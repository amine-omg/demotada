// backend/middleware/subdomainMiddleware.js
import Tenant from '../models/Tenant.js';

const subdomainMiddleware = async (req, res, next) => {
    const host = req.headers.host; 
    
    // On adapte au nouveau nom de domaine : kernain.com
    const subdomain = host.split('.kernain.com')[0];
    const localSubdomain = host.split('.localhost')[0];
    
    const finalSubdomain = host.includes('.kernain.com') ? subdomain : (host.includes('.localhost') ? localSubdomain : null);

    // On ignore les routes système
    const systemSubdomains = ['app', 'www', 'api', 'admin', 'localhost:3000'];

    if (finalSubdomain && !systemSubdomains.includes(finalSubdomain)) {
        try {
            // Utilise le modèle Tenant que tu as conservé
            const tenant = await Tenant.findOne({ subdomain: finalSubdomain }).lean();

            if (tenant) {
                req.tenant = tenant; // Très utile pour filtrer les documents par client
            }
        } catch (error) {
            console.error('[Middleware] Erreur Tenant:', error);
        }
    }
    next();
};

export default subdomainMiddleware;