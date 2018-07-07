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

/**
 * A post object with a common structure for every booru
 */
interface Post {
  /** ID of the post */
  id: number
  /** Post creation time as UTC timestamp */
  createdAt: string
  /** ID of the user that uploaded the post */
  uploaderId: number
  /** Original source of the post image */
  source?: string
  /** MD5 hash of the post image */
  md5: string
  /** Post rating in a common format */
  rating: rating
  /** Post votes */
  votes: {
    /** Number of upvotes */
    up: number
    /** Number of downvotes */
    down: number
    /** Total score */
    score: number
  }
  /** Image file URIs */
  files: {
    /** Full size image URI */
    full: string
    /** Sample image URI */
    sample?: string
    /** Thumbnail or preview URI */
    preview?: string
  }
  /** Dimensions of post images in pixels */
  dimensions: {
    width: number
    height: number
    sampleWidth?: number
    sampleHeight?: number
    previewWidth?: number
    previewHeight?: number
  }
  /** Number of tags the post has */
  tagCount: {
    /** Total number of tags */
    all: number
    /** Index for number of tags in a category */
    [other: string]: number
  }
  /** Tags the post has */
  tags: {
    /** Array of all tags */
    all: string[]
    /** Index for arrays of tags in a category */
    [other: string]: string[]
  }
  /** ID of the parent post */
  parent?: number
  /** Array of IDs of the post's children */
  children: number[]
  /** Identifiers of the pools that include the post */
  pools: string[]
}