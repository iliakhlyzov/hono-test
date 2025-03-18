import type { StatusCode } from 'hono/dist/types/utils/http-status'

export class ExtendedError extends Error {
  public status: StatusCode

  /**
   * @param {number} status
   * @param {string} message
   */
  constructor(status: StatusCode, message: string) {
    super(message)
    this.status = status
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
