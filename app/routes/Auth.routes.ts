import { Router } from "express"
import { sendRecoveryToken, recoverPassword, LoginGet } from "../controllers/Auth.controller"

const routes = Router()
const prefix = "/auth"

routes.get(`${prefix}/login`, LoginGet)
routes.get(`${prefix}/recovery`, sendRecoveryToken)
routes.patch(`${prefix}/recovery`, recoverPassword)

export default routes;
