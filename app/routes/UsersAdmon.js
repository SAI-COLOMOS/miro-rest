import { Router } from "express";
import { Register_Post } from "../controllers/UsersAdmon/Register.js";
import {isAuthenticated, isNotAuthenticated} from "../passport/VerifyAuth.js";

const route = Router();
const path = 'users';

//route.get(`/${path}`, isNotAuthenticated, Register.Get);
//route.post(`/${path}`, isNotAuthenticated, Post);
route.post(`/${path}/register`, Register_Post);

export default route;