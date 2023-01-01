/* Importaciones */

//Importaciones de librerías
import express from 'express';
import session from "express-session";
import morgan from 'morgan';
import passport from "passport";
import path from 'path';
import { fileURLToPath } from "url";
import conection from "./database/database.js";
import pass from "./passport/Auth.js";

// Importaciones de controladores
import Index from "./routes/index.js";
import Login from "./routes/auth/login.js";
import Signup from "./routes/auth/signup.js";
import Logout from "./routes/auth/logout.js";

/* Variables */
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Configuraciones */
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');

/* Middlewares */
app.use(morgan('dev'));
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
app.use('/', Index);
app.use('/login', Login);
app.use('/signup', Signup);
app.use('/logout', Logout);

// Escucha del puerto
app.listen(app.get('port'), () => {
    console.info(`Servidor iniciado en ${app.get('port')}.`);
});