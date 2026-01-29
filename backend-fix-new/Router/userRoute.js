import express from 'express';
import { createUser,loginUser } from '../controller/userController.js';

const UserRoute = express.Router();

UserRoute.post('/',createUser);
UserRoute.post('/login',loginUser);

export default UserRoute;