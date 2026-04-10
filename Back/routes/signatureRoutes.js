import express from 'express';
import { 
    createSignatureRequest, 
    getSignatureDetails, 
    finalizeSignature 
} from '../controllers/signatureController.js';

const router = express.Router();

router.post('/request', createSignatureRequest);
router.get('/details/:token', getSignatureDetails);
router.post('/finalize/:token', finalizeSignature);

export default router;