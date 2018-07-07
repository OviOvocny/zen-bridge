import Booru from './../booru'
import { stringify as queryStringify } from 'query-string'
import convertRating from './../utils/rating-converter'

/**
 * A Booru implementation for sites running Danbooru version 2
 */
export default class Danbooru2 extends Booru {
  readonly xml = false

  post (id: number): Promise<Post> {
    return this.fetch(UriBuilder.post(id)).then(data => this.postConverter(data))
  }

  posts (query: PostsQuery): Promise<Post[]> {
    return this.fetch(UriBuilder.posts(query))
      .then((data: Array<object>) => data.map(this.postConverter))
      .then((posts: Post[]) => query.exclude ? posts.filter(post => !query.exclude!.some(tag => post.tags.all.includes(tag))) : posts)
  }

  /**
   * Create a Post from an API response
   * @param d A post object from the API
   */
  private postConverter (d: any): Post {
    const tagTypes = ['general', 'character', 'copyright', 'artist', 'meta']
    const post: Post = {
      id: parseInt(d.id),
      active: !d.is_deleted,
      createdAt: d.created_at,
      userId: d.uploader_id,
      userName: d.uploader_name,
      md5: d.md5,
      rating: convertRating(d.rating, 'char'),
      votes: {
        up: d.up_score,
        down: d.down_score,
        score: d.up_score - d.down_score
      },
      files: {
        full: d.file_url,
        sample: d.large_file_url,
        preview: d.preview_file_url
      },
      dimensions: {
        width: d.image_width,
        height: d.image_height
      },
      tagCount: {
        all: d.tag_count
      },
      tags: {
        all: d.tag_string.split(' ')
      },
      children: d.has_children ? d.children_ids.split(' ').map(parseFloat) : [],
      pools: d.pool_string ? d.pool_string.split(' ') : []
    }
    if (d.source) post.source = d.source
    if (d.parent_id) post.parent = parseInt(d.parent_id)
    tagTypes.forEach(type => {
      if (d[`tag_count_${type}`]) {
        post.tagCount[type] = d[`tag_count_${type}`]
        post.tags[type] = d[`tag_string_${type}`].split(' ')
      }
    })
    return post
  }
}

class UriBuilder {
  static post (id: number): string {
    return `/posts/${id}.json`
  }

  static posts (query: PostsQuery): string {
    const base = '/posts.json'
    let queryString = ''
    if (query.tags) {
      let t = query.tags
      // Danbooru limitation, probably done wrong
      if (t.length > 2) {
        t = t.slice(0, 2)
      }
      queryString = queryStringify({
        ...query,
        tags: t.join(' ')
      })
    } else {
      queryString = queryStringify(query)
    }
    return queryString === '' ? base : base + '?' + queryString
  }
}