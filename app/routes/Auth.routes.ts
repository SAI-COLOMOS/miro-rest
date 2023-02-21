import { Router } from "express"
import { sendRecoveryToken, recoverPassword, LoginGet } from "../controllers/Auth.controller"

const route = Router()
const prefix = "/auth"

route.post(`${prefix}/login`, LoginGet)

route.post(`${prefix}/recovery`, sendRecoveryToken)

route.patch(`${prefix}/recovery`, recoverPassword)

export default route;
