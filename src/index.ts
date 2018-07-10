import Booru from './lib/booru'

/** Contains results from a booru site with additional metadata */
export interface BooruResult<T> {
  /** Base URI of the booru site */
  base: string
  /** Array of results from the booru site or error (check status) */
  data: T[] | any
  /** Status of the result (when 'error', data is the error, else 'ok' and data is array of T) */
  status: string
}

/** 
 * Describes a function that test elements of BooruResult.data for uniqueness
 * @typeparam T One of booru [[Data]] interface types
 * @param . current: The current element being tested
 * @param . data: The array to test against
 * @returns True if the element is unique
 */
type comparerCallback<T> = (current: T, data: T[]) => boolean

/**
 * Allows interfacing with multiple Boorus simultaneously and provides methods for manipulating the results
 */
export default class ZenBridge {
  /**
   * Collection of built-in comparer functions for the [[dedupe]] method.
   * Note that not all [[Data]] types are covered as for some deduping would not make sense.
   * You can of course provide your own comparer to [[dedupe]] if you want to dedupe those.
   */
  static readonly builtInComparers: {
    [type: string]: comparerCallback<any>
  } = {
    /**
     * Dedupes a collection of [[Post]]s based on md5. This is useful when (for example) displaying the images,
     * but you lose some information (like comments) that other boorus may have had for the same image.
     */
    posts(current: Post, data: Post[]): boolean {
      return !data.some(d => d.md5 === current.md5)
    },
    /**
     * Tries to dedupe a collection of [[Artist]]s based on name and at least one identical link.
     * Note that differernt boorus could still have different info about the same artist,
     * which you would lose by deduping. Remember to use [[query]] to get data without deduping!
     */
    artists(current: Artist, data: Artist[]): boolean {
      let final = true
      data.forEach(d => {
        if (d.name === current.name) {
          // final = !d.links.some(dl => current.links.some(cl => dl === cl))
          final = false
        }
      })
      return final
    },
    /**
     * Tries to dedupe a collection of [[Comment]]s based on their content
     * (use with caution, this is potentially too aggressive for short-form comments).
     */
    comments(current: Comment, data: Comment[]): boolean {
      return !data.some(d => d.content === current.content)
    }
  }

  /**
   * Merges results from many booru sites into one array,
   * throws additional info and errored results away
   * @typeparam T One of booru [[Data]] interface types
   * @param data [[BooruResult]]s to merge
   */
  static merge<T>(
    data: Array<BooruResult<T>>
  ): T[] {
    return data
      .filter(d => d.status === 'ok')
      .map(d => d.data)
      .reduce((acc, d) => acc.concat(d), [])
  }

  /**
   * Create a ZenBridge with predefined set of Boorus to interface with
   * @param services Array of instances of Booru-compatibiles
   */
  constructor(public services: Booru[]) {}

  /**
   * Queris all provided [[Booru]]s simultaneously
   * @typeparam T One of booru [[Data]] interface types
   * @param type Query type to execute as a string index
   * @param query Query object with search parameters
   * @returns Array of BooruResult objects (site base URI and results from that site)
   */
  query<T>(type: string, query: Query.Any): Promise<Array<BooruResult<T>>> {
    const promises: Array<Promise<T[]>> = []
    this.services.forEach(async booru => {
      promises.push((booru as any)[type](query))
    })
    return Promise.all(
      promises.map(p =>
        p.then(
          r => ({ data: r, status: 'ok' }),
          e => ({ data: e, status: 'error' })
        )
      )
    ).then(arrays =>
      arrays.map((data, i) => ({
        base: this.services[i].base,
        ...data
      }))
    )
  }

  /**
   * Returns a copy of [[BooruResult]] array with duplicate records removed
   * @typeparam T One of booru [[Data]] interface types
   * @param data Array of BooruResult objects to search through
   * @param comparer A function that tests every record in BooruResult data against records in the first dataset and returns true if the record is unique (eg. NOT a duplicate)
   */
  dedupe<T>(
    data: Array<BooruResult<T>>,
    comparer: comparerCallback<T>
  ): Array<BooruResult<T>> {
    // End right away if results from only one site are passed
    if (data.length === 1) {
      return data
    }
    const filtered: Array<BooruResult<T>> = [data[0]]
    data.slice(1).forEach(res => {
      filtered.push({
        base: res.base,
        data:
          res.status === 'ok'
            ? res.data.filter((d: T) =>
                comparer(
                  d,
                  ZenBridge.merge(filtered)
                )
              )
            : res.data,
        status: res.status
      })
    })
    return filtered
  }

  /**
   * Runs a query and automatically dedupes in one go
   * @typeparam T One of booru [[Data]] interface types
   * @param type Query type to execute as a string index
   * @param query Query object with search parameters
   * @param comparer Comparer function for [[dedupe]] (if not provided, built-in comparer is used based on the query type)
   */
  aggregate<T>(
    type: string,
    query: Query.Any,
    comparer?: comparerCallback<T>
  ): Promise<Array<BooruResult<T>>> {
    return this.query<T>(type, query).then(res =>
      this.dedupe<T>(
        res,
        comparer || ZenBridge.builtInComparers[type] || (() => true)
      )
    )
  }
}


export * from './lib/booru-types'