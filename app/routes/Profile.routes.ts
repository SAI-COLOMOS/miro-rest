import { Router } from "express"
import { getFeed, getProfile } from "../controllers/Profile.controller";
import Passport from "passport";

const route = Router()
const path = '/profile'

route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false }), getProfile)

route.get(`/feed`, Passport.authenticate('jwt', { session: false }), getFeed)

export default route