import { Router } from "express"
import { isAdministrador, isAdministradorOrEncargado } from "../middleware/RoleControl"
import Passport from "passport"
import { getArea, getAreas, updateArea, removeArea, addArea } from "../controllers/Area.controller"

const route = Router()
const path = "/areas"

// Obtener todas las áreas
route.get(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getAreas)

route.get(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getArea)

// Actualizar la información de un área
route.patch(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, updateArea)

// Crear un área
route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, addArea)

// Borrar un área
route.delete(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, removeArea)

export default route