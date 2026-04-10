<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFormationsStore } from '../../stores/formations';

const formationStore = useFormationsStore();

interface ImageOption {
    imageUrl: string;
    isCorrect: boolean;
}

interface Question {
    _id?: string;
    text: string;
    type: 'image-qcm';
    imageOptions: ImageOption[];
    points: number;
    explanation?: string;
}

const props = defineProps<{ question: Question }>();
const emit = defineEmits(['save-question', 'cancel-edit']);

const editedQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)));

watch(() => props.question, (newVal) => {
  editedQuestion.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

const handleImgUpload = async (event: Event, index: number) => {
    const target = event.target as HTMLInputElement;
    if (target.files?.[0]) {
        editedQuestion.value.imageOptions[index].imageUrl = await formationStore.uploadLessonFile(target.files[0]);
    }
};

const saveQuestion = () => {
    if (!editedQuestion.value.text.trim()) return alert("Consigne manquante");
    emit('save-question', editedQuestion.value);
};
</script>

<template>
    <div class="bg-white p-6 rounded-xl border-2 border-yellow-100 shadow-sm space-y-6">
        <div>
            <label class="label text-yellow-600">Consigne visuelle</label>
            <input v-model="editedQuestion.text" type="text" class="input-field" placeholder="Ex: Cliquez sur les logos corrects">
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="(opt, index) in editedQuestion.imageOptions" :key="index" class="relative p-2 border-2 rounded-xl transition-all" :class="opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'">
                <div class="aspect-square bg-white rounded-lg mb-2 overflow-hidden flex items-center justify-center border border-gray-200">
                    <img v-if="opt.imageUrl" :src="opt.imageUrl" class="w-full h-full object-cover">
                    <i v-else class="fas fa-image text-2xl text-gray-200"></i>
                </div>
                <input type="file" @change="e => handleImgUpload(e, index)" class="text-[10px] w-full mb-2">
                <button @click="opt.isCorrect = !opt.isCorrect" class="w-full py-1 rounded text-[10px] font-bold uppercase" :class="opt.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'">
                    {{ opt.isCorrect ? 'Correcte' : 'Incorrecte' }}
                </button>
                <button v-if="editedQuestion.imageOptions.length > 2" @click="editedQuestion.imageOptions.splice(index, 1)" class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px]"><i class="fas fa-times"></i></button>
            </div>
            <button @click="editedQuestion.imageOptions.push({imageUrl: '', isCorrect: false})" class="aspect-square border-2 border-dashed border-yellow-200 rounded-xl flex flex-col items-center justify-center text-yellow-500 hover:bg-yellow-50 transition-colors">
                <i class="fas fa-plus text-xl mb-1"></i>
                <span class="text-[10px] font-bold uppercase">Ajouter</span>
            </button>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-50">
            <button @click="$emit('cancel-edit')" class="px-4 py-2 text-gray-400 font-bold uppercase text-xs">Annuler</button>
            <button @click="saveQuestion" class="px-6 py-2 bg-yellow-600 text-white rounded-lg font-bold uppercase text-xs shadow-md">Enregistrer</button>
        </div>
    </div>
</template>

<style scoped>
.label { @apply block text-[10px] font-black uppercase tracking-widest mb-1 text-gray-500; }
.input-field { @apply w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20 outline-none text-sm transition-all; }
</style>