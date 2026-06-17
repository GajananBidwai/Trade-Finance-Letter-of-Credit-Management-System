import { Router } from 'express';
import { UserController } from '../controller/user.controller';

const router = Router();
const userController = new UserController();

router.get('/', userController.listUsers.bind(userController));
router.post('/', userController.createUser.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));

// Dual approval
router.post('/approvals/:id/approve', userController.approveMutation.bind(userController));

export default router;
