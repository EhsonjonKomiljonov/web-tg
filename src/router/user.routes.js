import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { userCheck } from '../middlewares/user.check.js';
export const userRouter = Router();
const { GET, POST, GETMAIN } = userController;

userRouter.post('/', userCheck, POST).get('/main', GETMAIN).get('/', GET);
