import axios, { AxiosError } from 'axios'
import { SHA1 } from 'jshashes'
import { stringify as queryStringify } from 'query-string'
import Booru from '../booru'
import {
  Artist,
  Comment,
  Credentials,
  Note,
  Pool,
  Post,
  User,
  Wiki
} from '../types/interfaces/data'
import { Converter, UriBuilder } from '../types/interfaces/helpers'
import * as Query from '../types/interfaces/queries'
import convertRating from '../utils/rating-converter'

class Moebooru extends Booru {
  readonly xml = false
  protected uriBuilder = MoebooruUriBuilder
  protected converter = MoebooruConverter

  /**
   * Salt used when hashing passwords, depends on the site you want to access.
   * Use {} where the password should go.
   * ```typescript
   * // Example with Konachan's salt
   * konachan.salt = 'So-I-Heard-You-Like-Mupkids-?--{}--'
   * ```
   */
  private pSalt: string = '{}'
  /** Setter for salt, checks if braces are present in the string */
  set salt(s: string) {
    if (!s.includes('{}')) {
      throw new Error(
        'Salt must include braces "{}" to indicate where to put the password'
      )
    }
    this.pSalt = s
  }
  /** Public getter for the salt */
  get salt() {
    return this.pSalt
  }

  set credentials(data: Credentials | undefined) {
    if (data && (!data.username || !data.key)) {
      throw new TypeError(
        'Invalid credentials object. See /interfaces/credentials in the docs.'
      )
    } else {
      this.pCredentials = data
        ? {
            key: new SHA1().hex(this.pSalt.replace('{}', data.key)),
            username: data.username
          }
        : undefined
    }
  }

  post(id: number): Promise<Post> {
    const uri = this.uriBuilder.post(id)
    return this.fetch(this.addAuth(uri)).then(res =>
      this.converter.post({
        data: res.posts[0],
        poolPostArray: res.pool_posts,
        tagMap: res.tags
      })
    )
  }

  posts(query: Query.Posts): Promise<Post[]> {
    const uri = this.uriBuilder.posts(query)
    return this.fetch(this.addAuth(uri)).then(res =>
      res.posts.map((post: any) => {
        return this.converter.post({
          data: post,
          poolPostArray: res.pool_posts,
          tagMap: res.tags
        })
      })
    )
  }

  vote(id: number, score: 0 | 1 | 2 | 3): Promise<boolean> {
    if (!this.loggedIn) {
      return Promise.reject(
        new Error('Credentials not set or invalid for this booru instance')
      )
    }
    const uri = this.base + this.uriBuilder.vote!(id, score)
    return axios.post(this.addAuth(uri), {}, this.fetchOptions).then(
      res => res.data.success,
      err => {
        throw new Error('API call was rejected: ' + err)
      }
    )
  }

  favorite(id: number): Promise<boolean> {
    return this.vote(id, 3)
  }

  unfavorite(id: number): Promise<boolean> {
    return this.vote(id, 0)
  }

  artist(name: string): Promise<Artist> {
    return this.artists({ nameMatches: name }).then(r => r[0])
  }

  user(id: number): Promise<User> {
    const uri = this.uriBuilder.user!(id)
    return this.fetch(this.addAuth(uri))
      .then(r => r[0])
      .then(this.converter.user)
  }

  note(id: number): Promise<Note> {
    throw new Error(
      `Moebooru cannot show a note by ID (passed ${id}), use the 'notes' method with a post ID`
    )
  }

  protected fetchThrow(err: AxiosError) {
    if (err.response) {
      if (typeof err.response.data === 'object') {
        err.message = err.response.data.reason
      }
    }
    throw err
  }

  protected genericSingle(type: string, id: number): Promise<any> {
    const uri = (this.uriBuilder as any)[type](id)
    return this.fetch(this.addAuth(uri)).then(data =>
      (this.converter as any)[type](data)
    )
  }

  protected genericQuery(type: string, query: Query.Any): Promise<any[]> {
    const uri = (this.uriBuilder as any)[`${type}s`](query)
    return this.fetch(this.addAuth(uri)).then((data: object[]) =>
      data.map((this.converter as any)[type])
    )
  }

  private addAuth(uri: string): string {
    if (this.loggedIn) {
      const auth = {
        login: this.pCredentials!.username,
        password_hash: this.pCredentials!.key
      }
      const authQuery = queryStringify(auth)
      const append = uri.includes('?') ? '&' + authQuery : '?' + authQuery
      return uri + append
    } else {
      return uri
    }
  }
}

