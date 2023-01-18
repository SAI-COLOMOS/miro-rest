import { Router } from "express"
import { sendRecoveryToken, recoverPassword, LoginGet } from "../controllers/Auth.controller"

const routes = Router()
const prefix = "/auth"

routes.get(`${prefix}/login`, LoginGet)

routes.get(`${prefix}/recoverPassword`, sendRecoveryToken)

routes.post(`${prefix}/changePassword`, recoverPassword)

export default routes;
