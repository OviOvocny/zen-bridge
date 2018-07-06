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
    all: number
    [other: string]: number
  }
  tags: {
    all: string[]
    [other: string]: string[]
  }
  parent?: number
  children: number[]
  pools: string[]
}

interface BooruType {
  responseType: encoding
  featureset: feature[]
  uriBuilder: {
    post(id: number): string
    posts(query: PostsQuery): string
  }
  dataParser: {
    post(data: any): Post
    posts(data: any): Post[]
  }
}