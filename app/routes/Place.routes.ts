import { Router } from "express"
import Passport from "passport"
import { getPlace, getPlaces, updatePlace, postPlace } from "../controllers/Place.controller"
import { updateArea, addArea, removeArea } from "../controllers/Area.controller"
import { isAdministrador, isAdministradorOrEncargado } from "../middleware/RoleControl"

const route = Router()
const path = "/places"

// Obtener todas los lugares
route.get(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getPlaces)

// Obtener un lugar en específico
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getPlace)

// Crear un lugar
route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministrador, postPlace)

// Actualizar la información de un lugar
route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, updatePlace)

// Actualizar la información de un área
route.patch(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, updateArea)

// Crear un área
route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, addArea)

// Borrar un área
route.delete(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, removeArea)

export default route