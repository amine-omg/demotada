const FORMATION_STATUSES = [
  {
    name: 'draft',
    label: 'Brouillon',
    description: 'Visible par vous uniquement',
    dotClass: 'bg-yellow-400', 
    badgeClass: 'bg-yellow-500 text-white', 
    iconPath: '<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>', 
    order: 1,
    isDefault: true
  },
  {
    name: 'public',
    label: 'Public',
    description: 'Votre formation est visible par tous',
    dotClass: 'bg-teal-500',
    badgeClass: 'bg-teal-600 text-[white]',
    iconPath: '<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>', // Icône d'œil/visibilité
    order: 2
  },
  {
    name: 'non_repertoriee',
    label: 'Non répertoriée',
    description: 'Votre formation est UNIQUEMENT visible par les personnes ayant le lien ainsi que par TOUS vos apprenants',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-700 text-white',
    iconPath: '<path d="M13.875 18.825A10.05 10.05 0 0112 20c-4.478 0-8.268-2.943-9.542-7a9.955 9.955 0 011.563-4.358m1.39-1.39a.75.75 0 00-1.06 1.06L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z"></path><path d="M19.06 5.94l-1.55 1.55A10.05 10.05 0 0112 4c-4.478 0-8.268 2.943-9.542 7a9.955 9.955 0 011.563-4.358m1.39-1.39a.75.75 0 00-1.06 1.06L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z"></path>', // Icône de lien/chaîne
    order: 3
  },
  {
    name: 'cachee',
    label: 'Cachée',
    description: 'Votre formation est UNIQUEMENT visible par les personnes ayant le lien et les apprenants l\'ayant acquis',
    dotClass: 'bg-gray-800',
    badgeClass: 'bg-gray-900 text-white', 
    iconPath: '<path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636M3 12a9 9 0 0118 0"></path>', 
    order: 4
  },
  {
    name: 'disabled',
    label: 'Archivée', 
    description: 'Votre formation est visible par tous MAIS les nouvelles inscriptions sont désactivées',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-700 text-white',
    iconPath: '<path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636M3 12a9 9 0 0118 0"></path><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>',
    order: 5
  }
];

export const CATEGORY_COLORS = {
  default: 'bg-[#B2E9E0]', 
  text: 'text-[#433C74]', 
  hover: 'hover:bg-[#B2E9E0]', 
  icon: '<path d="M9 5l7 7-7 7"></path>', 
  iconOpen: '<path d="M5 15l7-7 7 7"></path>' 
};

export default FORMATION_STATUSES;
