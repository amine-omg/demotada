import express from 'express';
const router = express.Router();
import * as anchorPointController from '../controllers/anchorPointController.js';

router.get('/:templateId/:fieldId', anchorPointController.getAnchorByField);
router.post('/', anchorPointController.upsertAnchor);

export default router;