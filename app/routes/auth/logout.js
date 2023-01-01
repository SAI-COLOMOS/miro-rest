/* Importaciones */
import { Router } from 'express';
import passport from "passport";

/* Varaibles */
const route = Router();

/* Rutas */
route.get('/', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

/* Exportación */
export default route;