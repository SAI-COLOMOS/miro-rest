import { Router } from "express"
import { getFeed, getProfile } from "../controllers/Profile.controller"
import Passport from "passport"

const route = Router()
const path = '/profile'

route.get(`${path}/:id`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), getProfile)

route.get(`/feed`, Passport.authenticate('jwt', { session: false, failureRedirect: '/' }), getFeed)

export default route