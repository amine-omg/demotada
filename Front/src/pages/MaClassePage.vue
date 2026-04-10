<template>
  <div class="flex flex-col min-h-screen bg-gray-50/50 w-full responsive-wrapper">
    <TheHeader
      :pageTitle="currentSession ? `Classe : ${currentSession.title}` : 'Chargement de la classe...'"
      :showBackButton="true"
      backButtonRoute="/sessions"
    />

    <main class="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8 bg-transparent">
      <div v-if="isLoading" class="text-center text-gray-600 text-lg mt-10">Chargement de la classe...</div>
      <div v-else-if="error" class="text-center text-red-600 text-lg mt-10">{{ error }}</div>
      <div v-else-if="!currentSession" class="text-center text-gray-600 text-lg mt-10">
        Aucune session trouvée pour cet ID. Une erreur est survenue.
      </div>
      
      <div v-else class="w-full">
        <div
          class="relative overflow-hidden w-full p-5 sm:p-6 md:p-8 mb-6 md:mb-8 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-500 group cursor-pointer bg-gradient-to-br from-[#FF8B7D] via-[#FE8B7D] to-[#423B72] hover:scale-[1.01] active:scale-[0.99]"
          @click="handleLiveSessionClick"
        >
          <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

          <div class="relative z-10 flex flex-col items-center w-full min-w-0">
            <div class="mb-2 md:mb-3 bg-white/20 p-2 md:p-3 rounded-full backdrop-blur-md shadow-inner">
              <i class="fas fa-video text-white text-lg md:text-2xl animate-pulse"></i>
            </div>
            
            <h2 class="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md leading-tight break-words max-w-full">
              Rejoindre le direct
            </h2>
            
            <div class="mt-3 flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 bg-black/10 rounded-full backdrop-blur-sm border border-white/10 w-fit max-w-full">
              <span class="flex h-2 w-2 flex-shrink-0">
                <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-[10px] sm:text-xs md:text-sm text-white font-medium opacity-90 truncate">{{ formatNextCourseInfo }}</span>
            </div>
          </div>

          <div class="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-10 -left-10 w-32 h-32 md:w-40 md:h-40 bg-[#423B72]/30 rounded-full blur-3xl"></div>
        </div>

        <div class="flex flex-col lg:flex-row gap-5 lg:gap-8 w-full">
          
          <section class="w-full lg:w-3/4 flex flex-col min-w-0">
            
            <div class="mb-5 border-b border-gray-200 w-full overflow-x-auto hide-scrollbar">
              <nav class="-mb-px flex space-x-6 md:space-x-8 flex-nowrap pb-2 px-1" aria-label="Tabs">
                <button @click="activeTab = 'parcours'" :class="['whitespace-nowrap pb-2 font-medium text-sm transition-colors duration-200 border-b-2', activeTab === 'parcours' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
                  Mon Parcours
                </button>

                <button @click="activeTab = 'feed'" :class="['whitespace-nowrap pb-2 font-medium text-sm transition-colors duration-200 border-b-2', activeTab === 'feed' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
                  Mur de la Classe
                </button>

                <button 
                  v-if="userStore.userRole === 'admin' || userStore.userRole === 'formateur' || userStore.userRole === 'ecole'"
                  @click="activeTab = 'progressions'" 
                  :class="['whitespace-nowrap pb-2 font-medium text-sm transition-colors duration-200 border-b-2', activeTab === 'progressions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
                >
                  Progressions
                </button>

                <button 
                  v-if="userStore.userRole !== 'apprenant'"
                  @click="activeTab = 'locks'" 
                  :class="['whitespace-nowrap pb-2 font-medium text-sm transition-colors duration-200 border-b-2', activeTab === 'locks' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
                >
                  Gestion des Verrous
                </button>
              </nav>
            </div>

            <div class="flex-1 w-full min-w-0">
              
              <div v-if="activeTab === 'parcours'" class="space-y-4 sm:space-y-6">
                <div v-if="isLoading" class="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                  Chargement du parcours...
                </div>
                
                <div v-else-if="!formation" class="text-center p-6 bg-white rounded-lg shadow-sm border border-red-100 text-red-500">
                  Impossible de charger le contenu de la formation.
                </div>

                <div v-else>
                  
                  <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 class="text-lg font-black text-[#423B71] flex items-center gap-2">
                        <i class="fas fa-route text-indigo-400"></i> Progression globale
                      </h3>
                      <p class="text-sm text-gray-500 mt-1">Vous avez complété <strong>{{ studentTotalProgress.completed }}</strong> activités sur <strong>{{ studentTotalProgress.total }}</strong>.</p>
                    </div>
                    <div class="w-full md:w-1/2 flex items-center gap-4">
                      <div class="w-full bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden relative">
                        <div 
                          :class="['h-full rounded-full transition-all duration-1000 ease-out', studentTotalProgress.percent === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-400 to-[#876EC8]']" 
                          :style="{ width: studentTotalProgress.percent + '%' }"
                        ></div>
                      </div>
                      <span class="text-2xl font-black text-[#423B71]">{{ studentTotalProgress.percent }}%</span>
                    </div>
                  </div>

                  <div
                    v-for="module in formation.modules"
                    :key="module._id"
                    @click="navigateToModule(module._id)"
                    :class="[
                      'p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 flex flex-col mb-4',
                      isModuleUnlocked(module._id) ? 'bg-white cursor-pointer hover:shadow-md hover:border-indigo-300' : 'bg-gray-50 opacity-75 cursor-not-allowed'
                    ]"
                  >
                    <div class="flex flex-row items-start sm:items-center w-full">
                      <div class="mr-3 sm:mr-4 md:mr-5 text-xl sm:text-2xl flex-shrink-0 mt-0.5 sm:mt-0">
                        <span v-if="getModuleStatus(module._id) === 'valide'" title="Validé par le formateur">✔️</span>
                        <span v-else-if="getModuleStatus(module._id) === 'termine'" title="Terminé, en attente de validation">📬</span>
                        <span v-else-if="getModuleStatus(module._id) === 'en_cours'" title="En cours" class="text-indigo-500"><i class="fas fa-play-circle"></i></span>
                        <span v-else title="Bloqué" class="text-gray-400"><i class="fas fa-lock"></i></span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h2 class="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-tight break-words">{{ module.name }}</h2>
                        <p v-if="getModuleStatus(module._id) === 'termine'" class="text-[11px] sm:text-xs md:text-sm text-blue-600 mt-1 font-medium leading-snug">
                          En attente de validation.
                        </p>
                        <p v-else-if="getModuleStatus(module._id) === 'bloque'" class="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-1 leading-snug">
                          Terminez le module précédent.
                        </p>
                      </div>
                    </div>

                    <div class="w-full mt-4 pt-4 border-t border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      
                      <div class="w-full xl:w-1/3 flex items-center gap-3">
                        <span class="text-xs font-bold text-gray-500 w-8 text-right">{{ getModuleProgress(module._id).percent }}%</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            :class="['h-full rounded-full transition-all duration-700', getModuleProgress(module._id).percent === 100 ? 'bg-green-500' : 'bg-indigo-400']" 
                            :style="{ width: getModuleProgress(module._id).percent + '%' }"
                          ></div>
                        </div>
                      </div>

                      <div class="flex flex-wrap items-center gap-2" v-if="getModuleQuizzes(module._id).length > 0">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1"><i class="fas fa-tasks mr-1"></i> Évaluations :</span>
                        
                        <div v-for="quiz in getModuleQuizzes(module._id)" :key="quiz._id"
                             class="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm"
                             :title="quiz.title">
                          
                          <i v-if="getQuizDisplayStatus(quiz) === 'passed'" class="fas fa-check-circle text-green-500"></i>
                          <i v-else-if="getQuizDisplayStatus(quiz) === 'failed'" class="fas fa-times-circle text-red-500"></i>
                          <i v-else class="fas fa-circle text-gray-300"></i>
                          
                          <span class="text-xs font-medium text-gray-700 max-w-[100px] truncate">{{ quiz.title }}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'feed'" class="bg-transparent p-0 rounded-lg w-full min-w-0">
                <ClassFeed :session-id="props.id" />
              </div>

              <div v-if="activeTab === 'progressions'" class="space-y-6 w-full min-w-0">
                <div class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                    <h3 class="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                      <i class="fas fa-chart-line text-indigo-500"></i>
                      Suivi des résultats
                    </h3>
                    <span class="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg w-fit">
                      {{ filteredProgressions.length }} résultat(s)
                    </span>
                  </div>
                  
                  <div class="w-full overflow-x-auto rounded-lg border border-gray-100 hide-scrollbar">
                    <table class="min-w-full table-auto">
                      <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th class="px-3 py-3 md:px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Apprenant</th>
                          <th class="px-3 py-3 md:px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contenu</th>
                          <th class="px-3 py-3 md:px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                          <th class="px-3 py-3 md:px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-50">
                        <tr v-for="prog in filteredProgressions" :key="prog._id" class="hover:bg-gray-50/80 transition-colors group">
                          <td class="px-3 py-3 md:px-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-2 md:mr-3 text-xs shadow-sm flex-shrink-0">
                                {{ prog.initiales }}
                              </div>
                              <div class="text-xs md:text-sm font-semibold text-gray-900 truncate max-w-[100px] md:max-w-none">
                                {{ prog.displayPrenom }} {{ prog.displayNom }}
                              </div>
                            </div>
                          </td>
                          <td class="px-3 py-3 md:px-4">
                            <div class="text-xs md:text-sm text-gray-600 font-medium line-clamp-2 md:line-clamp-1 min-w-[120px]">
                              {{ prog.contentName || prog.contentLabel || 'Exercice / QCM' }}
                            </div>
                          </td>
                          <td class="px-3 py-3 md:px-4 text-center">
                            <span 
                              :class="[
                                'inline-flex items-center justify-center px-2 py-1 md:px-3 rounded-full text-xs font-bold min-w-[50px]',
                                prog.isPassed ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                              ]"
                            >
                              {{ prog.score }} / {{ prog.maxScore }}
                            </span>
                          </td>
                          <td class="px-3 py-3 md:px-4 text-right">
                            <button 
                              v-if="!prog.isPassed"
                              @click="deleteProgression(prog._id)" 
                              class="md:opacity-0 group-hover:opacity-100 p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Réinitialiser pour permettre de recommencer"
                            >
                              <i class="fas fa-trash-alt"></i> Effacer
                            </button>
                            <span v-else class="text-[10px] md:text-xs font-bold text-gray-400 italic flex items-center justify-end">
                              <i class="fas fa-check-circle text-green-500 mr-1.5"></i> Validé
                            </span>
                          </td>
                        </tr>
                        <tr v-if="filteredProgressions.length === 0">
                          <td colspan="4" class="px-4 py-10 md:py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                              <div class="bg-gray-50 p-3 md:p-4 rounded-full mb-3">
                                <i class="fas fa-clipboard-list text-gray-300 text-2xl md:text-3xl"></i>
                              </div>
                              <p class="text-gray-500 font-medium text-sm md:text-base">Aucun score enregistré pour le moment.</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'locks'" class="space-y-6 w-full min-w-0">
                <div class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 w-full">
                  <div class="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
                    <h3 class="text-lg md:text-xl font-bold text-gray-800">Contrôle des accès</h3>
                    <select v-model="selectedStudentId" class="p-2.5 w-full md:w-64 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow">
                      <option :value="null">Choisir un apprenant...</option>
                      <option v-for="eleve in currentSession.elevesInscrits" :key="eleve.userId" :value="eleve.userId">
                        {{ eleve.prenom }} {{ eleve.nom }}
                      </option>
                    </select>
                  </div>

                  <div v-if="selectedStudentId && formation">
                    <div v-for="module in formation.modules" :key="module._id" class="mb-4 md:mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div class="bg-gray-50 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between border-b gap-3">
                        <span class="font-bold text-gray-800 text-base sm:text-lg flex-1 min-w-0 break-words">{{ module.name }}</span>
                        <div class="flex items-center justify-between sm:justify-start gap-3 bg-white px-3 py-2 sm:py-1.5 rounded-lg border border-gray-200 shadow-sm w-full sm:w-fit flex-shrink-0">
                          <span class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide">Accès Module</span>
                          <button 
                            @click="handleToggleLock(selectedStudentId, module._id, 'Module')"
                            :class="['relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', isContentUnlocked(selectedStudentId, module._id) ? 'bg-green-500' : 'bg-gray-300']"
                          >
                            <span class="sr-only">Débloquer module</span>
                            <span :class="[isContentUnlocked(selectedStudentId, module._id) ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                          </button>
                        </div>
                      </div>
                      
                      <div class="p-2 sm:p-4 space-y-1.5 sm:space-y-2 bg-white">
                        <div v-for="chapter in module.chapters" :key="chapter._id" class="flex items-center justify-between pl-2 sm:pl-4 py-2 border-l-2 border-transparent hover:border-indigo-400 hover:bg-indigo-50/30 rounded-r-lg transition-colors gap-2">
                          <span class="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2 sm:line-clamp-1 pr-2 flex-1 min-w-0 break-words">Chapitre : {{ chapter.title }}</span>
                          <button 
                            @click="handleToggleLock(selectedStudentId, chapter._id, 'Chapter', module._id)"
                            :class="['relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', isContentUnlocked(selectedStudentId, chapter._id) ? 'bg-indigo-400' : 'bg-gray-200']"
                          >
                            <span :class="[isContentUnlocked(selectedStudentId, chapter._id) ? 'translate-x-4' : 'translate-x-0', 'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-10 md:py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <div class="bg-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm border border-gray-100">
                      <i class="fas fa-user-lock text-indigo-300 text-xl md:text-2xl"></i>
                    </div>
                    <p class="text-gray-500 font-medium text-sm md:text-base px-4">Veuillez sélectionner un élève dans la liste<br class="hidden md:block"/>pour gérer ses autorisations.</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <aside class="w-full lg:w-1/4 flex flex-col gap-5 md:gap-6 min-w-0">
            <div class="bg-white p-4 md:p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 h-fit w-full">
              <h2 class="text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-4 md:mb-5 flex items-center justify-between">
                Membres de la classe
                <span v-if="currentSession" class="text-xs md:text-sm font-semibold bg-gray-100 text-gray-600 py-1 px-2 md:px-2.5 rounded-lg">
                  {{ (currentSession.formateurs.length || 0) + (currentSession.elevesInscrits.length || 0) }}
                </span>
              </h2>
              
              <button
                v-if="userStore.userRole === 'admin' || userStore.userRole === 'formateur'"
                @click="showAddEleveModal = true"
                class="w-full bg-[#B3E9E1] text-[#423B72] font-bold py-2.5 px-4 rounded-xl transition duration-300 ease-in-out flex items-center justify-center mb-5 md:mb-6 hover:bg-[#FF8B7D] hover:text-white text-sm md:text-base"
              >
                <i class="fas fa-user-plus mr-2"></i> Ajouter apprenant
              </button>

              <div v-if="currentSession.elevesInscrits.length === 0 && currentSession.formateurs.length === 0" class="text-gray-500 text-xs md:text-sm text-center py-4 italic">
                Aucun membre.
              </div>
              
              <ul class="space-y-2 md:space-y-2.5">
                <li v-for="formateur in currentSession.formateurs" :key="formateur.userId" class="p-2 md:p-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center">
                  <img v-if="formateur.photo" :src="formateur.photo" alt="Photo" class="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 object-cover shadow-sm flex-shrink-0">
                  <div v-else class="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 bg-blue-200 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0"><i class="fas fa-chalkboard-teacher text-xs md:text-sm"></i></div>
                  <div class="flex flex-col flex-1 min-w-0">
                    <span class="font-bold text-blue-900 text-xs md:text-sm truncate">{{ formateur.prenom }} {{ formateur.nom }}</span>
                    <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-0.5">Formateur</span>
                  </div>
                </li>
                
                <template v-for="eleve in currentSession.elevesInscrits" :key="eleve.userId">
                  <li
                    v-if="userStore.userRole === 'admin' || userStore.userRole === 'formateur'"
                    @click="openEleveDetailModal(eleve)"
                    :class="['p-2 md:p-2.5 border rounded-xl flex items-center cursor-pointer transition-all duration-200 ease-in-out',
                            eleve.isMuted ? 'bg-gray-100 border-gray-200 opacity-75' : 'bg-white border-gray-100 hover:border-indigo-200'
                            ]"
                  >
                    <img v-if="eleve.photo" :src="eleve.photo" alt="Photo" class="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 object-cover shadow-sm flex-shrink-0">
                    <div v-else class="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm flex-shrink-0"><i class="fas fa-user text-xs md:text-sm"></i></div>
                    
                    <span class="font-semibold text-gray-700 text-xs md:text-sm flex-1 min-w-0 truncate">{{ eleve.prenom }} {{ eleve.nom }}</span>
                    
                    <div class="flex items-center gap-1 md:gap-1.5 ml-1 md:ml-2 flex-shrink-0">
                      <span v-if="eleve.hasDisability" class="text-yellow-500 bg-yellow-50 p-1 md:p-1.5 rounded-md" title="Handicap">
                          <i class="fas fa-wheelchair text-[10px] md:text-xs"></i>
                      </span>
                      <span v-if="eleve.isMuted" class="text-red-400 bg-red-50 p-1 md:p-1.5 rounded-md" title="Sourdine">
                          <i class="fas fa-volume-mute text-[10px] md:text-xs"></i>
                      </span>
                    </div>
                  </li>
                  
                  <li
                    v-else-if="userStore.userRole === 'apprenant'"
                    :class="[
                      'p-2 md:p-2.5 border border-gray-100 bg-white rounded-xl flex items-center cursor-default',
                      eleve.isMuted ? 'opacity-70 bg-gray-50' : ''
                    ]"
                  >
                    <img v-if="eleve.photo" :src="eleve.photo" alt="Photo" class="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 object-cover shadow-sm flex-shrink-0">
                    <div v-else class="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm flex-shrink-0"><i class="fas fa-user text-xs md:text-sm"></i></div>
                    <span class="font-semibold text-gray-700 text-xs md:text-sm flex-1 min-w-0 truncate">{{ eleve.prenom }} {{ eleve.nom }}</span>
                    
                    <span v-if="eleve.userId === userStore.user.id && eleve.isMuted" class="ml-1 md:ml-2 text-red-400 bg-red-50 p-1 md:p-1.5 rounded-md flex-shrink-0" title="Vous êtes mis en sourdine">
                        <i class="fas fa-volume-mute text-[10px] md:text-xs"></i>
                    </span>
                  </li>
                </template>
              </ul>

              <div v-if="userStore.userRole !== 'apprenant' && currentSession" class="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-gray-100">
                <div class="flex flex-col gap-2 md:gap-3">
                  <div>
                    <h3 class="font-bold text-gray-800 text-xs md:text-sm flex items-center gap-1.5 md:gap-2">
                      <i class="fas fa-robot text-indigo-500"></i> Mode Autonome
                    </h3>
                    <p class="text-[10px] md:text-xs text-gray-500 mt-1 leading-snug">
                      {{ currentSession.isAutonomyEnabled ? "Les apprenants enchaînent les modules sans blocage." : "La progression se fait étape par étape manuellement." }}
                    </p>
                  </div>
                  <button
                    @click="sessionStore.toggleAutonomy(props.id)"
                    :class="[
                      'w-full font-bold py-2 px-3 md:px-4 rounded-lg transition-colors text-xs md:text-sm shadow-sm',
                      currentSession.isAutonomyEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                    ]"
                    :disabled="sessionStore.isLoading"
                  >
                    {{ sessionStore.isLoading ? '...' : (currentSession.isAutonomyEnabled ? 'Désactiver le mode' : 'Activer le mode') }}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>

  <EvaluationRunnerFullScreen 
  v-if="showPositioningModal"
  :show="showPositioningModal"
  :formationId="formation._id"
  evaluationType="positioning"
  :evaluationData="positioningTestData" 
  @close="showPositioningModal = false"
  @on-complete="handleTestCompleted"
