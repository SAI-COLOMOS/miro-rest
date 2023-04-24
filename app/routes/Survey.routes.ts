import { Router } from 'express'
import Passport from 'passport'
import { createSurvey, deleteSurvey } from '../controllers/Surveys.controller'
import { isAdministradorOrEncargado } from '../middleware/RoleControl'
const route = Router()
const path = '/surveys'

route.post(`${path}`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, createSurvey)

route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, deleteSurvey)

export default route