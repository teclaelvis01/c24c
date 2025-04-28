export interface CreditCard {
  id: number
  externalProductId: string
  title: string
  type: string
  description: string
  logoUrl: string
  deepLink: string
  incentiveAmount: IncentiveAmount
  cost: Cost
  bank: Bank
  processedFeatures?: Feature[]
}

export interface Feature {
  type: 'positive' | 'warning' | 'normal'
  text: string
}

export interface IncentiveAmount {
  amount: number
  currencyCode: string
}

export interface Cost {
  amount: number
  currencyCode: string
}

export interface Bank {
  id: number
  name: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface CreditCardResponse {
  data: CreditCard[]
  pagination: Pagination
}

export interface CreditCardFilters {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
} 