// tslint:disable:no-expression-statement
// tslint:disable:object-literal-sort-keys
import test from 'ava'
import dataFetcher from './data-fetcher'

test('fetches JSON', t => {
  return dataFetcher('https://danbooru.donmai.us', '/posts/1.json').then(
    data => {
      t.truthy(typeof data === 'object')
      t.truthy('id' in data)
      t.is(data.id, 1)
    }
  )
})

test('fetches XML', t => {
  return dataFetcher(
    'https://gelbooru.com',
    '/index.php?page=dapi&s=post&q=index&id=1',
    true
  )
    .then(d => d[0])
    .then(data => {
      t.truthy(typeof data === 'object')
      t.truthy('id' in data)
      t.is(data.id, 1)
    })
})
