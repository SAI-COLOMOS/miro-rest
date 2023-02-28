import { Router } from "express"
import { UsersGet, UserGet, UserPost, UserDelete, UserPatch, updatePassword, updateAvatar } from "../controllers/Users.controller"
import { isAdministradorOrEncargado } from "../middleware/RoleControl"
import { fileMiddleware, resize } from "../middleware/fileControl"
import Passport from "passport"

const route = Router()
const path = 'users'

// Retornar usuarios
route.get(`/${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UsersGet)

// Retornar un solo usuario
route.get(`/${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserGet)

// Crear un usuario
route.post(`/${path}`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserPost)

// Borrar un usuario
route.delete(`/${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserDelete)

// Actualizar mi usuario
route.patch(`/${path}/:id`, Passport.authenticate('jwt', { session: false }), isAdministradorOrEncargado, UserPatch)

// Actualizar la contraseña únicamente
route.patch(`/${path}/password/:id`, Passport.authenticate('jwt', { session: false }), updatePassword)

// Actualizar foto de perfil
route.post(`/${path}/avatar/:id`, Passport.authenticate('jwt', { session: false }), fileMiddleware, resize, updateAvatar)

export default route