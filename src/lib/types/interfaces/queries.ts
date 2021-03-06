import { range } from '../aliases'
import { User } from './data'

/**
 * Contains interfaces used to query an API endpoint via a Booru method
 */

/** An users search query */
export interface Users {
  /** Username to match (can be a pattern) */
  nameMatches?: string
  /** Order of results */
  order?: string
  /** Current user level or range as [minimum, maximum] */
  level?: number | range
}

/** A posts search query */
export interface Posts {
  /** Maximum number of posts to fetch */
  limit?: number
  /** Page number for a limited query */
  page?: number
  /** Tags the posts must include */
  tags?: string[]
  /** Tags the posts cannot have */
  exclude?: string[]
  /** Get randomly ordered results */
  random?: boolean
}

/** A comments search query */
export interface Comments {
  /** Maximum number of comments to fetch */
  limit?: number
  /** Page number for a limited query */
  page?: number
  /** Pattern the content of the comment has to match */
  contentMatches?: string
  /** ID of the post this comment belongs to */
  postId?: number
  /** User that posted the comment */
  creator?: User
}

/** A notes search query */
export interface Notes {
  /** Pattern the content of the note has to match */
  contentMatches?: string
  /** ID of the post this note belongs to */
  postId?: number
  /** User that created the note */
  creator?: User
}

/** An artists  search query */
export interface Artists {
  /** Pattern any of the artist's names have to match */
  nameMatches?: string
  /** Order of results */
  order?: string
}

/** A pools search query */
export interface Pools {
  /** Pattern the name of the pool has to match */
  nameMatches?: string
  /** User that created the pool */
  creator?: User
  /** Order of results */
  order?: string
}

/** A wiki pages search query */
export interface Wikis {
  /** Exact title of the wiki page to find */
  title?: string
  /** Pattern the content of the wiki page has to match */
  contentMatches?: string
  /** User that created the wiki page */
  creator?: User
  /** Order of results */
  order?: string
}

/** Type compatibile with any Query interface */
export type Any = Artists | Comments | Notes | Pools | Posts | Users | Wikis
