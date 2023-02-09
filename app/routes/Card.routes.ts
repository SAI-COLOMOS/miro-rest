import { Router } from "express";
import { isAdministradorOrEncargado } from "../middleware/RoleControl";
import Passport from "passport";
import { AddHoursToCard, getCards, getProviderHours, RemoveHoursFromCard } from "../controllers/Card.controller";

const route = Router()
const path = "/cards"

// Obtener el tarjeton del usuario
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), getProviderHours)

// Obtener todos los tarjetones de todos los prestadores
route.get(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, getCards)

// Añadir horas al tarjetón de un prestador
route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, AddHoursToCard)

// Eliminar horas del tarjetón de un prestador
route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, RemoveHoursFromCard)

export default route