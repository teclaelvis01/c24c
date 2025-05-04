<template>
  <div class="relative">
    <div ref="editorRef" contenteditable="true"
      class="w-full px-3 py-2 border rounded-lg mb-1 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 prose prose-sm max-w-none"
      @input="handleInput" @click="handleClick" @keyup="handleKeyUp" v-html="modelValue"></div>
    <div v-if="showMarkerSelector" class="absolute bg-white shadow-lg rounded-lg p-2 flex gap-2 z-10 marker-selector"
      :style="markerSelectorStyle">
      <button @click="markLine('✅')" class="p-1 hover:bg-gray-100 rounded" title="Mark as OK">
        ✅
      </button>
      <button @click="markLine('！')" class="p-1 hover:bg-gray-100 rounded" title="Mark as Important">
        ！
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorRef = ref<HTMLElement | null>(null)
const showMarkerSelector = ref(false)
const markerSelectorStyle = ref({ top: '0px', left: '0px' })
const selectedLine = ref<HTMLElement | null>(null)

const updateMarkerPosition = (lineElement: HTMLElement, container: HTMLElement) => {
  const rect = lineElement.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  markerSelectorStyle.value = {
    top: `${rect.top - containerRect.top}px`,
    left: `${rect.left - containerRect.left}px`
  }
}

const updateSelectedLine = () => {
  if (!editorRef.value) return

  const selection = window.getSelection()
  if (!selection) {
    return;
  }
  const range = selection.getRangeAt(0)
  const lineElement = range.startContainer.parentElement

  if (!lineElement) {
    return;
  }
  const isAtStart = range.startOffset === 0
  const isFirstChild = lineElement === lineElement.parentElement?.firstChild

  if (isAtStart || isFirstChild) {
    selectedLine.value = lineElement
    updateMarkerPosition(lineElement, editorRef.value)
    showMarkerSelector.value = true
  } else {
    showMarkerSelector.value = false
  }


}

const handleInput = (e: Event) => {
  const target = e.target as HTMLElement
  emit('update:modelValue', target.innerHTML)
}

const handleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'DIV' && target.contentEditable === 'true') {
    updateSelectedLine()
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    showMarkerSelector.value = false
    return
  }
  if (showMarkerSelector.value) {
    updateSelectedLine()
  }
}

const markLine = (marker: string) => {
  if (!selectedLine.value) {
    return;
  }
  const lineText = selectedLine.value.textContent || ''
  const hasMarker = lineText.startsWith('✅') || lineText.startsWith('！')

  if (hasMarker) {
    if (lineText[0] !== marker) {
      selectedLine.value.textContent = marker + ' ' + lineText.substring(1).trim()
    }
  } else {
    selectedLine.value.textContent = marker + ' ' + lineText.trim()
  }

  showMarkerSelector.value = false
  emit('update:modelValue', editorRef.value?.innerHTML || '')

}

// Close selector when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.marker-selector') && !target.closest('[contenteditable="true"]')) {
    showMarkerSelector.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyUp)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyUp)
})
</script>