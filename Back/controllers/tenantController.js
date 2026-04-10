import Tenant from '../models/Tenant.js';

// Créer un nouveau client (Tenant)
export const createTenant = async (req, res) => {
  try {
    const { name, slug, domain, branding } = req.body;
    
    // Le slug doit être unique (ex: 'syali', 'karnain-group')
    const tenant = new Tenant({
      name,
      slug,
      domain,
      branding
    });

    await tenant.save();
    res.status(201).json({ message: "Nouveau client configuré avec succès.", tenant });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer la config d'un client par son slug (utile pour le front-end)
export const getTenantBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug });
    
    if (!tenant) return res.status(404).json({ message: "Client introuvable." });
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour les quotas ou le branding
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tenant = await Tenant.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Paramètres client mis à jour.", tenant });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};