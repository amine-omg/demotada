<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0B1A]/95 backdrop-blur-2xl p-6">
      <div class="bg-[#111022] rounded-[4rem] shadow-2xl max-w-7xl w-full h-[90vh] overflow-hidden border border-white/10 flex flex-col">
        
        <div class="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div class="flex items-center gap-8">
            <div class="flex gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500/40"></div>
              <div class="w-3 h-3 rounded-full" :class="isAnalyzing || isMapping || isGeneratingMaster ? 'bg-[#10B981] animate-pulse' : 'bg-[#10B981]/40'"></div>
            </div>
            <nav class="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
              <span class="transition-colors" :class="currentStep === 1 ? 'text-[#10B981]' : 'text-white/20'">01. Deep Scan</span>
              <span class="transition-colors" :class="currentStep === 2 ? 'text-[#10B981]' : 'text-white/20'">02. Vector Engine</span>
              <span class="transition-colors" :class="currentStep === 3 ? 'text-[#10B981]' : 'text-white/20'">03. Final Master</span>
              <span class="transition-colors" :class="currentStep === 4 ? 'text-[#10B981]' : 'text-white/20'">04. Data Structure</span>
            </nav>
          </div>
          
          <div v-if="currentStep > 0 && (isAnalyzing || isMapping || isGeneratingMaster)" class="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span class="text-[9px] font-black text-white/30 uppercase tracking-widest">Processing</span>
            <span class="text-xs font-mono text-emerald-400 font-bold">{{ countdown }}s</span>
          </div>

          <button @click="$emit('close')" class="text-white/20 hover:text-white transition-colors p-2">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>

        <div class="flex-1 flex overflow-hidden">
          
          <div v-if="currentStep === 0" class="w-full flex flex-col items-center justify-center bg-[#0D0B1A] relative overflow-hidden animate-in">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_60%)]"></div>
            
            <div class="w-24 h-24 mb-10 relative">
              <div class="absolute inset-0 border-4 border-white/5 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-[#10B981] rounded-full border-t-transparent animate-spin"></div>
              <div class="absolute inset-4 bg-[#10B981]/10 rounded-full animate-pulse"></div>
            </div>
            
            <h2 class="text-2xl font-black text-white uppercase tracking-[0.3em] mb-8 z-10">Synchronisation</h2>
            
            <div class="w-96 space-y-4 z-10">
              <div class="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 transition-all" :class="syncStatus.ocr === 'found' ? 'bg-[#10B981]/5 border-[#10B981]/20' : ''">
                <span class="text-xs font-black uppercase tracking-widest text-white/50">Scanner OCR & Vecteurs</span>
                <span v-if="syncStatus.ocr === 'pending'" class="w-4 h-4 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin"></span>
                <span v-else-if="syncStatus.ocr === 'found'" class="text-[#10B981] font-bold text-xs tracking-widest">TROUVÉ</span>
                <span v-else class="text-white/20 font-bold text-xs tracking-widest">REQUIS</span>
              </div>
              
              <div class="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 transition-all" :class="syncStatus.master === 'found' ? 'bg-[#10B981]/5 border-[#10B981]/20' : ''">
                <span class="text-xs font-black uppercase tracking-widest text-white/50">Master Page Vierge</span>
                <span v-if="syncStatus.master === 'pending'" class="w-4 h-4 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin"></span>
                <span v-else-if="syncStatus.master === 'found'" class="text-[#10B981] font-bold text-xs tracking-widest">TROUVÉE</span>
                <span v-else class="text-white/20 font-bold text-xs tracking-widest">REQUISE</span>
              </div>

              <div class="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 transition-all" :class="syncStatus.semantic === 'found' ? 'bg-[#10B981]/5 border-[#10B981]/20' : ''">
                <span class="text-xs font-black uppercase tracking-widest text-white/50">Matrice Sémantique</span>
                <span v-if="syncStatus.semantic === 'pending'" class="w-4 h-4 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin"></span>
                <span v-else-if="syncStatus.semantic === 'found'" class="text-[#10B981] font-bold text-xs tracking-widest">TROUVÉE</span>
                <span v-else class="text-white/20 font-bold text-xs tracking-widest">REQUISE</span>
              </div>
            </div>
          </div>

          <template v-else-if="currentStep < 4">
            <div class="w-1/2 p-12 font-mono text-sm overflow-y-auto bg-black/40 custom-scrollbar" ref="terminalBody">
              <div v-for="(log, i) in logs" :key="i" class="mb-3 animate-in fade-in">
                <span class="text-[#10B981]/50">[{{ log.time }}]</span>
                <span :class="log.type === 'cmd' ? 'text-[#10B981] font-bold' : (log.type === 'success' ? 'text-emerald-400' : 'text-emerald-50')" class="ml-3">
                  {{ log.type === 'cmd' ? '>' : '' }} {{ log.msg }}
                </span>
              </div>
              <div v-if="isAnalyzing || isGeneratingMaster" class="w-2 h-5 bg-[#10B981] animate-pulse inline-block ml-3 vertical-middle"></div>
            </div>

            <div class="w-1/2 relative bg-[#0D0B1A] flex items-center justify-center p-12 border-l border-white/5">
              <div class="relative w-full aspect-[1/1.414] bg-white rounded-3xl overflow-hidden shadow-2xl">
                <img :src="sourceImageUrl" class="relative z-10 w-full h-full object-contain p-6">
                <div v-if="isAnalyzing || isGeneratingMaster" class="absolute inset-x-0 h-1 bg-[#10B981] shadow-[0_0_35px_rgba(16,185,129,1)] top-0 animate-scan z-50 pointer-events-none"></div>
                <img v-if="masterUrl" :src="masterUrl" @error="masterUrl = null" class="absolute inset-0 z-30 w-full h-full object-contain p-6 animate-in fade-in duration-1000">
              </div>
            </div>
          </template>

          <template v-else>
            <div class="w-full flex p-12 gap-8 animate-in">
              <div class="w-1/2 flex flex-col h-full">
                <h4 class="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-4">Source Text Stream</h4>
                <div class="flex-grow bg-[#0D0B1A] rounded-[2.5rem] border border-white/5 p-8 overflow-hidden flex flex-col shadow-2xl">
                  <div ref="scrollBox" class="flex-1 overflow-y-auto custom-scrollbar font-mono text-[12px] leading-relaxed text-emerald-400/80 whitespace-pre-wrap">
                    {{ displayedFullText }}
                    <span v-if="isTextStreaming" class="w-2 h-4 bg-emerald-500 animate-pulse inline-block ml-1"></span>
                  </div>
                </div>
              </div>

              <div class="w-1/2 flex flex-col h-full">
                <h4 class="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Intelligence Analysis</h4>
                <div class="flex-grow bg-white rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar space-y-4 shadow-xl">
                  
                  <div v-if="currentStep < 4" class="h-full flex flex-col items-center justify-center text-center transition-all duration-300">
                    <div v-if="isGeneratingMaster" class="flex flex-col items-center opacity-40">
                      <div class="w-12 h-12 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                      <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Génération de la Master Page (IA)...</p>
                    </div>
                    <div v-else-if="isAnalyzing" class="flex flex-col items-center opacity-40">
                      <div class="w-12 h-12 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                      <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Extraction des vecteurs...</p>
                    </div>
                    <div v-else class="flex flex-col items-center animate-in">
                      <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-2xl mb-4">✨</div>
                      <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Base technique prête</p>
                      <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {{ masterUrl ? "Déployez l'IA pour structurer ces données" : "Générez le background vierge pour continuer" }}
                      </p>
                    </div>
                  </div>

                  <template v-else>
                    <div v-for="(value, key) in structuredData" :key="key" class="p-5 bg-gray-50 border border-gray-100 rounded-3xl flex flex-col gap-1 animate-in">
                      <span class="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{{ key }}</span>
                      <span class="text-xs font-bold text-[#443E73]">{{ value || '---' }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>

        </div>

        <div class="p-10 border-t border-white/5 flex justify-between items-center bg-black/20">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-white/30 uppercase tracking-widest">Engine Status</span>
            <span class="text-xs font-bold text-emerald-500 uppercase tracking-tighter italic">
              <template v-if="currentStep === 0">Recherche de données...</template>
              <template v-else-if="isGeneratingMaster">Génération IA en cours...</template>
              <template v-else-if="isMapping">Analyse Gemini en cours...</template>
              <template v-else-if="isAnalyzing">Scanning Layers...</template>
              <template v-else>Ready</template>
            </span>
          </div>

          <div class="flex gap-4">
            <button v-if="currentStep === 3" 
                    @click="masterUrl ? runSemanticIntelligence() : generateMasterBackground()" 
                    :disabled="isAnalyzing || isMapping || isGeneratingMaster"
                    class="px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all flex items-center gap-3"
                    :class="(isAnalyzing || isMapping || isGeneratingMaster) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#10B981] text-white hover:scale-105 shadow-lg'">
              <span v-if="isAnalyzing || isMapping || isGeneratingMaster" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              {{ isGeneratingMaster ? 'Génération Master...' : (isMapping ? 'Traitement sémantique...' : (!masterUrl ? 'Générer le background' : 'Structurer les données')) }}
            </button>

            <button v-if="currentStep === 4" 
                    @click="handleFinish" 
                    class="px-12 py-5 bg-white text-[#111022] rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-all">
              Terminer & Enregistrer
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '/services/api';

const props = defineProps(['isOpen', 'templateId', 'sourceImageUrl']);
const emit = defineEmits(['close', 'refresh', 'complete']);

const currentStep = ref(0);
const syncStatus = ref({ ocr: 'pending', master: 'pending', semantic: 'pending' });
const logs = ref([]);
const masterUrl = ref(null);
const isAnalyzing = ref(false);
const isGeneratingMaster = ref(false);
const terminalBody = ref(null);
const analysisResult = ref(null);
const countdown = ref(60);
let timerInterval = null;

const isMapping = ref(false);
const structuredData = ref(null);
const displayedFullText = ref("");
const isTextStreaming = ref(false);
const scrollBox = ref(null);

const addLog = async (msg, type = 'info') => {
  const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const newLog = { time, msg: '', type };
  logs.value.push(newLog);
  const chars = msg.split('');
  for (const char of chars) {
    newLog.msg += char;
    if (terminalBody.value) terminalBody.value.scrollTop = terminalBody.value.scrollHeight;
    await new Promise(r => setTimeout(r, 5));
  }
};

const startTextStreaming = (text) => {
  if (!text) return;
  isTextStreaming.value = true;
  displayedFullText.value = "";
  let i = 0;
  const stream = () => {
    if (i < text.length) {
      displayedFullText.value += text[i];
      i++;
      if (scrollBox.value && i % 20 === 0) scrollBox.value.scrollTop = scrollBox.value.scrollHeight;
      setTimeout(stream, 1);
    } else {
      isTextStreaming.value = false;
    }
  };
  stream();
};

const startTimer = () => { countdown.value = 60; timerInterval = setInterval(() => { if (countdown.value > 0) countdown.value--; }, 1000); };
const stopTimer = () => { if (timerInterval) clearInterval(timerInterval); };

const generateMasterBackground = async () => {
  isGeneratingMaster.value = true;
  startTimer();
  try {
    await addLog("🪄 IA EN COURS : GÉNÉRATION DU MASTER VIERGE...", "cmd");
    const cleanRes = await api.post('/api/templates/generate-master', { templateId: props.templateId });
    if (cleanRes.data.success) {
      masterUrl.value = `http://localhost:3000${cleanRes.data.masterUrl}?t=${Date.now()}`;
      await addLog("🎯 MASTER PAGE GÉNÉRÉE AVEC SUCCÈS.", "success");
    } else {
      throw new Error("Erreur inattendue de l'IA de rendu.");
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    await addLog(`❌ ERREUR : ${errorMsg}`, "cmd");
  } finally {
    isGeneratingMaster.value = false;
    stopTimer();
  }
};

const runDeepAnalysis = async (isForced = false) => {
  if (isAnalyzing.value && currentStep.value !== 0) return;
  isAnalyzing.value = true;
  currentStep.value = 0;
  syncStatus.value = { ocr: 'pending', master: 'pending', semantic: 'pending' };
  startTimer();
  logs.value = [];
  masterUrl.value = null;

  try {
    if (!isForced) {
      await new Promise(r => setTimeout(r, 600));
      try {
        const ocrCheck = await api.get(`/api/ocr/template/${props.templateId}`);
        const existingOcr = Array.isArray(ocrCheck.data) ? ocrCheck.data[0] : ocrCheck.data;

        if (existingOcr && existingOcr.fullText) {
          analysisResult.value = existingOcr;
          syncStatus.value.ocr = 'found';
          
          await new Promise(r => setTimeout(r, 600));
          
          syncStatus.value.master = 'found';
          masterUrl.value = `http://localhost:3000/uploads/backgrounds/${props.templateId}_master.png`;

          const semCheck = await api.get(`/api/semantics/template/${props.templateId}`);
          if (semCheck.data && semCheck.data.extractedData && Object.keys(semCheck.data.extractedData).length > 0) {
            structuredData.value = semCheck.data.extractedData;
            syncStatus.value.semantic = 'found';
            
            await new Promise(r => setTimeout(r, 800));
            displayedFullText.value = existingOcr.fullText;
            currentStep.value = 4;
            stopTimer();
            isAnalyzing.value = false;
            return;
          } else {
            syncStatus.value.semantic = 'not_found';
            await new Promise(r => setTimeout(r, 800));
            currentStep.value = 3;
            displayedFullText.value = existingOcr.fullText;
            stopTimer();
            isAnalyzing.value = false;
            return;
          }
        } else {
          syncStatus.value.ocr = 'not_found';
          syncStatus.value.master = 'not_found';
          syncStatus.value.semantic = 'not_found';
          await new Promise(r => setTimeout(r, 800));
        }
      } catch (e) {
        syncStatus.value.ocr = 'not_found';
        syncStatus.value.master = 'not_found';
        syncStatus.value.semantic = 'not_found';
        await new Promise(r => setTimeout(r, 800));
      }
    } else {
      syncStatus.value.ocr = 'not_found';
      syncStatus.value.master = 'not_found';
      syncStatus.value.semantic = 'not_found';
      await new Promise(r => setTimeout(r, 600));
    }

    currentStep.value = 1;
    await api.post('/api/layout', { templateId: props.templateId });
    await addLog("🚀 INITIALISATION DU SCANNER...", "cmd");

    const ocrRes = await api.post('/api/ocr/process-smart', { templateId: props.templateId, forceRefresh: isForced });
    if (!ocrRes.data.success) throw new Error("Erreur OCR");
    analysisResult.value = ocrRes.data.ocrData;

    await addLog(ocrRes.data.cached ? "♻️ CACHE OCR RÉCUPÉRÉ" : "🤖 SCAN GEMINI RÉUSSI", "success");

    currentStep.value = 2;
    startTextStreaming(analysisResult.value.fullText);

    await addLog("⚡ EXTRACTION DES VECTEURS...", "cmd");
    await api.post('/api/vectors/extract', { templateId: props.templateId });

    currentStep.value = 3;
    await addLog("✅ BASE TECHNIQUE PRÊTE.", "success");
    stopTimer();
  } catch (err) {
    await addLog(`❌ ERREUR : ${err.message}`, "cmd");
    stopTimer();
  } finally {
    isAnalyzing.value = false;
  }
};

const runSemanticIntelligence = async () => {
  isMapping.value = true;
  try {
    const res = await api.post('/api/semantics/identify', { templateId: props.templateId });
    if (res.data.success) {
      structuredData.value = res.data.extractedData;
      currentStep.value = 4;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isMapping.value = false;
  }
};

const handleFinish = () => {
  emit('complete', {
    templateId: props.templateId,
    progress: { layout: 'complete', vectors: 'complete', ocr: 'complete', master: 'complete', logic: 'complete' }
  });
  emit('close');
};

onMounted(() => { if(props.isOpen) runDeepAnalysis(); });
</script>

<style scoped>
@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
.animate-scan { animation: scan 2.5s infinite ease-in-out; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-in { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.text-emerald-400 { text-shadow: 0 0 5px rgba(52, 211, 153, 0.4); }
.vertical-middle { vertical-align: middle; }
</style>