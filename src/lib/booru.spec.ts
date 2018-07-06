// tslint:disable:no-expression-statement
import { test } from 'ava'
import Booru from './booru'
import { Danbooru2 } from './booru-types/danbooru2';
const dd = new Booru(Danbooru2, 'https://danbooru.donmai.us', false)

test('searches for posts', t => {
  return dd.searchPosts({
    limit: 3,
    tags: ['cat_girl', 'hairband', 'cat_tail']
  }).then(res => {
    // console.dir(res)
    t.pass(JSON.stringify(res))
  }).catch(err => {
    t.fail(err)
  })
})

test('retrieves post by id', t => {
  return dd.getPostById(1).then(res => {
    // console.dir(res)
    t.pass(JSON.stringify(res))
  }).catch(err => {
    t.fail(err)
  })
})