<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue';
import { usePostStore } from '../stores/postStore';
import { useUserStore } from '../stores/user';
import type { Post } from '../stores/postStore'; 

const props = defineProps<{
  sessionId: string; 
}>();

const postStore = usePostStore();
const userStore = useUserStore(); 

const posts = computed(() => postStore.posts);
const isLoading = computed(() => postStore.isLoading);
const error = computed(() => postStore.error);

const newPostContent = ref('');
const showPostInput = ref(false); 

watchEffect(async () => {
  if (props.sessionId && userStore.isAuthenticated) {
    await postStore.fetchPostsForSession(props.sessionId);
  }
});

const handleCreatePost = async () => {
  if (newPostContent.value.trim()) {
    try {
      await postStore.createPost(props.sessionId, newPostContent.value.trim());
      newPostContent.value = ''; 
      showPostInput.value = false; 
    } catch (err) {
      console.error("Erreur lors de la création du post:", err);
    }
  }
};

const handleDeletePost = async (postId: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
    try {
      await postStore.deletePost(postId);
    } catch (err) {
      console.error("Erreur lors de la suppression du post:", err);
    }
  }
};

const handleAddComment = async (postId: string, commentContent: string) => {
  if (commentContent.trim()) {
    try {
      await postStore.addComment(postId, commentContent.trim());
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
    }
  }
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const isAuthorOrAdmin = (authorId: string | object) => {
  const authorObjectId = typeof authorId === 'object' && '_id' in authorId ? authorId._id : authorId;
  return userStore.user.id === authorObjectId || userStore.userRole === 'admin';
};
</script>

<template>
  <div class="class-feed-container bg-transparent p-0 rounded-lg h-full flex flex-col">

    <button
      @click="showPostInput = !showPostInput"
      class="w-full bg-[#B2E9E1] text-[#464279] text-2x1 font-bold py-5 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-[#FE8B7D] flex items-center justify-center mb-6 shadow-md"
    >
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
<path d="M45,21c0-2.287-1.07-3.306-1.192-3.414c-0.082-0.072-0.175-0.131-0.274-0.174L41,16.338V6V4c0-1.654-1.346-3-3-3 s-3,1.346-3,3v0.672C34.008,5.985,28.185,13,17,13H7c-0.197,0-0.391,0.059-0.555,0.168C6.305,13.262,3,15.527,3,21  c0,0.346,0,1.654,0,2c0,5.473,3.305,7.738,3.445,7.832c0.019,0.013,0.042,0.018,0.062,0.029c0.017,0.009,0.028,0.025,0.045,0.033  C9.338,32.287,11,37.934,11,46c0,0.553,0.447,1,1,1h5c1.542,0,3-1.458,3-3c0-0.445,0-1.757,0-2c0-1.234-0.299-2.309-0.645-3.553 c-0.129-0.465-0.269-0.969-0.408-1.535l3.327-0.951c0.272-0.078,0.499-0.268,0.623-0.521c0.125-0.254,0.136-2.549,0.031-2.812 l-0.397-0.993c7.587,1.742,11.656,6.616,12.468,7.692V40c0,1.654,1.346,3,3,3s3-1.346,3-3V27.662l2.533-1.075 c0.1-0.043,0.192-0.102,0.273-0.173C43.929,26.306,45,25.288,45,23C45,22.63,45,21.37,45,21z"></path><polygon fill="#fff" points="22,33 15,35 15,28 20,28"></polygon><path d="M15,36c-0.215,0-0.427-0.069-0.603-0.201C14.147,35.609,14,35.313,14,35v-7c0-0.553,0.447-1,1-1h5 c0.409,0,0.776,0.249,0.929,0.629l2,5c0.104,0.263,0.094,0.558-0.031,0.812c-0.124,0.254-0.351,0.443-0.623,0.521l-7,2  C15.185,35.987,15.092,36,15,36z M16,29v4.674l4.66-1.331L19.323,29H16z"></path><path fill="#fff" d="M7,14c0,0-3,2-3,7s3,7,3,7h10V14H7z"></path><path d="M17,29H7c-0.197,0-0.391-0.059-0.555-0.168C6.305,28.738,3,26.473,3,21s3.305-7.738,3.445-7.832C6.609,13.059,6.803,13,7,13  h10c0.553,0,1,0.447,1,1v14C18,28.553,17.553,29,17,29z M7.344,27H16V15H7.344C6.722,15.538,5,17.355,5,21S6.722,26.462,7.344,27z"></path><path fill="#fff" d="M43.143,23.667c0,0,0.857-0.762,0.857-2.667s-0.857-2.667-0.857-2.667L40,17v8L43.143,23.667z"></path><path d="M40,26c-0.193,0-0.386-0.056-0.552-0.166C39.168,25.648,39,25.336,39,25v-8c0-0.336,0.168-0.648,0.448-0.834 c0.279-0.185,0.633-0.217,0.942-0.087l3.143,1.333c0.1,0.043,0.192,0.102,0.274,0.174C43.93,17.694,45,18.713,45,21 c0,2.288-1.071,3.306-1.193,3.415c-0.081,0.071-0.174,0.13-0.273,0.173l-3.143,1.333C40.266,25.974,40.132,26,40,26z M43.143,23.667 h0.01H43.143z M43.143,23.667h0.01H43.143z M41,18.511v4.979l1.539-0.652C42.691,22.62,43,22.054,43,21 c0-1.053-0.309-1.62-0.462-1.837L41,18.511z"></path><path fill="#fff" d="M38,2c-1.105,0-2,0.895-2,2v1c0,0-6,9-19,9v14c13,0,19,9,19,9v1c0,1.105,0.895,2,2,2s2-0.895,2-2V4 C40,2.895,39.105,2,38,2z"></path><path d="M38,41c-1.654,0-3-1.346-3-3v-0.675C33.961,35.957,28.123,29,17,29c-0.553,0-1-0.447-1-1V14c0-0.553,0.447-1,1-1 c11.123,0,16.961-6.957,18-8.325V4c0-1.654,1.346-3,3-3s3,1.346,3,3v34C41,39.654,39.654,41,38,41z M18,27.017 c12.689,0.436,18.581,9.053,18.832,9.429C36.941,36.609,37,36.803,37,37v1c0,0.552,0.448,1,1,1s1-0.448,1-1V4c0-0.552-0.448-1-1-1 s-1,0.448-1,1v1c0,0.197-0.059,0.391-0.168,0.555C36.581,5.931,30.689,14.548,18,14.983V27.017z M36,5h0.01H36z"></path><path fill="#fff" d="M19,42c0,1-1,2-2,2s-5,0-5,0c0-6-1-14-5-16h10C17,37,19,39,19,42z"></path><path d="M17,45h-5c-0.553,0-1-0.447-1-1c0-8.066-1.662-13.713-4.447-15.105c-0.415-0.207-0.633-0.673-0.526-1.124 C6.134,27.319,6.536,27,7,27h10c0.553,0,1,0.447,1,1c0,5.569,0.783,8.389,1.355,10.447C19.701,39.691,20,40.766,20,42 C20,43.542,18.542,45,17,45z M12.991,43H17c0.448,0,1-0.552,1-1c0-0.962-0.239-1.823-0.571-3.017 c-0.567-2.042-1.332-4.795-1.42-9.983H9.671C12.305,32.426,12.915,38.661,12.991,43z"></path><path d="M9,20h4c0.553,0,1-0.447,1-1s-0.447-1-1-1H9c-0.553,0-1,0.447-1,1S8.447,20,9,20z"></path><path d="M13,22H9c-0.553,0-1,0.447-1,1s0.447,1,1,1h4c0.553,0,1-0.447,1-1S13.553,22,13,22z"></path>
</svg>
     &nbsp; {{ showPostInput ? 'Annuler le post' : 'Publier sur le mur' }}
    </button>

    <div v-if="showPostInput" class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <textarea
        v-model="newPostContent"
        placeholder="Écrivez un nouveau message pour la classe..."
        class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] text-gray-800 resize-y min-h-[80px]"
      ></textarea>
      <button
        @click="handleCreatePost"
        :disabled="!newPostContent.trim() || isLoading"
        class="mt-3 bg-[#B3E9E1] text-[#423B72] font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-[#FF8B7D] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Publication...</span>
        <span v-else>Publier</span>
      </button>
    </div>

    <div v-if="isLoading" class="text-center text-gray-600 text-lg my-4">Chargement des posts...</div>
    <div v-else-if="error" class="text-center text-red-600 text-lg my-4">{{ error }}</div>
    <div v-else-if="posts.length === 0" class="text-center text-gray-500 my-4 p-4 bg-gray-50 rounded-md">
      Aucun post dans ce fil d'actualité pour le moment. Soyez le premier à poster !
    </div>
    <div v-else class="flex-1 overflow-y-auto space-y-6">
      <div v-for="post in posts" :key="post._id" class="bg-white border border-gray-200 rounded-lg shadow-md p-4">
        <div class="flex items-center mb-3">
          <img
            :src="(typeof post.author !== 'string' ? post.author.photo : 'https://placehold.co/40x40/cccccc/ffffff?text=User')"
            alt="Photo de profil"
            class="w-10 h-10 rounded-full object-cover mr-3"
            onerror="this.onerror=null;this.src='https://placehold.co/40x40/cccccc/ffffff?text=User';"
          />
          <div>
            <span class="font-semibold text-gray-900">{{ typeof post.author !== 'string' ? `${post.author.prenom} ${post.author.nom}` : 'Utilisateur inconnu' }}</span>
            <p class="text-xs text-gray-500">{{ formatDateTime(post.createdAt) }}</p>
          </div>
          <div class="ml-auto flex space-x-2">
            <button
              v-if="isAuthorOrAdmin(post.author)"
              @click="handleDeletePost(post._id)"
              class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Supprimer le post"
            ><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
