<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import L from 'leaflet'; 

const props = defineProps<{
  lat: number;
  lng: number;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<L.Map | null>(null);
const markerInstance = ref<L.Marker | null>(null);

onMounted(() => {
  if (mapContainer.value) {
    mapInstance.value = L.map(mapContainer.value).setView([props.lat, props.lng], 15);
    L.tileLayer('/map-tiles/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.value);
    markerInstance.value = L.marker([props.lat, props.lng]).addTo(mapInstance.value);
  }
});

watch(() => [props.lat, props.lng], (newCoords) => {
  if (mapInstance.value && markerInstance.value) {
    const newLatLng = L.latLng(newCoords[0], newCoords[1]);
    mapInstance.value.setView(newLatLng, 15);
    markerInstance.value.setLatLng(newLatLng);
  }
});
</script>

<template>
  <div ref="mapContainer" style="height: 100%; width: 100%; border-radius: 0.375rem;"></div>
</template>