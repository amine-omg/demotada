import Organization from '../models/Organization.js';

// Créer ou mettre à jour les infos officielles (Upsert)
export const upsertOrganization = async (req, res) => {
  try {
    const { 
      tenantId, 
      legalName, 
      siret, 
      vatNumber, 
      address, 
      contactEmail, 
      officialLogoUrl 
    } = req.body;

    const org = await Organization.findOneAndUpdate(
      { tenantId }, // On lie l'organisation au compte SaaS (Tenant)
      { 
        legalName, 
        siret, 
        vatNumber, 
        address, 
        contactEmail, 
        officialLogoUrl 
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Informations légales de l'organisation synchronisées.", 
      org 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer les infos pour l'injection dans un document
export const getOrganizationByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const org = await Organization.findOne({ tenantId });
    
    if (!org) return res.status(404).json({ message: "Organisation non configurée." });
    res.status(200).json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};