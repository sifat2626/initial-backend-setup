import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SessionParticipantControllers } from './sessionParticipant.controller';

const router = express.Router();

router.post('/', auth(UserRole.CLUB_OWNER), SessionParticipantControllers.createSessionParticipant);
router.get('/', SessionParticipantControllers.getAllSessionParticipants);
router.get('/:id', SessionParticipantControllers.getSingleSessionParticipant);
router.patch('/:id', auth(UserRole.CLUB_OWNER), SessionParticipantControllers.updateSessionParticipant);
router.delete('/:id', auth(UserRole.CLUB_OWNER), SessionParticipantControllers.deleteSessionParticipant);

export const SessionParticipantRoutes = router;
