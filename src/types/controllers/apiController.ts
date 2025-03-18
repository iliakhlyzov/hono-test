import type { Currency } from '../services/skinportService/currency'

export interface GetSkinportRequestQuery {
  appId?: number
  currency?: Currency
  tradable?: 0 | 1
}

export interface PostPurchaseRequestBody {}
