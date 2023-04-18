import { Router } from 'express'
import Passport from 'passport'
import { createForm, deleteForm, getForm, getForms, updateForm } from '../controllers/Form.controller'
import { isAdministradorOrEncargado } from '../middleware/RoleControl'

const route: Router = Router()
const path: string = '/forms'

route.get(`${path}`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, getForms)

route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, getForm)

route.post(`${path}`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, createForm)

route.patch(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, updateForm)

route.delete(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), isAdministradorOrEncargado, deleteForm)

export default route