import { Router } from "express"
import { sendRecoveryToken, recoverPassword, LoginGet } from "../controllers/Auth.controller"

const route = Router()
const prefix = "/auth"

route.get(`${prefix}/login`, LoginGet)
route.get(`${prefix}/recovery`, sendRecoveryToken)
route.patch(`${prefix}/recovery`, recoverPassword)

export default route;
