// tslint:disable:no-expression-statement
import { test } from 'ava'
import convertRating from './rating-converter';

test('converts single char ratings', t => {
  t.plan(4)
  t.is(convertRating('s'), 'safe')
  t.is(convertRating('q'), 'questionable')
  t.is(convertRating('e'), 'explicit')
  t.is(convertRating('r'), 'explicit')
})

test('converts full word ratings', t => {
  t.plan(4)
  t.is(convertRating('safe', 'full'), 'safe')
  t.is(convertRating('suggestive', 'full'), 'questionable')
  t.is(convertRating('questionable', 'full'), 'questionable')
  t.is(convertRating('explicit', 'full'), 'explicit')
})