import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { CourtControllers } from './court.controller';

const router = express.Router();

router.post('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), CourtControllers.createCourt);
router.get('/', CourtControllers.getAllCourts);
router.get('/:id', CourtControllers.getSingleCourt);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), CourtControllers.updateCourt);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), CourtControllers.deleteCourt);

export const CourtRoutes = router;
