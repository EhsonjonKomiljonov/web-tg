import { Router } from 'express';
import { imgMsgController } from '../controllers/imgMsgController.js';
export const imgMsgRouter = Router();
const { POST, GET } = imgMsgController;

imgMsgRouter.post('/', POST).get('/', GET);
