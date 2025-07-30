import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SessionCourtControllers } from './sessionCourt.controller';

const router = express.Router();

router.post('/', auth(UserRole.CLUB_OWNER), SessionCourtControllers.createSessionCourt);
router.get('/', SessionCourtControllers.getAllSessionCourts);
router.get('/:id', SessionCourtControllers.getSingleSessionCourt);
router.patch('/:id', auth(UserRole.CLUB_OWNER), SessionCourtControllers.updateSessionCourt);
router.delete('/:id', auth(UserRole.CLUB_OWNER), SessionCourtControllers.deleteSessionCourt);

export const SessionCourtRoutes = router;
