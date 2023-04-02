import { Router } from "express"
import Passport from "passport"
import { addAttendee, checkAttendace, getAttendees, removeAttendee, updateAttendee } from "../controllers/Attendance.controller"
import { createEvent, deleteEvent, getAgenda, getEvent, updateEvent, updateEventStatus } from "../controllers/Agenda.controller"
import { isAdministradorOrEncargado } from "../middleware/RoleControl"

const route = Router()
const path = "/agenda"

// -------------------------- Events ------------------------------------

// Obtener todos los eventos
route.get(`${path}`, Passport.authenticate('jwt', { session: false }), getAgenda)

// Obtener un solo evento
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), getEvent)

// Crear un evento
route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, createEvent)

// Actualizar un evento
route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateEvent)

// Actualizar el estado de un evento
route.patch(`${path}/:id/status`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateEventStatus)

// Eliminar un evento
route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, deleteEvent)


// -------------------------- Attendance ------------------------------------

// Añadir a la lista de asistencia un usuario
route.post(`${path}/:id`, Passport.authenticate('jwt', { session: false }), addAttendee)

// Añadir a la lista de asistencia un usuario
route.patch(`${path}/:id/unsubscribe`, Passport.authenticate('jwt', { session: false }), removeAttendee)

// Actualizar el estado de un usuario en la lista de asistencia
route.patch(`${path}/:id/status`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateAttendee)

// Actualizar la asistencia del evento de un usuario
route.patch(`${path}/:id/attendance`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, checkAttendace)

// Obtener todos los usuarios en la lista de asistencia
route.get(`${path}/:id/attendance`, Passport.authenticate('jwt', { session: false }), getAttendees)

export default route