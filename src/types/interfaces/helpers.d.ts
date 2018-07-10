interface UriBuilder {
  artist?(id: number): string
  artists?(query: Query.Artists): string
  comment?(id: number): string
  comments?(query: Query.Comments): string
  note?(id: number): string
  notes?(query: Query.Notes): string
  pool?(id: number): string
  pools?(query: Query.Pools): string
  post(id: number): string
  posts(query: Query.Posts): string
  user?(id: number): string
  users?(query: Query.Users): string
  wiki?(id: number): string
  wikis?(query: Query.Wikis): string
}

interface Converter {
  artist?(data: any): Artist
  comment?(data: any): Comment
  note?(data: any): Note
  pool?(data: any): Pool
  post(data: any): Post
  user?(data: any): User
  wiki?(data: any): Wiki
}
