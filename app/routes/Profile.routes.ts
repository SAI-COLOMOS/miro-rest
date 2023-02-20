import { Router } from "express"
import { ProfileGet } from "../controllers/Profile.controller";
import Passport from "passport";

const route = Router()
const path = 'profile'

route.get(`/${path}/:id`, Passport.authenticate('jwt', { session: false }), ProfileGet)

export default route