import { Router } from 'express'
import Passport from 'passport'
import { addAttendee, addSeveralAttendees, checkAttendance, getAttendees, removeAttendee, updateAttendee } from '../controllers/Attendance.controller'
import { createEvent, deleteEvent, getAgenda, getEvent, updateEvent, updateEventStatus } from '../controllers/Agenda.controller'
import { isAdministradorOrEncargado } from '../middleware/RoleControl'

const route = Router()
const path = '/agenda'

// -------------------------- Events ------------------------------------

// Obtener todos los eventos
route.get(`${path}`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), getAgenda)

// Obtener un solo evento
route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), getEvent)

// Crear un evento
route.post(`${path}`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, createEvent)

// Actualizar un evento
route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, updateEvent)

// Actualizar el estado de un evento
route.patch(`${path}/:id/status`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, updateEventStatus)

// Eliminar un evento
route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, deleteEvent)


// -------------------------- Attendance ------------------------------------

// Añadir a la lista de asistencia un usuario
route.post(`${path}/:id/attendance`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), addAttendee)

// Remover de la lista de asistencia un usuario
route.delete(`${path}/:id/attendance`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), removeAttendee)

// Actualizar el estado de un usuario en la lista de asistencia
route.patch(`${path}/:id/attendance`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, updateAttendee)

// Obtener todos los usuarios en la lista de asistencia
route.get(`${path}/:id/attendance`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), getAttendees)

// Añadir varios a la lista de asistencia un usuario
route.post(`${path}/:id/attendance/several`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, addSeveralAttendees)

// Tomar asistencia
route.patch(`${path}/:id/attendance/take`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, checkAttendance)

export default route