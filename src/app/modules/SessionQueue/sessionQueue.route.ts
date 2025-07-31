import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SessionQueueControllers } from './sessionQueue.controller';

const router = express.Router();

router.post('/', auth(UserRole.CLUB_OWNER), SessionQueueControllers.createSessionQueue);
router.get('/', SessionQueueControllers.getAllSessionQueues);
router.get('/:id', SessionQueueControllers.getSingleSessionQueue);
router.patch('/:id', auth(UserRole.CLUB_OWNER), SessionQueueControllers.updateSessionQueue);
router.delete('/:id', auth(UserRole.CLUB_OWNER), SessionQueueControllers.deleteSessionQueue);

export const SessionQueueRoutes = router;
