// tslint:disable:no-expression-statement
import { test } from 'ava'
import Danbooru2 from './danbooru2'

const b = new Danbooru2('https://danbooru.donmai.us')

test('gets a post', t => {
  return b.post(1).then(post => {
    t.truthy(typeof post === 'object')
  }).catch(err => {
    console.error(err)
    t.fail()
  })
})

test('searches posts', t => {
  return b.posts({
    limit: 2,
    random: true
  }).then(postArr => {
    t.truthy(postArr.length == 2)
  }).catch(err => {
    t.fail(err)
  })
})

test('excludes tags', t => {
  return b.posts({
    limit: 1,
    tags: ['umbrella'],
    exclude: ['umbrella']
  }).then(postArr => {
    t.truthy(postArr.length == 0)
  }).catch(err => {
    t.fail(err)
  })
})

test('paginates', async t => {
  t.plan(3)
  const p1 = await b.posts({ limit: 1, page: 1 })
  const p2 = await b.posts({ limit: 1, page: 2 })
  t.truthy(typeof p1 === 'object')
  t.truthy(typeof p2 === 'object')
  t.notDeepEqual(p1, p2)
})