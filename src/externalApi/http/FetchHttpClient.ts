import type { HttpClient } from '../../types/externalApi/HttpClient'
import { ExtendedError } from '../../errors/ExtendedError'
import type { StatusCode } from 'hono/dist/types/utils/http-status'

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string) {}

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value.toString())
      }
    }

    return url.toString()
  }

  async request<T>(
    method: 'GET',
    endpoint: string,
    {
      params,
      body,
      headers,
    }: {
      params?: Record<string, string | number | boolean>
      body?: unknown
      headers?: HeadersInit
    } = {},
  ): Promise<T> {
    console.log(this.buildUrl(endpoint, params))
    console.log(headers)
    const response = await fetch(this.buildUrl(endpoint, params), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const test = await response.text()
      console.log('test', test)
      throw new ExtendedError(response.status as StatusCode, test)
    }

    return response.json()
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    headers?: HeadersInit,
  ): Promise<T> {
    return this.request<T>('GET', endpoint, { params, headers })
  }
}