<path d="M39,16H9c-1.654,0-3-1.346-3-3V9c0-0.52,0.398-0.953,0.917-0.997l12-1L29,7c0.027,0,0.056,0.001,0.083,0.003l12,1  C41.602,8.047,42,8.48,42,9v4C42,14.654,40.654,16,39,16z"></path><path d="M36,47H12c-1.654,0-3-1.346-3-3V14c0-0.552,0.447-1,1-1h28c0.553,0,1,0.448,1,1v30C39,45.654,37.654,47,36,47z"></path><path fill="#fff" d="M36,44H12c-1.105,0-2-0.895-2-2V12h28v30C38,43.105,37.105,44,36,44z"></path><path d="M36,45H12c-1.654,0-3-1.346-3-3V12c0-0.552,0.447-1,1-1h28c0.553,0,1,0.448,1,1v30C39,43.654,37.654,45,36,45z M11,13v29 c0,0.551,0.448,1,1,1h24c0.552,0,1-0.449,1-1V13H11z"></path><path fill="#fff" d="M29,6H19L7,9v2c0,1.105,0.895,2,2,2h30c1.105,0,2-0.895,2-2V9L29,6z"></path><path d="M39,14H9c-1.654,0-3-1.346-3-3V9c0-0.459,0.312-0.859,0.758-0.97l12-3C18.837,5.01,18.918,5,19,5h10 c0.082,0,0.163,0.01,0.242,0.03l12,3C41.688,8.141,42,8.541,42,9v2C42,12.654,40.654,14,39,14z M8,9.781V11c0,0.551,0.448,1,1,1h30  c0.552,0,1-0.449,1-1V9.781L28.877,7h-9.754L8,9.781z"></path><path d="M30,6h-2V4c0-0.551-0.448-1-1-1h-6c-0.552,0-1,0.449-1,1v2h-2V4c0-1.654,1.346-3,3-3h6c1.654,0,3,1.346,3,3V6z"></path><path d="M24,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C25,37.552,24.553,38,24,38z"></path><path d="M31,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C32,37.552,31.553,38,31,38z"></path><path d="M17,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C18,37.552,17.553,38,17,38z"></path>
</svg>
            </button>
                 </div>
        </div>
        <p class="text-gray-800 mb-3">{{ post.content }}</p>
        <div v-if="post.attachments && post.attachments.length" class="mb-3">
          <p class="text-sm text-gray-600">Pièces jointes:</p>
          <ul class="list-disc list-inside text-sm text-blue-600">
            <li v-for="attachment in post.attachments" :key="attachment">
              <a :href="attachment" target="_blank" class="hover:underline">{{ attachment.split('/').pop() }}</a>
            </li>
          </ul>
        </div>

        <div v-if="post.comments.length" class="mt-4 border-t border-gray-100 pt-3">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">{{ post.comments.length }} Commentaire(s)</h4>
          <div v-for="comment in post.comments" :key="comment._id" class="bg-gray-50 p-3 rounded-lg mb-2 text-sm">
            <div class="flex items-center mb-1">
              <img
                :src="(typeof comment.user !== 'string' ? comment.user.photo : 'https://placehold.co/30x30/cccccc/ffffff?text=User')"
                alt="Photo de profil"
                class="w-7 h-7 rounded-full object-cover mr-2"
                onerror="this.onerror=null;this.src='https://placehold.co/30x30/cccccc/ffffff?text=User';"
              />
              <span class="font-semibold text-gray-800">{{ typeof comment.user !== 'string' ? `${comment.user.prenom} ${comment.user.nom}` : 'Utilisateur inconnu' }}</span>
              <span class="text-xs text-gray-500 ml-auto">{{ formatDateTime(comment.createdAt) }}</span>
            </div>
            <p class="text-gray-700">{{ comment.content }}</p>
          </div>
        </div>

        <div class="mt-3">
          <input
            :id="`comment-input-${post._id}`"
            type="text"
            placeholder="Ajouter un commentaire..."
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] text-gray-800 text-sm"
            @keyup.enter="handleAddComment(post._id, $event.target.value); $event.target.value = ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.class-feed-container {
  max-height: calc(100vh - 250px); 
}
.flex-1.overflow-y-auto {
  overflow-y: auto;
}
</style>
