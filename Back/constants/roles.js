// backend/constants/roles.js
// Définition des rôles et permissions pour Kernain

const USER_ROLES = [
  { 
    name: 'owner', 
    label: 'Propriétaire', 
    description: 'Accès total : facturation, branding et gestion du compte',
    canSendEnvelopes: true,
    canCreateTemplates: true,
    canManageTeam: true,
    canEditBranding: true,
    canAccessApi: true 
  },
  { 
    name: 'admin', 
    label: 'Administrateur', 
    description: 'Gère les utilisateurs et les modèles de documents',
    canSendEnvelopes: true,
    canCreateTemplates: true,
    canManageTeam: true,
    canEditBranding: false,
    canAccessApi: true 
  },
  { 
    name: 'sender', 
    label: 'Expéditeur', 
    description: 'Peut préparer et envoyer des documents pour signature',
    canSendEnvelopes: true,
    canCreateTemplates: true,
    canManageTeam: false,
    canEditBranding: false,
    canAccessApi: false 
  },
  { 
    name: 'viewer', 
    label: 'Observateur', 
    description: 'Accès en lecture seule pour l\'audit et le suivi',
    canSendEnvelopes: false,
    canCreateTemplates: false,
    canManageTeam: false,
    canEditBranding: false,
    canAccessApi: false 
  }
];

export default USER_ROLES;