import { stringify as queryStringify } from 'query-string'
import convertRating from './../utils/rating-converter'

const tagTypes = ['general', 'character', 'copyright', 'artist', 'meta']

function postUriBuilder (id: number): string {
  return `/posts/${id}.json`
}

function postsUriBuilder (query: PostsQuery): string {
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

export const Danbooru2: BooruType = {
  responseType: 'json',
  featureset: ['login', 'posts', 'pools', 'artists', 'comments', 'notes', 'tags', 'md5'],
  uriBuilder: {
    post: postUriBuilder,
    posts: postsUriBuilder
  },
  dataParser: {
    post: postConverter,
    posts: data => data.map(postConverter)
  }
}