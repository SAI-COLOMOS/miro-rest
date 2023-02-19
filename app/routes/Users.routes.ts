import { Router } from "express"
import { UsersGet, UserGet, UserPost, UserDelete, UserPatch } from "../controllers/Users.controller"
import { isAdministradorOrEncargado } from "../middleware/RoleControl"
import Passport from "passport"

const route = Router()
const path = 'users'

// Retornar usuarios
route.post(`/${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, Userspost)

// Retornar un solo usuario
route.post(`/${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserGet)

// Crear un usuario
route.post(`/${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserPost)

// Borrar un usuario
route.delete(`/${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserDelete)

// Actualizar mi usuario
route.patch(`/${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserPatch)

export default route