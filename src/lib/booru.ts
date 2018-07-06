import axios from 'axios'
import convert from './utils/xml-converter'

export default class Booru {
  /**
   * Create an instance of a specific booru site
   * @param service Functions that interact with a specific booru type
   * @param base Base URI of a specific booru site
   * @param safe Is this booru site SFW only?
   */
  constructor(readonly service: BooruType, public base: string, public safe: boolean = false) {}

  /**
   * Search this Booru for posts based on a query
   * @param query The posts search query
   */
  async searchPosts(query: PostsQuery): Promise<Post[]> {
    return new Promise<Post[]>((resolve, reject) => {
      const href = this.service.uriBuilder.posts(query)
      axios.get(this.base + href).then(async res => {
        let result = res.data
        // Convert XML if needed
        if (this.service.responseType === 'xml') {
          result = await convert(res.data)
        }
        let postArr = this.service.dataParser.posts(result)
        // Remove posts with unwanted tags
        if (query.exclude) {
          postArr = postArr.filter(post => !query.exclude!.some(tag => post.tags.all.includes(tag)))
        }
        resolve(postArr)
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * Fetch a single post by ID
   * @param id Numeric ID of the post
   */
  async getPostById(id: number): Promise<Post> {
    return new Promise<Post>((resolve, reject) => {
      const href = this.service.uriBuilder.post(id)
      axios.get(this.base + href).then(async res => {
        let result = res.data
        if (this.service.responseType === 'xml') {
          result = await convert(res.data)
        }
        resolve(this.service.dataParser.post(result))
      }).catch(err => {
        reject(err)
      })
    })
  }

}