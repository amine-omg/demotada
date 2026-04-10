<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { useEmailTemplatesStore, type EmailTemplate, type EmailVariable } from '../../stores/emailTemplatesStore';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { VariablePill } from './VariablePillExtension';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const store = useEmailTemplatesStore();
const template = computed(() => store.currentTemplate);

const SingleLine = Extension.create({
  name: 'singleLine',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleKeyDown: (view, event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              return true;
            }
          },
        },
      }),
    ];
  },
});

const sujetEditor = useEditor({
  content: '',
  extensions: [ StarterKit, VariablePill, SingleLine ],
  editorProps: { attributes: { class: 'sujet-editor' } },
});

const corpsEditor = useEditor({
  content: '',
  extensions: [ StarterKit, VariablePill ],
  editorProps: { attributes: { class: 'tiptap-editor' } },
});

const convertPillsToTags = (htmlContent: string | null): string => {
  if (!htmlContent) return '';
  const regex = /<span[^>]*class="variable-pill"[^>]*data-tag="([^"]+)"[^>]*>.*?<\/span>/g;
  return htmlContent.replace(regex, '$1');
};

const parseAndRenderVariables = (htmlContent: string, variables: EmailVariable[]): string => {
  if (!htmlContent) return '';
  const variableMap = new Map(variables.map(v => [v.tag, v.description]));
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;

  return htmlContent.replace(regex, (match) => {
    const description = variableMap.get(match);
    if (description) {
      return `<span data-tag="${match}" class="variable-pill">${description}</span>`;
    }
    return match;
  });
};

watch(template, (newTemplate) => {
  if (newTemplate && sujetEditor.value && corpsEditor.value) {
    const sujetHtml = parseAndRenderVariables(newTemplate.sujet, newTemplate.variablesDisponibles);
    sujetEditor.value.commands.setContent(sujetHtml, false);

    const corpsHtml = parseAndRenderVariables(newTemplate.corps, newTemplate.variablesDisponibles);
    corpsEditor.value.commands.setContent(corpsHtml, false);
  }
}, { immediate: true, deep: true });

const insertVariable = (event: Event, editorType: 'sujet' | 'corps') => {
  const selectElement = event.target as HTMLSelectElement;
  const selectedTag = selectElement.value;
  const targetEditor = editorType === 'sujet' ? sujetEditor.value : corpsEditor.value;
  if (!selectedTag || !targetEditor || !template.value) return;
  const variableObject = template.value.variablesDisponibles.find(v => v.tag === selectedTag);
  if (variableObject) {
    targetEditor.chain().focus().setVariablePill({ 
        tag: variableObject.tag, 
        description: variableObject.description 
    }).run();
  }
  selectElement.value = '';
};

const handleSave = async () => {
    if (template.value && sujetEditor.value && corpsEditor.value) {
        try {
            const rawSujet = convertPillsToTags(sujetEditor.value.getHTML());
            const rawCorps = convertPillsToTags(corpsEditor.value.getHTML());
            
            await store.updateTemplate(template.value._id, { sujet: rawSujet, corps: rawCorps });
            alert('Modèle sauvegardé avec succès !');
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            alert(store.error || "Une erreur est survenue lors de la sauvegarde.");
        }
    }
};

onBeforeUnmount(() => {
  sujetEditor.value?.destroy();
  corpsEditor.value?.destroy();
});
</script>

<template>
  <div v-if="template && sujetEditor && corpsEditor">
    <h2 class="text-2xl font-bold text-gray-800">{{ template.nom }}</h2>
    <form @submit.prevent="handleSave" class="mt-6 space-y-6">
      
      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="label">Sujet de l'e-mail</label>
          <select @change="insertVariable($event, 'sujet')" class="text-sm border-gray-300 rounded-md">
            <option value="" disabled selected>Insérer...</option>
            <option v-for="variable in template.variablesDisponibles" :key="variable.tag" :value="variable.tag">{{ variable.description }}</option>
          </select>
        </div>
        <EditorContent :editor="sujetEditor" />
      </div>

      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="label">Corps de l'e-mail</label>
          <select @change="insertVariable($event, 'corps')" class="text-sm border-gray-300 rounded-md">
            <option value="" disabled selected>Insérer une variable...</option>
            <option v-for="variable in template.variablesDisponibles" :key="variable.tag" :value="variable.tag">{{ variable.description }}</option>
          </select>
        </div>
        
        <div class="border border-gray-300 rounded-t-md p-2 flex items-center gap-2 bg-gray-50">
          <button type="button" @click="corpsEditor.chain().focus().toggleBold().run()" :class="{ 'is-active': corpsEditor.isActive('bold') }" class="toolbar-btn">B</button>
          <button type="button" @click="corpsEditor.chain().focus().toggleItalic().run()" :class="{ 'is-active': corpsEditor.isActive('italic') }" class="toolbar-btn">I</button>
          <button type="button" @click="corpsEditor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': corpsEditor.isActive('bulletList') }" class="toolbar-btn">Liste</button>
        </div>
        
        <EditorContent :editor="corpsEditor" />
      </div>

      <div class="flex justify-end">
        <button type="submit" class="btn-primary" :disabled="store.isLoading">{{ store.isLoading ? 'Sauvegarde...' : 'Enregistrer les modifications' }}</button>
      </div>
      
    </form>
  </div>
</template>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700; }
.input-field { @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FE8B7D] focus:border-[#FE8B7D] sm:text-sm; }
.btn-primary { @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300 disabled:opacity-50; }

.tiptap-editor {
  @apply border-x border-b border-gray-300 rounded-b-md p-4 min-h-[300px] bg-white focus:outline-none;
}

/* On applique notre focus ring orange sur le conteneur */
.tiptap-editor:focus-within {
  @apply ring-2 ring-[#B2E9E1];
}

/*
  Et on s'assure de bien retirer l'outline par défaut de l'éditeur interne de TipTap.
  Le :deep() est nécessaire pour que le style s'applique à un élément enfant.
*/
:deep(.tiptap-editor .ProseMirror:focus) {
  @apply outline-none;
}

.toolbar-btn {
  @apply px-2 py-1 rounded-md hover:bg-gray-200 font-bold;
}

.toolbar-btn.is-active {
  @apply bg-gray-800 text-white;
}

/* --- STYLE POUR LES ÉDITEURS --- */
:deep(.sujet-editor) {
  @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500;
}
:deep(.sujet-editor p) {
  @apply m-0; /* Pour s'assurer qu'il n'y a pas de marge de paragraphe */
}

:deep(.tiptap-editor) {
  @apply border-x border-b border-gray-300 rounded-b-md p-4 min-h-[300px] bg-white focus:outline-none;
}
:deep(.tiptap-editor:focus-within), :deep(.sujet-editor:focus-within) {
  @apply ring-0 border-indigo-500;
}
:deep(.ProseMirror:focus) {
  @apply outline-none;
}

:deep(.variable-pill) {
  background-color: #FEAAA0;
  border: 0px solid #FEAAA0;
  color: #423B72;
  padding: 0px 6px;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 600;
  white-space: nowrap;
  display: inline-block; /* Important pour le bon affichage */
}
</style>