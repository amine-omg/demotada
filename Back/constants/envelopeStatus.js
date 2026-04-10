// backend/constants/envelopeStatus.js
// Cycle de vie d'un document dans Kernain

const ENVELOPE_STATUSES = [
  {
    name: 'draft',
    label: 'Brouillon',
    description: 'En cours de préparation par l\'expéditeur',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-100 text-gray-700',
    order: 1
  },
  {
    name: 'sent',
    label: 'Envoyé',
    description: 'En attente d\'action des signataires',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700',
    order: 2
  },
  {
    name: 'delivered',
    label: 'Délivré',
    description: 'Le document a été ouvert par au moins un signataire',
    dotClass: 'bg-purple-500',
    badgeClass: 'bg-purple-100 text-purple-700',
    order: 3
  },
  {
    name: 'completed',
    label: 'Signé',
    description: 'Tous les signataires ont apposé leur signature',
    dotClass: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700',
    order: 4
  },
  {
    name: 'declined',
    label: 'Refusé',
    description: 'Un signataire a refusé de signer le document',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700',
    order: 5
  },
  {
    name: 'voided',
    label: 'Annulé',
    description: 'L\'expéditeur a annulé la demande de signature',
    dotClass: 'bg-black',
    badgeClass: 'bg-black text-white',
    order: 6
  }
];

export default ENVELOPE_STATUSES;