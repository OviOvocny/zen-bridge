// tslint:disable:no-expression-statement
import { test } from 'ava'
import ZenBridge from './index'
import Danbooru2 from './lib/booru-types/danbooru2'

const db = new Danbooru2('https://danbooru.donmai.us')
const sb = new Danbooru2('https://safebooru.donmai.us')

const zb = new ZenBridge([db, sb])

test.serial('queries multiple Boorus for notes', t => {
  return zb.query<Note>('notes', <Query.Notes>{
    postId: 7
  }).then(notes => {
    t.truthy(notes)
  })
})

test.serial('aggregates posts from multiple Boorus', t => {
  return zb.aggregate<Post>('posts', <Query.Posts>{
    tags: ['cat_girl', 'hairband']
  }).then(posts => {
    t.truthy(posts)
  })
})