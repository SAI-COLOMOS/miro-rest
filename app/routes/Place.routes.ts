import { Router } from "express"
import Passport from "passport"
import { getPlace, getPlaces, updatePlace, postPlace, deletePlace } from "../controllers/Place.controller"
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

// Eliminar un lugar
route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, deletePlace)
export default route