/**
 * Object with properties common to all Data interfaces
 */
interface CommonData {
  /** ID of the content */
  id: number
  /** True if the content is not marked hidden or deleted */
  active: boolean
  /** Content creation time as UTC timestamp */
  createdAt: string
  /** ID of the user that posted the content */
  userId: number
}

/**
 * A post object with a common structure for every booru.
 * Posts contain an image described by tags.
 */
interface Post extends CommonData {
  /** Display name of the user that posted the comment */
  userName?: string
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
 * A comment object with a common structure for every booru.
 * Comments are created by users for discussing a post.
 */
interface Comment extends CommonData {
  /** Display name of the user that posted the comment */
  userName: string
  /** ID of the post this comment belongs to */
  postId: number
  /** Comment score */
  score: number
  /** Body of the comment */
  content: string
}

/**
 * A note object with a common structure for every booru.
 * Notes are attached to a post in a specific position. They are used to annotate a part of the image or to translate text in the image, for example speech bubbles in comics.
 */
interface Note extends CommonData {
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