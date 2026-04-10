const USER_PERMISSIONS = [
  { name: 'admin', label: 'Administrateur', description: 'Accès complet', canCreateFormation: true, canManageApprenants: true, canAccessStats: true },
  { name: 'formateur', label: 'Formateur', description: 'Gère les cours et apprenants', canCreateFormation: true, canManageApprenants: true, canAccessStats: false },
  { name: 'apprenant', label: 'Apprenant', description: 'Suit les formations', canCreateFormation: false, canManageApprenants: false, canAccessStats: false },
  { name: 'ecole', label: 'Admin École', description: 'Gère les utilisateurs et formations de son école', canCreateFormation: true, canManageApprenants: true, canAccessStats: true },
  { name: 'entreprise', label: 'Responsable Entreprise', description: 'Gère les apprenants de son entreprise', canCreateFormation: false, canManageApprenants: true, canAccessStats: true },
  { name: 'sales', label: 'Commercial', description: 'Accès au CRM et aux leads' }
];

export default USER_PERMISSIONS;
