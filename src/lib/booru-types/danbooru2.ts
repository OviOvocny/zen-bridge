import axios, { AxiosError } from 'axios'
import { stringify as queryStringify } from 'query-string'
import Booru from '../booru'
import {
  Artist,
  Comment,
  Note,
  Pool,
  Post,
  User,
  Wiki
} from '../types/interfaces/data'
import { Converter, UriBuilder } from '../types/interfaces/helpers'
import * as Query from '../types/interfaces/queries'
import convertRating from '../utils/rating-converter'

/**
 * A Booru implementation for sites running Danbooru version 2
 */
class Danbooru2 extends Booru {
  readonly xml = false
  protected uriBuilder = Danbooru2UriBuilder
  protected converter = Danbooru2Converter

  posts(query: Query.Posts) {
    return this.genericQuery('post', query).then(
      (posts: Post[]) =>
        query.exclude
          ? posts.filter(
              post => !query.exclude!.some(tag => post.tags.all.includes(tag))
            )
          : posts
    )
  }

  pool(id: number): Promise<Pool> {
    const pool: Promise<Pool> = this.genericSingle('pool', id)
    const posts: Promise<Post[]> = this.genericQuery('post', {
      tags: [`pool:${id}`]
    })
    return Promise.all([pool, posts]).then(res => {
      res[0].posts = res[1]
      return res[0]
    })
  }

  favorite(id: number): Promise<boolean> {
    if (!this.loggedIn) {
      return Promise.reject(
        new Error('Credentials not set or invalid for this booru instance')
      )
    }
    const uri = this.base + this.uriBuilder.favorite!(id)
    return axios.post(uri, {}, this.fetchOptions).then(
      res => JSON.parse(res.data.is_favorited),
      err => {
        if (
          err &&
          err.response.data.message === 'You have already favorited this post'
        ) {
          return true
        } else {
          throw new Error('API call was rejected: ' + err)
        }
      }
    )
  }

  unfavorite(id: number): Promise<boolean> {
    if (!this.loggedIn) {
      return Promise.reject(
        new Error('Credentials not set or invalid for this booru instance')
      )
    }
    const uri = this.base + this.uriBuilder.unfavorite!(id)
    return axios
      .delete(uri, this.fetchOptions)
      .then(res => res.data)
      .then(d => {
        /* istanbul ignore else */
        if (d.includes(`<meta name="post-id" content="${id}">`)) {
          return true
        } else {
          throw new Error(
            'API call was rejected, reason: who knows, Danbooru just sends a login page...'
          )
        }
      })
  }

  protected fetchThrow(err: AxiosError) {
    if (err.response) {
      if (typeof err.response.data === 'object') {
        // @ts-ignore
        err.message = err.response.data.message
      }
    }
    throw err
  }

  protected get fetchOptions(): object {
    return this.loggedIn
      ? {
          auth: {
            password: this.pCredentials!.key,
            username: this.pCredentials!.username
          }
        }
      : {}
  }
}

