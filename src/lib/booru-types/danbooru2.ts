import Booru from './../booru'
import { stringify as queryStringify } from 'query-string'
import convertRating from './../utils/rating-converter'

/**
 * A Booru implementation for sites running Danbooru version 2
 */
class Danbooru2 extends Booru {
  readonly xml = false

  private genericSingle<T> (type: string, id: number): Promise<T> {
    return this.fetch((<any>Danbooru2.UriBuilder)[type](id)).then(data => <T>(<any>Danbooru2.Converter)[type](data))
  }

  private genericQuery<T> (type: string, query: Query.Any): Promise<T[]> {
    return this.fetch((<any>Danbooru2.UriBuilder)[`${type}s`](query))
      .then((data: Array<object>) => <T[]>data.map((<any>Danbooru2.Converter)[type]))
  }

  post (id: number) {
    return this.genericSingle<Post>('post', id)
  }

  posts (query: Query.Posts) {
    return this.genericQuery<Post>('post', query)
      .then((posts: Post[]) => query.exclude ? posts.filter(post => !query.exclude!.some(tag => post.tags.all.includes(tag))) : posts)
  }

  artist (id: number) {
    return this.genericSingle<Artist>('artist', id)
  }

  artists (query: Query.Artists) {
    return this.genericQuery<Artist>('artist', query)
  }

  comment (id: number) {
    return this.genericSingle<Comment>('comment', id)
  }

  comments (query: Query.Comments): Promise<Comment[]>
  comments (post: Post): Promise<Post>
  comments (query: Query.Comments | Post) {
    if (query.hasOwnProperty('id')) {
      // This is a Post, fill in the comments field
      const post = <Post>query
      return this.genericQuery<Comment>('comment', <Query.Comments>{
        postId: post.id
      }).then(commentArr => {
        post.comments = commentArr
        return post
      })
    } else {
      // This is a query, get comments array
      return this.genericQuery<Comment>('comment', query)
    }
  }

  note (id: number) {
    return this.genericSingle<Note>('note', id)
  }

  notes (query: Query.Notes): Promise<Note[]>
  notes (post: Post): Promise<Post>
  notes (query: Query.Notes | Post) {
    if (query.hasOwnProperty('id')) {
      // This is a Post, fill in the comments field
      const post = <Post>query
      return this.genericQuery<Note>('note', <Query.Notes>{
        postId: post.id
      }).then(noteArr => {
        post.notes = noteArr
        return post
      })
    } else {
      // This is a query, get comments array
      return this.genericQuery<Note>('note', query)
    }
  }

  pool (id: number) {
    return this.genericSingle<Pool>('pool', id)
  }

  pools (query: Query.Pools) {
    return this.genericQuery<Pool>('pool', query)
  }

  user (id: number) {
    return this.genericSingle<User>('user', id)
  }

  users (query: Query.Users) {
    return this.genericQuery<User>('user', query)
  }

  wiki (id: number) {
    return this.genericSingle<Wiki>('wiki', id)
  }

  wikis (query: Query.Wikis) {
    return this.genericQuery<Wiki>('wiki', query)
  }

}

Danbooru2.UriBuilder = {
  post (id: number): string {
    return `/posts/${id}.json`
  },
  posts (query: Query.Posts): string {
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
    return '/posts.json?' + queryString
  },
  artist (id: number): string {
    return `/artists/${id}.json`
  },
  artists (query: Query.Artists): string {
    return '/artists.json?' + queryStringify({
      name: query.nameMatches,
      order: query.order
    })
  },
  comment (id: number): string {
    return `/comments/${id}.json`
  },
  comments (query: Query.Comments): string {
    return '/comments.json?' + queryStringify({
      'group_by': 'comment',
      ...query,
      'search[body_matches]': query.contentMatches,
      'search[post_id]': query.postId,
      'search[creator_id]': query.creator ? query.creator.id : undefined,
      'search[creator_name]': query.creator ? query.creator.name : undefined
    })
  },
  note (id: number): string {
    return `/notes/${id}.json`
  },
  notes (query: Query.Notes): string {
    return '/notes.json?' + queryStringify({
      'search[body_matches]': query.contentMatches,
      'search[post_id]': query.postId,
      'search[creator_id]': query.creator ? query.creator.id : undefined,
      'search[creator_name]': query.creator ? query.creator.name : undefined
    })
  },
  pool (id: number): string {
    return `/pools/${id}.json`
  },
  pools (query: Query.Pools): string {
    return '/pools.json?' + queryStringify({
      'search[name_matches]': query.nameMatches,
      'search[order]': query.order,
      'search[creator_id]': query.creator ? query.creator.id : undefined,
      'search[creator_name]': query.creator ? query.creator.name : undefined
    })
  },
  user (id: number): string {
    return `/users/${id}.json`
  },
  users (query: Query.Users): string {
    const transformed: any = {
      'search[name]': query.nameMatches,
      'search[order]': query.order
    }
    if (query.level) {
      if (typeof query.level === 'number') {
        transformed['search[level]'] = query.level
      } else {
        transformed['search[min_level]'] = query.level[0] || 0
        transformed['search[max_level]'] = query.level[1] || 9001
      }
    }
    return '/users.json?' + queryStringify(transformed)
  },
  wiki (id: number): string {
    return `/wiki_pages/${id}.json`
  },
  wikis (query: Query.Wikis): string {
    return '/wiki_pages.json?' + queryStringify({
      'search[title]': query.title,
      'search[body_matches]': query.contentMatches,
      'search[order]': query.order,
      'search[creator_id]': query.creator ? query.creator.id : undefined,
      'search[creator_name]': query.creator ? query.creator.name : undefined
    })
  }
}

Danbooru2.Converter = {
  post (data: any): Post {
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
  },
  user (data: any): User {
    return {
      id: data.id,
      name: data.name,
      banned: data.is_banned,
      level: data.level
    }
  },
  comment (data: any): Comment {
    return {
      id: data.id,
      createdAt: data.created_at,
      active: !data.is_deleted,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      content: data.body,
      postId: data.post_id,
      score: data.score
    }
  },
  note (data: any): Note {
    return {
      id: data.id,
      createdAt: data.created_at,
      active: data.is_active,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      content: data.body,
      postId: data.post_id,
      position: {
        x: data.x,
        y: data.y
      },
      dimensions: {
        width: data.width,
        height: data.height
      }
    }
  },
  artist (data: any): Artist {
    return {
      id: data.id,
      createdAt: data.created_at,
      active: data.is_active,
      creator: {
        id: data.creator_id
      },
      name: data.name,
      aliases: data.other_names.split(' '),
      group: data.group_name,
      links: data.urls.map((obj: any) => obj.url),
      about: data.notes
    }
  },
  pool (data: any): Pool {
    return {
      id: data.id,
      createdAt: data.created_at,
      active: data.is_active,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      name: data.name,
      category: data.category,
      postCount: data.post_count,
      postIds: data.post_ids.split(' ').map(parseFloat),
      description: data.description
    }
  },
  wiki (data: any): Wiki {
    return {
      id: data.id,
      createdAt: data.created_at,
      active: !data.is_deleted,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      title: data.title,
      content: data.body,
      aliases: data.other_names
    }
  }
}

export default Danbooru2