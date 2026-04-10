// backend/knowledge/cee_rules.js

export const ceeRules = `
RÈGLES DE CALCUL CEE (BASE DE CONNAISSANCE) :

1. ZONES CLIMATIQUES PAR DÉPARTEMENT :
- Zone H1 : Départements 01, 02, 03, 05, 08, 10, 14, 15, 21, 25, 27, 28, 38, 39, 42, 43, 51, 52, 54, 55, 57, 58, 59, 60, 61, 62, 67, 68, 69, 70, 71, 73, 74, 76, 78 (Yvelines - ex: Achères), 80, 88, 89, 90, 91, 92, 93, 94, 95.
- Zone H2 : Départements 04, 07, 09, 12, 16, 17, 18, 19, 22, 23, 24, 26, 29, 31, 32, 33, 35, 36, 37, 40, 41, 44, 46, 47, 48, 49, 50, 53, 56, 61, 72, 79, 81, 82, 85, 86, 87.
- Zone H3 : Départements 11, 13, 30, 34, 66, 83, 84, 2A, 2B.

2. FICHE BAT-EN-101 (Isolation planchers/toitures tertiaire) :
- Montant forfaitaire : Zone H1 = 2600 kWh cumac/m2 | Zone H2 = 2100 kWh cumac/m2 | Zone H3 = 1400 kWh cumac/m2.
- Facteur correctif : Bureaux/Commerces = 0.6 | Santé = 1.2 | Autres = 0.6.
- Formule : Surface (m2) * Montant forfaitaire * Facteur correctif.
- Critère technique : Résistance thermique (R) >= 6 m2.K/W.

3. FICHE BAR-TH-104 (Pompe à chaleur) :
- Critère technique : Efficacité saisonnière (Etas) >= 111% (Moyenne temp) ou 126% (Basse temp).
`;