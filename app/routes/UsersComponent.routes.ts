import { Router } from "express"
import { UsersGet, UserGet, UserPost, UserDelete } from "../controllers/UsersComponent/Users.controller"
import { isAdministradorOrEncargado } from "../middleware/RoleControl"
import Passport from "passport"

const route = Router()
const path = 'users'

//route.use(Passport.authenticate('jwt',{session: false}))
//route.use(isAdministradorOrEncargado);

route.get(`/${path}`, UsersGet)
route.get(`/${path}/:id`, UserGet)
route.post(`/${path}`, UserPost)
route.delete(`/${path}/:id`, UserDelete)


export default route