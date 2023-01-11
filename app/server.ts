/* Importaciones */

//Importaciones de librerías
import express from 'express';
import morgan from 'morgan';
import passport from "passport";
import ControlAccess from "./middleware/AccessControl";
//import path from 'path';
//import { fileURLToPath } from "url";

// Importaciones de rutas
import Auth from "./routes/Auth.routes";
import UsersComponent from "./routes/UsersComponent.routes";

/* Variables */
const app = express();
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

/* Configuraciones */
app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');
//app.use(express.static(__dirname + '/public'));

/* Middlewares */
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
passport.use(ControlAccess);

/* Código del servidor */

// Rutas
app.use(Auth);
app.use(UsersComponent);

export default app;