/* Importaciones */

//Importaciones de librerías
import express from 'express'
import morgan from 'morgan'
import passport from 'passport'
import ControlAccess from './middleware/AccessControl'
// import bodyParser from "body-parser"
//import path from 'path'
//import { fileURLToPath } from "url"

// Importaciones de rutas
import Auth from './routes/Auth.routes'
import Users from './routes/Users.routes'
import Profile from './routes/Profile.routes'
import Card from './routes/Card.routes'
import Agenda from './routes/Agenda.routes'
import Place from './routes/Place.routes'
import School from './routes/School.routes'
import Form from './routes/Form.routes'
import DraftAgenda from './routes/DraftAgenda.routes'


/* Variables */
const app = express()
export const global_path = __dirname
//const __filename = fileURLToPath(import.meta.url)
//const __dirname = path.dirname(__filename)

/* Configuraciones */
app.set('port', process.env.PORT || 3000)
app.set('view engine', 'pug')
app.set('views', `${__dirname}/views`)
app.use(express.static(__dirname + '/public'))

/* Middleware */
app.use(morgan('dev'))
app.use(express.json({ limit: '5mb' }))
// app.use(bodyParser.json({limit: '5mb'}))
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())
passport.use(ControlAccess)

// Rutas
app.use(Auth)
app.use(Users)
app.use(Profile)
app.use(Card)
app.use(Agenda)
app.use(DraftAgenda)
app.use(Place)
app.use(School)
app.use(Form)

app.use((req, res) => {
  if (req.originalUrl === '/' || req.originalUrl === '') res.send('Root page')
  else res.redirect('/')
})

export default app