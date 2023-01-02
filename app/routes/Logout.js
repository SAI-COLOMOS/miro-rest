import { Router } from "express";
import { Get} from "../controllers/Logout.js";
import {isAuthenticated, isNotAuthenticated} from "../passport/VerifyAuth.js";

const route = Router();
const path = 'logout';

route.get(`/${path}`, isAuthenticated, Get);

export default route;