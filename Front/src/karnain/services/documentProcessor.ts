// src/karnain/services/documentProcessor.ts
import api from '/services/api';

class DocumentProcessor {
  private documentId: string | null = null;

  /**
   * Orchestre la séquence de clonage via le moteur Karnain.
   * Basé sur VITE_API_BASE_URL = http://localhost:3000
   */
  async process(file: File, onProgress: (percent: number) => void) {
    try {
      this.documentId = null;
      onProgress(2);

      // 1. PHASE D'INGESTION (0% -> 15%)
      // On ajoute bien /api/ car il manque dans ton baseURL .env
      const formData = new FormData();
      formData.append('file', file); // La clé 'file' doit correspondre au backend
      
      const uploadRes = await api.post('/api/upload', formData);
      
      // On récupère l'ID de manière sécurisée (selon ce que renvoie ton uploadController)
      this.documentId = uploadRes.data.documentId || uploadRes.data.id || uploadRes.data._id;
      
      if (!this.documentId) {
        throw new Error("Identifiant du document manquant dans la réponse du serveur.");
      }
      onProgress(15);

      // 2. ANALYSE STRUCTURELLE (15% -> 35%)
      await api.post('/api/layout/analyze', { documentId: this.documentId });
      onProgress(35);

      // 3. RECONSTITUTION GRAPHIQUE (35% -> 55%)
      await api.post('/api/vectors/extract', { documentId: this.documentId });
      onProgress(55);

      // 4. COUCHE TEXTUELLE & TYPOGRAPHIE (55% -> 75%)
      // On lance l'OCR et l'analyse de polices en même temps pour gagner du temps
      await Promise.all([
        api.post('/api/ocr/process', { documentId: this.documentId }),
        api.post('/api/font-assets/analyze', { documentId: this.documentId })
      ]);
      onProgress(75);

      // 5. INTELLIGENCE SÉMANTIQUE (75% -> 100%)
      await Promise.all([
        api.post('/api/tables/detect', { documentId: this.documentId }),
        api.post('/api/semantic/map', { documentId: this.documentId })
      ]);

      onProgress(100);

      return { 
        success: true, 
        documentId: this.documentId,
        message: "Clonage Karnain réussi."
      };

    } catch (error: any) {
      console.error("Erreur critique [Karnain Engine]:", error);
      onProgress(0);
      
      // Extraction du message d'erreur du backend ou message générique
      const errorMessage = error.response?.data?.message || error.message || "Échec du processus.";
      throw new Error(errorMessage);
    }
  }

  public getActiveDocumentId(): string | null {
    return this.documentId;
  }
}

export const documentProcessor = new DocumentProcessor();