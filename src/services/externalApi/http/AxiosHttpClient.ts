import { ExtendedError } from '../../../errors/ExtendedError'
import type { StatusCode } from 'hono/dist/types/utils/http-status'
import type { HttpClient } from '../../../types/services/HttpClient'
import axios, { AxiosError } from 'axios'
import type { AxiosInstance } from 'axios'

export class AxiosHttpClient implements HttpClient {
  private readonly axiosInstance: AxiosInstance

  constructor(private readonly baseUrl: string) {
    this.axiosInstance = axios.create({ baseURL: baseUrl })
  }

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
      headers?: Record<string, string>
    } = {},
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url: endpoint,
        params,
        data: body,
        headers,
      })
      return response.data
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new ExtendedError(
          (error.response?.status as StatusCode) || 500,
          error.response?.data || 'Unknown error',
        )
      }

      throw error
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>('GET', endpoint, { params, headers })
  }
}
