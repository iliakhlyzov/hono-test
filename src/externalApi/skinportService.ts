import type {
  Currency,
  MarketItem,
  SkinportGetItemsResponse,
} from '../types/externalApi/skinportService'
import {AxiosHttpClient} from "./http/AxiosHttpClient";

const DEFAULT_API_V1 = 'https://api.skinport.com/v1'

class SkinportService extends AxiosHttpClient {
  constructor() {
    super(DEFAULT_API_V1)
  }

  async getItemsV1(
    appId: number,
    currency: Currency,
    tradable: 0 | 1,
  ): Promise<MarketItem[]> {
    const data = await this.get<SkinportGetItemsResponse>(
      '/items',
      { app_id: appId, currency, tradable },
      {
        'Accept-Encoding': 'br',
      },
    )

    return data.map((item) => ({
      suggested_price: item.suggested_price,
      min_price: item.min_price,
    }))
  }
}

export const skinportService = new SkinportService()
