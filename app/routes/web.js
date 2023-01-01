/* Importaciones */
import { Router } from 'express';

import passport from "passport";
import { isAuthenticated, isNotAuthenticated  } from "../passport/VerifyAuth.js";

/* Varaibles */
const route = Router();

/* Rutas */

route.get('/', isAuthenticated, (req, res, next) => {
    res.redirect('/dashboard');
});

    route.get('/dashboard', isAuthenticated, (req, res, next) => {
        res.status(200).render('dashboard', {peticion: JSON.stringify(req.isAuthenticated())});
    });

    route.get('/signup', isNotAuthenticated, (req, res, next) => {
        res.render('login/signup', {puerto: 3000})
    }).post('/register', passport.authenticate('signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/signup',
        passReqToCallback: true
    }));

    route.get('/login', isNotAuthenticated, (req, res, next) => {
        res.status(200).render('login/login');
    }).post('/login', passport.authenticate('login', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        passReqToCallback: true
    }));

    route.get('/logout', isAuthenticated, (req, res, next) => {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/login');
          });
    });


route.use((req, res, next) => {
    res.status(404).render('404');
});

/* Exportaciones */
export default route;