/>

    <div v-if="showAddEleveModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white p-5 md:p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-user-plus text-indigo-500"></i> Ajouter un élève
        </h3>
        
        <div class="mb-5">
          <label for="eleveEmail" class="block text-sm font-bold text-gray-700 mb-1.5">Email de l'élève</label>
          <input
            type="email"
            id="eleveEmail"
            v-model="eleveEmailToAdd"
            class="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
            placeholder="prenom.nom@exemple.com"
          />
        </div>

        <div v-if="addEleveError" class="text-red-500 text-xs md:text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
          <i class="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
          <span>{{ addEleveError }}</span>
        </div>
        
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button
            @click="showAddEleveModal = false; eleveEmailToAdd = ''; addEleveError = ''"
            class="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            @click="handleAddEleve"
            :disabled="sessionStore.isLoading"
            class="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            <i v-if="sessionStore.isLoading" class="fas fa-spinner fa-spin"></i>
            {{ sessionStore.isLoading ? 'Ajout...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEleveDetailModal && selectedEleve" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white p-5 md:p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div class="flex justify-between items-start mb-5 md:mb-6">
          <h3 class="text-lg md:text-xl font-bold text-gray-800">Profil apprenant</h3>
          <button @click="closeEleveDetailModal" class="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="flex items-center gap-4 md:gap-5 mb-6 md:mb-8 p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/50">
          <img v-if="selectedEleve.photo" :src="selectedEleve.photo" alt="Photo élève" class="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0">
          <div v-else class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center text-indigo-300 text-2xl md:text-3xl flex-shrink-0 shadow-sm border border-indigo-50"><i class="fas fa-user"></i></div>
          
          <div class="flex flex-col min-w-0">
            <p class="text-lg md:text-xl font-bold text-gray-800 truncate leading-tight">{{ selectedEleve.prenom }} {{ selectedEleve.nom }}</p>
            <p class="text-xs md:text-sm text-gray-500 truncate mb-2">{{ selectedEleve.email }}</p>
            
            <div class="flex flex-wrap gap-1.5 mt-1">
              <span v-if="selectedEleve.hasDisability" class="inline-flex items-center text-[10px] md:text-xs font-bold text-yellow-700 bg-yellow-100 px-2 md:px-2.5 py-1 rounded-md w-fit">
                  <i class="fas fa-wheelchair mr-1.5"></i> Handicap
              </span>
              <span v-if="selectedEleve.isMuted" class="inline-flex items-center text-[10px] md:text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 md:px-2.5 py-1 rounded-md w-fit">
                  <i class="fas fa-volume-mute mr-1.5"></i> Sourdine
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <button @click="handleSendMessage(selectedEleve!.userId)" class="w-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2.5 md:py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors shadow-sm text-sm md:text-base">
            <i class="fas fa-comment-dots mr-2 text-indigo-500"></i> Démarrer discussion
          </button>
          
          <button
            @click="handleToggleMute(selectedEleve!.userId)"
            :class="['w-full flex items-center justify-center font-bold py-2.5 md:py-3 px-4 rounded-xl transition-colors shadow-sm border text-sm md:text-base',
                     selectedEleve?.isMuted ? 'bg-green-50 border-green-100 hover:bg-green-100 text-green-700' : 'bg-orange-50 border-orange-100 hover:bg-orange-100 text-orange-700'
                    ]"
          >
            <i :class="['mr-2', selectedEleve?.isMuted ? 'fas fa-volume-up' : 'fas fa-volume-mute']"></i>
            {{ selectedEleve?.isMuted ? 'Réactiver les posts' : 'Restreindre les posts' }}
          </button>

          <button @click="handleRemoveEleve(selectedEleve!.userId)" class="w-full flex items-center justify-center bg-red-50 border border-red-100 text-red-600 font-bold py-2.5 md:py-3 px-4 rounded-xl hover:bg-red-100 transition-colors mt-4 md:mt-6 text-sm md:text-base">
            <i class="fas fa-user-minus mr-2"></i> Retirer de la session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore, type SessionUser } from '../stores/sessionStore';
