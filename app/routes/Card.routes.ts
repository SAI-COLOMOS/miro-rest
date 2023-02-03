import { Router } from "express";
import { isAdministradorOrEncargado } from "../middleware/RoleControl";
import Passport from "passport";
import { CardPatch, CardPost, getProviderHours } from "../controllers/Card.controller";

const route = Router()
const path = "/hours"

// Obtener el tarjeton del usuario
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), getProviderHours)

// Obtener todos los tarjetones de todos los prestadores
route.get(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado)

// Crear el tarjeton de un prestador
// route.post(`${path}/`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, CardPost)

// Actualizar el tarjeton de un prestador
route.patch(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, CardPatch)

// Eliminar el tarjeton de un prestador
route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado)

export default route