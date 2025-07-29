import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { ClubControllers } from './club.controller';

const router = express.Router();

router.post('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ClubControllers.createClub);
router.get('/', ClubControllers.getAllClubs);
router.get('/:id', ClubControllers.getSingleClub);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ClubControllers.updateClub);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ClubControllers.deleteClub);

export const ClubRoutes = router;
