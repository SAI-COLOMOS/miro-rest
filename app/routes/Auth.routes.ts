import { Router } from "express";
import { LoginPost, RegisterPost, sendRecoveryToken } from "../controllers/Auth.controller";

const routes = Router();

routes.post('/login', LoginPost);

routes.post('/register', RegisterPost);

routes.post('/recoverPassword', sendRecoveryToken);

export default routes;