<script setup lang="ts">
import { defineProps, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { Opportunite } from '../../stores/crm'; 

const props = defineProps({
  opportunite: {
    type: Object as PropType<Opportunite>,
    required: true,
  },
});

const router = useRouter();

const goToDetail = () => {
    router.push({ 
        name: 'opportunite-detail', 
        params: { id: props.opportunite._id } 
    });
};

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

</script>

<template>
  <div class="opportunite-card" @click="goToDetail">
    <div class="card-header">
      <h4 class="card-title">{{ opportunite.nomOpportunite }}</h4>
      </div>

    <div class="card-body">
      <p class="valeur">{{ currencyFormatter.format(opportunite.valeur) }}</p>
      <p v-if="opportunite.formation" class="formation-title">
        {{ opportunite.formation.title }}
      </p>
    </div>

    <div class="card-footer">
      <div v-if="opportunite.proprietaire" class="proprietaire-info">
        <span class="avatar">{{ opportunite.proprietaire.nom.charAt(0) }}</span>
        <span>{{ opportunite.proprietaire.nom }}</span>
      </div>
      <div class="apprenants-info">
        <span class="icon">👥</span>
        <span>{{ opportunite.apprenants.length }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.opportunite-card {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31);
  cursor: pointer;
  border: 1px solid transparent;
  transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.opportunite-card:hover {
  box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31);
  border-color: #B2E9E1;
}

.card-header .card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #172b4d;
  margin: 0;
}

.card-body {
  margin: 1rem 0;
}

.card-body .valeur {
  font-size: 1.1rem;
  font-weight: bold;
  color: #FE8B7D; 
  margin: 0 0 0.5rem 0;
}

.card-body .formation-title {
    font-size: 0.8rem;
    color: #5e6c84;
    margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f4f5f7;
  padding-top: 0.75rem;
}

.proprietaire-info, .apprenants-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #42526e;
}

.avatar {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #dfe1e6;
  color: #172b4d;
  text-align: center;
  line-height: 24px;
  font-weight: bold;
  font-size: 0.75rem;
}
</style>