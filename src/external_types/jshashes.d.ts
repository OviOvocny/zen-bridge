declare module 'jshashes' {
  class algorithm {
    constructor(options?: any)
    hex(s: string): string
    b64(s: string): string
    any(s: string, e: any[]): string
  }
  export class SHA1 extends algorithm {}
}
