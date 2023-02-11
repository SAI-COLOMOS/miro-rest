import { Router } from "express";
import Passport from "passport";
import { createEvent } from "../controllers/Agenda.controller";
import { isAdministradorOrEncargado } from "../middleware/RoleControl";

const route = Router()
const path = "/agenda"

route.post(`${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, createEvent)

export default route