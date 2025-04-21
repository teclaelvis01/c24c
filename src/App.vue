<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation -->
    <nav class="bg-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center">
          <div class="flex-shrink-0">
            <h1 class="text-xl font-bold tracking-wider">CHECK<span class="text-2xl">24</span> Code Challenge</h1>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-grow flex items-center justify-center">
      <div v-if="!showResults" class="text-center px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold text-blue-800 mb-12">Comparison of Credit Cards</h1>
        
        <button 
          @click="showResults = true" 
          class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-md transition-colors shadow-md"
        >
          Compare now
        </button>
      </div>

      <div v-else class="w-full">
        <div class="flex justify-between items-center mb-6 px-4">
          <h2 class="text-2xl font-bold text-blue-800">Results</h2>
          <button 
            @click="showResults = false" 
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Back to home
          </button>
        </div>
        <CreditCardList />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CreditCardList from './components/CreditCardList.vue'

const showResults = ref(false)
</script>

<style>
/* @import "tailwindcss/preflight";
@import "tailwindcss/utilities"; */
</style>