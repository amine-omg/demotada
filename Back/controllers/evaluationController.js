// Back/controllers/evaluationController.js
import Formation from '../models/Formation.js';

/**
 * SAUVEGARDER OU METTRE À JOUR UNE ÉVALUATION (Builder & Switch)
 */
export const saveEvaluation = async (req, res) => {
  try {
    const { formationId } = req.params;
    // On extrait isEnabled en plus des autres champs. S'il n'est pas fourni, on le met à true par défaut.
    const { type, questions, settings, title, explanationPdfUrl, isEnabled } = req.body;

    const formation = await Formation.findById(formationId);
    if (!formation) return res.status(404).json({ message: "Formation non trouvée" });

    if (!formation.evaluations) formation.evaluations = [];
    
    const evalIndex = formation.evaluations.findIndex(e => e.type === type);

    if (evalIndex > -1) {
      // Si l'évaluation existe déjà, on la met à jour.
      // On utilise l'opérateur de coalescence (??) ou le || selon ce qu'on veut écraser.
      // Cela permet de faire une simple bascule (toggle) isEnabled sans écraser les questions existantes si elles ne sont pas envoyées.
      const existingEval = formation.evaluations[evalIndex];
      
      formation.evaluations[evalIndex] = {
        type: type,
        title: title !== undefined ? title : existingEval.title,
        questions: questions !== undefined ? questions : existingEval.questions,
        settings: settings !== undefined ? settings : existingEval.settings,
        explanationPdfUrl: explanationPdfUrl !== undefined ? explanationPdfUrl : existingEval.explanationPdfUrl,
        isEnabled: isEnabled !== undefined ? isEnabled : existingEval.isEnabled
      };
    } else {
      // Si l'évaluation n'existe pas, on la crée entièrement
      const newEval = {
        type,
        title: title || (type === 'positioning' ? 'Test de Positionnement' : type === 'satisfaction_chaud' ? 'Satisfaction à Chaud' : 'Satisfaction à Froid'),
        questions: questions || [],
        settings: settings || { isBlocking: false, minScoreToPass: 0 },
        explanationPdfUrl: explanationPdfUrl || '',
        isEnabled: isEnabled !== undefined ? isEnabled : true
      };
      formation.evaluations.push(newEval);
    }

    // Rétrocompatibilité avec l'ancien champ 'positioningTest'
    if (type === 'positioning') {
      const currentEval = formation.evaluations.find(e => e.type === 'positioning');
      formation.positioningTest = currentEval;
    }

    await formation.save();
    
    // On renvoie l'évaluation mise à jour pour que le front soit synchro
    const updatedEval = formation.evaluations.find(e => e.type === type);
    res.status(200).json({ message: "Évaluation sauvegardée avec succès", evaluation: updatedEval });
    
  } catch (error) {
    console.error("Erreur saveEvaluation:", error);
    res.status(500).json({ message: "Erreur lors de la sauvegarde", error: error.message });
  }
};

/**
 * RÉCUPÉRER LES STATS PAR CATÉGORIE
 */
export const getStatsByCategory = async (req, res) => {
  try {
    const { formationId, type } = req.params;
    const formation = await Formation.findById(formationId);
    if (!formation) return res.status(404).json({ message: "Formation non trouvée" });

    const evaluation = formation.evaluations.find(e => e.type === type);
    if (!evaluation) return res.status(404).json({ message: "Évaluation non trouvée" });

    const categoryStats = {};

    evaluation.questions.forEach(q => {
      const name = q.category || "Général";
      if (!categoryStats[name]) {
        categoryStats[name] = { count: 0, maxPoints: 0, earnedPoints: 0 };
      }
      categoryStats[name].count++;
      categoryStats[name].maxPoints += (q.points || 1);
    });

    const formattedStats = Object.keys(categoryStats).map(name => ({
      category: name,
      score: Math.round((categoryStats[name].earnedPoints / categoryStats[name].maxPoints) * 100) || 0,
      totalQuestions: categoryStats[name].count
    }));

    res.status(200).json(formattedStats);
  } catch (error) {
    console.error("Erreur getStatsByCategory:", error);
    res.status(500).json({ message: "Erreur lors du calcul des stats", error: error.message });
  }
};

/**
 * RÉCUPÉRER UNE ÉVALUATION SPÉCIFIQUE
 */
export const getEvaluation = async (req, res) => {
    try {
        const { formationId, type } = req.params;
        const formation = await Formation.findById(formationId);
        
        if (!formation) return res.status(404).json({ message: "Formation non trouvée" });

        const evaluation = formation.evaluations.find(e => e.type === type);
        
        if (!evaluation) {
            // Rétrocompatibilité : si l'évaluation de positionnement n'est pas dans le tableau mais existe dans l'ancien champ
            if (type === 'positioning' && formation.positioningTest && formation.positioningTest.questions && formation.positioningTest.questions.length > 0) {
                return res.status(200).json(formation.positioningTest);
            }
            return res.status(404).json({ message: "Évaluation non trouvée pour ce type" });
        }

        res.status(200).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
    }
};

// Supprimer une copie (Force l'apprenant à repasser le test)
export const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    await UserEvaluation.findByIdAndDelete(id);
    res.status(200).json({ message: "Copie supprimée avec succès. L'apprenant devra repasser le test." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

// Export par défaut pour la compatibilité avec les routes
export default {
  saveEvaluation,
  getStatsByCategory,
  getEvaluation
};