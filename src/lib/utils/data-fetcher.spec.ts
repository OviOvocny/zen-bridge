// tslint:disable:no-expression-statement
// tslint:disable:object-literal-sort-keys
import { test } from 'ava'
import dataFetcher from './data-fetcher'

test('fetches', t => {
  return dataFetcher('https://danbooru.donmai.us', '/posts/1.json').then(
    data => {
      t.truthy(typeof data === 'object')
    }
  )
})
