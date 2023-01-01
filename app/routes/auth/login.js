/* Importaciones */
import { Router } from 'express';
import passport from "passport";

/* Varaibles */
const route = Router();

/* Rutas */
route.get('/', (req, res, next) => {
    res.render('login/login', {puerto: 3000})
});

route.post('/auth', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    passReqToCallback: true
}));

/* Exportación */
export default route;