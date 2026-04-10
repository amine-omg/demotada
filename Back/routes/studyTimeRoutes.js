import express from 'express';
import { recordStudyTime, getUserStudyLogs, getSessionStudyLogs, addManualStudyTime, deleteStudyLog,
  repairLogs } from '../controllers/studyTimeController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/ping', protect, recordStudyTime);

router.get('/user/:userId', protect, getUserStudyLogs);

router.get('/session/:sessionId/user/:userId', protect, getSessionStudyLogs);

router.post('/manual', protect, addManualStudyTime);

router.post('/repair-logs', protect, repairLogs);

router.delete('/log/:logId', protect, deleteStudyLog);

export default router;