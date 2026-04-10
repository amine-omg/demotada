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

export const generateDevisPDF = async (opportunite: any, schoolInput: any, returnDoc: boolean = false) => {
  const etablissementsStore = useEtablissementsStore();
  const userStore = useUserStore();

  let sourceData = schoolInput;

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
  const apprenants = opportunite.apprenants && opportunite.apprenants.length > 0 ? opportunite.apprenants : opportunite.prospects || [];
  const client = apprenants.length > 0 ? apprenants[0] : null;
  
  const prixHT = opportunite.valeur || 0;
  const tauxTVA = 0.20;
  const montantTVA = prixHT * tauxTVA;
  const prixTTC = prixHT + montantTVA;

  const dateDevis = new Date();
  const dateValidite = new Date();
  dateValidite.setDate(dateDevis.getDate() + 30);

  const numDevis = `DEV-${dateDevis.getFullYear()}${String(dateDevis.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;

  let currentY = 20;

  const logoUrl = sourceData?.logoUrl || sourceData?.logo;
  if (logoUrl) {
    const b64Logo = await imageToBase64(logoUrl);
    if (b64Logo) {
      const props = doc.getImageProperties(b64Logo);
      const ratio = props.width / props.height;
      const displaySize = 40;
      const w = ratio > 1 ? displaySize : displaySize * ratio;
      const h = ratio > 1 ? displaySize / ratio : displaySize;
      doc.addImage(b64Logo, 'PNG', 15, currentY, w, h);
      currentY += Math.max(h, 20) + 5;
    } else {
      currentY += 25;
    }
  } else {
    currentY += 25;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text(sourceData?.nom?.toUpperCase() || "ORGANISME DE FORMATION", 15, currentY);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#6B7280");
  
  let adresse = "";
  if (sourceData?.adresse) {
      adresse = `${sourceData.adresse.rue || ''}\n${sourceData.adresse.codePostal || ''} ${sourceData.adresse.ville || ''}`.replace(/^, | , /g, '').trim();
  }
  doc.text(adresse || "Adresse non renseignée", 15, currentY + 5);
  doc.text(`SIRET : ${sourceData?.numeroSIRET || sourceData?.siret || 'N/A'}`, 15, currentY + 15);
  if (sourceData?.nda) doc.text(`NDA : ${sourceData.nda}`, 15, currentY + 20);
  if (sourceData?.contactEmail) doc.text(sourceData.contactEmail, 15, currentY + 25);

  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(120, 20, 75, 45, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("CLIENT", 125, 28);
  
  doc.setFontSize(11);
  doc.setTextColor("#111827");
  if (client) {
    doc.text(`${client.prenom} ${client.nom}`.toUpperCase(), 125, 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#6B7280");
    doc.text(client.email || "", 125, 42);
    if (client.telephone) doc.text(client.telephone, 125, 48);
  } else {
    doc.text("Client à définir", 125, 35);
  }

  currentY = Math.max(currentY + 35, 80);

  doc.setFillColor(c1);
  doc.rect(15, currentY, 180, 16, 'F');
  
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("DEVIS", 20, currentY + 11);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`N° ${numDevis}`, 185, currentY + 10, { align: "right" });

  currentY += 25;
  doc.setTextColor(c1);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Date : ${dateDevis.toLocaleDateString('fr-FR')}`, 15, currentY);
  doc.text(`Valable jusqu'au : ${dateValidite.toLocaleDateString('fr-FR')}`, 195, currentY, { align: "right" });

  currentY += 10;

  const descFormation = formation.title ? `Action de formation professionnelle : ${formation.title}` : "Prestation de formation";
  const format = opportunite.typeInterIntra === 'Intra' ? 'Intra-entreprise' : 'Inter-entreprise / Distanciel';
  const duree = formation.duration ? `${formation.duration} heures` : "Durée non précisée";

  autoTable(doc, {
    startY: currentY,
    head: [['Désignation', 'Format', 'Durée', 'Qté', 'Prix Unitaire HT', 'Total HT']],
    body: [
      [descFormation, format, duree, '1', `${prixHT.toFixed(2)} €`, `${prixHT.toFixed(2)} €`]
    ],
    theme: 'plain',
    headStyles: { 
      fillColor: c2, 
      textColor: "#FFFFFF", 
      fontStyle: 'bold', 
      fontSize: 10,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: "#374151"
    },
    columnStyles: {
      0: { cellWidth: 70 },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' }
    },
    didDrawCell: (data) => {
      if (data.section === 'head') {
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
      if (data.section === 'body') {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.1);
        doc.line(15, data.cell.y + data.cell.height, 195, data.cell.y + data.cell.height);
      }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(125, finalY, 70, 32, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor("#374151");
  doc.setFont("helvetica", "normal");
  
  doc.text("Total HT", 130, finalY + 8);
  doc.text(`${prixHT.toFixed(2)} €`, 190, finalY + 8, { align: "right" });
  
  doc.text("TVA (20%)", 130, finalY + 16);
  doc.text(`${montantTVA.toFixed(2)} €`, 190, finalY + 16, { align: "right" });

  doc.setDrawColor(c2);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 20, 190, finalY + 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("TOTAL TTC", 130, finalY + 27);
  doc.text(`${prixTTC.toFixed(2)} €`, 190, finalY + 27, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("Conditions de règlement :", 15, finalY + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#6B7280");
  doc.text("Acompte de 30% à la signature.\nSolde à réception de facture selon échéancier convenu.", 15, finalY + 11);

  let signY = finalY + 50;
  if (signY > 240) {
    doc.addPage();
    signY = 30;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(c1);
  doc.text("Le prestataire :", 45, signY, { align: "center" });
  doc.text("Le client :", 150, signY, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#9CA3AF");
  doc.text("Date et signature", 45, signY + 5, { align: "center" });
  doc.text('Date, signature et mention "Bon pour accord"', 150, signY + 5, { align: "center" });

  doc.setDrawColor(229, 231, 235);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(15, signY + 10, 60, 35, 2, 2);
  doc.roundedRect(120, signY + 10, 60, 35, 2, 2);

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

  if (returnDoc) return doc;
  const nomFichier = client ? client.nom : 'Client';
  doc.save(`Devis_${numDevis}_${nomFichier}.pdf`);
};