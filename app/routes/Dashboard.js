import { Router } from "express";
import { Get, Put } from "../controllers/Dashboard.js";
import {isAuthenticated, isNotAuthenticated} from "../passport/VerifyAuth.js";

const route = Router();
const path = 'dashboard';

route.get('/dashboard', isAuthenticated, Get);
//route.put('/dashboard', Put);

export default route;
