/* Importaciones */
import { Router } from 'express';
import passport from "passport";

/* Varaibles */
const route = Router();

/* Rutas */
route.get('/', (req, res, next) => {
    res.render('login/signup', {puerto: 3000})
})

route.post('/register', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    passReqToCallback: true
}));

/* Exportación */
export default route;