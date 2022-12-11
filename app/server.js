/* Importaciones */
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from "url";
import Index from "./routes/index.js";

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

/* Código del servidor */

// Rutas
app.use('/', Index);

// Escucha del puerto
app.listen(app.get('port'), () => {
    console.info(`Servidor iniciado en ${app.get('port')}.`);
});