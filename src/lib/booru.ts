import dataFetcher from './utils/data-fetcher'

/**
 * An instance of a specific booru site. 
 * Has common methods for getting data from a booru.
 * Can be used on its own or as a ZenBridge service.
 */
export default abstract class Booru {
  /** True if this booru has a XML-based API */
  abstract readonly xml: boolean

  /**
   * Create instance of a specific booru site
   * @param base Base URI of a booru site
   */
  constructor (public base: string) {}
  
  /**
   * GET an API call result as an object
   * @param path Part of the URI appended to the base
   */
  protected fetch (path: string): Promise<any> {
    return dataFetcher(this.base, path, this.xml)
  }

  /**
   * Get a single Post by ID
   * @param id ID of the post
   */
  abstract post (id: number): Promise<Post>

  /**
   * Get an array of Posts that match a query
   * @param query Posts search query object
   */
  abstract posts (query: PostsQuery): Promise<Post[]>
}