import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SessionControllers } from './session.controller';

const router = express.Router();

router.post('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), SessionControllers.createSession);
router.get('/', SessionControllers.getAllSessions);
router.get('/:id', SessionControllers.getSingleSession);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), SessionControllers.updateSession);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), SessionControllers.deleteSession);

export const SessionRoutes = router;
