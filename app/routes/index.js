/* Importaciones */
import { Router } from 'express';
import passport from "passport";
import isAuthenticated from "../passport/Verify_auth.js";

/* Varaibles */
const route = Router();

/* Rutas */
route.get('/', isAuthenticated, (req, res, next) => {
    res.render('index', {puerto: 3000})
}) 

/* Exportaciones */
export default route;