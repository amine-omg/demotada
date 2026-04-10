import axios from 'axios';

const OPENDATA_API_URL = 'https://opendata.caissedesdepots.fr/api/explore/v2.1/catalog/datasets/moncompteformation_catalogueformation/records';

// On définit la constante pour les en-têtes une seule fois
const API_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

/**
 * @desc    Récupère des données de marché depuis l'API Open Data avec des filtres et agrégations
 * @route   GET /api/market-analysis/data
 * @access  Privé (Admin, Ecole)
 */
export const getMarketData = async (req, res) => {
    try {
        const {
            region,
            departement,
            keyword,
            minPrice, maxPrice,
            minHours, maxHours,
            certification,
            code_rome,
            code_nsf,
            limit = 100,
        } = req.query;

        const whereClauses = [];
        if (region) whereClauses.push(`nom_region = "${region}"`);
        if (departement) whereClauses.push(`nom_departement = "${departement}"`);
        if (certification) whereClauses.push(`intitule_formation LIKE "${certification}"`);
        if (code_rome) whereClauses.push(`(code_rome_1="${code_rome}" OR code_rome_2="${code_rome}" OR code_rome_3="${code_rome}")`);
        if (code_nsf) whereClauses.push(`code_nsf_1 = "${code_nsf}"`);
        if (keyword) whereClauses.push(`intitule_formation LIKE "${keyword}"`);
        if (minPrice) whereClauses.push(`frais_ttc_tot_mean >= ${minPrice}`);
        if (maxPrice) whereClauses.push(`frais_ttc_tot_mean <= ${maxPrice}`);
        if (minHours) whereClauses.push(`nombre_heures_total_mean >= ${minHours}`);
        if (maxHours) whereClauses.push(`nombre_heures_total_mean <= ${maxHours}`);
        
        const whereQuery = whereClauses.join(' AND ');

        const params = {
            select: "nom_of, intitule_formation, frais_ttc_tot_mean, nom_region, nom_departement, nombre_heures_total_mean",
            where: whereQuery,
            limit: parseInt(limit, 10),
        };
        
        const apiResponse = await axios.get(OPENDATA_API_URL, {
            params,
            headers: API_HEADERS // CORRECTION: On passe la constante directement
        });
        
        res.status(200).json(apiResponse.data);

    } catch (error) {
        console.error("Erreur lors de la récupération des données de marché :", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erreur lors de la communication avec l'API Open Data" });
    }
};

export const getPricingStats = async (req, res) => {
    try {
        const { certification } = req.query;
        if (!certification) {
            return res.status(400).json({ message: "Le paramètre 'certification' est requis." });
        }

        const statsParams = {
            // AJOUT: On demande maintenant la durée médiane (duree_mediane)
            select: `avg(frais_ttc_tot_mean) as prix_moyen, 
                     median(frais_ttc_tot_mean) as prix_median, 
                     min(frais_ttc_tot_mean) as prix_min, 
                     max(frais_ttc_tot_mean) as prix_max, 
                     avg(nombre_heures_total_mean) as duree_moyenne,
                     median(nombre_heures_total_mean) as duree_mediane`,
            where: `intitule_formation LIKE "${certification}"`,
        };

        const scatterParams = {
            select: "nom_of, frais_ttc_tot_mean, nombre_heures_total_mean",
            where: `intitule_formation LIKE "${certification}"`,
            limit: 100,
        };
        
        const [statsResponse, scatterResponse] = await Promise.all([
            axios.get(OPENDATA_API_URL, { params: statsParams, headers: API_HEADERS }),
            axios.get(OPENDATA_API_URL, { params: scatterParams, headers: API_HEADERS })
        ]);

        res.status(200).json({
            stats: statsResponse.data.results[0] || null,
            scatterPoints: scatterResponse.data.results || []
        });

    } catch (error) {
        console.error("Erreur lors du calcul des stats de prix :", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erreur lors de la communication avec l'API Open Data" });
    }
};

/**
 * @desc    Trouve des opportunités de marché
 * @route   GET /api/market-analysis/opportunities
 * @access  Privé (Admin, Ecole)
 */
export const getMarketOpportunities = async (req, res) => {
    try {
        const { region, domain } = req.query;
        if (!region || !domain) {
            return res.status(400).json({ message: "Les paramètres 'region' et 'domain' sont requis." });
        }

        const whereClauses = [];
        if (domain) whereClauses.push(`libelle_nsf_1 LIKE "${domain}"`); 
        if (region) whereClauses.push(`nom_region = "${region}"`);
        
        const whereQuery = whereClauses.join(' AND ');

        const params = {
            select: "intitule_certification, count(*) as competitor_count",
            group_by: "intitule_certification",
            where: whereQuery,
            order_by: "competitor_count ASC",
            limit: 50,
        };
        
        const apiResponse = await axios.get(OPENDATA_API_URL, {
            params,
            headers: API_HEADERS // CORRECTION
        });
        
        res.status(200).json(apiResponse.data.results);

    } catch (error) {
        console.error("Erreur lors de la recherche d'opportunités :", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erreur lors de la communication avec l'API Open Data" });
    }
};

/**
 * @desc    Extrait les mots-clés des contenus de formation
 * @route   GET /api/market-analysis/keywords
 * @access  Privé (Admin, Ecole)
 */
export const getFormationKeywords = async (req, res) => {
    try {
        const { certification } = req.query;
        if (!certification) {
            return res.status(400).json({ message: "Le paramètre 'certification' est requis." });
        }

        const params = {
            select: "contenu_formation, intitule_formation", // On demande aussi l'intitulé pour le log
            where: `intitule_formation LIKE "${certification}"`,
            limit: 50
        };
        
        console.log(`[Keywords] Appel API avec les paramètres :`, params);

        const apiResponse = await axios.get(OPENDATA_API_URL, {
            params,
            headers: API_HEADERS
        });

        // --- SONDE N°1 : Que renvoie l'API ? ---
        console.log(`[Keywords] ${apiResponse.data.total_count} résultats bruts trouvés pour "${certification}"`);
        // On vérifie si les résultats ont bien le champ 'contenu_formation'
        if (apiResponse.data.results && apiResponse.data.results.length > 0) {
            console.log("[Keywords] Premier résultat brut :", JSON.stringify(apiResponse.data.results[0], null, 2));
        }

        const wordCounts = {};
        const stopWords = new Set(['le', 'la', 'les', 'de', 'des', 'du', 'et', 'à', 'en', 'pour', 'un', 'une', 'avec', 'sur', 'par', 'ce', 'cette', 'est', 'sont', 'vous', 'nous', 'dans', 'que', 'qui', 'il', 'elle', 'au', 'aux', 'pas', 'plus', 'vos', 'nos', 'votre', 'notre', 'des', 'les', 'd', 'l', 's', 'n', 'qu', 'une', 'un', 'les', 'des', 'et', 'ou', 'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'par', 'vers', 'chez', 'entre', 'pendant', 'depuis', 'malgré', 'selon', 'comme', 'si', 'quand', 'lorsque', 'puisque', 'afin', 'donc', 'car', 'mais', 'or', 'ni', 'soit', 'être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'savoir', 'vouloir', 'devoir', 'falloir', 'mettre', 'prendre', 'donner', 'parler', 'aimer', 'penser', 'trouver', 'passer', 'comprendre', 'connaître', 'partir', 'revenir', 'sortir', 'entrer', 'monter', 'descendre', 'rester', 'tomber', 'mourir', 'naître', 'devenir', 'suivre', 'vivre', 'croire', 'perdre', 'attendre', 'répondre', 'entendre', 'conduire', 'écrire', 'lire', 'dormir', 'servir', 'sentir', 'courir', 'ouvrir', 'fermer', 'offrir', 'recevoir', 'choisir', 'finir', 'agir', 'réussir', 'grandir', 'vieillir', 'maigrir', 'grossir', 'rougir', 'pâlir', 'guérir', 'obéir', 'désobéir', 'réfléchir', 'bâtir', 'démolir', 'nourrir', 'remplir', 'vider', 'salir', 'nettoyer', 'unir', 'séparer', 'réunir', 'diviser', 'avertir', 'punir', 'saisir', 'établir', 'investir', 'convertir', 'trahir', 'haïr', 'bénir', 'fleurir', 'verdir', 'jaunir', 'blanchir', 'noircir', 'éclaircir', 'foncer', 'alourdir', 'alléger', 'enrichir', 'appauvrir', 'agrandir', 'rétrécir', 'épaissir', 'amincir', 'approfondir', 'durcir', 'ramollir', 'embellir', 'enlaidir', 'rafraîchir', 'réchauffer', 'ralentir', 'accélérer', 'améliorer', 'détériorer']);

        if (apiResponse.data.results) {
            for (const result of apiResponse.data.results) {
                if (!result.contenu_formation) {
                    continue; // On passe au suivant si le champ est vide
                }

                const text = result.contenu_formation
                    .replace(/<[^>]*>/g, ' ')
                    .toLowerCase()
                    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                    .replace(/\s+/g, ' ');

                const words = text.split(' ');
                for (const word of words) {
                    if (word.length > 3 && !stopWords.has(word) && isNaN(word)) {
                        wordCounts[word] = (wordCounts[word] || 0) + 1;
                    }
                }
            }
        }
        
        // --- SONDE N°2 : Avons-nous compté des mots ? ---
        console.log(`[Keywords] Nombre de mots-clés uniques trouvés après traitement : ${Object.keys(wordCounts).length}`);

        const keywords = Object.entries(wordCounts)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);

        // --- SONDE N°3 : Qu'est-ce qu'on renvoie au front ? ---
        console.log(`[Keywords] Envoi de ${keywords.length} mots-clés au frontend.`);

        res.status(200).json(keywords);

    } catch (error) {
        console.error("Erreur lors de l'analyse des mots-clés :", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erreur lors de la communication avec l'API Open Data" });
    }
};

export const getCompetitionHeatmap = async (req, res) => {
    try {
        // MODIFICATION: On attend un 'keyword' au lieu d'un 'domain'
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({ message: "Le paramètre 'keyword' est requis." });
        }

        const params = {
            select: "count(*) as count",
            // MODIFICATION: On cherche dans 'intitule_formation'
            where: `intitule_formation LIKE "${keyword}"`,
            group_by: "nom_departement",
            limit: 101, // Il y a 101 départements en France
        };

        const apiResponse = await axios.get(OPENDATA_API_URL, {
            params,
            headers: API_HEADERS
        });

        res.status(200).json(apiResponse.data.results);

    } catch (error) {
        console.error("Erreur lors de la récupération des données de la carte de chaleur :", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erreur lors de la communication avec l'API Open Data" });
    }
};

export const getTopCertifications = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({ message: "Le paramètre 'keyword' est requis." });
        }

        const params = {
            select: "intitule_certification, count(*) as count",
            where: `intitule_formation LIKE "${keyword}" AND intitule_certification IS NOT NULL`,
            group_by: "intitule_certification",
            order_by: "count DESC",
            limit: 10,
        };

        const apiResponse = await axios.get(OPENDATA_API_URL, {
            params,
            headers: API_HEADERS
        });

        res.status(200).json(apiResponse.data.results);

    } catch (error) {
        console.error("Erreur lors de l'analyse des top certifications :", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Erreur lors de la communication avec l'API Open Data" });
    }
};
