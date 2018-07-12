// tslint:disable:no-expression-statement
// tslint:disable:object-literal-sort-keys
import { test } from 'ava'
import { Credentials } from '../../types/interfaces/data'
import { Danbooru2 } from './danbooru2'

const b = new Danbooru2('https://danbooru.donmai.us')
test('instantiates', t => t.true(b instanceof Danbooru2))

test('gets a post while logged out', t => {
  return b
    .post(1)
    .then(content => {
      t.truthy(typeof content === 'object')
    })
    .catch(err => {
      t.log(err)
      t.fail()
    })
})

test('rejects invalid credentials', t => {
  t.plan(2)
  t.false(b.loggedIn)
  // tslint:disable-next-line:no-object-literal-type-assertion
  t.throws(() => (b.credentials = {} as Credentials))
})

test('sets credentials', t => {
  t.plan(2)
  t.false(b.loggedIn)
  b.credentials = {
    username: process.env.DANBOORU_USERNAME!,
    key: process.env.DANBOORU_KEY!
  }
  t.true(b.loggedIn)
})

test('gets a post', t => {
  return b
    .post(1)
    .then(content => {
      t.truthy(typeof content === 'object')
    })
    .catch(err => {
      t.log(err)
      t.fail()
    })
})

test('searches posts', t => {
  return b
    .posts({
      limit: 2,
      random: true
    })
    .then(arr => {
      t.truthy(arr.length === 2)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('slices tags to 2', t => {
  return b
    .posts({
      limit: 2,
      tags: ['cat_girl', 'cat_ears', 'cat_tail']
    })
    .then(arr => {
      t.truthy(arr.length === 2)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('excludes tags', t => {
  return b
    .posts({
      limit: 1,
      tags: ['umbrella'],
      exclude: ['umbrella']
    })
    .then(arr => {
      t.truthy(arr.length === 0)
    })
    .catch(err => {
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

test('gets an artist', t => {
  return b
    .artist(152501)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.creator)
      t.is(content.creator!.id, 509825)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches artists', t => {
  t.plan(2)
  const q = 'momiji'
  return b
    .artists({
      nameMatches: q
    })
    .then(arr => {
      t.truthy(arr)
      let matches = true
      arr.forEach(a => {
        if (!a.name.includes(q) && !a.aliases.some(v => v.includes(q))) {
          matches = false
        }
      })
      t.truthy(matches)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('gets a comment', t => {
  return b
    .comment(1832633)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.creator)
      t.is(content.creator!.id, 372491)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches comments', t => {
  return b
    .comments({
      creator: {
        id: 1
      }
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].creator!.name, 'albert')
    })
    .catch(err => {
      t.fail(err)
    })
})

test('adds comments to a Post', t => {
  t.plan(2)
  return b
    .post(1)
    .then(post => {
      t.truthy(post)
      return b
        .comments(post)
        .then(populated => {
          t.truthy(populated.comments)
        })
        .catch(err => {
          t.fail(err)
        })
    })
    .catch(err => {
      t.fail(err)
    })
})

test('gets a note', t => {
  return b
    .note(8940)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.creator)
      t.is(content.creator!.id, 11347)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches notes', t => {
  return b
    .notes({
      contentMatches: 'Chii?',
      creator: {
        id: 11347
      }
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].postId, 7)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('adds notes to a Post', t => {
  t.plan(2)
  return b
    .post(7)
    .then(post => {
      t.truthy(post)
      return b
        .notes(post)
        .then(populated => {
          t.truthy(populated.notes)
        })
        .catch(err => {
          t.fail(err)
        })
    })
    .catch(err => {
      t.fail(err)
    })
})

test('gets a pool', t => {
  return b
    .pool(5674)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.creator)
      t.is(content.creator!.id, 78398)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches pools', t => {
  return b
    .pools({
      nameMatches: 'idolmaster'
    })
    .then(arr => {
      t.truthy(arr[0])
      t.regex(arr[0].name, /idolmaster/i)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches pools by user', t => {
  return b
    .pools({
      creator: {
        id: 1,
        name: 'albert'
      }
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].creator!.id, 1)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('gets an user', t => {
  return b
    .user(1)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.name)
      t.is(content.name!, 'albert')
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches users', t => {
  return b
    .users({
      nameMatches: 'albert'
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].id, 1)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches users with exact level', t => {
  return b
    .users({
      level: 50
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].level, 50)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches users in level range', t => {
  return b
    .users({
      level: [40, 50]
    })
    .then(arr => {
      t.truthy(arr[0])
      t.truthy(arr[0].level === 50 || arr[0].level === 40)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches users in undefined level range', t => {
  return b
    .users({
      level: [undefined, undefined]
    })
    .then(arr => {
      t.truthy(arr[0])
      t.truthy(typeof arr[0].level === 'number')
    })
    .catch(err => {
      t.fail(err)
    })
})

test('gets a wiki page', t => {
  return b
    .wiki(43568)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.title)
      t.is(content.title, 'help:api')
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches wiki pages', t => {
  return b
    .wikis({
      title: 'help:api'
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].id, 43568)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches wiki pages by user', t => {
  return b
    .wikis({
      creator: {
        id: 1,
        name: 'albert'
      }
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].creator!.id, 1)
    })
    .catch(err => {
      t.fail(err)
    })
})
