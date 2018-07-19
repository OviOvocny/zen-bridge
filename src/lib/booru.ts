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
import { Converter, UriBuilder } from './types/interfaces/helpers'
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
  /** Functions that build the URI to fetch for each Booru function */
  protected abstract uriBuilder: UriBuilder
  /** Functions that convert API responses to Booru data objects */
  protected abstract converter: Converter

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
  post(id: number | string): Promise<Post> {
    return this.genericSingle('post', id)
  }

  /**
   * Get an array of Posts that match a query
   * @param query Posts search query object
   */
  posts(query: Query.Posts): Promise<Post[]> {
    return this.genericQuery('post', query)
  }

  /**
   * Add a post to favorites
   * @precondition Credentials are set (for authentication, see [[credentials]])
   * @param id ID of the target post
   */
  abstract favorite(id: number | string): Promise<boolean>

  /**
   * Remove a post from favorites
   * @precondition Credentials are set (for authentication, see [[credentials]])
   * @param id ID of the target post
   */
  abstract unfavorite(id: number | string): Promise<boolean>

  /**
   * Get a single Artist by ID
   * @param id ID of the artist
   */
  artist(id: number | string): Promise<Artist> {
    return this.genericSingle('artist', id)
  }

  /**
   * Get an array of Artists that match a query
   * @param query Artists search query object
   */
  artists(query: Query.Artists): Promise<Artist[]> {
    return this.genericQuery('artist', query)
  }

  /**
   * Get a single Comment by ID
   * @param id ID of the comment
   */
  comment(id: number | string): Promise<Comment> {
    return this.genericSingle('comment', id)
  }

  /**
   * Get an array of Comments that match a query
   * @param query Comments search query object
   */
  comments(query: Query.Comments): Promise<Comment[]>

  /**
   * Get back the Post you passed in with the comments field populated
   * @param post The post to find comments for
   */
  comments(post: Post): Promise<Post>

  comments(query: Query.Comments | Post) {
    if (query.hasOwnProperty('id')) {
      // This is a Post, fill in the comments field
      const post = query as Post
      return this.genericQuery('comment', {
        postId: post.id
      }).then(comments => {
        const populated: Post = {
          ...post,
          comments
        }
        return populated
      })
    } else {
      // This is a query, get comments array
      return this.genericQuery('comment', query)
    }
  }

  /**
   * Get a single Note by ID
   * @param id ID of the note
   */
  note(id: number | string): Promise<Note> {
    return this.genericSingle('note', id)
  }

  /**
   * Get an array of Notes that match a query
   * @param query Notes search query object
   */
  notes(query: Query.Notes): Promise<Note[]>

  /**
   * Get back the Post you passed in with the notes field populated
   * @param post The post to find notes for
   */
  notes(post: Post): Promise<Post>

  notes(query: Query.Notes | Post) {
    if (query.hasOwnProperty('id')) {
      // This is a Post, fill in the notes field
      const post = query as Post
      return this.genericQuery('note', {
        postId: post.id
      }).then(notes => {
        const populated: Post = {
          ...post,
          notes
        }
        return populated
      })
    } else {
      // This is a query, get notes array
      return this.genericQuery('note', query)
    }
  }

  /**
   * Get a single Pool by ID
   * @param id ID of the pool
   */
  pool(id: number | string): Promise<Pool> {
    return this.genericSingle('pool', id)
  }

  /**
   * Get an array of Pools that match a query
   * @param query Pools search query object
   */
  pools(query: Query.Pools): Promise<Pool[]> {
    return this.genericQuery('pool', query)
  }

  /**
   * Get a single User by ID
   * @param id ID of the user
   */
  user(id: number | string): Promise<User> {
    return this.genericSingle('user', id)
  }

  /**
   * Get an array of Users that match a query
   * @param query Users search query object
   */
  users(query: Query.Users): Promise<User[]> {
    return this.genericQuery('user', query)
  }

  /**
   * Get a single Wiki page by ID
   * @param id ID of the wiki page
   */
  wiki(id: number | string): Promise<Wiki> {
    return this.genericSingle('wiki', id)
  }

  /**
   * Get an array of Wikis that match a query
   * @param query Wikis search query object
   */
  wikis(query: Query.Wikis): Promise<Wiki[]> {
    return this.genericQuery('wiki', query)
  }

  /**
   * GET an API call result as an object
   * @param path Part of the URI appended to the base
   * @param config Axios config object
   */
  protected fetch(path: string, config?: object): Promise<any> {
    return dataFetcher(this.base, path, this.xml, config)
  }

  protected genericSingle(type: string, id: number | string): Promise<any> {
    const uri = (this.uriBuilder as any)[type](id)
    return this.fetch(uri, this.fetchOptions).then(data =>
      (this.converter as any)[type](data)
    )
  }

  protected genericQuery(type: string, query: Query.Any): Promise<any[]> {
    const uri = (this.uriBuilder as any)[`${type}s`](query)
    return this.fetch(uri, this.fetchOptions).then((data: object[]) =>
      data.map((this.converter as any)[type])
    )
  }

  protected get fetchOptions(): object {
    return {}
  }
}
