import { stringify as queryStringify } from 'query-string'
import convertRating from './../utils/rating-converter'

function postUriBuilder (query: PostsQuery | number): string {
  if (typeof query === 'number') {
    return `/posts/${query}.json`
  } else {
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

function postConverter (d: any): Post {
  const post: Post = {
    id: parseInt(d.id),
    createdAt: d.created_at,
    uploaderId: d.uploader_id,
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
      all: d.tag_count,
      general: d.tag_count_general,
      character: d.tag_count_character || 0,
      copyright: d.tag_count_copyright || 0,
      artist: d.tag_count_artist || 0,
      meta: d.tag_count_meta || 0
    },
    tags: {
      all: d.tag_string.split(' '),
      general: d.tag_string_general.split(' ')
    },
    children: d.has_children ? d.children_ids.split(' ').map(parseFloat) : [],
    pools: d.pool_string ? d.pool_string.split(' ') : []
  }
  if (d.source) post.source = d.source
  if (d.parent_id) post.parent = parseInt(d.parent_id)
  const tagTypes = ['character', 'copyright', 'artist', 'meta']
  tagTypes.forEach(type => {
    if (post.tagCount[type] && post.tagCount[type]! > 0) {
      post.tags[type] = d[`tag_string_${type}`].split(' ')
    }
  })
  return post
}

function postResponseProcessor (query: PostsQuery, data: Array<any>): Post[] {
  let posts: Post[] = []
  data.forEach(d => {
    const allTags = d.tag_string.split(' ')
    // Skip posts with unwanted tags
    if (query.exclude && query.exclude.length > 0) {
      if (query.exclude.some(tag => allTags.includes(tag))) {
        return
      }
    }
    // Create post object
    const post: Post = postConverter(d)
    posts.push(post)
  })
  return posts
}

export const Danbooru2: BooruType = {
  responseType: 'json',
  featureset: ['login', 'posts', 'pools', 'artists', 'comments', 'notes', 'tags', 'md5'],
  postUriBuilder,
  postConverter,
  postResponseProcessor
}