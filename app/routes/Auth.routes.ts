import { Router } from "express"
import { LoginPost, RegisterPost, sendRecoveryToken, recoverPassword } from "../controllers/Auth.controller"

const routes = Router()

routes.post('/login', LoginPost)

routes.post('/register', RegisterPost)

const recoverPrefix = "/recovery"

routes.post(`${recoverPrefix}`, sendRecoveryToken);

routes.post(`${recoverPrefix}/changePassword`, recoverPassword);

export default routes;
