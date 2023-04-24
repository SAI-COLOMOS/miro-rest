import { Router } from 'express'
import Passport from 'passport'
import { createSurvey, deleteSurvey, getSurveys, saveAnswers } from '../controllers/Surveys.controller'
import { isAdministradorOrEncargado } from '../middleware/RoleControl'
const route = Router()
const path = '/surveys'

route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, getSurveys)

route.post(`${path}`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, createSurvey)

route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, deleteSurvey)

route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, saveAnswers)

export default route