import type { Currency } from './currency'

const SKINPORT_KEY: string = 'skinport'

export const getSkinportItemsKey = (
  appId: number,
  currency: Currency,
  tradable: 0 | 1,
) => {
  return `${SKINPORT_KEY}:${appId}:${currency}:${tradable}`
}
