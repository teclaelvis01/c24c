import { ref } from 'vue'
import type { CreditCard, CreditCardResponse, CreditCardFilters } from '@/types/creditCard'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useCreditCardService = () => {
  const creditCards = ref<CreditCard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })

  const fetchCreditCards = async (filters: CreditCardFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (filters.sortBy) queryParams.append('sort_by', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sort_order', filters.sortOrder)
      if (filters.page) queryParams.append('page', filters.page.toString())

      const response = await fetch(`${API_BASE_URL}/cards?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error('Error al obtener las tarjetas de crédito')
      }

      const data: CreditCardResponse = await response.json()
      creditCards.value = data.data
      pagination.value = data.pagination
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
    } finally {
      loading.value = false
    }
  }

  const updateCreditCard = async (id: number, updates: Partial<CreditCard>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la tarjeta de crédito')
      }

      const updatedCard = await response.json()
      const index = creditCards.value.findIndex((card) => card.id === id)
      if (index !== -1) {
        creditCards.value[index] = { ...creditCards.value[index], ...updatedCard }
      }
      return updatedCard
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    }
  }

  const getCreditCardById = async (id: number): Promise<CreditCard | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/${id}`)

      if (!response.ok) {
        throw new Error('Error al obtener la tarjeta de crédito')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    }
  }

  return {
    creditCards,
    loading,
    error,
    pagination,
    fetchCreditCards,
    updateCreditCard,
    getCreditCardById,
  }
}
