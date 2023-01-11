import {Router} from "express"
import { LoginPost, RegisterPost } from "../controllers/Auth.controller"

const routes = Router()

routes.post('/login', LoginPost)

routes.post('/register', RegisterPost)

export default routes