import { parseString } from 'xml2js'
import { parseNumbers, parseBooleans } from 'xml2js/lib/processors';

/**
 * Converts a XML-based booru API response to an object 
 * @param xml XML data to convert
 */
export default function convertXml(xml: string): Promise<object> {
  return new Promise((resolve, reject) => {
    parseString(xml, {
      attrValueProcessors: [parseNumbers, parseBooleans]
    }, (err, res) => {
      if (err) {
        reject(err)
      }
      const arr = res.posts.post.map((postData: any) => postData.$) 
      resolve(arr)
    })
  })
}