export class ZenBridgeNetworkError extends Error {
  constructor(
    public status: number,
    public message: string,
    public url: string
  ) {
    super()
  }
}
