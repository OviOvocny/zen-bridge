// tslint:disable:no-expression-statement
// tslint:disable:object-literal-sort-keys
import { test } from 'ava'
import ZenBridge, { BooruResult, Danbooru2, Moebooru } from '.'
import { Artist, Comment, Note, Post } from './lib/types/interfaces/data'

const db = new Danbooru2('https://danbooru.donmai.us')
const kc = new Moebooru('http://konachan.net')

const bridge = new ZenBridge([db, kc])

test.serial('queries multiple Boorus for content', t => {
  return bridge
    .query<Note>('notes', {
      postId: 7
    })
    .then(notes => {
      t.truthy(notes)
    })
})

test.serial('error status in result when its promise rejects', t => {
  return bridge
    .query<Post>('posts', {
      page: 9999 // Over 1000 limit on Danbooru2
    })
    .then(fails => {
      t.true(fails.some(f => f.status !== 'ok'))
    })
})

test.serial('aggregates posts from multiple Boorus', t => {
  return bridge
    .aggregate<Post>('posts', {
      tags: ['cat_girl', 'hairband']
    })
    .then(posts => {
      t.truthy(posts)
    })
})

test.serial('aggregates artists from multiple Boorus', t => {
  return bridge
    .aggregate<Artist>('artists', {
      nameMatches: 'nico'
    })
    .then(artists => {
      t.truthy(artists)
    })
})

test.serial('aggregates comments from multiple Boorus', t => {
  return bridge
    .aggregate<Comment>('comments', {
      postId: 1
    })
    .then(posts => {
      t.truthy(posts)
    })
})

test.serial('aggregate comparer defaults to always true', t => {
  return bridge
    .aggregate<Note>('notes', {
      postId: 1
    })
    .then(posts => {
      t.truthy(posts)
    })
})

test.serial('dedupes', t => {
  const testData: Array<BooruResult<Comment>> = [
    {
      base: 'booru1',
      status: 'ok',
      data: [
        {
          md5: 'test'
        }
      ]
    },
    {
      base: 'booru2',
      status: 'ok',
      data: [
        {
          md5: 'test'
        }
      ]
    }
  ]
  t.is(
    bridge.dedupe<Post>(testData, ZenBridge.builtInComparers.posts)[1].data
      .length,
    0
  )
})

test.serial('skips dedupe for array of single result', t => {
  const testData: Array<BooruResult<Comment>> = [
    {
      base: 'whatever',
      status: 'ok',
      data: [
        {
          id: 0
        }
      ]
    }
  ]
  function lazyComparer(current: Comment, data: Comment[]) {
    const trash = { current, data }
    return typeof trash === 'object'
  }
  t.is(bridge.dedupe<Comment>(testData, lazyComparer), testData)
})

test.serial('skips dedupe for errored results', t => {
  const testData: Array<BooruResult<Comment>> = [
    {
      base: 'whatever',
      status: 'ok',
      data: [
        {
          id: 0
        }
      ]
    },
    {
      base: 'whatever',
      status: 'error',
      data: [
        {
          err: 'oh no'
        }
      ]
    }
  ]
  function lazyComparer(current: Comment, data: Comment[]) {
    const trash = { current, data }
    return typeof trash === 'object'
  }
  t.is(bridge.dedupe<Comment>(testData, lazyComparer)[1].data[0].err, 'oh no')
})
