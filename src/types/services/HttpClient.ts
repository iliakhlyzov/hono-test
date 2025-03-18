export interface HttpClient {
  get<T>(
    url: string,
    params?: Record<string, string>,
    headers?: HeadersInit,
  ): Promise<T>
}