import { useCoursStore } from '../stores/coursStore';
import { useUserStore } from '../stores/user';
import { useFormationsStore } from '../stores/formations'; 
import { useProgressionStore } from '../stores/progressionStore'; 
import TheHeader from '../components/TheHeader.vue';
import ClassFeed from '../components/ClassFeed.vue';
import api from '/services/api';
import EvaluationRunnerFullScreen from '../components/modals/EvaluationRunnerFullScreen.vue';
import { useStudyTracker } from '../composables/useStudyTracker';


const props = defineProps<{
  id: string;
}>();

useStudyTracker(() => props.id, 'classe');

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const coursStore = useCoursStore();
const userStore = useUserStore();
const formationStore = useFormationsStore(); 
const progressionStore = useProgressionStore(); 

const currentSession = computed(() => sessionStore.currentSession);
const nextCoursData = computed(() => coursStore.nextCoursData);
const isNextCoursLive = computed(() => coursStore.nextCoursData.isLive);
const formation = computed(() => formationStore.currentFormation);
const progressions = computed(() => progressionStore.progressions);
const nextCoursMessage = computed(() => coursStore.nextCoursData.message);
const nextCours = computed(() => coursStore.nextCoursData.nextCours);

const isLoading = ref(true); 
const error = ref<string | null>(null);
const activeTab = ref('parcours');
const showAddEleveModal = ref(false);
const eleveEmailToAdd = ref('');
const addEleveError = ref('');
const showEleveDetailModal = ref(false);
const selectedEleve = ref<SessionUser | null>(null);
const selectedStudentId = ref<string | null>(null);

