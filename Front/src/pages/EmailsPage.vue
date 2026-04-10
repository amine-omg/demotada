<script setup lang="ts">
import { computed, watch } from 'vue';
import { useEmailTemplatesStore } from '../stores/emailTemplatesStore';
import { useUserStore } from '../stores/user';
import EmailTemplateEditor from '../components/emails/EmailTemplateEditor.vue';

const props = defineProps<{
  etablissementId: string | null;
}>();

const emailTemplatesStore = useEmailTemplatesStore();
const userStore = useUserStore();

const ecoleId = computed(() => {
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext._id;
  }
  if (userStore.userRole === 'ecole' && userStore.user.associatedEntity) {
    return userStore.user.associatedEntity._id;
  }
  return null;
});

watch(() => props.etablissementId, (newId) => {
  if (newId) {
    emailTemplatesStore.fetchTemplates(newId);
  } else {
    emailTemplatesStore.templates = [];
    emailTemplatesStore.currentTemplate = null;
  }
}, { immediate: true });

const handleSelectTemplate = (templateId: string) => {
  emailTemplatesStore.selectTemplate(templateId);
};

</script>

<template>
  <div class="flex h-[calc(100vh-250px)]">
    <div class="w-1/4 bg-white border border-gray-200 rounded-l-lg p-6 overflow-y-auto">
      <h2 class="text-xl font-bold text-[#423B71] mb-4">Modèles d'e-mails</h2>
      <div v-if="emailTemplatesStore.isLoading">Chargement...</div>
      <ul v-else class="space-y-1">
        <li v-for="template in emailTemplatesStore.templates" :key="template._id">
          <a 
            @click.prevent="handleSelectTemplate(template._id)"
            href="#"
            class="block p-3 rounded-md text-sm font-medium"
            :class="[
              emailTemplatesStore.currentTemplate?._id === template._id 
                ? 'bg-[#DCD8F4] text-[#464279]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            {{ template.nom }}
          </a>
        </li>
      </ul>
    </div>

    <div class="flex-1 p-6 md:p-8 overflow-y-auto bg-white border-t border-r border-b border-gray-200 rounded-r-lg">
      <EmailTemplateEditor v-if="emailTemplatesStore.currentTemplate" />
      <div v-else class="text-center text-gray-500 mt-12">
          <p>Sélectionnez un modèle dans la liste de gauche pour commencer l'édition.</p>
      </div>
    </div>
  </div>
</template>