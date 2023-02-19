import { Router } from "express"
import Passport from "passport"
import { addArea, PlacePost } from "../controllers/Place.controller"
import { isAdministradorOrEncargado } from "../middleware/RoleControl"

const route = Router()
const path = "/places"

route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, PlacePost)

route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, addArea)

export default route