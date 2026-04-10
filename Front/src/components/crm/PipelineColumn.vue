<script setup lang="ts">
import { defineProps, PropType } from 'vue';
import { useCrmStore } from '../../stores/crm';
import draggable from 'vuedraggable';
import OpportuniteCard from './OpportuniteCard.vue';

interface PipelineStage {
  name: string;
  order: number;
}

const props = defineProps({
  stage: {
    type: Object as PropType<PipelineStage>,
    required: true,
  },
});

const crmStore = useCrmStore();

const handleCardMove = (event: any) => {
  if (event.added || event.moved) {
    const change = event.added || event.moved;
    const movedOpportuniteId = change.element._id;
    const newStageName = props.stage.name;

    console.log(`Opportunité ${movedOpportuniteId} est maintenant dans ${newStageName}`);
    crmStore.updateOpportunite(movedOpportuniteId, { currentStage: newStageName });
  }
};
</script>

<template>
  <div class="pipeline-column">
    <h3 class="column-title">{{ stage.name }}</h3>
    
    <draggable
        class="card-list"
        :list="crmStore.getOpportunitesByStage(stage.name)"
        group="opportunites"
        item-key="_id"
        @change="handleCardMove"
    >
        <template #item="{ element: opportunite }">
            <OpportuniteCard :opportunite="opportunite" />
        </template>
    </draggable>
  </div>
</template>

<style scoped>
.pipeline-column {
  flex: 0 0 300px; 
  background-color: #f4f5f7;
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.column-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #5e6c84;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.card-list {
  min-height: 100px; 
  flex-grow: 1;
  overflow-y: auto; 
  padding: 0 0.5rem;
}
</style>