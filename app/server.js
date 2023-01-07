/* Importaciones */

//Importaciones de librerías
import express from 'express';
import session from "express-session";
import morgan from 'morgan';
import passport from "passport";
import path from 'path';
import { fileURLToPath } from "url";
import conection from "./database.js";
import pass from "./passport/Auth.js";

// Importaciones de rutas
import Root from "./routes/Root.js";
import UsersAdmon from "./routes/UsersAdmon.js";
import Dashboard from "./routes/Dashboard.js";
import Login from "./routes/Login.js";
import Logout from "./routes/Logout.js";
import NotFound from "./routes/NotFound.js";

/* Variables */
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Configuraciones */
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

/* Middlewares */
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'El Jonathan se la come :v',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

/* Código del servidor */

// Rutas
app.use(Root);
app.use(Login);
app.use(Logout);
app.use(Dashboard);
app.use(UsersAdmon);

app.use(NotFound);

// Escucha del puerto
app.listen(app.get('port'), () => {
    console.info(`Servidor iniciado en ${app.get('port')}.`);
});