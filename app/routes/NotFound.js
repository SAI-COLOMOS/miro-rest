import { Router } from "express";
import { Get, Post } from "../controllers/NotFound.js";

const route = Router();

route.get('*', Get);
route.post('*', Post);

export default route;