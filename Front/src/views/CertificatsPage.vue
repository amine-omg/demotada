<template>
  <div class="min-h-screen bg-[#f6f6f5] flex">
    <!-- Left Sidebar -->
    <aside class="w-64 bg-white shadow-sm flex-shrink-0">
      <div class="p-4">
        <!-- Logo -->
        <div class="flex items-center mb-8">
          <button class="mr-3">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div class="text-3xl font-bold">
            <span class="text-[#EF4436]">si</span><span class="text-[#F9A03F]">aly</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="space-y-1">
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded">
            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 16a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zM4 16a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1z"/>
            </svg>
            Dashboard
          </a>

          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded">
            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            Statistiques
          </a>

          <router-link to="/apprenants" class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded">
            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
            </svg>
            Apprenants
          </router-link>

          <!-- Formations Section -->
          <div>
            <button @click="toggleFormationsMenu" class="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
                Formations
              </div>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': formationsMenuOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Sub-menu -->
            <div v-if="formationsMenuOpen" class="ml-7 mt-1 space-y-1">
              <router-link to="/formations" class="block px-3 py-1 text-sm text-gray-700 hover:text-gray-900">Gérer les formations</router-link>
              <router-link to="/certificats" class="block px-3 py-1 text-sm text-gray-900 bg-gray-100 rounded">Certificat de réussite</router-link>
            </div>
          </div>

          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded">
            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            Calendrier
          </a>

          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded">
            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
            </svg>
            Chat
          </a>

          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded">
            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            Paramètres
          </a>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Header -->
      <header class="bg-white shadow-sm border-b px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/formations" class="flex items-center text-gray-600 hover:text-gray-900 mr-4">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Retour aux formations
            </router-link>
          </div>

          <!-- Right side - User controls -->
          <div class="flex items-center space-x-4">
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>

            <!-- School Affiliation -->
            <div class="flex items-center space-x-2 mr-4">
              <span class="text-sm text-gray-500">Affilié à</span>
              <img
                src="https://ext.same-assets.com/68667335/4266974086.png"
                alt="Green Target Academy"
                class="h-6"
              >
            </div>

            <!-- User Profile Dropdown -->
            <div class="relative">
              <button
                @click="toggleProfileMenu"
                class="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
              >
                <!-- User Avatar -->
                <span class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">Am</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showProfileMenu"
                class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50"
              >
                <div class="py-1">
                  <a href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
                    </svg>
                    Mon compte
                  </a>
                  <div class="border-t border-gray-100"/>
                  <button
                    @click="logout"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 p-6">
        <!-- Header with title and generate button -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-semibold text-[#F04636]">Certificats de réussite</h1>
          <button @click="openGenerateModal" class="btn-primary flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Générer certificat de réussite
          </button>
        </div>

        <!-- Description -->
        <div class="mb-8">
          <p class="text-gray-700 mb-2">
            Le certificat de réussite est un document que vos apprenants <strong>pourront générer eux-mêmes</strong>, uniquement lorsqu'ils auront terminé toutes les leçons d'une formation.
          </p>
          <p class="text-gray-600 text-sm">
            Ce document est <strong>illustratif</strong> et n'a par conséquent aucune valeur juridique.
          </p>
        </div>

        <!-- Models Section -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-[#F04636] mb-4">Mes modèles</h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Certificate Template -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Modèle Sialy</h3>

              <!-- Certificate Preview -->
              <div class="relative w-full max-w-md mx-auto bg-gradient-to-br from-[#62D6CA] via-[#4fc3b7] to-[#3fb0a3] rounded-lg p-6 text-white shadow-lg">
                <!-- Decorative Elements -->
                <div class="absolute top-4 right-4 w-16 h-16 border-4 border-white/20 rounded-full"/>
                <div class="absolute bottom-4 left-4 w-8 h-8 bg-white/20 rounded-full"/>
                <div class="absolute top-1/2 left-8 w-4 h-4 bg-white/20 rounded-full transform -translate-y-1/2"/>

                <div class="relative z-10 text-center">
                  <div class="mb-4">
                    <p class="text-xs opacity-80">Délivré par &#123;&#123;nom de votre espace&#125;&#125; le &#123;&#123;date du certificat&#125;&#125;</p>
                  </div>

                  <h2 class="text-lg font-bold mb-4">CERTIFICAT DE RÉUSSITE</h2>

                  <div class="mb-4">
                    <p class="text-xl font-semibold">&#123;&#123;nom de l'apprenant&#125;&#125;</p>
                    <p class="text-xs opacity-80 mt-1">&#123;&#123;date de naissance&#125;&#125;</p>
                  </div>

                  <div class="mb-4">
                    <p class="text-sm opacity-90">A obtenu le certificat :</p>
                    <p class="text-lg font-semibold">&#123;&#123;nom de la formation&#125;&#125;</p>
                  </div>

                  <div class="mt-6 flex items-center justify-between">
                    <div class="text-xs">
                      <p>Formation effectuée sur</p>
                      <div class="flex items-center mt-1">
                        <span class="text-[#EF4436] font-bold text-sm">si</span>
                        <span class="text-[#F9A03F] font-bold text-sm">aly</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 flex items-center justify-between">
                <span class="text-sm text-gray-600">Modèle par défaut</span>
                <button class="text-sm text-gray-700 hover:text-gray-900 underline">
                  Personnaliser
                </button>
              </div>
            </div>

            <!-- Info Section -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Choisissez le modèle du certificat de réussite</h3>

              <div class="space-y-4">
                <p class="text-gray-700">
                  Le certificat de réussite est automatiquement généré avec les informations de votre apprenant et de votre formation.
                </p>

                <div class="bg-white rounded-lg p-4 border-l-4 border-[#62D6CA]">
                  <h4 class="font-medium text-gray-900 mb-2">Variables disponibles :</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• &#123;&#123;nom de l'apprenant&#125;&#125;</li>
                    <li>• &#123;&#123;nom de la formation&#125;&#125;</li>
                    <li>• &#123;&#123;date du certificat&#125;&#125;</li>
                    <li>• &#123;&#123;nom de votre espace&#125;&#125;</li>
                    <li>• &#123;&#123;date de naissance&#125;&#125;</li>
                  </ul>
                </div>

                <p class="text-sm text-gray-600">
                  Les certificats générés seront automatiquement envoyés par email aux apprenants concernés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Certificate Modal -->
    <div
      v-if="showGenerateModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50"
      @click="closeGenerateModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-[#F04636]">Générer un certificat</h3>
            <button
              @click="closeGenerateModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="generateCertificate">
            <div class="mb-4">
              <label class="label">Sélectionner l'apprenant</label>
              <select
                v-model="selectedStudent"
                class="input-field"
                required
              >
                <option value="">Choisir un apprenant...</option>
                <option v-for="student in students" :key="student.id" :value="student.id">{{ student.name }}</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="label">Sélectionner la formation</label>
              <select
                v-model="selectedFormation"
                class="input-field"
                required
              >
                <option value="">Choisir une formation...</option>
                <option v-for="formation in formations" :key="formation.id" :value="formation.id">{{ formation.name }}</option>
              </select>
            </div>

            <div class="mb-6">
              <label class="label">Modèle de certificat</label>
              <select
                v-model="selectedTemplate"
                class="input-field"
                required
              >
                <option value="sialy-default">Modèle Sialy (par défaut)</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeGenerateModal"
                class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="btn-primary"
              >
                Générer le certificat
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import jsPDF from 'jspdf'

const router = useRouter()

// State
const showProfileMenu = ref(false)
const showGenerateModal = ref(false)
const formationsMenuOpen = ref(true)

const selectedStudent = ref('')
const selectedFormation = ref('')
const selectedTemplate = ref('sialy-default')

// Define certificate structure
interface Certificate {
  id: string
  studentId: string
  studentName: string
  formationId: string
  formationName: string
  templateId: string
  generatedAt: string
  pdfUrl?: string
}

// Sample certificates storage (in real app, this would be in a database)
const certificates = ref<Certificate[]>([])

// Sample students and formations data
const students = [
  { id: 'jean-martin', name: 'Jean Martin', email: 'jean.martin@email.com' },
  { id: 'sophie-dupont', name: 'Sophie Dupont', email: 'sophie.dupont@email.com' },
  { id: 'pierre-durand', name: 'Pierre Durand', email: 'pierre.durand@email.com' }
]

const formations = [
  { id: 'formation-digital', name: 'Formation Digital Marketing' },
  { id: 'formation-dev', name: 'Développement Web' },
  { id: 'formation-design', name: 'Design UI/UX' }
]

// Methods
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const logout = () => {
  router.push('/')
}

const toggleFormationsMenu = () => {
  formationsMenuOpen.value = !formationsMenuOpen.value
}

const openGenerateModal = () => {
  showGenerateModal.value = true
  selectedStudent.value = ''
  selectedFormation.value = ''
  selectedTemplate.value = 'sialy-default'
}

const closeGenerateModal = () => {
  showGenerateModal.value = false
}

const generateCertificate = async () => {
  const student = students.find(s => s.id === selectedStudent.value)
  const formation = formations.find(f => f.id === selectedFormation.value)

  if (!student || !formation) return

  try {
    // Create certificate data
    const certificateData = {
      studentName: student.name,
      formationName: formation.name,
      date: new Date().toLocaleDateString('fr-FR'),
      organizationName: 'Sialy'
    }

    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Set up the certificate design
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Background gradient (simulated with rectangles)
    pdf.setFillColor(98, 214, 202) // #62D6CA
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')

    // Add decorative elements
    pdf.setFillColor(255, 255, 255, 0.2)
    pdf.circle(pageWidth - 30, 30, 20)
    pdf.circle(30, pageHeight - 30, 15)

    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CERTIFICAT DE RÉUSSITE', pageWidth / 2, 50, { align: 'center' })

    // Organization info
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Délivré par ${certificateData.organizationName} le ${certificateData.date}`, pageWidth / 2, 30, { align: 'center' })

    // Student name
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(certificateData.studentName, pageWidth / 2, 90, { align: 'center' })

    // Formation info
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('A obtenu le certificat :', pageWidth / 2, 110, { align: 'center' })

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(certificateData.formationName, pageWidth / 2, 125, { align: 'center' })

    // Sialy branding
    pdf.setFontSize(10)
    pdf.text('Formation effectuée sur', 30, pageHeight - 40)
    pdf.setTextColor(239, 70, 54) // #EF4436
    pdf.setFont('helvetica', 'bold')
    pdf.text('si', 30, pageHeight - 30)
    pdf.setTextColor(249, 160, 63) // #F9A03F
    pdf.text('aly', 40, pageHeight - 30)

    // Generate unique filename
    const fileName = `certificat_${student.name.replace(/\s+/g, '_')}_${formation.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`

    // Save PDF
    pdf.save(fileName)

    // Create certificate record
    const certificateId = Math.random().toString(36).substr(2, 9)
    const newCertificate: Certificate = {
      id: certificateId,
      studentId: student.id,
      studentName: student.name,
      formationId: formation.id,
      formationName: formation.name,
      templateId: selectedTemplate.value,
      generatedAt: new Date().toISOString(),
      pdfUrl: fileName // In real app, this would be a proper URL
    }

    // Add to certificates collection (in real app, save to database)
    certificates.value.push(newCertificate)

    console.log('Certificate generated and saved:', newCertificate)

    closeGenerateModal()

    // Show success message
    alert(`Certificat généré avec succès pour ${student.name} !\nLe PDF a été téléchargé et est maintenant disponible dans le profil de l'apprenant.`)

  } catch (error) {
    console.error('Error generating certificate:', error)
    alert('Erreur lors de la génération du certificat.')
  }
}
</script>
