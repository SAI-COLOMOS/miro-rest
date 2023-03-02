import { Router } from "express"
import Passport from "passport"
import { getPlace, getPlaces, updatePlace, postPlace, deletePlace } from "../controllers/Place.controller"
import { getArea, getAreas, updateArea, removeArea, addArea } from "../controllers/Area.controller"
import { isAdministrador, isAdministradorOrEncargado } from "../middleware/RoleControl"

const route = Router()
const path = "/places"

//----------------------------------- Places ---------------------------------------------

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

//----------------------------------- Areas ---------------------------------------------

// Obtener todas las áreas
route.get(`${path}/areas`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getAreas)

// Obtener un área en específico
route.get(`${path}/:id/areas/:id2`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getArea)

// Actualizar la información de un área
route.patch(`${path}/:id/areas/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, updateArea)

// Crear un área
route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, addArea)

// Borrar un área
route.delete(`${path}/:id/areas/:id2`, Passport.authenticate('jwt', { session: false }), isAdministrador, removeArea)

export default route