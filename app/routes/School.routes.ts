import { Router } from "express"
import Passport from "passport"
import { isAdministrador } from "../middleware/RoleControl"
import { getSchool, getSchools, deleteSchool, postSchool, updateSchool } from "../controllers/School.controller"

const route = Router()
const path = "/schools"

// Obtener todas las escuelas
route.get(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministrador, getSchools)

// Obtener una escuela en específico
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, getSchool)

// Crear una escuela
route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministrador, postSchool)

// Actualizar la información de una escuela
route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, updateSchool)

// Eliminar una escuela
route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministrador, deleteSchool)
export default route