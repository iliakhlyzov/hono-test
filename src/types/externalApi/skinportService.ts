export interface SkinportItem {
  market_hash_name: string // Название предмета на торговой площадке
  currency: string // Валюта, в которой указаны цены
  suggested_price: number // Рекомендуемая цена
  item_page: string // Ссылка на страницу предмета
  market_page: string // Ссылка на страницу категории на маркете
  min_price: number | null // Минимальная цена (null, если данных нет)
  max_price: number | null // Максимальная цена (null, если данных нет)
  mean_price: number | null // Средняя цена (null, если данных нет)
  median_price: number | null // Медианная цена (null, если данных нет)
  quantity: number // Количество предметов в продаже
  created_at: number // Временная метка создания (в формате Unix timestamp)
  updated_at: number // Временная метка последнего обновления (в формате Unix timestamp)
}

export interface SkinportGetItemsResponse {
  items: SkinportItem[]
}
