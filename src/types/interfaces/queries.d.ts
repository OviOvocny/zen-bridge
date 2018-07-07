/**
 * A posts search query
 */
interface PostsQuery {
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