const MoebooruUriBuilder: UriBuilder = {
  post(id: number): string {
    return `/post.json?api_version=2&include_pools=1&include_tags=1&tags=id:${id}`
  },
  posts(query: Query.Posts): string {
    let queryString = ''
    if (query.tags) {
      let tags = query.tags
      if (query.exclude) {
        tags = tags.concat(query.exclude.map(t => '-' + t))
      }
      queryString = queryStringify({
        ...query,
        tags: tags.join('+')
      })
    } else {
      queryString = queryStringify(query)
    }
    return (
      '/post.json?api_version=2&include_pools=1&include_tags=1&' + queryString
    )
  },
  vote(id: number, score: number): string {
    return `/post/vote.json?id=${id}&score=${score}`
  },
  artists(query: Query.Artists): string {
    return (
      '/artist.json?' +
      queryStringify({
        name: query.nameMatches,
        order: query.order
      })
    )
  },
  comment(id: number): string {
    return `/comment/show.json?id=${id}`
  },
  comments(query: Query.Comments): string {
    return (
      '/comment.json?' +
      queryStringify({
        post_id: query.postId
      })
    )
  },
  notes(query: Query.Notes): string {
    return query.contentMatches
      ? '/note/search.json?' +
          queryStringify({
            query: query.contentMatches
          })
      : '/note.json?' +
          queryStringify({
            post_id: query.postId
          })
  },
  pool(id: number): string {
    return `/pool/show.json?id=${id}`
  },
  pools(query: Query.Pools): string {
    return (
      '/pool.json?' +
      queryStringify({
        query: query.nameMatches
      })
    )
  },
  user(id: number): string {
    return `/user.json?id=${id}`
  },
  users(query: Query.Users): string {
    return (
      '/user.json?' +
      queryStringify({
        name: query.nameMatches
      })
    )
  },
  wikis(query: Query.Wikis): string {
    return (
      '/wiki.json?' +
      queryStringify({
        order: query.order,
        query: query.contentMatches
      })
    )
  }
}

const MoebooruConverter: Converter = {
  post({
    data,
    poolPostArray,
    tagMap
  }: {
    data: any
    poolPostArray: any[]
    tagMap: { [i: string]: string }
  }): Post {
    const tags = data.tags.split(' ')
    const post: Post = {
      active: data.status === 'active',
      children: data.has_children ? [1] : [],
      createdAt: new Date(data.created_at).toUTCString(),
      creator: {
        id: data.creator_id,
        name: data.author
      },
      dimensions: {
        height: data.height,
        width: data.width
      },
      files: {
        full: data.file_url,
        preview: data.preview_url,
        sample: data.sample_url
      },
      id: parseInt(data.id, 10),
      md5: data.md5,
      parent: data.parent_id ? parseInt(data.parent_id, 10) : undefined,
      pools: poolPostArray
        ? poolPostArray.filter(e => e.post_id === data.id).map(e => e.pool_id)
        : [],
      rating: convertRating(data.rating, 'char'),
      source: data.source,
      tagCount: {
        all: tags.length
      },
      tags: {
        all: tags
      },
      votes: {
        down: 0,
        score: data.score,
        up: data.score
      }
    }
    if (tagMap) {
      Object.keys(tagMap)
        .filter(tag => post.tags.all.includes(tag))
        .forEach(tag => {
          post.tagCount[tagMap[tag]]
            ? post.tagCount[tagMap[tag]]++
            : (post.tagCount[tagMap[tag]] = 1)
          post.tags[tagMap[tag]]
            ? post.tags[tagMap[tag]].push(tag)
            : (post.tags[tagMap[tag]] = [tag])
        })
    }
    return post
  },
  user(data: any): User {
    return {
      id: data.id,
      name: data.name
    }
  },
  comment(data: any): Comment {
    return {
      content: data.body,
      createdAt: data.created_at,
      creator: {
        id: data.creator_id,
        name: data.creator
      },
      id: data.id,
      postId: data.post_id
    }
  },
  note(data: any): Note {
    return {
      active: data.is_active,
      content: data.body,
      createdAt: data.created_at,
      creator: {
        id: data.creator_id
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
      aliases: data.alias_id ? [`id:${data.alias_id}`] : [],
      group: data.group_id,
      id: data.id,
      links: data.urls,
      name: data.name
    }
  },
  pool(data: any): Pool {
    return {
      active: data.is_public,
      createdAt: data.created_at,
      creator: {
        id: data.user_id
      },
      description: data.description,
      id: data.id,
      name: data.name,
      postCount: data.post_count,
      posts: data.posts ? data.posts : undefined
    }
  },
  wiki(data: any): Wiki {
    return {
      content: data.body,
      createdAt: data.created_at,
      id: data.id,
      title: data.title
    }
  }
}

export { Moebooru }