const Danbooru2UriBuilder: UriBuilder = {
  post(id: number): string {
    return `/posts/${id}.json`
  },
  posts(query: Query.Posts): string {
    let queryString = ''
    let t: string[] = []
    if (query.tags) {
      t = t.concat(query.tags)
    }
    if (query.exclude) {
      t = t.concat(query.exclude.map(tag => `-${tag}`))
    }
    // Danbooru limitation, probably done wrong
    if (t.length > 2) {
      t = t.slice(0, 2)
    }
    queryString = queryStringify({
      ...query,
      exclude: undefined,
      tags: t.join(' ')
    })
    return '/posts.json?' + queryString
  },
  favorite(id: number): string {
    return `/favorites.json?post_id=${id}`
  },
  unfavorite(id: number): string {
    return `/favorites/${id}`
  },
  artist(id: number): string {
    return `/artists/${id}.json`
  },
  artists(query: Query.Artists): string {
    return (
      '/artists.json?' +
      queryStringify({
        name: query.nameMatches,
        order: query.order
      })
    )
  },
  comment(id: number): string {
    return `/comments/${id}.json`
  },
  comments(query: Query.Comments): string {
    return (
      '/comments.json?' +
      queryStringify({
        group_by: 'comment',
        ...query,
        'search[body_matches]': query.contentMatches,
        'search[creator_id]': query.creator ? query.creator.id : undefined,
        'search[creator_name]': query.creator ? query.creator.name : undefined,
        'search[post_id]': query.postId
      })
    )
  },
  note(id: number): string {
    return `/notes/${id}.json`
  },
  notes(query: Query.Notes): string {
    return (
      '/notes.json?' +
      queryStringify({
        'search[body_matches]': query.contentMatches,
        'search[creator_id]': query.creator ? query.creator.id : undefined,
        'search[creator_name]': query.creator ? query.creator.name : undefined,
        'search[post_id]': query.postId
      })
    )
  },
  pool(id: number): string {
    return `/pools/${id}.json`
  },
  pools(query: Query.Pools): string {
    return (
      '/pools.json?' +
      queryStringify({
        'search[creator_id]': query.creator ? query.creator.id : undefined,
        'search[creator_name]': query.creator ? query.creator.name : undefined,
        'search[name_matches]': query.nameMatches,
        'search[order]': query.order
      })
    )
  },
  user(id: number): string {
    return `/users/${id}.json`
  },
  users(query: Query.Users): string {
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
  wiki(id: number): string {
    return `/wiki_pages/${id}.json`
  },
  wikis(query: Query.Wikis): string {
    return (
      '/wiki_pages.json?' +
      queryStringify({
        'search[body_matches]': query.contentMatches,
        'search[creator_id]': query.creator ? query.creator.id : undefined,
        'search[creator_name]': query.creator ? query.creator.name : undefined,
        'search[order]': query.order,
        'search[title]': query.title
      })
    )
  }
}

const Danbooru2Converter: Converter = {
  post(data: any): Post {
    const tagTypes = ['general', 'character', 'copyright', 'artist', 'meta']
    const post: Post = {
      active: !data.is_deleted,
      children: data.has_children
        ? data.children?.map((child: Post) => child.id)
        : [],
      createdAt: data.created_at,
      creator: {
        id: data.uploader_id,
        name: data.uploader_name
      },
      dimensions: {
        height: data.image_height,
        width: data.image_width
      },
      files: {
        full: data.file_url,
        preview: data.preview_file_url,
        sample: data.large_file_url
      },
      id: parseInt(data.id, 10),
      md5: data.md5,
      parent: data.parent_id ? parseInt(data.parent_id, 10) : undefined,
      pools: data.pool_string ? data.pool_string.split(' ') : [],
      rating: convertRating(data.rating, 'char'),
      source: data.source,
      tagCount: {
        all: data.tag_count
      },
      tags: {
        all: data.tag_string.split(' ')
      },
      votes: {
        down: data.down_score,
        score: data.up_score - data.down_score,
        up: data.up_score
      }
    }
    tagTypes.forEach(type => {
      if (data[`tag_count_${type}`]) {
        post.tagCount[type] = data[`tag_count_${type}`]
        post.tags[type] = data[`tag_string_${type}`].split(' ')
      }
    })
    return post
  },
  user(data: any): User {
    return {
      banned: data.is_banned,
      id: data.id,
      level: data.level,
      name: data.name
    }
  },
  comment(data: any): Comment {
    return {
      active: !data.is_deleted,
      content: data.body,
      createdAt: data.created_at,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      id: data.id,
      postId: data.post_id,
      score: data.score
    }
  },
  note(data: any): Note {
    return {
      active: data.is_active,
      content: data.body,
      createdAt: data.created_at,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      dimensions: {
        height: data.height,
        width: data.width
      },
      id: data.id,
      position: {
        x: data.x,
        y: data.y
      },
      postId: data.post_id
    }
  },
  artist(data: any): Artist {
    return {
      about: data.notes,
      active: data.is_active,
      aliases: data.other_names,
      createdAt: data.created_at,
      creator: {
        id: data.creator_id
      },
      group: data.group_name,
      id: data.id,
      links: data.urls.map((obj: any) => obj.url),
      name: data.name
    }
  },
  pool(data: any): Pool {
    return {
      active: data.is_active,
      category: data.category,
      createdAt: data.created_at,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      description: data.description,
      id: data.id,
      name: data.name,
      postCount: data.post_count,
      postIds: data.post_ids.map(parseFloat)
    }
  },
  wiki(data: any): Wiki {
    return {
      active: !data.is_deleted,
      aliases: data.other_names,
      content: data.body,
      createdAt: data.created_at,
      creator: {
        id: data.creator_id,
        name: data.creator_name
      },
      id: data.id,
      title: data.title
    }
  }
}

export { Danbooru2 }
