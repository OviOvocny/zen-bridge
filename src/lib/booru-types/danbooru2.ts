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

  posts (query: Query.Posts): Promise<Post[]> {
    return this.fetch(UriBuilder.posts(query))
      .then((data: Array<object>) => data.map(this.postConverter))
      .then((posts: Post[]) => query.exclude ? posts.filter(post => !query.exclude!.some(tag => post.tags.all.includes(tag))) : posts)
  }

  /**
   * Create a Post from an API response
   * @param data A post object from the API
   */
  private postConverter (data: any): Post {
    const tagTypes = ['general', 'character', 'copyright', 'artist', 'meta']
    const post: Post = {
      id: parseInt(data.id),
      active: !data.is_deleted,
      createdAt: data.created_at,
      creator: {
        id: data.uploader_id,
        name: data.uploader_name
      },
      md5: data.md5,
      rating: convertRating(data.rating, 'char'),
      votes: {
        up: data.up_score,
        down: data.down_score,
        score: data.up_score - data.down_score
      },
      files: {
        full: data.file_url,
        sample: data.large_file_url,
        preview: data.preview_file_url
      },
      dimensions: {
        width: data.image_width,
        height: data.image_height
      },
      tagCount: {
        all: data.tag_count
      },
      tags: {
        all: data.tag_string.split(' ')
      },
      children: data.has_children ? data.children_ids.split(' ').map(parseFloat) : [],
      pools: data.pool_string ? data.pool_string.split(' ') : []
    }
    if (data.source) post.source = data.source
    if (data.parent_id) post.parent = parseInt(data.parent_id)
    tagTypes.forEach(type => {
      if (data[`tag_count_${type}`]) {
        post.tagCount[type] = data[`tag_count_${type}`]
        post.tags[type] = data[`tag_string_${type}`].split(' ')
      }
    })
    return post
  }
}

class UriBuilder {
  static post (id: number): string {
    return `/posts/${id}.json`
  }

  static posts (query: Query.Posts): string {
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