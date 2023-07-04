import { Router } from 'express';
import { loginController } from '../controllers/loginController.js'; 
export const loginRouter = Router();
const { POST } = loginController;

loginRouter.post('/', POST);
