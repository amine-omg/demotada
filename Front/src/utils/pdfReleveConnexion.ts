import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '/services/api';
import { useEtablissementsStore } from '../stores/etablissementsStore';
import { useUserStore } from '../stores/user';

// Fonction utilitaire de formatage du temps
const formatTime = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds === 0) return '0h 00m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

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

export const generateReleveConnexionPDF = async (timeData: any, student: any, sessionData: any, schoolInput: any = null) => {
  const etablissementsStore = useEtablissementsStore();
  const userStore = useUserStore();

  let sourceData = schoolInput;

  // Récupération intelligente des données de l'école (CORS Safe)
  if (!sourceData || (!sourceData.logoUrl && !sourceData.logo)) {
    const ecoleIdToFetch = sourceData?._id || userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
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

  let currentY = 20;

  // --- 1. LOGO ET EN-TÊTE ---
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

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("RELEVÉ DE CONNEXIONS", 195, currentY + 5, { align: "right" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#6B7280");
  doc.text("Preuve d'assiduité (Art. L.6353-1 du Code du Travail)", 195, currentY + 11, { align: "right" });
  doc.text(`Édité le : ${new Date().toLocaleDateString('fr-FR')}`, 195, currentY + 16, { align: "right" });

  currentY += 35;

  // --- 2. ENCADRÉ INFOS (Apprenant & Session) ---
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(15, currentY, 180, 28, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("APPRENANT", 20, currentY + 8);
  doc.text("ACTION DE FORMATION", 100, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor("#374151");
  doc.text(`${student?.prenom || ''} ${student?.nom?.toUpperCase() || ''}`, 20, currentY + 15);
  doc.text(`${student?.email || 'N/A'}`, 20, currentY + 21);

  doc.text(sessionData?.title || "Session de formation", 100, currentY + 15);
  doc.text(`Organisme : ${sourceData?.nom || 'N/A'}`, 100, currentY + 21);

  currentY += 40;

  // --- 3. RÉCAPITULATIF GLOBAL ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("RÉCAPITULATIF DES TEMPS DE FORMATION", 15, currentY);
  doc.setFillColor(c2);
  doc.rect(15, currentY + 2, 10, 0.8, 'F');

  currentY += 10;
  
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(15, currentY, 50, 20, 2, 2, 'F');
  doc.setFontSize(14);
  doc.setTextColor(c1);
  doc.text(formatTime(timeData?.totalSeconds), 40, currentY + 15, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#374151");
  doc.text(`Visio Live : ${formatTime(timeData?.details?.live)}`, 75, currentY + 8);
  doc.text(`E-learning : ${formatTime(timeData?.details?.elearning)}`, 75, currentY + 15);

  currentY += 35;

  // --- 4. TABLEAU DÉTAILLÉ (QUALIOPI) ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("DÉTAIL JOURNALIER ET AMPLITUDE", 15, currentY);
  doc.setFillColor(c2);
  doc.rect(15, currentY + 2, 10, 0.8, 'F');

  currentY += 8;

  const tableBody: any[] = [];
  
  if (timeData?.logs && timeData.logs.length > 0) {
    timeData.logs.forEach((log: any) => {
      const dateFormatee = new Date(log.dateString).toLocaleDateString('fr-FR', {
        weekday: 'short', day: 'numeric', month: 'short'
      });
      
      // 🌟 Données de connexion
      const amplitude = (log.firstConnection && log.lastConnection) 
        ? `${log.firstConnection} - ${log.lastConnection}`
        : "--:--";

      let detailsTxt = [];
      if (log.details?.live > 0) detailsTxt.push(`Live: ${formatTime(log.details.live)}`);
      if (log.details?.elearning > 0) detailsTxt.push(`E-learn: ${formatTime(log.details.elearning)}`);
      
      tableBody.push([
        dateFormatee,
        amplitude,
        detailsTxt.join(' | ') || 'Activité plateforme',
        formatTime(log.totalSeconds)
      ]);
    });
  } else {
    tableBody.push(["Aucun log trouvé", "-", "-", "-"]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Amplitude', 'Modalités', 'Durée']],
    body: tableBody,
    theme: 'plain',
    headStyles: { fillColor: c1, textColor: "#FFFFFF", fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: "#374151" },
    columnStyles: {
      1: { halign: 'center' },
      3: { halign: 'right', fontStyle: 'bold' }
    },
    didDrawCell: (data) => {
      if (data.section === 'body') {
        doc.setDrawColor(243, 244, 246);
        doc.setLineWidth(0.1);
        doc.line(15, data.cell.y + data.cell.height, 195, data.cell.y + data.cell.height);
      }
    },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(c2);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 20, 195, pageHeight - 20);
      doc.setFontSize(6);
      doc.setTextColor("#9CA3AF");
      doc.text(`${sourceData?.nom?.toUpperCase()} | SIRET : ${sourceData?.numeroSIRET || 'N/A'} | GÉNÉRÉ VIA SYALI ACADEMY`, 105, pageHeight - 15, { align: "center" });
      doc.text(`Page ${data.pageNumber}`, 195, pageHeight - 15, { align: "right" });
    }
  });

  doc.save(`Releve_Connexions_${student?.nom || 'Apprenant'}.pdf`);
};