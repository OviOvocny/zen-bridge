// tslint:disable:no-expression-statement
// tslint:disable:object-literal-sort-keys
import { test } from 'ava'
import convertXml from './xml-converter'

test('converts sample xml', t => {
  const sample = `
    <posts count="2" offset="0">
      <post height="1400" score="0" file_url="https://simg3.gelbooru.com/1.png" parent_id="" has_comments="false" preview_width="150" preview_height="120"/>
      <post height="1600" score="8" file_url="https://simg3.gelbooru.com/2.png" parent_id="" has_comments="true" preview_width="150" preview_height="120"/>
    </posts>
  `
  const sampleObject = [
    {
      height: 1400,
      score: 0,
      file_url: 'https://simg3.gelbooru.com/1.png',
      parent_id: NaN,
      has_comments: false,
      preview_width: 150,
      preview_height: 120
    },
    {
      height: 1600,
      score: 8,
      file_url: 'https://simg3.gelbooru.com/2.png',
      parent_id: NaN,
      has_comments: true,
      preview_width: 150,
      preview_height: 120
    }
  ]
  return convertXml(sample).then(result => {
    t.deepEqual(result, sampleObject)
  })
})

test('rejects invalid xml', t => {
  const sample = `
    <posts count="2" offset="0"
      <post height=1400" score="0" file_url="https://simg3.gelbooru.com/1.png" parent_id="" has_comments="false" preview_width="150" preview_height="120"/>
      <post height="1600" score="8" file_url="https://simg3.gelbooru.com/2.png" parent_id="" has_comments="true" preview_width="150" preview_height="120"/>
    </pos ts>
  `
  return convertXml(sample)
    .then(res => {
      t.fail('Got result when should have thrown: ' + res)
    })
    .catch(err => {
      t.pass(err)
    })
})
