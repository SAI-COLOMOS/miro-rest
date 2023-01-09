import { Router } from "express";
import { UserGet } from "../controllers/UsersComponent/User.controller";
import Passport from "passport";

const route = Router();
const path = 'users';

route.get(`/${path}/user`, Passport.authenticate('jwt',{session: false}), UserGet);

export default route;