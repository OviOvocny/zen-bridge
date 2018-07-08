import dataFetcher from './utils/data-fetcher'

namespace BooruHelper {
  export interface UriBuilder {
    artist? (id: number): string
    artists? (query: Query.Artists): string
    comment? (id: number): string
    comments? (query: Query.Comments): string
    note? (id: number): string
    notes? (query: Query.Notes): string
    pool? (id: number): string
    pools? (query: Query.Pools): string
    post (id: number): string
    posts (query: Query.Posts): string
    user? (id: number): string
    users? (query: Query.Users): string
    wiki? (id: number): string
    wikis? (query: Query.Wikis): string
  }
  export interface Converter {
    artist? (data: any): Artist
    comment? (data: any): Comment
    note? (data: any): Note
    pool? (data: any): Pool
    post (data: any): Post
    user? (data: any): User
    wiki? (data: any): Wiki
  }
}

/**
 * An instance of a specific booru site. 
 * Has common methods for getting data from a booru.
 * Can be used on its own or as a ZenBridge service.
 */
export default abstract class Booru {
  static UriBuilder: BooruHelper.UriBuilder
  static Converter: BooruHelper.Converter

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
  abstract posts (query: Query.Posts): Promise<Post[]>

  /**
   * Get a single Artist by ID
   * @param id ID of the artist
   */
  artist? (id: number): Promise<Artist>

  /**
   * Get an array of Artists that match a query
   * @param query Artists search query object
   */
  artists? (query: Query.Artists): Promise<Artist[]>

  /**
   * Get a single Comment by ID
   * @param id ID of the comment
   */
  comment? (id: number): Promise<Comment>

  /**
   * Get an array of Comments that match a query
   * @param query Comments search query object
   */
  comments? (query: Query.Comments): Promise<Comment[]>

  /**
   * Get back the Post you passed in with the comments field populated
   * @param post The post to find comments for
   */
  comments? (post: Post): Promise<Post>

  /**
   * Get a single Note by ID
   * @param id ID of the note
   */
  note? (id: number): Promise<Note>

  /**
   * Get an array of Notes that match a query
   * @param query Notes search query object
   */
  notes? (query: Query.Notes): Promise<Note[]>

  /**
   * Get back the Post you passed in with the notes field populated
   * @param post The post to find notes for
   */
  notes? (post: Post): Promise<Post>

  /**
   * Get a single Pool by ID
   * @param id ID of the pool
   */
  pool? (id: number): Promise<Pool>

  /**
   * Get an array of Pools that match a query
   * @param query Pools search query object
   */
  pools? (query: Query.Pools): Promise<Pool[]>

  /**
   * Get a single User by ID
   * @param id ID of the user
   */
  user? (id: number): Promise<User>

  /**
   * Get an array of Users that match a query
   * @param query Users search query object
   */
  users? (query: Query.Users): Promise<User[]>

  /**
   * Get a single Wiki page by ID
   * @param id ID of the wiki page
   */
  wiki? (id: number): Promise<Wiki>

  /**
   * Get an array of Wikis that match a query
   * @param query Wikis search query object
   */
  wikis? (query: Query.Wikis): Promise<Wiki[]>
}