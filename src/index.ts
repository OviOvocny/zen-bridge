import Booru from './lib/booru';

export default class ZenBridge {
  constructor(public services: Booru[], public ratingFilter: rating[] | boolean = false) {}

  async posts(query: Query.Posts): Promise<Post[]> {
    let results: Post[] = []
    let md5s: string[] = []
    this.services.forEach(async booru => {
      const localResult = await booru.posts(query)
      localResult.forEach(post => {
        // Skip dupes if possible
        if (post.md5 && md5s.includes(post.md5)) return
        // Add post to results
        results.push(post)
      })
    })
    return results
  }
}