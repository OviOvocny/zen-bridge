/* interface Credentials {
  username: string
  key: string
} */


interface PostsQuery {
  limit?: number
  page?: number
  tags?: string[]
  exclude?: string[]
  random?: boolean
}

interface Post {
  id: number
  createdAt: Date | string
  uploaderId: number
  source?: string
  md5: string
  rating: rating
  votes: {
    up: number
    down: number
    score: number
  }
  files: {
    full: string
    sample?: string
    preview?: string
  }
  dimensions: {
    width: number
    height: number
    sampleWidth?: number
    sampleHeight?: number
    previewWidth?: number
    previewHeight?: number
  }
  tagCount: {
    [index: string]: number | undefined
    all: number
    general: number
    character?: number
    copyright?: number
    artist?: number
    meta?: number
  }
  tags: {
    [index: string]: string[] | undefined
    all: string[]
    general: string[]
    character?: string[]
    copyright?: string[]
    artist?: string[]
    meta?: string[]
  }
  parent?: number
  children: number[]
  pools: string[]
}

interface BooruType {
  responseType: encoding
  featureset: feature[]
  postUriBuilder(query: PostsQuery | number): string
  postConverter(d: any): Post
  postResponseProcessor(query: PostsQuery, data: object): Post[]
  // uriBuilder(target: string, query: object): string
  // responseProcessor(target: string, data: object): any // Change to only possible interfaces
  // authenticate?(base: string, credentials: Credentials): boolean
}