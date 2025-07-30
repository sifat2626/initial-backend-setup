module.exports = ({ pascal, camel }) => `import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { ${pascal}Controllers } from './${camel}.controller';

const router = express.Router();

router.post('/', auth(UserRole.CLUB_OWNER), ${pascal}Controllers.create${pascal});
router.get('/', ${pascal}Controllers.getAll${pascal}s);
router.get('/:id', ${pascal}Controllers.getSingle${pascal});
router.patch('/:id', auth(UserRole.CLUB_OWNER), ${pascal}Controllers.update${pascal});
router.delete('/:id', auth(UserRole.CLUB_OWNER), ${pascal}Controllers.delete${pascal});

export const ${pascal}Routes = router;
`
