import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import ProgressionEleve from '../models/ProgressionEleve.js';

export const submitQuizAttempt = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { sessionId, activityId, answers: studentAnswers } = req.body; // On récupère activityId du body
        const studentId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz non trouvé" });

        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: "Utilisateur non trouvé" });

        if (quiz.rules?.hasAttemptLimit) {
            const attemptsCount = await QuizAttempt.countDocuments({ quizId, studentId });
            if (attemptsCount >= quiz.rules.maxAttempts && !(quiz.rules.isHandicapImmune && student.isHandicap)) {
                return res.status(403).json({ message: "Nombre maximum de tentatives atteint." });
            }
        }

        let score = 0;
        const totalPossibleScore = quiz.totalPossibleScore || 0;
        const processedAnswers = [];

        for (const question of quiz.questions) {
            const studentAnswer = studentAnswers.find(a => a.questionId === question._id.toString());
            let isCorrect = false;
            let finalSelectedIds = [];

            if (studentAnswer) {
                if (question.type === 'ordering') {
                    finalSelectedIds = studentAnswer.orderedIds || [];
                    isCorrect = question.orderingElements.every((el, index) => {
                        const correctEl = question.orderingElements.find(e => e.order === index + 1);
                        return String(finalSelectedIds[index]) === String(correctEl._id);
                    });
                } 
                else {
                    finalSelectedIds = (studentAnswer.selectedOptions || []).map(id => String(id).trim());
                    const correctIds = question.options
                        .filter(o => o.isCorrect)
                        .map(o => String(o._id).trim());

                    isCorrect = correctIds.length === finalSelectedIds.length && 
                                correctIds.every(id => finalSelectedIds.includes(id));
                }

                if (isCorrect) {
                    score += (question.points || 1); 
                }
            }

            processedAnswers.push({ 
                questionId: question._id, 
                selectedOptionIds: finalSelectedIds, 
                wasCorrect: isCorrect 
            });
        }

        const minScoreRequired = quiz.minScoreToPass || 0; 
        const passed = score >= minScoreRequired;
        
        // Calcul du score en pourcentage pour le nouveau champ de ProgressionContent
        const percentageScore = totalPossibleScore > 0 ? Math.round((score / totalPossibleScore) * 100) : 0;

        const newAttempt = new QuizAttempt({
            quizId,
            studentId,
            answers: processedAnswers,
            score,
            totalPossibleScore,
            passed,
            completedAt: new Date()
        });

        await newAttempt.save();

        if (sessionId) {
            // On récupère l'ID de l'activité (contentId) depuis le body
            // Si le front ne l'envoie pas encore, on prend quizId par défaut
            const actualContentId = req.body.contentId || quizId;

            // 1. Mise à jour de ProgressionContent (pour le tableau Admin)
            await ProgressionContent.findOneAndUpdate(
                { 
                    user: studentId, 
                    session: sessionId, 
                    content: actualContentId // Utilise l'ID de l'activité
                },
                { 
                    $set: { 
                        status: 'termine', 
                        score: percentageScore // Note en % pour ton tableau
                    } 
                },
                { upsert: true } // INDISPENSABLE : crée la ligne si elle n'existe pas
            );

            // 2. Mise à jour de ProgressionEleve (ta structure d'origine pour ne rien casser)
            await ProgressionEleve.findOneAndUpdate(
                { 
                    user: studentId, 
                    session: sessionId, 
                    contentId: quizId // Garde ton ancienne logique ici
                },
                { 
                    $set: { 
                        status: 'termine', 
                        score: score, // Note brute 
                        totalScore: totalPossibleScore,
                        completedAt: new Date()
                    } 
                },
                { upsert: true }
            );
        }

        res.status(201).json({ 
            message: "Quiz soumis avec succès", 
            score, 
            percentageScore,
            totalPossibleScore, 
            passed,
            attemptId: newAttempt._id 
        });

    } catch (error) {
        console.error("Erreur dans submitQuizAttempt:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


export const getMyAttemptsForQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        const attempts = await QuizAttempt.find({ quizId, studentId })
            .sort({ createdAt: -1 });

        res.status(200).json(attempts);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

/**
 * @desc    Récupère les détails d'une tentative spécifique
 * @route   GET /api/attempts/:attemptId
 */
export const getAttemptById = async (req, res) => {
    try {
        const attempt = await QuizAttempt.findById(req.params.attemptId)
            .populate('quizId', 'title questions');

        if (!attempt) return res.status(404).json({ message: "Tentative non trouvée" });

        // Sécurité : Seul l'élève concerné ou un admin peut voir le détail
        if (attempt.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès non autorisé" });
        }

        res.status(200).json(attempt);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};