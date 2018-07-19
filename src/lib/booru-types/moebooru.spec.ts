// tslint:disable:no-expression-statement
// tslint:disable:object-literal-sort-keys
import { test } from 'ava'
import { Credentials } from '../types/interfaces/data'
import { Moebooru } from './moebooru'

function login() {
  b.credentials = {
    username: process.env.DANBOORU_USERNAME!, // For fututre me: same login, this is intentional
    key: process.env.KONACHAN_PASSWORD!
  }
}

const b = new Moebooru('http://konachan.net')
test('instantiates', t => t.true(b instanceof Moebooru))

test.serial('checks salt', t => {
  t.plan(2)
  t.throws(() => {
    b.salt = 'So-I-Heard-You-Like-Mupkids-?--%s--'
  })
  t.notThrows(() => {
    b.salt = 'So-I-Heard-You-Like-Mupkids-?--{}--'
  })
})

test('rejects invalid credentials', t => {
  b.credentials = undefined
  t.plan(2)
  t.false(b.loggedIn)
  // tslint:disable-next-line:no-object-literal-type-assertion
  t.throws(() => (b.credentials = {} as Credentials))
})

test.serial('sets credentials', t => {
  t.plan(2)
  login()
  t.true(b.loggedIn)
  b.credentials = undefined
  t.false(b.loggedIn)
})

test('fails to add favorite logged out', t => {
  b.credentials = undefined
  return b
    .favorite(1)
    .then(() => t.fail('Then called'))
    .catch(err => t.pass(err))
})

test('fails to remove favorite logged out', t => {
  b.credentials = undefined
  return b
    .unfavorite(1)
    .then(() => t.fail('Then called'))
    .catch(err => t.pass(err))
})

test.serial('fails to add favorite bad login', t => {
  t.plan(2)
  b.credentials = {
    username: 'nope',
    key: 'nope'
  }
  return b
    .favorite(1)
    .then(() => {
      b.credentials = undefined
      t.fail('Then called')
    })
    .catch(err => t.true(err instanceof Error))
    .then(() => {
      b.credentials = undefined
      t.false(b.loggedIn)
    })
})

test.serial('adds favorite', t => {
  t.plan(3)
  login()
  t.true(b.loggedIn)
  return b
    .favorite(1)
    .then(t.true)
    .then(() => {
      b.credentials = undefined
      t.false(b.loggedIn)
    })
})

test.serial('removes favorite', t => {
  t.plan(3)
  login()
  t.true(b.loggedIn)
  return b
    .unfavorite(1)
    .then(t.true)
    .then(() => {
      b.credentials = undefined
      t.false(b.loggedIn)
    })
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
    .artist('riyo')
    .then(content => {
      t.true(content.name === 'riyo')
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches artists', t => {
  t.plan(2)
  const q = 'riyo'
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
    .comment(163500)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.creator)
      t.is(content.creator!.id, 73632)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches comments', t => {
  return b
    .comments({
      postId: 225731
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].creator!.name, 'otaku_emmy')
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

test('searches notes', t => {
  return b
    .notes({
      contentMatches: 'wait a minute'
    })
    .then(arr => {
      t.truthy(arr[0])
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
    .pool(5)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.creator)
      t.is(content.creator!.id, 1)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches pools', t => {
  return b
    .pools({
      nameMatches: 'Air artbook'
    })
    .then(arr => {
      t.truthy(arr[0])
      t.regex(arr[0].name, /air_artbook/i)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('gets an user', t => {
  return b
    .user(170591)
    .then(content => {
      t.truthy(typeof content === 'object')
      t.truthy(content.name)
      t.is(content.name!, 'Ovi')
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches users', t => {
  return b
    .users({
      nameMatches: 'dummy_user'
    })
    .then(arr => {
      t.truthy(arr[0])
      t.is(arr[0].id, 39950)
    })
    .catch(err => {
      t.fail(err)
    })
})

test('searches wiki pages', t => {
  return b
    .wikis({
      contentMatches: 'boots'
    })
    .then(arr => {
      t.truthy(arr[0])
    })
    .catch(err => {
      t.fail(err)
    })
})
