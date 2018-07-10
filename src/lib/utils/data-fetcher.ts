import axios from 'axios'
import convert from './xml-converter'

export default function dataFetcher(
  base: string,
  path: string,
  xml: boolean = false
): Promise<object> {
  return axios
    .get(base + path)
    .then((res: any) => (xml ? convert(res.data) : res.data))
}
