<template>
  <PipelineStep 
    label="Fonts" 
    :status="status" 
    :templateId="templateId"
    @run-step="$emit('run')"
  />
</template>

<script setup>
import PipelineStep from './PipelineStep.vue';
defineProps(['status', 'templateId']);
defineEmits(['run']);
</script>