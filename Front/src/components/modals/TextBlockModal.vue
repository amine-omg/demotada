<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50" @click="$emit('cancel')">
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-[#62D6CA] rounded flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
            </div>
            <span class="text-lg font-medium text-[#62D6CA]">Éditeur de texte</span>
          </div>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Text Editor -->
        <div class="border-2 border-dashed border-[#62D6CA] rounded-lg p-6 mb-6">
          <!-- Rich Text Toolbar -->
          <div class="border border-gray-300 rounded-t-md bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-1 mb-0">
            <!-- Headings -->
            <button type="button" @click="formatText('h2')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 font-semibold bg-white">H2</button>
            <button type="button" @click="formatText('h3')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 font-semibold bg-white">H3</button>
            <button type="button" @click="formatText('h4')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 font-semibold bg-white">H4</button>
            <button type="button" @click="formatText('h5')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 font-semibold bg-white">H5</button>
            <button type="button" @click="formatText('h6')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 font-semibold bg-white">H6</button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <!-- Text formatting -->
            <button type="button" @click="formatText('bold')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 font-bold bg-white">B</button>
            <button type="button" @click="formatText('italic')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 italic bg-white">I</button>
            <button type="button" @click="formatText('underline')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 underline bg-white">U</button>
            <button type="button" @click="formatText('strikethrough')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 line-through bg-white">S</button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <!-- Tools -->
            <button type="button" @click="formatText('link')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white" title="Lien">🔗</button>
            <button type="button" @click="formatText('code')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white" title="Code">&lt;/&gt;</button>
            <button type="button" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white" title="Emoji">⚡</button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <!-- Lists -->
            <button type="button" @click="formatText('ul')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white">•</button>
            <button type="button" @click="formatText('ol')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white">1.</button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <!-- More tools -->
            <button type="button" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white" title="Emoji sourire">😊</button>
            <button type="button" @click="formatText('quote')" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white" title="Citation">""</button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <!-- Actions -->
            <button type="button" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white">—</button>
            <button type="button" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white">⊞</button>
            <button type="button" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white">↶</button>
            <button type="button" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white">↷</button>
          </div>

          <!-- Text Area -->
          <textarea
            ref="textAreaRef"
            v-model="textContent"
            class="w-full h-64 px-4 py-3 border border-t-0 border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-[#62D6CA] focus:border-transparent resize-none"
            placeholder="Tapez votre texte ici..."
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="saveText"
            class="px-4 py-2 bg-[#62D6CA] text-white rounded hover:bg-[#4FC3B7]"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['save', 'cancel'])
const props = defineProps(['block'])

const textContent = ref(props.block?.content || '')
const textAreaRef = ref<HTMLTextAreaElement | null>(null)

const formatText = (format: string) => {
  const textarea = textAreaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textContent.value.substring(start, end)
  let replacement = ''

  switch (format) {
    case 'bold':
      replacement = `**${selectedText}**`
      break
    case 'italic':
      replacement = `*${selectedText}*`
      break
    case 'underline':
      replacement = `__${selectedText}__`
      break
    case 'strikethrough':
      replacement = `~~${selectedText}~~`
      break
    case 'h2':
      replacement = `## ${selectedText}`
      break
    case 'h3':
      replacement = `### ${selectedText}`
      break
    case 'h4':
      replacement = `#### ${selectedText}`
      break
    case 'h5':
      replacement = `##### ${selectedText}`
      break
    case 'h6':
      replacement = `###### ${selectedText}`
      break
    case 'link':
      replacement = `[${selectedText}](url)`
      break
    case 'ul':
      replacement = `- ${selectedText}`
      break
    case 'ol':
      replacement = `1. ${selectedText}`
      break
    case 'quote':
      replacement = `> ${selectedText}`
      break
    case 'code':
      replacement = `\`${selectedText}\``
      break
    default:
      replacement = selectedText
  }

  const newText = textContent.value.substring(0, start) + replacement + textContent.value.substring(end)
  textContent.value = newText

  textarea.focus()
  const newCursorPos = start + replacement.length
  textarea.setSelectionRange(newCursorPos, newCursorPos)
}

const saveText = () => {
  const textData = {
    title: textContent.value.slice(0, 50) + (textContent.value.length > 50 ? '...' : '') || 'Bloc de texte',
    content: textContent.value,
    formattedContent: formatContentForDisplay(textContent.value)
  }

  emit('save', textData)
}

const formatContentForDisplay = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
}
</script>
