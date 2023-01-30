import { Router } from "express"
import { ProfileGet } from "../controllers/Profile.controller";
import Passport from "passport";

const route = Router()
const path = 'profile'

route.use(Passport.authenticate('jwt', { session: false }))
//route.use(isAdministradorOrEncargado);

route.get(`/${path}/:id`, ProfileGet)
//route.patch(`/${path}/:id`, UserPatch)

export default route