import { Router } from "express"
import { UserGet, UsersPost } from "../controllers/UsersComponent/Users.controller"
import { isAdministradorOrEncargado } from "../middleware/RoleControl"
import Passport from "passport"

const route = Router()
const path = 'users'

route.use(Passport.authenticate('jwt',{session: false}))
route.use(isAdministradorOrEncargado);

route.get(`/${path}`, UserGet)

route.post(`/${path}`, UsersPost)

export default route