import { Router } from "express"
import Passport from "passport"
import { getPlace, getPlaces, updatePlace, postPlace } from "../controllers/Place.controller"
import { updateArea, addArea, removeArea } from "../controllers/Area.controller"
import { isAdministrador, isAdministradorOrEncargado } from "../middleware/RoleControl"

const route = Router()
const path = "/places"

route.get(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getPlaces)

route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getPlace)

route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministrador, postPlace)

route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, updatePlace)

route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, addArea)

route.patch(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, updateArea)

route.delete(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, removeArea)

export default route