/**
 * Converts various representations of post ratings to the ZenBridge rating type
 * @param rating Post rating received from booru
 * @param form Form of the rating
 */
export default function convertRating(
  rating: string,
  form: string = 'char'
): rating {
  switch (form) {
    case 'char':
      switch (rating) {
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
      if (rating === 'suggestive') {
        return 'questionable'
      } else {
        return rating as rating
      }
    default:
      return 'explicit'
  }
}
