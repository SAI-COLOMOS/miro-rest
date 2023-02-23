import { Router } from "express";
import Passport from "passport";
import { createEvent, deleteEvent, getAgenda, getEvent, updateEvent, updateEventStatus } from "../controllers/Agenda.controller";
import { AddAttendee, getAttendees, updateAttendee } from "../controllers/Attendance.controller";
import { isAdministradorOrEncargado } from "../middleware/RoleControl";

const route = Router()
const path = "/agenda"

// Obtener todos los eventos
route.get(`${path}`, Passport.authenticate('jwt', { session: false }), getAgenda)

// Obtener un solo evento
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), getEvent)

// Crear un evento
route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, createEvent)

// Actualizar un evento
route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateEvent)

// Actualizar el estado de un evento
route.patch(`${path}/status/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateEventStatus)

// Eliminar un evento
route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, deleteEvent)

// Añadir a la lista de asistencia un usuario
route.post(`${path}/attendance/:id`, Passport.authenticate('jwt', { session: false }), AddAttendee)

// Actualizar el estado de un usuario en la lista de asistencia
route.patch(`${path}/attendance/:id/:id2`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateAttendee)

// Obtener todos los usuarios en la lista de asistencia
route.get(`${path}/attendance/:id`, Passport.authenticate('jwt', { session: false }), getAttendees)

export default route