// Assurez-vous que ces refs sont bien déclarées
const showPositioningModal = ref(false);
const positioningTestData = ref(null);

const loadPageData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const sessionData = await sessionStore.fetchSessionById(props.id);
    if (!sessionData) throw new Error("Session non trouvée.");

    // Chargement des dépendances
    await Promise.all([
      coursStore.fetchNextCoursForSession(props.id),
      coursStore.fetchCoursForSession(props.id),
      formationStore.fetchFormationById((sessionData.formation as any)._id),
      progressionStore.fetchProgressionForSession(props.id)
    ]);

    // ================= DEBUG LOGS =================
    console.log("1. Rôle utilisateur:", userStore.userRole);
    console.log("2. Formation chargée:", formation.value?.title);
    console.log("3. Liste des évaluations reçues:", formation.value?.evaluations);
    // ==============================================

    if (userStore.userRole === 'apprenant' && formation.value && formation.value.evaluations) {
      
      const activeTest = formation.value.evaluations.find(
        e => e.type === 'positioning' && e.isEnabled === true
      );

      console.log("4. Test de positionnement actif trouvé ?", activeTest ? "OUI" : "NON");

      if (activeTest && activeTest.questions?.length > 0) {
        console.log("5. Nombre de questions dans le test:", activeTest.questions.length);
        
        try {
          const checkUrl = `/api/user-evaluations/check/${formation.value._id}/positioning`;
          console.log("6. Appel API de vérification:", checkUrl);
          
          const checkRes = await api.get(checkUrl);
          console.log("7. L'élève a déjà fait le test ?", checkRes.data.hasCompleted ? "OUI (Modal caché)" : "NON (Affichage Modal)");
          
          if (!checkRes.data.hasCompleted) {
            positioningTestData.value = activeTest;
            showPositioningModal.value = true;
          }
        } catch (err) {
          console.error("ERREUR lors du check positionnement:", err);
        }
      } else if (activeTest) {
        console.warn("ATTENTION : Le test est activé mais ne contient AUCUNE question.");
      }
    }
  } catch (err: any) {
    error.value = err.message || "Erreur de chargement.";
    console.error("Erreur globale loadPageData:", err);
  } finally {
    isLoading.value = false;
  }
};

