import express from 'express';
import { createGatePass, viewAllGatePass, viewGatePassById } from '../controller/gatepassController.js';


const gatepassRouter = express.Router();

gatepassRouter.post('/',createGatePass);
gatepassRouter.get('/',viewAllGatePass);
gatepassRouter.get('/:passId',viewGatePassById);

export default gatepassRouter;