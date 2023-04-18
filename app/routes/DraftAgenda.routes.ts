import { Router } from 'express'
import Passport from 'passport'
import { isAdministradorOrEncargado } from '../middleware/RoleControl'
import { getDraft, getDrafts, updateDraft } from '../controllers/DraftAgenda.controller'

const route = Router()
const path: string = '/draftAgenda'

route.get(`${path}`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, getDrafts)

route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, getDraft)

route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, updateDraft)

export default route