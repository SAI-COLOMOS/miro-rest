import { Router } from "express";
import { LoginPost, RegisterPost } from "../controllers/Auth.controller";
import { RecoverPassword } from "../controllers/PasswordRecovery.controller";

const routes = Router();

routes.post('/login', LoginPost);

routes.post('/register', RegisterPost);

routes.post('/recoverPassword', RecoverPassword);

export default routes;