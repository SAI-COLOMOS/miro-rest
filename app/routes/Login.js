import { Router } from "express";
import { Get, Post} from "../controllers/Login.js";
import {isAuthenticated, isNotAuthenticated} from "../passport/VerifyAuth.js";

const route = Router();
const path = 'login';

route.get(`/${path}`, isNotAuthenticated, Get);
route.post(`/${path}`, isNotAuthenticated, Post);

export default route;