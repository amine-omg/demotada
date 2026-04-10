// src/stores/formationBuilder.ts
import { defineStore } from 'pinia';
import api from '/services/api'; 
import router from '../router';
import { useUserStore } from './user';
import { useCategoriesStore } from './categories';


// Interfaces (Complètes et cohérentes)
export interface Price {
  prix: number;
  prixPromotionnel: number;
}

interface Block {
  _id?: string;
  type: string;
  title: string;
  content: string;
  src: string;
  order: number;
  isDraft: boolean;
  isValidated?: boolean;
  isEditing?: boolean;
}

export interface PopulatedEcole {
  _id: string;
  nom: string;
  logoUrl?: string;
  couleur1?: string; 
  couleur2?: string; 
}

// NOUVELLE INTERFACE : Module
export interface Module {
  _id?: string;
  name: string;
  description?: string;
  order: number;
  chapters: Chapter[]; // Un module contient des chapitres
  formation?: string;
}

export interface ChapterContent {
  _id?: string;
  type: 'lesson' | 'quiz' | 'assignment' | 'exercise' | 'support' | 'task';
  title: string;
  order: number;
  lessonRef?: string;
  quizRef?: string | { _id: string; title: string; };
  assignmentRef?: string;
  taskRef?: string;
}

export interface ActivityContent {
  _id: string;
  type: 'Lesson' | 'Quiz' | 'Assignment' | 'Exercise' | 'Support' | 'Task'; 
  title: string;
  order: number;
  dureeEstimee?: number;
  objectifs?: string[];
  notesPedagogiques?: string;
  blocks?: any[]; // Gardons 'any[]' pour l'instant
}


export interface Chapter {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  contents: ActivityContent[]; 
  formation?: string;
  createdBy?: string;
}


interface User {
  _id: string;
  nom: string;
  prenom: string;
}

export interface PopulatedCategory {
  _id: string;
  name: string;
}

