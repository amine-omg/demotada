import UserEvaluation from '../models/UserEvaluation.js';

export const submitEvaluation = async (req, res) => {
  try {
    // AJOUT : On extrait sessionId depuis la requête
    const { formationId, evaluationType, responses, sessionId } = req.body;
    const userId = req.user._id; 

    // 1. Calcul des scores par catégorie
    const categoryTotals = {}; 

    responses.forEach(resp => {
      if (!categoryTotals[resp.category]) {
        categoryTotals[resp.category] = { score: 0, total: 0 };
      }
      
      categoryTotals[resp.category].total += 1;
      if (resp.isCorrect) {
        categoryTotals[resp.category].score += 1;
      }
    });

    // 2. Transformer en pourcentages
    const statsByCategory = {};
    let totalCorrect = 0;
    
    for (const cat in categoryTotals) {
      const percentage = Math.round((categoryTotals[cat].score / categoryTotals[cat].total) * 100);
      statsByCategory[cat] = percentage;
      totalCorrect += categoryTotals[cat].score;
    }

    // 3. Calcul du score global
    const globalScore = Math.round((totalCorrect / responses.length) * 100);

    // 4. Enregistrement 
    const evaluation = await UserEvaluation.findOneAndUpdate(
      { student: userId, formation: formationId, evaluationType },
      {
        session: sessionId, // NOUVEAU : On sauvegarde la session en BDD
        responses,
        statsByCategory,
        globalScore,
        completedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la soumission", error: error.message });
  }
};

export const getResultsByFormation = async (req, res) => {
  try {
    const { formationId, type } = req.params;

    const query = { formation: formationId };
    if (type && type !== 'all') {
      query.evaluationType = type;
    }

    const results = await UserEvaluation.find(query)
      .populate('student', 'nom prenom email')
      .populate('session', 'nom startDate') // NOUVEAU : On récupère les infos de la session pour le front !
      .sort({ completedAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération résultats", error: error.message });
  }
};

export const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    await UserEvaluation.findByIdAndDelete(id);
    res.status(200).json({ message: "Copie supprimée avec succès. L'apprenant devra repasser le test." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

export const checkMyEvaluation = async (req, res) => {
  try {
    const { formationId, type } = req.params;
    const userId = req.user._id;

    const evaluation = await UserEvaluation.findOne({
      formation: formationId,
      student: userId,
      evaluationType: type
    });

    res.status(200).json({ hasCompleted: !!evaluation });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la vérification", error: error.message });
  }
};