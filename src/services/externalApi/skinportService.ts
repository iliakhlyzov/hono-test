import type {
  MarketItem,
  SkinportGetItemsResponse,
} from '../../types/services/skinportService/skinportService'
import { AxiosHttpClient } from './http/AxiosHttpClient'
import type { Currency } from '../../types/services/skinportService/currency'

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
      marketHashName: item.market_hash_name,
      suggestedPrice: item.suggested_price,
      minPrice: item.min_price,
    }))
  }
}

export const skinportService = new SkinportService()
