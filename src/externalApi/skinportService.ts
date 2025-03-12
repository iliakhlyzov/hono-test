import { SkinportGetItemsResponse } from '../types/externalApi/skinportService'

class SkinportService {
  async getItemsV1(
    appId: number = 730,
    currency: string = 'EUR',
    tradable: number = 0,
  ): Promise<SkinportGetItemsResponse> {
    const params = new URLSearchParams({
      app_id: String(appId),
      currency,
      tradable: String(tradable),
    })

    const response = await fetch(
      `https://api.skinport.com/v1/items?${params}`,
      {
        method: 'GET',
        headers: {
          'Accept-Encoding': 'br',
        },
      },
    )

    return await response.json()
  }
}

export const skinportService = new SkinportService()
