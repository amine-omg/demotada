import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '/services/api';
import { useEtablissementsStore } from '../stores/etablissementsStore';
import { useUserStore } from '../stores/user';

const imageToBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  try {
    const cleanUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const response = await api.get(cleanUrl, { responseType: 'blob' });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(response.data);
    });
  } catch (error) { return null; }
};

export const generateConventionPDF = async (opportunite: any, schoolInput: any, returnDoc: boolean = false) => {
  const etablissementsStore = useEtablissementsStore();
  const userStore = useUserStore();
  let sourceData = schoolInput;

  // Récupération des données complètes si schoolInput est incomplet
  if (!sourceData?.logoUrl && !sourceData?.logo) {
    const ecoleIdToFetch = sourceData?._id || opportunite?.ecole?._id || opportunite?.ecole || userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
    if (ecoleIdToFetch) {
      try {
        await etablissementsStore.fetchEtablissementById(ecoleIdToFetch);
        sourceData = etablissementsStore.currentEtablissement; 
      } catch (e) {}
    }
    if (!sourceData || (!sourceData.logoUrl && !sourceData.logo)) {
       sourceData = userStore.adminSelectedContext || userStore.user.associatedEntity;
    }
  }

  const doc = new jsPDF();
  const c1 = sourceData?.couleur1 || sourceData?.color1 || "#423B71"; 
  const c2 = sourceData?.couleur2 || sourceData?.color2 || "#62D6CA";
  const formation = opportunite.formation || {};
  const apprenants = opportunite.apprenants || [];
  const prixConvenu = opportunite.valeur || 0;
  const isBtoB = opportunite.typeBusiness === 'OpportunitéEntreprise';

  let currentY = 20;

  // Logo
  const logoUrl = sourceData?.logoUrl || sourceData?.logo;
  if (logoUrl) {
    const b64Logo = await imageToBase64(logoUrl);
    if (b64Logo) {
      const props = doc.getImageProperties(b64Logo);
      const ratio = props.width / props.height;
      const displaySize = 35;
      const w = ratio > 1 ? displaySize : displaySize * ratio;
      const h = ratio > 1 ? displaySize / ratio : displaySize;
      doc.addImage(b64Logo, 'PNG', 15, currentY, w, h);
    }
  }

  // En-tête Organisme
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text(sourceData?.nom?.toUpperCase() || "ORGANISME DE FORMATION", 195, currentY + 5, { align: "right" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#6B7280");
  
  let adresse = "Adresse non renseignée";
  if (sourceData?.adresse) {
      adresse = `${sourceData.adresse.rue || ''}, ${sourceData.adresse.codePostal || ''} ${sourceData.adresse.ville || ''}`.replace(/^, | , /g, '').trim();
  }
  if (adresse && adresse !== ",") doc.text(adresse, 195, currentY + 10, { align: "right" });
  doc.text(`SIRET : ${sourceData?.numeroSIRET || sourceData?.siret || 'Non renseigné'}`, 195, currentY + 15, { align: "right" });
  if (sourceData?.nda) doc.text(`NDA : ${sourceData.nda}`, 195, currentY + 20, { align: "right" });

  currentY += 35;

  // Titre
  doc.setFillColor(c1);
  doc.rect(15, currentY, 180, 12, 'F');
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CONVENTION DE FORMATION PROFESSIONNELLE", 105, currentY + 8, { align: "center" });
  
  currentY += 18;
  doc.setTextColor("#9CA3AF");
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Établie conformément aux articles L. 6353-1 et D.6353-1 du Code du travail", 105, currentY, { align: "center" });

  currentY += 15;

  // Parties
  doc.setTextColor(c1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("ENTRE LES SOUSSIGNÉS :", 15, currentY);
  currentY += 8;
  doc.setFontSize(9);
  doc.text("L'ORGANISME DE FORMATION :", 15, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${sourceData?.nom || 'L\'établissement'} représenté(e) par sa direction.`, 15, currentY + 5);
  doc.setFont("helvetica", "bold");
  doc.text(isBtoB ? "ET L'ENTREPRISE CLIENTE :" : "ET LE BÉNÉFICIAIRE / CLIENT :", 105, currentY);
  doc.setFont("helvetica", "normal");
  if (apprenants.length > 0) {
    const referent = apprenants[0];
    doc.text(`${referent.prenom} ${referent.nom}`, 105, currentY + 5);
    doc.text(`Email : ${referent.email}`, 105, currentY + 10);
  } else {
    doc.text("Client en attente d'identification", 105, currentY + 5);
  }

  currentY += 25;

  // Articles
  const addArticle = (titre: string, contenu: string[]) => {
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    doc.setTextColor(c2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(titre.toUpperCase(), 15, currentY);
    currentY += 6;
    doc.setTextColor("#374151");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    contenu.forEach(line => {
      const splitText = doc.splitTextToSize(line, 180);
      doc.text(splitText, 15, currentY);
      currentY += (splitText.length * 5);
    });
    currentY += 4;
  };

  addArticle("Article 1 - Objet, durée et lieu de la formation", [
    `Le bénéficiaire participera à l'action de formation intitulée : "${formation.title || 'Formation non définie'}".`,
    `Durée de la formation : ${formation.duration || 'Non précisée'} heures.`,
    `Lieu de formation : ${opportunite.typeInterIntra === 'Intra' ? 'En entreprise' : 'En centre ou Classe virtuelle'}.`
  ]);

  const nomsStagiaires = apprenants.map((a: any) => `- ${a.prenom} ${a.nom}`).join('\n');
  addArticle("Article 2 - Engagement de participation", [
    `La formation sera suivie par le(s) stagiaire(s) suivant(s) :`,
    nomsStagiaires || "- Stagiaire à définir"
  ]);

  const ht = prixConvenu;
  const tva = ht * 0.20; 
  const ttc = ht + tva;
  addArticle("Article 3 - Prix de la formation", [
    `Montant HT : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(ht)}`,
    `TVA (20%) : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tva)}`,
    `Total TTC : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(ttc)}`
  ]);

  addArticle("Article 4 - Moyens permettant d'apprécier les résultats", [
    `L'appréciation des résultats se fera à travers la mise en œuvre d'une procédure d'évaluation.`
  ]);

  addArticle("Article 5 - Non réalisation et Litiges", [
    `En application de l'article L.6354-1 du Code du travail, faute de réalisation totale ou partielle de la prestation, l'organisme doit rembourser les sommes indûment perçues.`
  ]);

  // Signatures
  if (currentY > 240) { doc.addPage(); currentY = 20; }
  else { currentY += 10; }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(`Fait à ______________________, le ${new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.`, 15, currentY);
  currentY += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Pour l'organisme de formation", 45, currentY, { align: "center" });
  doc.text(isBtoB ? "Pour l'entreprise cliente" : "Pour le bénéficiaire", 150, currentY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("(Nom, prénom, qualité et cachet)", 45, currentY + 5, { align: "center" });
  doc.text("(Nom, prénom et signature)", 150, currentY + 5, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(15, currentY + 10, 60, 30, 2, 2);
  doc.roundedRect(120, currentY + 10, 60, 30, 2, 2);

  // Pied de page dynamique (sur toutes les pages)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(c2);
    doc.setLineDashPattern([], 0); 
    doc.setLineWidth(0.5);
    doc.line(15, 280, 195, 280);
    doc.setFontSize(6);
    doc.setTextColor("#9CA3AF");
    doc.text(`${sourceData?.nom?.toUpperCase()} | SIRET : ${sourceData?.numeroSIRET || sourceData?.siret || 'N/A'} | GÉNÉRÉ VIA SYALI ACADEMY`, 105, 285, { align: "center" });
    doc.text(`Page ${i}/${pageCount}`, 195, 285, { align: "right" });
  }

  // LOGIQUE DE RETOUR OU SAUVEGARDE
  if (returnDoc) return doc;
  const nomFichier = apprenants.length > 0 ? apprenants[0].nom : 'Client';
  doc.save(`Convention_Formation_${nomFichier}_${new Date().getFullYear()}.pdf`);
};