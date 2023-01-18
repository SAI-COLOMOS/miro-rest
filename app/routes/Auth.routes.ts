import { Router } from "express"
import { LoginPost, sendRecoveryToken, recoverPassword } from "../controllers/Auth.controller"

const routes = Router()
const prefix = "/auth"

routes.get(`${prefix}/login`, LoginPost)

routes.get(`${prefix}/recoverPassword`, sendRecoveryToken)

routes.post(`${prefix}/changePassword`, recoverPassword)

export default routes;
