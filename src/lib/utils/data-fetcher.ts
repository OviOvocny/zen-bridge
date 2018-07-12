import axios from 'axios'
import convert from './xml-converter'

export default function dataFetcher(
  base: string,
  path: string,
  xml: boolean = false,
  config: object = {}
): Promise<any> {
  return axios
    .get(base + path, config)
    .then((res: any) => (xml ? convert(res.data) : res.data))
}
