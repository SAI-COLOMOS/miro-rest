import { Router } from "express";
import Passport from "passport";
import { createEvent, deleteEvent, getAgenda, getEvent, updateEvent } from "../controllers/Agenda.controller";
import { isAdministradorOrEncargado } from "../middleware/RoleControl";

const route = Router()
const path = "/agenda"

route.get(`${path}`, Passport.authenticate('jwt', { session: false }), getAgenda)

route.get(`${path}`, Passport.authenticate('jwt', { session: false }), getEvent)

route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, createEvent)

route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, updateEvent)

route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, deleteEvent)

export default route