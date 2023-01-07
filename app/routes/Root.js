import { Router } from "express";

const route = Router();
const path = '/';

route.get(`/${path}`, (res, req, next) => {
    req.redirect('/dashboard');
});

export default route;