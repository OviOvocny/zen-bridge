/**
 * Interface with common data properties
 */
interface Data {
  /** ID of the content */
  id: number
  /** True if the content is not marked hidden or deleted */
  active?: boolean
  /** Content creation time as UTC timestamp */
  createdAt?: string
  /** User that added the content */
  creator?: User
}

/**
 * A booru user object.
 */
interface User {
  /** ID of the user */
  id: number
  /** True if user is banned */
  banned?: boolean
  /** Display name */
  name?: string
  /** User level */
  level?: number
}

/**
 * A post object.
 * Posts contain an image described by tags.
 */
interface Post extends Data {
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
    [category: string]: number
  }
  /** Tags the post has */
  tags: {
    /** Array of all tags */
    all: string[]
    /** Index for arrays of tags in a category */
    [category: string]: string[]
  }
  /** ID of the parent post */
  parent?: number
  /** Array of IDs of the post's children */
  children: number[]
  /** Identifiers of the pools that include the post */
  pools: string[],
  /** Array of comments belonging to the post */
  comments?: Comment[],
  /** Array of notes attached to the post */
  notes?: Note[]
}

/**
 * A comment object.
 * Comments are created by users for discussing a post.
 */
interface Comment extends Data {
  /** ID of the post this comment belongs to */
  postId: number
  /** Comment score */
  score: number
  /** Body of the comment */
  content: string
}

/**
 * A note object.
 * Notes are attached to a post in a specific position. 
 * They are used to annotate a part of the image or to translate text in the image, for example speech bubbles in comics.
 */
interface Note extends Data {
  /** ID of the note this comment belongs to */
  postId: number
  /** Position on top of the image */
  position: {
    x: number
    y: number
  }
  /** Dimensions of the note */
  dimensions: {
    width: number
    height: number
  }
  /** Body of the note */
  content: string
}

/**
 * An artist object.
 */
interface Artist extends Data {
  /** Primary name of the artist */
  name: string
  /** Other names the artist uses */
  aliases: string[]
  /** Group the artists is part of */
  group?: string
  /** Links to the artist's social media, portfolios and other websites */
  links: string[]
  /** Artist description */
  about?: string
}

/**
 * A pool object.
 * Pools are collections of images with a common theme.
 */
interface Pool extends Data {
  /** Name of the pool */
  name: string
  /** Category the pool belongs to */
  category?: string
  /** Number of posts in the pool */
  postCount: number
  /** IDs of all posts in the pool */
  postIds?: number[]
  /** Description of the pool */
  description?: string
}

/**
 * A wiki page object.
 * Wiki pages describe tags or other features.
 */
interface Wiki extends Data {
  /** Title of the page */
  title: string
  /** Body of the page */
  content: string
  /** Other names for the entry */
  aliases: string[]
}