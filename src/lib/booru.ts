import {
  Artist,
  Comment,
  Credentials,
  Note,
  Pool,
  Post,
  User,
  Wiki
} from './types/interfaces/data'
import * as Query from './types/interfaces/queries'
import dataFetcher from './utils/data-fetcher'
/**
 * An instance of a specific booru site.
 * Has common methods for getting data from a booru.
 * Can be used on its own or as a ZenBridge service.
 */
export default abstract class Booru {
  /** True if this booru has a XML-based API. */
  abstract readonly xml: boolean
  /** Stores any global options for the booru. This has different members based on the booru type. */
  options?: Map<string, any>
  /** Stores credentials for authentication. From outside the class, use [[credentials]] accessor or set it in the constructor directly. */
  protected pCredentials?: Credentials

  /**
   * Create instance of a specific booru site
   * @param base Base URI of a booru site
   * @param credentials Credentials for authentication on the site
   */
  constructor(public base: string, credentials?: Credentials) {
    this.pCredentials = credentials
  }

  /**
   * Set credentials object to use for authentication on the site. See [[Credentials]] for more about required fields.
   */
  set credentials(data: Credentials | undefined) {
    if (data && (!data.username || !data.key)) {
      throw new TypeError(
        'Invalid credentials object. See /interfaces/credentials in the docs.'
      )
    } else {
      this.pCredentials = data
    }
  }

  /**
   * Check if the auth credentials are set
   */
  get loggedIn(): boolean {
    return (
      this.pCredentials !== undefined &&
      this.pCredentials.username !== undefined &&
      this.pCredentials.key !== undefined
    )
  }

  /**
   * Get a single Post by ID
   * @param id ID of the post
   */
  abstract post(id: number): Promise<Post>

  /**
   * Get an array of Posts that match a query
   * @param query Posts search query object
   */
  abstract posts(query: Query.Posts): Promise<Post[]>

  /**
   * Add a post to favorites
   * @precondition Credentials are set (for authentication, see [[credentials]])
   * @param id ID of the target post
   */
  favorite?(id: number): Promise<boolean>

  /**
   * Remove a post from favorites
   * @precondition Credentials are set (for authentication, see [[credentials]])
   * @param id ID of the target post
   */
  unfavorite?(id: number): Promise<boolean>

  /**
   * Get a single Artist by ID
   * @param id ID of the artist
   */
  artist?(id: number): Promise<Artist>

  /**
   * Get an array of Artists that match a query
   * @param query Artists search query object
   */
  artists?(query: Query.Artists): Promise<Artist[]>

  /**
   * Get a single Comment by ID
   * @param id ID of the comment
   */
  comment?(id: number): Promise<Comment>

  /**
   * Get an array of Comments that match a query
   * @param query Comments search query object
   */
  comments?(query: Query.Comments): Promise<Comment[]>

  /**
   * Get back the Post you passed in with the comments field populated
   * @param post The post to find comments for
   */
  comments?(post: Post): Promise<Post>

  /**
   * Get a single Note by ID
   * @param id ID of the note
   */
  note?(id: number): Promise<Note>

  /**
   * Get an array of Notes that match a query
   * @param query Notes search query object
   */
  notes?(query: Query.Notes): Promise<Note[]>

  /**
   * Get back the Post you passed in with the notes field populated
   * @param post The post to find notes for
   */
  notes?(post: Post): Promise<Post>

  /**
   * Get a single Pool by ID
   * @param id ID of the pool
   */
  pool?(id: number): Promise<Pool>

  /**
   * Get an array of Pools that match a query
   * @param query Pools search query object
   */
  pools?(query: Query.Pools): Promise<Pool[]>

  /**
   * Get a single User by ID
   * @param id ID of the user
   */
  user?(id: number): Promise<User>

  /**
   * Get an array of Users that match a query
   * @param query Users search query object
   */
  users?(query: Query.Users): Promise<User[]>

  /**
   * Get a single Wiki page by ID
   * @param id ID of the wiki page
   */
  wiki?(id: number): Promise<Wiki>

  /**
   * Get an array of Wikis that match a query
   * @param query Wikis search query object
   */
  wikis?(query: Query.Wikis): Promise<Wiki[]>

  /**
   * GET an API call result as an object
   * @param path Part of the URI appended to the base
   * @param config Axios config object
   */
  protected fetch(path: string, config?: object): Promise<any> {
    return dataFetcher(this.base, path, this.xml, config)
  }
}
