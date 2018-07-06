// tslint:disable:no-expression-statement
import { test } from 'ava'
import { Danbooru2 } from './danbooru2'

test('correct post search uri', t => {
  const postTestQuery: PostsQuery = {
    limit: 3,
    tags: ['cat_girl', 'hairband'],
    random: true
  }
  t.is(Danbooru2.uriBuilder.posts(postTestQuery), '/posts.json?limit=3&random=true&tags=cat_girl%20hairband')
})

test('correct empty search uri', t => {
  const emptyTestQuery: PostsQuery = {}
  t.is(Danbooru2.uriBuilder.posts(emptyTestQuery), '/posts.json')
})

test('correct overloaded search uri', t => {
  const postTestQuery: PostsQuery = {
    limit: 0,
    tags: ['cat_girl', 'hairband', 'lips'],
    random: false
  }
  t.is(Danbooru2.uriBuilder.posts(postTestQuery), '/posts.json?limit=0&random=false&tags=cat_girl%20hairband')
})