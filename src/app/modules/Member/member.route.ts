import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { MemberControllers } from './member.controller';

const router = express.Router();

router.post('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), MemberControllers.createMember);
router.get('/', MemberControllers.getAllMembers);
router.get('/:id', MemberControllers.getSingleMember);
router.patch('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), MemberControllers.updateMember);
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), MemberControllers.deleteMember);

export const MemberRoutes = router;
