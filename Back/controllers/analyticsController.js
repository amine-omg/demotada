import Session from '../models/Session.js';
import Opportunite from '../models/Opportunite.js';
import User from '../models/User.js';

export const getPerformanceTunnel = async (req, res) => {
    try {
        const { timeframe } = req.query; // 'jour', 'semaine', 'mois', 'annee'
        const ecoleId = req.user?.associatedEntity; // Optionnel : filtrer par école

        const now = new Date();
        const intervals = [];
        let totalPeriods = 0;

        // --- 1. GÉNÉRATION DES TRANCHES DE TEMPS (BINS) ---
        // On génère le passé vers le présent
        if (timeframe === 'jour') {
            totalPeriods = 7; // Les 7 derniers jours
            for (let i = totalPeriods - 1; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const end = new Date(start);
                end.setDate(end.getDate() + 1);
                intervals.push({ 
                    label: start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), 
                    start, end 
                });
            }
        } else if (timeframe === 'semaine') {
            totalPeriods = 5; // Les 5 dernières semaines
            for (let i = totalPeriods - 1; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - now.getDay() + 1);
                const end = new Date(start);
                end.setDate(end.getDate() + 7);
                intervals.push({ 
                    label: `Sem. ${start.getDate()}/${start.getMonth()+1}`, 
                    start, end 
                });
            }
        } else if (timeframe === 'mois') {
            totalPeriods = 6; // Les 6 derniers mois
            for (let i = totalPeriods - 1; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
                intervals.push({ 
                    label: start.toLocaleDateString('fr-FR', { month: 'short' }), 
                    start, end 
                });
            }
        } else { // annee
            totalPeriods = 5; // 5 dernières années
            for (let i = totalPeriods - 1; i >= 0; i--) {
                const start = new Date(now.getFullYear() - i, 0, 1);
                const end = new Date(start.getFullYear() + 1, 0, 1);
                intervals.push({ label: `${start.getFullYear()}`, start, end });
            }
        }

        const overallStartDate = intervals[0].start;

        // --- 2. EXTRACTION DES DONNÉES GLOBALES DEPUIS LA BDD ---
        // Inscriptions
        const users = await User.find({ 
            role: 'apprenant', 
            createdAt: { $gte: overallStartDate } 
        }).select('createdAt');

        // CA (Opportunités gagnées)
        const baseMatch = ecoleId ? { ecole: ecoleId } : {};
        const opportunites = await Opportunite.find({
            ...baseMatch,
            statutOpportunite: 'Gagné',
            modifiedAt: { $gte: overallStartDate }
        }).select('modifiedAt valeur');

        // Démarrages & Complétions (Via les Sessions)
        const sessions = await Session.find().select('elevesInscrits');
        let eleves = [];
        sessions.forEach(s => {
            if (s.elevesInscrits && s.elevesInscrits.length > 0) {
                eleves = eleves.concat(s.elevesInscrits.filter(e => e.dateInscription >= overallStartDate));
            }
        });

        // --- 3. VENTILATION DANS LES TRANCHES (Le "Binning") ---
        const timeline = {
            labels: intervals.map(i => i.label),
            datasets: {
                inscriptions: [],
                demarrages: [],
                actifs: [],
                termines: [],
                ca: []
            }
        };

        const totals = { inscriptions: 0, demarrages: 0, actifs: 0, termines: 0, ca: 0 };

        intervals.forEach(interval => {
            // Utilisateurs inscrits dans cet intervalle
            const u = users.filter(user => user.createdAt >= interval.start && user.createdAt < interval.end).length;
            
            // CA généré dans cet intervalle
            const ca = opportunites
                .filter(opp => opp.modifiedAt >= interval.start && opp.modifiedAt < interval.end)
                .reduce((acc, opp) => acc + (opp.valeur || 0), 0);

            // Élèves inscrits dans cet intervalle
            const elInInterval = eleves.filter(e => e.dateInscription >= interval.start && e.dateInscription < interval.end);
            const demarrages = elInInterval.filter(e => e.completion > 0).length;
            const termines = elInInterval.filter(e => e.completion === 100).length;
            const actifs = Math.max(0, demarrages - termines); // Ceux qui ont commencé mais pas fini

            // Remplissage des tableaux pour le graphique
            timeline.datasets.inscriptions.push(u);
            timeline.datasets.demarrages.push(demarrages);
            timeline.datasets.actifs.push(actifs);
            timeline.datasets.termines.push(termines);
            timeline.datasets.ca.push(ca);

            // Incrémentation des Totaux
            totals.inscriptions += u;
            totals.demarrages += demarrages;
            totals.actifs += actifs;
            totals.termines += termines;
            totals.ca += ca;
        });

        // --- 4. RÉPONSE ---
        res.status(200).json({
            success: true,
            tunnel: {
                inscriptions: { value: totals.inscriptions, trend: 0 },
                demarrages: { value: totals.demarrages, trend: 0 },
                actifs: { value: totals.actifs, trend: 0 },
                termines: { value: totals.termines, trend: 0 },
                ca: { value: totals.ca, trend: 0 }
            },
            timeline
        });

    } catch (error) {
        console.error("Erreur Analytics Tunnel:", error);
        res.status(500).json({ message: "Erreur serveur analytique" });
    }
};

export const getSessionsOverview = async (req, res) => {
    // Garde le même code que je t'ai fourni juste avant pour getSessionsOverview
    // (Pas de changement requis sur la vue Sessions, elle était déjà bonne)
    res.status(200).json({ success: true, message: "Utilise le code précédent pour la route sessions" });
};