// --- GESTION DE LA FIN DU TEST ---
const handleTestCompleted = () => {
  showPositioningModal.value = false;
  // Optionnel: on peut rafraîchir les données ou afficher un message de succès
};

onMounted(loadPageData);

watch(() => props.id, loadPageData);

// --- NOUVEAUX MOTEURS DE CALCULS DE PROGRESSION (APPRENANT) ---

const studentTotalProgress = computed(() => {
  if (!formation.value || !formation.value.modules) return { percent: 0, completed: 0, total: 0 };
  
  const userId = userStore.user.id;
  let totalActivities = 0;
  let completedActivities = 0;

  const sessionProgs = progressions.value.filter(p => {
    return String(p.session?._id || p.session) === String(props.id) &&
           String(p.user?._id || p.user || p.userId) === String(userId) &&
           ['termine', 'valide'].includes(p.status);
  });
  
  const completedContentIds = new Set(sessionProgs.map(p => String(p.contentId || p.content?._id || p.content)));

  for (const mod of formation.value.modules) {
    for (const chap of (mod.chapters || [])) {
      const contents = chap.contents || [];
      totalActivities += contents.length;
      for (const content of contents) {
        if (completedContentIds.has(String(content._id || content))) completedActivities++;
      }
    }
  }

  const percent = totalActivities === 0 ? 0 : Math.round((completedActivities / totalActivities) * 100);
  return { percent: percent > 100 ? 100 : percent, completed: completedActivities, total: totalActivities };
});

