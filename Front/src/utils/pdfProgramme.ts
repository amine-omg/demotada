import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '/services/api';

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

export const generateProgrammePDF = async (formation: any, etablissement: any) => {
  const doc = new jsPDF();
  const c1 = etablissement?.couleur1 || "#423B71"; 
  const c2 = etablissement?.couleur2 || "#62D6CA";

  // Fonction utilitaire pour les titres harmonisés
  const addSectionHeader = (text: string, y: number) => {
    doc.setTextColor(c1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(text.toUpperCase(), 15, y);
    // Petite barre de stylisation sous le titre (Couleur 2)
    doc.setFillColor(c2);
    doc.rect(15, y + 2, 10, 1, 'F');
  };

  // ==========================================
  // PAGE 1 : COUVERTURE ÉPURÉE (FOND BLANC)
  // ==========================================
  const logoUrl = etablissement?.logoUrl || etablissement?.logo;
  if (logoUrl) {
    const b64Logo = await imageToBase64(logoUrl);
    if (b64Logo) {
      const props = doc.getImageProperties(b64Logo);
      const ratio = props.width / props.height;
      const displaySize = 60;
      const w = ratio > 1 ? displaySize : displaySize * ratio;
      const h = ratio > 1 ? displaySize / ratio : displaySize;
      doc.addImage(b64Logo, 'PNG', 105 - w/2, 60 - h/2, w, h);
    }
  }

  // Ligne de stylisation centrale (Couleur 2)
  doc.setDrawColor(c2);
  doc.setLineWidth(0.5);
  doc.line(80, 110, 130, 110);

  // Titre Formation (Couleur 1)
  doc.setTextColor(c1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  const splitTitle = doc.splitTextToSize(formation.title?.toUpperCase() || 'PROGRAMME DE FORMATION', 160);
  doc.text(splitTitle, 105, 135, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#6B7280");
  doc.text(`Une formation proposée par ${etablissement.nom}`, 105, 150, { align: 'center' });

  // Bloc Durée (Discret, sans ombre bizarre)
  doc.setDrawColor(c2);
  doc.setLineWidth(0.2);
  doc.roundedRect(85, 165, 40, 10, 1, 1, 'S');
  doc.setTextColor("#000000");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`DURÉE : ${formation.duration || 0}H`, 105, 171.5, { align: 'center' });

  // ==========================================
  // PAGE 2 : PRÉSENTATION & OBJECTIFS
  // ==========================================
  doc.addPage();
  
  // Barre de rappel discrète en haut de page
  doc.setFillColor(c1);
  doc.rect(15, 10, 5, 1, 'F');
  doc.setTextColor("#9CA3AF");
  doc.setFontSize(7);
  doc.text(formation.title?.toUpperCase(), 22, 11);

  let currentY = 35;

  // 1. Présentation
  addSectionHeader("Présentation de la formation", currentY);
  doc.setTextColor("#374151");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const desc = formation.descriptionLongue || formation.description || "Contenu détaillé à venir.";
  const splitDesc = doc.splitTextToSize(desc, 180);
  doc.text(splitDesc, 15, currentY + 12);
  currentY += (splitDesc.length * 6) + 30;

  // 2. Cartes Pédagogiques (Fonds neutres, bordures Couleur 2)
  const margin = 15;
  const gap = 6;
  const cardW = (180 - (gap * 2)) / 3;
  const cardH = 45;

  const cards = [
    { t: "OBJECTIFS", c: formation.objectives || "Non définis" },
    { t: "PUBLIC VISÉ", c: formation.publicCible || "Tout public" },
    { t: "PRÉ-REQUIS", c: formation.prerequisites || "Aucun" }
  ];

  cards.forEach((s, i) => {
    const x = margin + (i * (cardW + gap));
    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(x, currentY, cardW, cardH, 2, 2, 'FD');
    
    doc.setFillColor(c2);
    doc.rect(x, currentY + 4, 1, 6, 'F'); // Petite barre latérale

    doc.setTextColor(c1);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(s.t, x + 4, currentY + 8);

    doc.setTextColor("#6B7280");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(s.c, cardW - 8);
    doc.text(lines, x + 4, currentY + 15);
  });

  currentY += cardH + 20;

  // 3. Détail du Parcours
  addSectionHeader("Détail du parcours", currentY);
  
  const tableBody: any[] = [];
  formation.modules?.forEach((mod: any, i: number) => {
    tableBody.push([{ 
        content: `${(i + 1).toString().padStart(2, '0')} . ${mod.name.toUpperCase()}`, 
        colSpan: 2, 
        styles: { textColor: "#000000", fontStyle: 'bold', cellPadding: 4, fontSize: 9 } 
    }]);
    mod.chapters?.forEach((chap: any) => {
      tableBody.push([
        { content: `      ${chap.title}`, styles: { textColor: "#4B5563", fontSize: 8 } },
        { content: "OFFICIEL", styles: { halign: 'right', textColor: c2, fontSize: 6, fontStyle: 'bold' } }
      ]);
    });
  });

  autoTable(doc, {
    startY: currentY + 10,
    body: tableBody,
    theme: 'plain',
    margin: { bottom: 60 },
    didDrawPage: (data) => {
       const pageHeight = doc.internal.pageSize.height;
       doc.setDrawColor(c2);
       doc.setLineWidth(0.1);
       doc.line(15, pageHeight - 20, 195, pageHeight - 20);
       doc.setFontSize(7);
       doc.setTextColor("#9CA3AF");
       doc.text(`${etablissement.nom?.toUpperCase()} | SIRET : ${etablissement.numeroSIRET || 'N/A'}`, 105, pageHeight - 12, { align: 'center' });
       doc.text(`${data.pageNumber}`, 195, pageHeight - 12, { align: 'right' });
    }
  });

  // ==========================================
  // SECTION FINALE : TARIFS & CONTACTS
  // ==========================================
  let finalY = (doc as any).lastAutoTable.finalY + 20;
  if (finalY > 240) { doc.addPage(); finalY = 30; }

  addSectionHeader("Tarifs", finalY);
  doc.setTextColor("#374151");
  doc.setFontSize(10);
  const prix = formation.price?.prix || 0;
  doc.text(`Coût de la formation : ${prix} € HT`, 15, finalY + 12);

  finalY += 30;
  addSectionHeader("Contacts", finalY);
  doc.setTextColor("#374151");
  doc.setFontSize(9);
  doc.text(`Email : ${etablissement.contactEmail || 'N/A'}`, 15, finalY + 12);
  doc.text(`Tél : ${etablissement.contactPhone || 'N/A'}`, 15, finalY + 18);
  doc.text(`Site : ${etablissement.website || 'N/A'}`, 15, finalY + 24);

  doc.save(`Programme_${formation.title || 'Formation'}.pdf`);
};