export interface PopulatedUser {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface ContinuousEnrollmentDetails {
  title: string;
  description: string;
}

interface ApprovedInstructor {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

// L'état complet de la formation
export interface FormationState {
  _id?: string;
  title: string;
  description?: string;
  lessons: number;
  students: number;
  sales: number;
  status: string;
  createdAt?: Date;
  modifiedAt?: Date;
  image: string;
  modules: Module[]; 
  price: Price;
  createdBy?: string | PopulatedUser;
  objectives: string;
  publicCible: string;
  videoPresentation: string;
  positioningTest: {
    text: string;
    questions: any[];
  };
  descriptionCourte: string;
  descriptionLongue: string;
  category: string | PopulatedCategory | null;
  isContinuousEnrollmentEnabled: boolean;
  continuousEnrollmentDetails: ContinuousEnrollmentDetails;
  approvedInstructors: string[] | PopulatedUser[];
  domain: string;
  tags: string[];
  validationStatus: string;
  isContentModalVisible: boolean;
  currentChapterIdForContent: string | null;
  isLoading: boolean;
  ecole?: string | PopulatedEcole | null; // <-- AJOUTER CETTE LIGNE
  error: string | null;
}

export const useFormationBuilderStore = defineStore('formationBuilder', {
  state: (): FormationState => ({
    _id: undefined,
    title: '',
    description: '',
    lessons: 0,
    students: 0,
    sales: 0,
    status: 'draft',
    createdAt: undefined,
    modifiedAt: undefined,
    image: '',
    modules: [],
    price: { prix: 0, prixPromotionnel: 0 },
    createdBy: undefined,
    objectives: '',
    publicCible: '',
    prerequisites: '',
    videoPresentation: '',
    descriptionCourte: '',
    descriptionLongue: '',
    category: null,
    isContinuousEnrollmentEnabled: false,
    continuousEnrollmentDetails: { title: 'Session Continue', description: 'Accès permanent à la formation.' },
    approvedInstructors: [],
    domain: 'Business',
    positioningTest: { text: '', questions: [] },
    tags: [],
    validationStatus: 'pending',
    isContentModalVisible: false,
    currentChapterIdForContent: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    formation: (state) => state,
    getChapterById: (state) => (chapterId: string) => {
          if (!state.modules) return null;
          
          // On parcourt chaque module pour trouver le chapitre
          for (const module of state.modules) {
            const chapter = module.chapters.find(c => c._id === chapterId);
            if (chapter) {
              return chapter; // On l'a trouvé, on le retourne
            }
          }
          
          return null; // On n'a rien trouvé
        },
    getFormationTitle: (state) => state.title,
    getChapters: (state) => state.chapters,
    getApprovedInstructors: (state) => state.approvedInstructors,
    getIsContinuousEnrollmentEnabled: (state) => state.isContinuousEnrollmentEnabled,
  },

  actions: {
    resetFormation() {
      this.$reset();
    },
    resetFormationState() {
      this.$reset();
    },
setChapters(newChapters: any[]) {
    this.formation.chapters = newChapters;
  },
    async loadFormation(id: string) {
      this.isLoading = true;
      this.error = null;
      
      this.ecole = null;
      this.modules = [];
      this.title = ''; 
      this.positioningTest = { text: '', questions: [] };

      
      const userStore = useUserStore();
      const authToken = localStorage.getItem('authToken');

      if (!authToken) {
        this.error = "Authentification requise pour charger la formation.";
        this.isLoading = false;
        return;
      }

      try {
        const response = await api.get(`/api/formations/${id}`);
        const data = response.data;

        Object.assign(this, data);
        this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
        this.modifiedAt = data.modifiedAt ? new Date(data.modifiedAt) : undefined;
        this.modules = data.modules || [];
        this.approvedInstructors = data.approvedInstructors || [];
        this.tags = data.tags || [];
        this.validationStatus = data.validationStatus || 'pending';

      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement de la formation.';
        console.error('Erreur loadFormation:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAndSetCurrentLesson(lessonId: string) {
    this.isLoading = true;
    this.error = null;
    try {
        const authToken = localStorage.getItem('authToken');  
        const response = await api.get(`/api/lessons/${lessonId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        return response.data;
    } catch (err: any) {
        this.error = "Erreur lors du chargement des détails de la leçon.";
        console.error("Erreur fetchAndSetCurrentLesson:", err);
        throw err;
    } finally {
        this.isLoading = false;
    }
},

async uploadLessonFile(file: File): Promise<string> {
        this.isLoading = true;
        this.error = null;

        const formData = new FormData();
        formData.append('file', file); // 'file' doit correspondre à ce que Multer attend

        try {
            const authToken = localStorage.getItem('authToken');
            // On appelle la route d'upload universelle que nous avons créée
            const response = await api.post('/api/upload/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authToken}`,
                },
            });
            
            // On retourne l'URL du fichier uploadé sur Cloudflare
            return response.data.location;

        } catch (err: any) {
            this.error = "L'upload du fichier a échoué.";
            console.error('Erreur dans laction uploadLessonFile:', err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async duplicateElement(payload: { 
  sourceId: string, 
  type: string, 
  targetFormationId: string, 
  contentType?: string,
  targetModuleId: string, 
  targetChapterId: string 
}) {
  this.isLoading = true;
  this.error = null;

  try {
    // On envoie la demande de duplication à la nouvelle route backend
    const response = await api.post('/api/formations/duplicate-element', payload);
    return response.data;
  } catch (err: any) {
    this.error = err.response?.data?.message || "Erreur lors de la duplication de l'élément.";
    console.error('Erreur duplicateElement:', err);
    throw err;
  } finally {
    this.isLoading = false;
  }
},

async saveFormation() {
  this.isLoading = true;
  this.error = null;

  try {
    // On extrait uniquement ce dont la DB a besoin selon Formation.js
    const payload = {
      title: this.formation.title,
      description: this.formation.description,
      image: this.formation.image, // URL R2
      status: this.formation.status,
      descriptionLongue: this.formation.descriptionLongue, // AJOUTÉ
  objectives: this.formation.objectives,             // AJOUTÉ
  publicCible: this.formation.publicCible,           // AJOUTÉ
  videoPresentation: this.formation.videoPresentation, // AJOUTÉ
  prerequisites: this.formation.prerequisites,
      domain: this.formation.domain,
      price: this.formation.price, // Objet priceSchema {prix, prixPromotionnel}
      category: this.formation.category?._id || this.formation.category,
      ecole: this.formation.ecole?._id || this.formation.ecole,
      modules: this.modules?.map(m => m._id).filter(id => id) || [],
      tags: this.formation.tags || [],
      validationStatus: this.formation.validationStatus || 'pending'
    };

    let response;
    // Si l'ID existe, c'est un PUT (Update), sinon c'est un POST (Create)
    if (this.formation._id) {
      response = await api.put(`/api/formations/${this.formation._id}`, payload);
    } else {
      response = await api.post('/api/formations', payload);
    }

    // Mise à jour du store SANS casser la réactivité et SANS récursion
    if (response.data) {
       // On met à jour l'ID si c'était une création
       if (!this.formation._id) this.formation._id = response.data._id;
       // On synchronise les dates de serveur
       if (response.data.updatedAt) this.formation.updatedAt = response.data.updatedAt;
    }

    return response.data;
  } catch (err: any) {
    this.error = "Erreur lors de l'enregistrement de la formation.";
    console.error('Erreur saveFormation:', err);
    throw err;
  } finally {
    this.isLoading = false;
  }
},

    updateTitle(newTitle: string) {
      this.title = newTitle;
    },

    setEtablissement(ecole: PopulatedEcole) {
      this.ecole = ecole;
    },

    updateContinuousEnrollmentDetails(details: ContinuousEnrollmentDetails) {
        this.continuousEnrollmentDetails = details;
    },

    toggleContinuousEnrollment(isEnabled: boolean) {
        this.isContinuousEnrollmentEnabled = isEnabled;
    },

    addApprovedInstructor(instructor: PopulatedUser) {
        if (!(this.approvedInstructors as PopulatedUser[]).some(a => a._id === instructor._id)) {
            (this.approvedInstructors as PopulatedUser[]).push(instructor);
        }
    },
    removeApprovedInstructor(instructorId: string) {
        this.approvedInstructors = (this.approvedInstructors as PopulatedUser[]).filter(
            a => a._id !== instructorId
        );
    },
    setApprovedInstructors(instructors: PopulatedUser[]) {
        this.approvedInstructors = instructors;
    },

    async addChapter(moduleId: string, chapterData: { title: string; description?: string }) {
      this.isLoading = true;
      this.error = null;
      if (!moduleId) {
        this.error = "L'ID du module est requis pour ajouter un chapitre.";
        this.isLoading = false;
        throw new Error(this.error);
      }

      try {
        const parentModule = this.modules.find(m => m._id === moduleId);
        if (!parentModule) throw new Error("Module parent non trouvé.");

        const response = await api.post(`/api/chapters`, {
            title: chapterData.title,
            description: chapterData.description || '',
            order: parentModule.chapters.length, // Le nouveau chapitre va à la fin du module
            moduleId: moduleId // On envoie l'ID du module parent
        });

        const newChapter = response.data;
        parentModule.chapters.push(newChapter);
        parentModule.chapters.sort((a, b) => a.order - b.order);

      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de l'ajout du chapitre.";
        console.error('Erreur addChapter:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    navigateToQuizBuilder(quizId: string) {
        if (!this._id) {
            console.error("Impossible de naviguer : ID de la formation manquant.");
            return;
        }
        router.push({
            name: 'quiz-builder',
            params: {
                quizId: quizId,
            },
        });
    },

    async updateChapter(chapterId: string, updateData: Partial<Chapter>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/api/chapters/${chapterId}`, updateData);
        const updatedChapter = response.data;

        for (const module of this.modules) {
            const index = module.chapters.findIndex(c => c._id === chapterId);
            if (index !== -1) {
                module.chapters[index] = { ...module.chapters[index], ...updatedChapter };
                break; // On a trouvé et mis à jour, on peut sortir de la boucle
            }
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la mise à jour du chapitre.';
        console.error('Erreur updateChapter:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteChapter(moduleId: string, chapterId: string) {
      this.isLoading = true;
      this.error = null;

      try {
        await api.delete(`/api/chapters/${chapterId}`);
        const parentModule = this.modules.find(m => m._id === moduleId);
        if (parentModule) {
            parentModule.chapters = parentModule.chapters.filter(c => c._id !== chapterId);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression du chapitre.';
        console.error('Erreur deleteChapter:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async duplicateChapter(chapterId: string) {
      if (!this._id) return; // Check this._id
      this.isLoading = true;
      this.error = null;

      try {
        const chapter = this.chapters.find(c => c._id === chapterId);
        if (!chapter) throw new Error('Chapitre non trouvé pour duplication.');

        const payload = {
          title: `${chapter.title} (copie)`,
          description: chapter.description,
          isDraft: chapter.isDraft,
          order: chapter.order + 1,
          formation: this._id,
        };

        const response = await api.post(
          `/api/chapters`,
          payload);

        const duplicatedChapter = response.data;
        const chapterIndex = this.chapters.findIndex(c => c._id === chapterId);
        if (chapterIndex !== -1) {
          this.chapters.splice(chapterIndex + 1, 0, duplicatedChapter);
        } else {
          this.chapters.push(duplicatedChapter);
        }
        this.chapters.sort((a, b) => a.order - b.order);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la duplication du chapitre.';
        console.error('Erreur duplicateChapter:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },


    async reorderChapters(moduleId: string, orderedChapterIds: string[]) {
      if (!moduleId) {
        console.error("ID de module manquant, impossible de réorganiser.");
        throw new Error("ID de module manquant.");
      }

      const module = this.modules.find(m => m._id === moduleId);
      if (module) {
        const chapterMap = new Map(module.chapters.map(c => [c._id, c]));
        module.chapters = orderedChapterIds.map(id => chapterMap.get(id!)).filter(Boolean) as Chapter[];
      }
      
      try {
        await api.put(
          `/api/modules/${moduleId}/reorder-chapters`,
          { chapters: orderedChapterIds } 
        );
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du nouvel ordre des chapitres:", error);
        if (this._id) this.loadFormation(this._id); 
        throw error;
      }
    },

    async addModule(moduleData: { name: string; description?: string }) {
      if (!this._id) {
        this.error = "L'ID de la formation est manquant pour ajouter un module.";
        return;
      }
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post(
          `/api/formations/${this._id}/modules`,
          {
            ...moduleData,
            order: this.modules.length, 
          });

        this.modules.push(response.data);

      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de l'ajout du module.";
        console.error('Erreur addModule:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateModule(moduleId: string, updateData: { name?: string; description?: string }) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await api.put(
          `/api/modules/${moduleId}`,
          updateData);

        const index = this.modules.findIndex(m => m._id === moduleId);
        if (index !== -1) {
          this.modules[index] = { ...this.modules[index], ...response.data };
        }

      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la mise à jour du module.";
        console.error('Erreur updateModule:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteModule(moduleId: string) {
      this.isLoading = true;
      this.error = null;

      try {
        await api.delete(`/api/modules/${moduleId}`);

        // Retire le module de l'état local
        this.modules = this.modules.filter(m => m._id !== moduleId);

      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la suppression du module.';
        console.error('Erreur deleteModule:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

async reorderModules(orderedModuleIds: string[]) {
  if (!this.formation._id) {
    console.error("Impossible de réordonner : ID de formation manquant");
    return;
  }

  // 1. Sauvegarde de l'ordre actuel pour annulation en cas d'échec
  const previousModulesState = [...this.modules];

  // 2. Mise à jour "Optimiste" de l'UI
  // On réordonne immédiatement les modules localement pour éviter tout lag visuel
  const cleanIds = orderedModuleIds.filter(id => !!id);
  const moduleMap = new Map(this.modules.map(m => [m._id, m]));
  this.modules = cleanIds.map(id => moduleMap.get(id)).filter(Boolean) as Module[];

  console.log("📤 Envoi du nouvel ordre au serveur...", cleanIds);

  try {
    // 3. Appel API vers la route spécifique
    // TRÈS IMPORTANT : Le backend doit attendre la clé { modules: ... }
    const response = await api.put(`/api/formations/${this.formation._id}/reorder-modules`, { 
      modules: cleanIds 
    });

    // 4. Synchronisation des propriétés 'order'
    // Une fois que le serveur a validé, on met à jour les index numériques
    // Cela garantit que si un composant fait un tri par .order, il reste correct.
    this.modules.forEach((mod, index) => {
      mod.order = index;
    });

    console.log("✅ Ordre sauvegardé sur le serveur et synchronisé localement.");
    
  } catch (error: any) {
    // 5. Gestion de l'erreur (ex: erreur 400 ou 500)
    const errorMsg = error.response?.data?.message || error.message;
    console.error("❌ Échec de la sauvegarde de l'ordre :", errorMsg);
    
    // On remet l'ordre précédent pour que l'UI reflète la réalité de la BDD
    // sans forcer un rafraîchissement complet de la page.
    this.modules = previousModulesState;

    throw error;
  }
},

    async updateContentOrder(chapterId: string, orderedContents: any[]) {
    const payload = orderedContents.map((content, index) => ({
      _id: content._id,
      order: index,
    }));

    try {
      await api.put(
        `/api/formations/chapters/${chapterId}/reorder-contents`,
        { contents: payload });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du nouvel ordre du contenu:", error);
      throw error;
    }
  },
    navigateToLessonEditor(chapterId: string, lessonId: string) {
      if (!this._id) {
        console.error("Impossible de naviguer : ID de la formation manquant.");
        return;
      }
      router.push({
        name: 'edit-lesson',
        params: {
          formationId: this._id,
          chapterId: chapterId,
          lessonId: lessonId,
        },
      });
    },

    openContentModal(chapterId: string) {
       this.currentChapterIdForContent = chapterId;
       this.isContentModalVisible = true;
     },

     closeContentModal() {
       this.isContentModalVisible = false;
       this.currentChapterIdForContent = null;
     },

     async addContentToChapter(contentData: { type: 'lesson' | 'quiz' | 'exercice' | 'support' | 'assignment' | 'task', title: string }) {
  this.isLoading = true;
  this.error = null;
  const chapterId = this.currentChapterIdForContent;

  if (!chapterId) {
    this.error = "Aucun chapitre sélectionné pour ajouter du contenu.";
    this.isLoading = false;
    throw new Error(this.error);
  }

  try {
    const parentChapter = this.modules.flatMap(m => m.chapters).find(c => c._id === chapterId);
    if (!parentChapter) throw new Error("Chapitre parent non trouvé dans le store.");

    let endpoint = '';
    
    switch (contentData.type) {
      case 'lesson':
        endpoint = '/api/lessons';
        break;
      case 'quiz':
        endpoint = '/api/quizzes';
        break;
      case 'exercise': 
        endpoint = '/api/exercises';
        break;
      case 'support': 
        endpoint = '/api/supports';
        break;
      default:
        throw new Error(`Type de contenu '${contentData.type}' non supporté pour le moment.`);
    }

    const payload = {
      title: contentData.title,
      formation: this._id,
      chapter: chapterId,
    };

    const response = await api.post(endpoint, payload);

    parentChapter.contents.push(response.data);
    console.log('Contenu ajouté avec succès:', response.data);

  } catch (err: any) {
    this.error = err.response?.data?.message || err.message || "Erreur lors de l'ajout du contenu.";
    console.error('Erreur addContentToChapter:', err);
    throw err;
  } finally {
    this.isLoading = false;
    this.closeContentModal();
  }
},

    async duplicateContent(chapterId: string, contentId: string) {
      if (!this._id) return; // Check this._id
      this.isLoading = true;
      this.error = null;

      try {
        const chapter = this.chapters.find(c => c._id === chapterId);
        if (!chapter) throw new Error('Chapitre non trouvé pour duplication de contenu.');

        const originalContent = chapter.contents.find(c => c._id === contentId);
        if (!originalContent) throw new Error('Contenu original non trouvé pour duplication.');

        const duplicatedContent = {
          ...JSON.parse(JSON.stringify(originalContent)),
          _id: undefined,
          title: `${originalContent.title} (copie)`,
        };

        const contentIndex = chapter.contents.findIndex(c => c._id === contentId);
        if (contentIndex !== -1) {
          chapter.contents.splice(contentIndex + 1, 0, duplicatedContent);
        } else {
          chapter.contents.push(duplicatedContent);
        }
        chapter.contents.sort((a,b) => a.order - b.order);

        const response = await api.put(
          `/api/chapters/${chapter._id}`,
          { contents: chapter.contents }
        );
        const updatedChapter = response.data;
        const chapterIndex = this.chapters.findIndex(c => c._id === updatedChapter._id);
        if (chapterIndex !== -1) {
          this.chapters[chapterIndex] = updatedChapter;
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors de la duplication du contenu.';
        console.error('Erreur duplicateContent:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchLessonDetails(chapterId: string, lessonId: string) {
      this.isLoading = true;
      this.error = null;
      const authToken = localStorage.getItem('authToken');

      try {
        const response = await api.get(`/api/lessons/${lessonId}`); 
        const lessonDetails = response.data;

        const chapter = this.chapters.find(c => c._id === chapterId);
        if (chapter) {
          const lessonIndex = chapter.contents.findIndex(l => l._id === lessonId);
          if (lessonIndex !== -1) {
            chapter.contents[lessonIndex] = { ...chapter.contents[lessonIndex], ...lessonDetails };
          }
        }
        return lessonDetails;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des détails de la leçon.';
        console.error('Erreur fetchLessonDetails:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async saveLesson(payload: {
    lessonId: string;
    lessonData: {
        title: string;
        dureeEstimee: number;
        objectifs: string[];
        notesPedagogiques: string;
        pdfUrl: string;
        blocks: any[];
    }
}) {
    // 1. On prépare le début de l'action
    this.isLoading = true;
    this.error = null;
    const authToken = localStorage.getItem('authToken');

    try {
        // 2. On nettoie les données avant de les envoyer au backend.
        //    Ceci retire les propriétés temporaires comme `isEditing` que le frontend utilise,
        //    mais que la base de données n'a pas besoin de stocker.
        const cleanBlocks = payload.lessonData.blocks.map(({ isEditing, ...rest }) => rest);
        
        const updateData = {
            title: payload.lessonData.title,
            dureeEstimee: payload.lessonData.dureeEstimee,
            objectifs: payload.lessonData.objectifs,
            notesPedagogiques: payload.lessonData.notesPedagogiques,
            pdfUrl: payload.lessonData.pdfUrl,
            blocks: cleanBlocks
        };

        // 3. On effectue l'appel API pour mettre à jour la leçon.
        //    C'est la seule responsabilité de cette fonction maintenant.
        const response = await api.put(
            `/api/lessons/${payload.lessonId}`,
            updateData,
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log("Leçon sauvegardée avec succès via l'action du store !");

        // 4. On retourne la réponse pour que le composant qui a appelé l'action puisse réagir
        return response.data;

    } catch (error: any) {
        // 5. En cas d'erreur, on met à jour l'état d'erreur et on la propage
        this.error = error.response?.data?.message || 'Erreur lors de la sauvegarde de la leçon.';
        console.error("Erreur dans l'action saveLesson:", error);
        throw error;
    } finally {
        // 6. Quoi qu'il arrive, on arrête l'indicateur de chargement
        this.isLoading = false;
    }
},

    async updateContentInChapter(payload: { chapterId: string, contentId: string, newTitle: string }) {
        const { chapterId, contentId, newTitle } = payload;
        const authToken = localStorage.getItem('authToken');

        const chapterIndex = this.chapters.findIndex(c => c._id === chapterId);
        if (chapterIndex === -1) return;

        const chapter = this.chapters[chapterIndex];
        const contentIndex = chapter.contents.findIndex(c => c._id === contentId);
        if (contentIndex === -1) return;

        chapter.contents[contentIndex].title = newTitle;

        try {
            const response = await api.put(
                `/api/chapters/${chapterId}`,
                { contents: chapter.contents });
            this.chapters[chapterIndex] = response.data;
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour du contenu :", error);
        }
    },

    async deleteContentFromChapter(payload: { chapterId: string, contentId: string }) {
        const { chapterId, contentId } = payload;
        const chapterIndex = this.chapters.findIndex(c => c._id === chapterId);
        if (chapterIndex === -1) return;
          const chapter = this.chapters[chapterIndex];
          const updatedContents = chapter.contents.filter(c => c._id !== contentId);
          chapter.contents = updatedContents;
          try {
            const response = await api.put(
                `/api/chapters/${chapterId}`,
                chapter);
            this.chapters[chapterIndex] = response.data;
        } catch (error: any) {
            console.error("Erreur lors de la suppression du contenu :", error);
        }
    },

    async fetchExerciseById(exerciseId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/api/exercises/${exerciseId}`);
        return response.data; 
      } catch (err: any) {
        this.error = "Erreur lors du chargement de l'exercice.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExerciseSettings(exerciseId: string, settings: { title?: string; timeLimit?: number; submissionType?: string }) {
      await api.put(`/api/exercises/${exerciseId}`, settings);
    },

    async addQuestionToExercise(exerciseId: string, questionData: { questionText: string }) {
      const response = await api.post(`/api/exercises/${exerciseId}/questions`, questionData);
      return response.data; // Renvoie l'exercice mis à jour avec la nouvelle question
    },

    async updateQuestionInExercise(exerciseId: string, questionId: string, questionData: any) {
      await api.put(`/api/exercises/${exerciseId}/questions/${questionId}`, questionData);
    },

    async deleteQuestionFromExercise(exerciseId: string, questionId: string) {
      await api.delete(`/api/exercises/${exerciseId}/questions/${questionId}`);
    },

async uploadFormationImage(file: File) {
      this.isLoading = true;
      this.error = null;

      try {
        const formData = new FormData();
        formData.append('image', file); // 'image' doit correspondre au backend

        // On utilise 'api' et non 'axios' pour profiter des intercepteurs (token auth, etc.)
        const response = await api.post('/api/upload/formation-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // On récupère l'URL renvoyée par Cloudflare R2 via ton backend
        // Vérifie si ton backend renvoie .url ou .imageUrl
        const uploadedUrl = response.data.url || response.data.imageUrl;

        if (uploadedUrl) {
          this.formation.image = uploadedUrl;
          console.log("Image mise à jour dans le store:", uploadedUrl);
        }
        
        return uploadedUrl;
      } catch (err: any) {
        this.error = "Erreur lors de l'upload de l'image.";
        console.error("Détails erreur upload:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

async uploadBlockFile(payload: { lessonId: string, blockId: string, file: File }) {
    this.isLoading = true;
    this.error = null;
    const { lessonId, blockId, file } = payload;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const authToken = localStorage.getItem('authToken');
        const response = await api.post('/api/upload/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${authToken}`,
            },
        });

        const fileUrl = response.data.location;

        // Mettre à jour l'état local (très important !)
        // On doit trouver le bon bloc dans la bonne leçon du bon chapitre du bon module...
        for (const module of this.modules) {
            for (const chapter of module.chapters) {
                const lesson = chapter.contents.find(c => c._id === lessonId && c.type === 'Lesson') as ActivityContent | undefined;
                if (lesson && lesson.blocks) {
                    const block = lesson.blocks.find(b => b._id === blockId);
                    if (block) {
                        block.src = fileUrl; // On met à jour la source avec l'URL de Cloudflare
                        // On force la réactivité si nécessaire, bien que Pinia s'en charge souvent
                        this.modifiedAt = new Date(); 
                        return; // On a trouvé et mis à jour, on sort
                    }
                }
            }
        }
    } catch (err: any) {
        this.error = "L'upload a échoué.";
        console.error('Erreur uploadBlockFile:', err);
        throw err;
    } finally {
        this.isLoading = false;
    }
},

// DANS : src/stores/formationBuilder.ts -> actions

async fetchSupportDetails(supportId: string) {
  this.isLoading = true;
  this.error = null;
  try {
    const response = await api.get(`/api/supports/${supportId}`);
    return response.data; // On retourne directement les données
  } catch (err: any) {
    this.error = "Erreur lors du chargement du support.";
    console.error('Erreur fetchSupportDetails:', err);
    throw err;
  } finally {
    this.isLoading = false;
  }
},

async saveSupport(payload: { supportId: string; supportData: { title: string; pdfUrl: string; } }) {
  this.isLoading = true;
  this.error = null;
  try {
    const response = await api.put(
      `/api/supports/${payload.supportId}`,
      payload.supportData
    );
    return response.data;
  } catch (err: any) {
    this.error = "Erreur lors de la sauvegarde du support.";
    console.error('Erreur saveSupport:', err);
    throw err;
  } finally {
    this.isLoading = false;
  }
},

async reorderActivities(chapterId: string, orderedContentIds: string[]) {
  try {
    // Appel vers la route identifiée dans formationRoutes.js
    await api.put(`/api/formations/chapters/${chapterId}/reorder-contents`, { 
      contents: orderedContentIds 
    });
    
    // On met à jour localement les index 'order' pour la cohérence
    const chapter = this.allChapters.find(c => c._id === chapterId);
    if (chapter) {
      chapter.contents.forEach((activity, index) => {
        activity.order = index;
      });
    }
  } catch (error) {
    throw error;
  }
},


    async deleteContent(chapterId: string, content: ActivityContent) {
      this.isLoading = true;
      this.error = null;

      try {
        let endpoint = '';
        switch (content.type) {
          case 'Lesson':
            endpoint = `/api/lessons/${content._id}`;
            break;
          case 'Quiz':
            endpoint = `/api/quizzes/${content._id}`;
            break;
          case 'Exercise':
            endpoint = `/api/exercises/${content._id}`;
            break;
          case 'Support':
            endpoint = `/api/supports/${content._id}`;
            break;
          default:
            throw new Error("Type de contenu non supporté pour la suppression.");
        }
        // --- FIN DE LA CORRECTION ---

        await api.delete(endpoint);

        const parentChapter = this.modules.flatMap(m => m.chapters).find(c => c._id === chapterId);
        if (parentChapter) {
          parentChapter.contents = parentChapter.contents.filter(c => c._id !== content._id);
        }

      } catch (err: any) {
        this.error = err.response?.data?.message || "Erreur lors de la suppression du contenu.";
        console.error('Erreur deleteContent:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