const getModuleProgress = (moduleId: string) => {
  if (!formation.value || !formation.value.modules) return { percent: 0, completed: 0, total: 0 };
  
  const mod = formation.value.modules.find(m => m._id === moduleId);
  if (!mod) return { percent: 0, completed: 0, total: 0 };

  const userId = userStore.user.id;
  let totalActivities = 0;
  let completedActivities = 0;

  const sessionProgs = progressions.value.filter(p => {
    return String(p.session?._id || p.session) === String(props.id) &&
           String(p.user?._id || p.user || p.userId) === String(userId) &&
           ['termine', 'valide'].includes(p.status);
  });
  
  const completedContentIds = new Set(sessionProgs.map(p => String(p.contentId || p.content?._id || p.content)));

  for (const chap of (mod.chapters || [])) {
    const contents = chap.contents || [];
    totalActivities += contents.length;
    for (const content of contents) {
      if (completedContentIds.has(String(content._id || content))) completedActivities++;
    }
  }

  const percent = totalActivities === 0 ? 0 : Math.round((completedActivities / totalActivities) * 100);
  return { percent: percent > 100 ? 100 : percent, completed: completedActivities, total: totalActivities };
};

const getModuleQuizzes = (moduleId: string) => {
  if (!formation.value || !formation.value.modules) return [];
  const mod = formation.value.modules.find(m => m._id === moduleId);
  if (!mod) return [];

  const quizzes = [];
  for (const chap of (mod.chapters || [])) {
    for (const content of (chap.contents || [])) {
      if (content.type === 'Quiz') {
        quizzes.push(content);
      }
    }
  }
  return quizzes;
};

