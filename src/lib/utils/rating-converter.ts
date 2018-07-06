export default function convertRating(rating: string, form: string = 'char'): rating {
  switch(form) {
    case 'char':
      	switch(rating) {
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
      default:
        return 'explicit'
  }
}