/**
 * Contains interfaces used to query an API endpoint via a Booru method
 */
declare module Query {
  /**
   * A posts search query
   */
  interface Posts {
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
}