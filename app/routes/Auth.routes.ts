import { Router } from "express"
import { sendRecoveryToken, recoverPassword, LoginGet } from "../controllers/Auth.controller"

const route = Router()
const path = "/auth"

route.post(`${path}/login`, LoginGet)

route.post(`${path}/recovery`, sendRecoveryToken)

route.patch(`${path}/recovery`, recoverPassword)

export default route;
