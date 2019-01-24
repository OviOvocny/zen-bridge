import { rating } from '../types/aliases'

/**
 * Converts various representations of post ratings to the ZenBridge rating type
 * @param postRating Post rating received from booru
 * @param form Form of the rating
 */
export default function convertRating(
  postRating: string,
  form: string = 'char'
): rating {
  switch (form) {
    case 'char':
      switch (postRating) {
        case 's':
          return 'safe'
        case 'q':
          return 'questionable'
        case 'e':
        case 'r':
          return 'explicit'
        default:
          return 'explicit'
      }
    case 'full':
      if (postRating === 'suggestive') {
        return 'questionable'
      } else {
        return postRating as rating
      }
    default:
      return 'explicit'
  }
}
