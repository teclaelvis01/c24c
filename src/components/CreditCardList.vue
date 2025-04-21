<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Credit Cards</h1>
      <button
        @click="toggleEditMode"
        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
      >
        {{ isEditMode ? 'Exit Edit Mode' : 'Edit Mode' }}
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex justify-center gap-4 mb-8">
      <select
        v-model="filters.sortBy"
        class="px-4 py-2 border rounded-lg"
        @change="handleFilterChange"
      >
        <option value="">Sort by</option>
        <option value="cost">Price</option>
        <option value="title">Title</option>
      </select>

      <select
        v-model="filters.sortOrder"
        class="px-4 py-2 border rounded-lg"
        @change="handleFilterChange"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-2">Loading credit cards...</p>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    >
      {{ error }}
    </div>

    <!-- Lista de tarjetas -->
    <div v-if="!loading && !error" class="space-y-4">
      <div
        v-for="card in creditCards"
        :key="card.id"
        class="bg-white border rounded-lg overflow-hidden shadow-sm"
      >
        <div class="p-6 flex flex-col md:flex-row md:items-center">
          <!-- Logo -->
          <div class="md:w-1/6 flex justify-center mb-4 md:mb-0">
            <img :src="card.logoUrl" :alt="card.title" class="h-24 object-contain" />
          </div>

          <!-- Información principal -->
          <div class="md:w-3/6 md:pl-6">
            <template v-if="isEditMode && editingCardId === card.id">
              <input
                v-model="editingCard.title"
                class="w-full px-3 py-2 border rounded-lg mb-2"
                placeholder="Card title"
              />
              <textarea
                v-model="editingCard.description"
                class="w-full px-3 py-2 border rounded-lg mb-2"
                rows="3"
                placeholder="Card description"
              />
              <div class="flex gap-4 mb-2">
                <div class="w-1/2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Annual Fee</label>
                  <input
                    v-model.number="editingCard.cost.amount"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg"
                    placeholder="Annual fee amount"
                  />
                </div>
                <div class="w-1/2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Year Fee</label>
                  <input
                    v-model.number="editingCard.firstYearFee.amount"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg"
                    placeholder="First year fee amount"
                  />
                </div>
              </div>
              <div class="flex gap-2 mt-2">
                <button
                  @click="saveCard(card.id)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  @click="cancelEdit"
                  class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </template>
            <template v-else>
              <h3 class="text-lg font-semibold text-blue-600">{{ card.id }}. {{ card.title }}</h3>
              <div class="card-text" v-html="card.description"></div>
              <div
                class="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
              >
                Available
              </div>
              <button
                v-if="isEditMode"
                @click="startEdit(card)"
                class="mt-2 text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </template>
          </div>

          <!-- Precio y acciones -->
          <div class="md:w-2/6 mt-4 md:mt-0 text-right">
            <div class="text-2xl font-bold text-blue-600">
              {{ card.cost.amount }} {{ card.cost.currencyCode }}
            </div>
            <div class="text-sm text-gray-600">Annual fee</div>
            <div class="text-xs text-gray-500">
              (first year fee: {{ card.firstYearFee.amount }} {{ card.firstYearFee.currencyCode }})
            </div>
            <div class="mt-1">Bank: {{ card.bank.name }}</div>
            <a
              :href="card.deepLink"
              target="_blank"
              class="inline-block mt-2 text-blue-600 hover:text-blue-800 hover:underline"
            >
              see offer on the web →
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="!loading && !error" class="flex justify-center mt-8">
      <button
        v-for="page in pagination.pages"
        :key="page"
        @click="handlePageChange(page)"
        :class="[
          'mx-1 px-4 py-2 rounded-lg',
          pagination.page === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300',
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCreditCardService } from '../services/creditCardService'
import type { CreditCard, CreditCardFilters } from '../types/creditCard'

const { creditCards, loading, error, pagination, fetchCreditCards, updateCreditCard } =
  useCreditCardService()

const isEditMode = ref(false)
const editingCardId = ref<number | null>(null)
const editingCard = ref<CreditCard>({
  id: 0,
  externalProductId: '',
  title: '',
  type: '',
  description: '',
  logoUrl: '',
  deepLink: '',
  cost: {
    amount: 0,
    currencyCode: 'EUR',
  },
  firstYearFee: {
    amount: 0,
    currencyCode: 'EUR',
  },
  incentiveAmount: {
    amount: 0,
    currencyCode: 'EUR',
  },
  bank: {
    id: 0,
    name: '',
  },
})

const filters = ref<CreditCardFilters>({
  sortBy: 'cost',
  sortOrder: 'asc',
  page: 1,
})

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    cancelEdit()
  }
}

const startEdit = (card: CreditCard) => {
  editingCardId.value = card.id
  editingCard.value = {
    id: card.id,
    externalProductId: card.externalProductId,
    title: card.title,
    type: card.type,
    description: card.description,
    logoUrl: card.logoUrl,
    deepLink: card.deepLink,
    cost: {
      amount: card.cost.amount,
      currencyCode: 'EUR',
    },
    firstYearFee: {
      amount: card.firstYearFee.amount,
      currencyCode: 'EUR',
    },
    incentiveAmount: {
      amount: card.incentiveAmount.amount,
      currencyCode: 'EUR',
    },
    bank: {
      id: card.bank.id,
      name: card.bank.name,
    },
  }
}

const cancelEdit = () => {
  editingCardId.value = null
  editingCard.value = {
    id: 0,
    externalProductId: '',
    title: '',
    type: '',
    description: '',
    logoUrl: '',
    deepLink: '',
    cost: {
      amount: 0,
      currencyCode: 'EUR',
    },
    firstYearFee: {
      amount: 0,
      currencyCode: 'EUR',
    },
    incentiveAmount: {
      amount: 0,
      currencyCode: 'EUR',
    },
    bank: {
      id: 0,
      name: '',
    },
  }
}

const saveCard = async (id: number) => {
  if (!editingCard.value.title || !editingCard.value.description) {
    error.value = 'Title and description are required'
    return
  }

  const updatedCard = await updateCreditCard(id, {
    title: editingCard.value.title,
    description: editingCard.value.description,
    cost: {
      amount: editingCard.value.cost?.amount ?? 0,
      currencyCode: 'EUR',
    },
    firstYearFee: {
      amount: editingCard.value.firstYearFee?.amount ?? 0,
      currencyCode: 'EUR',
    },
  })

  if (updatedCard) {
    editingCardId.value = null
    editingCard.value = {
      id: 0,
      externalProductId: '',
      title: '',
      type: '',
      description: '',
      logoUrl: '',
      deepLink: '',
      cost: {
        amount: 0,
        currencyCode: 'EUR',
      },
      firstYearFee: {
        amount: 0,
        currencyCode: 'EUR',
      },
      incentiveAmount: {
        amount: 0,
        currencyCode: 'EUR',
      },
      bank: {
        id: 0,
        name: '',
      },
    }
    await fetchCreditCards(filters.value)
  }
}

const handleFilterChange = () => {
  filters.value.page = 1
  fetchCreditCards(filters.value)
}

const handlePageChange = (page: number) => {
  filters.value.page = page
  fetchCreditCards(filters.value)
}

onMounted(() => {
  fetchCreditCards(filters.value)
})
</script>