const getQuizDisplayStatus = (quiz: any) => {
  const userId = userStore.user.id;
  const prog = progressions.value.find(p => 
    String(p.session?._id || p.session) === String(props.id) && 
    String(p.user?._id || p.user || p.userId) === String(userId) && 
    String(p.contentId || p.content?._id || p.content) === String(quiz._id) &&
    ['termine', 'valide'].includes(p.status)
  );

  if (!prog) return 'not_taken'; // Pas encore fait (Gris)

  let maxScore = prog.totalScore || quiz.totalPossibleScore || 10;
  if (prog.score > maxScore) maxScore = prog.score;

  let minScore = quiz.minScoreToPass !== undefined ? quiz.minScoreToPass : (maxScore / 2);

  return prog.score >= minScore ? 'passed' : 'failed'; // Réussi (Vert) ou Echoué (Rouge)
};

// --- FIN NOUVEAUX MOTEURS ---

const getModuleStatus = (moduleId: string) => {
  if (userStore.userRole === 'admin' || userStore.userRole === 'formateur') return 'valide'; 
  const progression = progressions.value.find(p => p.contentId === moduleId && String(p.user._id || p.user) === String(userStore.user.id) && p.contentType === 'Module');
  return progression ? progression.status : 'bloque';
};

const isModuleUnlocked = (moduleId: string) => {
  if (userStore.userRole === 'admin' || userStore.userRole === 'formateur') return true;
  const status = getModuleStatus(moduleId);
  return ['en_cours', 'termine', 'valide'].includes(status);
};

const navigateToModule = (moduleId: string) => {
  if (isModuleUnlocked(moduleId)) {
    router.push({ name: 'elearning-module', params: { id: props.id, moduleId: moduleId } });
  } else {
    alert("Vous devez d'abord terminer le module précédent.");
  }
};

const isContentUnlocked = (userId: string, contentId: string) => {
  const prog = progressions.value.find(p => 
    String(p.user?._id || p.user) === String(userId) && 
    String(p.contentId || p.content?._id || p.content) === String(contentId)
  );
  return prog ? ['en_cours', 'termine', 'valide'].includes(prog.status) : false;
};

const handleToggleLock = async (userId: string | null, contentId: string, type: string, moduleId?: string) => {
  if (!userId) {
    alert("Erreur : Aucun apprenant n'est sélectionné dans la liste déroulante.");
    return;
  }

  const isCurrentlyUnlocked = isContentUnlocked(userId, contentId);
  const newStatus = isCurrentlyUnlocked ? 'bloque' : 'en_cours';

  try {
    // 1. Déverrouillage/Verrouillage de l'élément principal (Module ou Chapitre)
    await progressionStore.toggleManualLock({
      userId, 
      sessionId: props.id, 
      contentId, 
      contentType: type, 
      status: newStatus, 
      moduleId: moduleId 
    });

    // 2. LOGIQUE AUTOMATIQUE : Si on déverrouille un MODULE, on déverrouille le 1er CHAPITRE
    if (type === 'Module' && newStatus === 'en_cours' && formation.value) {
      const module = formation.value.modules.find(m => m._id === contentId);
      
      if (module && module.chapters && module.chapters.length > 0) {
        const firstChapter = module.chapters[0];
        
        // On vérifie s'il est déjà déverrouillé pour ne pas faire d'appel inutile
        if (!isContentUnlocked(userId, firstChapter._id)) {
          await progressionStore.toggleManualLock({
            userId,
            sessionId: props.id,
            contentId: firstChapter._id,
            contentType: 'Chapter',
            status: 'en_cours',
            moduleId: contentId
          });
          console.log(`Déverrouillage automatique du chapitre: ${firstChapter.title}`);
        }
      }
    }
  } catch (err: any) {
    const serverMessage = err.response?.data?.message || err.message || "Erreur inconnue";
    alert(`L'opération a échoué.\n\nNature de l'incident : ${serverMessage}`);
  }
};

const formatNextCourseInfo = computed(() => {
  if (isLoading.value) return "Chargement...";
  if (error.value) return `Erreur: ${error.value}`;
  if (isNextCoursLive.value) return "Rejoindre le cours";
  if (nextCoursMessage.value) return nextCoursMessage.value;
  
  if (nextCours.value) {
    const coursDate = new Date(nextCours.value.date);
    const [startHour, startMinute] = nextCours.value.startTime.split(':').map(Number);
    const displayDateTime = new Date(coursDate.getFullYear(), coursDate.getMonth(), coursDate.getDate(), startHour, startMinute, 0, 0);

    const now = new Date();
    const diff = displayDateTime.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let message = "Prochain cours ";
    const formattedCoursDate = displayDateTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedCoursTime = displayDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (days === 0 && hours === 0 && minutes < 60) message += `dans ${minutes} minute(s) : "${nextCours.value.title}".`;
    else if (days === 0) message += `aujourd'hui à ${formattedCoursTime} : "${nextCours.value.title}".`;
    else if (days === 1) message += `demain à ${formattedCoursTime} : "${nextCours.value.title}".`;
    else message += `le ${formattedCoursDate} à ${formattedCoursTime} : "${nextCours.value.title}".`;
    return message;
  }
  if (nextCoursData.value.message) return nextCoursData.value.message;
  if (currentSession.value?.dateFin && new Date(currentSession.value.dateFin).getTime() < new Date().getTime()) return "Tous les cours de cette session sont terminés.";
  return "Il n'y a pas de cours programmé pour le moment.";
});

