interface SkinportItem {
  market_hash_name: string
  currency: string
  suggested_price: number
  item_page: string
  market_page: string
  min_price: number | null
  max_price: number | null
  mean_price: number | null
  median_price: number | null
  quantity: number
  created_at: number
  updated_at: number
}

export type SkinportGetItemsResponse = SkinportItem[]
export type MarketItem = Pick<SkinportItem, 'suggested_price' | 'min_price'>
