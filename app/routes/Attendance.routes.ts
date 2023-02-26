import { Router } from "express";
import Passport from "passport";
import { isAdministradorOrEncargado } from "../middleware/RoleControl";
import { AddAttendee, getAttendees, updateAttendee } from "../controllers/Attendance.controller";

const route = Router()
const path = "/attendance"

// Añadir a la lista de asistencia un usuario
route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), AddAttendee)

// Actualizar el estado de un usuario en la lista de asistencia
route.patch(`${path}/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateAttendee)

// Obtener todos los usuarios en la lista de asistencia
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), getAttendees)

export default route