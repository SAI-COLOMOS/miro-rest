import { Router } from "express";
import { Register_put } from "../controllers/UsersAdmon/Register.js";
import {isAuthenticated, isNotAuthenticated} from "../passport/VerifyAuth.js";

const route = Router();
const path = 'users';

//route.get(`/${path}`, isNotAuthenticated, Register.Get);
//route.post(`/${path}`, isNotAuthenticated, Post);
route.put(`/${path}/register`, Register_put);

export default route;