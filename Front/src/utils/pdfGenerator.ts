import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '/services/api';
// 1. On importe les stores directement dans le générateur
import { useEtablissementsStore } from '../stores/etablissementsStore';
import { useUserStore } from '../stores/user';

/**
 * Convertisseur d'image avec respect du ratio (contourne les CORS via api.get)
 */
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
  } catch (error) { 
    console.error("Erreur chargement logo Bilan:", error);
    return null; 
  }
};

/**
 * Générateur de Bilan Pédagogique Harmonisé (Auto-suffisant)
 */
export const generateBilanPDF = async (result: any, schoolInput: any, typeLabel: string) => {
  const etablissementsStore = useEtablissementsStore();
  const userStore = useUserStore();

  let sourceData = schoolInput;

  // --- 2. L'INTERCEPTEUR MAGIQUE ---
  // Si le composant parent a envoyé un objet école qui n'a pas de logo ou de couleur, 
  // on force la récupération de la vraie donnée depuis le store.
  if (!sourceData?.logoUrl && !sourceData?.logo) {
    console.log("🚀 Générateur PDF : Data école incomplète détectée. Récupération dans le Store...");
    
    const ecoleIdToFetch = sourceData?._id || result?.ecole?._id || result?.ecole || userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;

    if (ecoleIdToFetch) {
      try {
        await etablissementsStore.fetchEtablissementById(ecoleIdToFetch);
        // On récupère la donnée directement du STATE (comme on a fait pour PositioningTestsOverview)
        sourceData = etablissementsStore.currentEtablissement; 
      } catch (e) {
        console.error("Erreur de récupération de l'établissement dans le générateur");
      }
    }

    // Fallback ultime
    if (!sourceData || (!sourceData.logoUrl && !sourceData.logo)) {
       sourceData = userStore.adminSelectedContext || userStore.user.associatedEntity;
    }
  }

  // --- 3. MAPPING BLINDÉ ---
  const c1 = sourceData?.couleur1 || sourceData?.color1 || "#423B71"; 
  const c2 = sourceData?.couleur2 || sourceData?.color2 || "#62D6CA";
  const schoolName = sourceData?.nom || sourceData?.name || "Établissement";
  const logoUrl = sourceData?.logoUrl || sourceData?.logo || null;
  const siret = sourceData?.siret || sourceData?.numeroSIRET || 'N/A';

  const doc = new jsPDF();

  // Utilitaire pour titres de section harmonisés
  const addSectionHeader = (text: string, y: number) => {
    doc.setTextColor(c1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(text.toUpperCase(), 15, y);
    doc.setFillColor(c2);
    doc.rect(15, y + 2, 8, 0.8, 'F'); // Petite barre discrète
  };

  // --- 4. HEADER ÉPURÉ & LOGO ---
  if (logoUrl) {
    const base64Logo = await imageToBase64(logoUrl);
    if (base64Logo) {
      const props = doc.getImageProperties(base64Logo);
      const ratio = props.width / props.height;
      const size = 25;
      const w = ratio > 1 ? size : size * ratio;
      const h = ratio > 1 ? size / ratio : size;
      doc.addImage(base64Logo, 'PNG', 15, 12, w, h);
    }
  }

  // Infos École 
  doc.setFont("helvetica", "bold").setFontSize(7).setTextColor("#9CA3AF");
  doc.text("ÉTABLISSEMENT DISPENSATEUR", 45, 16);
  doc.setFontSize(10).setTextColor(c1);
  doc.text(schoolName.toUpperCase(), 45, 21);
  
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor("#6B7280");
  const addr = sourceData?.adresse;
  const addrStr = addr ? `${addr.rue || ''}, ${addr.codePostal || ''} ${addr.ville || ''}` : "";
  if (addrStr !== ",  ") doc.text(addrStr, 45, 25);
  if (sourceData?.website) doc.text(sourceData.website, 45, 29);

  // Titre du Document à droite
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(c1);
  doc.text(typeLabel.toUpperCase(), 195, 21, { align: "right" });
  doc.setFontSize(7).setTextColor("#9CA3AF");
  doc.text(`ID PASSAGE : ${result._id?.substring(0, 12).toUpperCase() || 'N/A'}`, 195, 26, { align: "right" });

  // --- 5. INFOS APPRENANT & FORMATION ---
  let currentY = 45;
  doc.setDrawColor(243, 244, 246).line(15, currentY, 195, currentY);
  
  currentY += 12;
  addSectionHeader("Détails de l'évaluation", currentY);

  doc.setFontSize(8).setTextColor("#9CA3AF").setFont("helvetica", "normal");
  doc.text("FORMATION ÉVALUÉE", 15, currentY + 12);
  doc.text("APPRENANT", 110, currentY + 12);

  doc.setTextColor("#000000").setFont("helvetica", "bold").setFontSize(10);
  doc.text(result.formationTitle || "Formation", 15, currentY + 18);
  const studentName = `${result.student?.nom || ''} ${result.student?.prenom || ''}`.trim().toUpperCase() || "UTILISATEUR";
  doc.text(studentName, 110, currentY + 18);
  
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor("#6B7280");
  const compDate = result.completedAt ? new Date(result.completedAt).toLocaleDateString('fr-FR') : 'N/A';
  doc.text(`Date d'exécution : ${compDate}`, 110, currentY + 23);

  // --- 6. RÉSULTAT GLOBAL (Box avec relief discret) ---
  currentY += 35;
  doc.setFillColor(0, 0, 0, 0.02); // Ombre portée légère
  doc.roundedRect(15.5, currentY + 0.5, 180, 25, 2, 2, 'F');
  
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(243, 244, 246);
  doc.roundedRect(15, currentY, 180, 25, 2, 2, 'FD');
  
  doc.setTextColor(c1);
  doc.setFontSize(9).setFont("helvetica", "bold");
  doc.text("SCORE GLOBAL OBTENU", 25, currentY + 10);
  
  const totalPoints = result.responses?.reduce((acc: number, r: any) => acc + (r.points || 0), 0) || 0;
  
  doc.setFontSize(22).setTextColor(c1);
  doc.text(`${result.globalScore || 0}%`, 185, currentY + 16, { align: "right" });
  doc.setFontSize(9).setTextColor("#6B7280").setFont("helvetica", "normal");
  doc.text(`${totalPoints} / ${result.responses?.length || 0} points validés`, 25, currentY + 17);

  // --- 7. TABLEAU DÉTAILLÉ (Harmonisé Couleur 1) ---
  autoTable(doc, {
    startY: currentY + 35,
    head: [['ID', 'INTITULÉ DE LA QUESTION', 'RÉSULTAT', 'POINTS']],
    body: result.responses?.map((res: any, i: number) => [
      `Q${i + 1}`, res.questionText || "Question sans intitulé", res.isCorrect ? "VALIDE" : "ÉCHEC", `${res.points || 0} pt`
    ]) || [],
    theme: 'plain',
    headStyles: { fillColor: [255, 255, 255], textColor: c1, fontSize: 8, fontStyle: 'bold', cellPadding: 4 },
    styles: { fontSize: 8, cellPadding: 5, font: 'helvetica' },
    columnStyles: { 0: { cellWidth: 15, fontStyle: 'bold' }, 2: { halign: 'center', cellWidth: 30, fontStyle: 'bold' }, 3: { halign: 'right', cellWidth: 20 } },
    didDrawCell: (data) => {
      // Ligne de séparation Couleur 2 discrète sous le header
      if (data.section === 'head') {
        doc.setFillColor(c2);
        doc.rect(data.cell.x, data.cell.y + data.cell.height, data.cell.width, 0.5, 'F');
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        data.cell.styles.textColor = data.cell.raw === "VALIDE" ? [22, 163, 74] : [220, 38, 38];
      }
    }
  });

  // --- 8. FOOTER ---
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(c2).setLineWidth(0.1);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);
  
  doc.setFontSize(7).setTextColor("#9CA3AF");
  const footerText = `${schoolName.toUpperCase()} | SIRET : ${siret} | GÉNÉRÉ VIA SYALI ACADEMY`;
  doc.text(footerText, 105, pageHeight - 12, { align: "center" });
  doc.text(`Page 1`, 195, pageHeight - 12, { align: "right" });

  doc.save(`Bilan_${typeLabel}_${studentName.replace(/\s+/g, '_')}.pdf`);
};