const handleLiveSessionClick = () => {
  if (currentSession.value?.lienZoomUnique) {
    router.push({ name: 'session-live', params: { id: props.id } });
  } else {
    alert("Le lien de la réunion live n'est pas encore configuré pour cette session.");
  }
};

const handleAddEleve = async () => {
  addEleveError.value = '';
  if (!eleveEmailToAdd.value.trim()) { addEleveError.value = "L'email est requis."; return; }
  if (!props.id) { addEleveError.value = "ID de session manquant."; return; }

  try {
    const updatedSession = await sessionStore.addEleveToSessionByEmail(props.id, eleveEmailToAdd.value);
    if (updatedSession) {
      alert(`L'élève a été ajouté avec succès !`);
      showAddEleveModal.value = false;
      eleveEmailToAdd.value = '';
    }
  } catch (err: any) {
    addEleveError.value = err.message || 'Erreur lors de l\'ajout de l\'élève.';
  }
};

const openEleveDetailModal = (eleve: SessionUser) => { selectedEleve.value = eleve; showEleveDetailModal.value = true; };
const closeEleveDetailModal = () => { showEleveDetailModal.value = false; selectedEleve.value = null; };

const handleSendMessage = (userId: string) => { router.push({ name: 'chat', query: { userId: userId } }); closeEleveDetailModal(); };

const handleRemoveEleve = async (eleveId: string) => {
  if (confirm(`Êtes-vous sûr de vouloir retirer cet élève de la session ?`)) {
    try {
      await sessionStore.removeEleveFromSession(props.id, eleveId);
      alert('Élève retiré avec succès.');
      closeEleveDetailModal();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  }
};

const handleToggleMute = async (eleveId: string) => {
  const currentStatus = selectedEleve.value?.isMuted;
  if (confirm(currentStatus ? "Réactiver les posts ?" : "Mettre en sourdine ?")) {
    try {
      await sessionStore.toggleEleveMuteStatus(props.id, eleveId);
      alert(`Statut mis à jour.`);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  }
};

const filteredProgressions = computed(() => {
  if (!progressions.value || !Array.isArray(progressions.value)) return [];

  const mapped = progressions.value
    .filter(p => {
      const isRightSession = String(p.session?._id || p.session) === String(props.id);
      const isFinished = p.status === 'termine' || p.status === 'valide';
      return isRightSession && isFinished;
    })
    .map(p => {
      const userId = p.user?._id || p.user || p.userId;
      const matchingEleve = currentSession.value?.elevesInscrits?.find(e => 
        String(e.userId) === String(userId) || String(e.id) === String(userId)
      );
      
      const prenom = matchingEleve?.prenom || p.user?.prenom || 'Apprenant';
      const nom = matchingEleve?.nom || p.user?.nom || '';

      let contentTitle = 'Évaluation / Devoir'; 
      let actualContentType = 'Unknown'; 
      let foundContentData: any = null;
      
      if (formation.value && formation.value.modules) {
        for (const mod of formation.value.modules) {
          for (const chap of (mod.chapters || [])) {
            const foundContent = (chap.contents || []).find((c: any) => String(c._id) === String(p.contentId));
            if (foundContent) {
              contentTitle = foundContent.title;
              actualContentType = foundContent.type; 
              foundContentData = foundContent;
              break;
            }
          }
        }
      }

      let maxScore = p.totalScore || (foundContentData ? foundContentData.totalPossibleScore : 0) || 10;
      if (p.score > maxScore) maxScore = p.score; 

      let minScore = (foundContentData && foundContentData.minScoreToPass !== undefined) 
        ? foundContentData.minScoreToPass 
        : (maxScore / 2);

      const isPassed = p.score >= minScore;

      return {
        ...p,
        displayPrenom: prenom,
        displayNom: nom,
        contentLabel: contentTitle,
        actualContentType: actualContentType,
        maxScore: maxScore,
        isPassed: isPassed,
        initiales: (prenom.charAt(0) || '') + (nom.charAt(0) || 'U')
      };
    });

    return mapped
      .filter(p => {
        const isGradedContent = p.actualContentType === 'Quiz' || p.actualContentType === 'Exercise' || p.actualContentType === 'Assignment';
        const isBackendQuiz = p.contentType === 'Quiz';
        return isGradedContent || isBackendQuiz;
      })
      .sort((a, b) => a.displayPrenom.localeCompare(b.displayPrenom));
});

const deleteProgression = async (progressionId: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce résultat ? L'apprenant devra recommencer l'évaluation.")) {
    try {
      await progressionStore.deleteProgression(progressionId);
      await progressionStore.fetchProgressionForSession(props.id);
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression.");
    }
  }
};
</script>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.group-hover\:animate-shimmer {
  animation: shimmer 7s infinite;
}

/* Cache la barre de défilement pour les onglets tout en gardant le scroll */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch; 
}

/* Classe ciblée uniquement sur mobile pour ne pas écraser la sidebar Desktop */
@media (max-width: 1024px) {
  .responsive-wrapper {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>