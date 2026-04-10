import Chapter from '../models/Chapter.js';
// MODIFIÉ : On importe 'Module' au lieu de 'Formation' car c'est le nouveau parent du chapitre.
import Module from '../models/Module.js';


export const createChapter = async (req, res) => {
         try {
               const { title, description, moduleId, order } = req.body;
               if (!moduleId) {
               return res.status(400).json({ message: "L'ID du module est requis pour créer un chapitre." });
             }

                 const newChapter = new Chapter({
                         title,
                         description,
                         module: moduleId, 
                         order,
      createdBy: req.user._id,
    });

    const savedChapter = await newChapter.save();

    // MODIFIÉ : On met à jour le module parent pour y ajouter la référence de ce nouveau chapitre.
    await Module.findByIdAndUpdate(moduleId, {
      $push: { chapters: savedChapter._id }
    });

    res.status(201).json(savedChapter);
  } catch (error) {
    console.error("Erreur dans createChapter:", error);
    res.status(400).json({ message: "Erreur lors de la création du chapitre", error: error.message });
  }
};

export const getChapters = async (req, res) => {
  try {
    const filter = req.query.moduleId ? { module: req.query.moduleId } : {};
    
    const chapters = await Chapter.find(filter)
      .populate({
    path: 'contents',
    select: '_id title type totalPossibleScore passingScore minScoreToPass'
})
      .sort('order');

    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate({
        path: 'contents',
        // IMPORTANT : On ne filtre plus avec select pour laisser 
        // Mongoose ramener tous les champs du Quiz
        strictPopulate: false 
      });

    if (!chapter) {
      return res.status(404).json({ message: "Chapitre non trouvé" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate({
    path: 'contents',
    select: '_id title type totalPossibleScore passingScore minScoreToPass'
})

    if (!updatedChapter) {
      return res.status(404).json({ message: "Chapitre non trouvé" });
    }
    res.status(200).json(updatedChapter);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du chapitre:", error);
    res.status(400).json({ message: "Erreur lors de la mise à jour du chapitre", error: error.message });
  }
};

/**
* @desc  Supprime un chapitre.
* @route DELETE /api/chapters/:id
* @access Private (Instructor, Admin)
*/
export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapitre non trouvé" });
    }

    // MODIFIÉ : On retire la référence du chapitre du module parent.
    await Module.findByIdAndUpdate(chapter.module, {
      $pull: { chapters: chapter._id }
    });

    await chapter.deleteOne();

    res.status(200).json({ message: "Chapitre supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};