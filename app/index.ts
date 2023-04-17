import Server from './server'
import Mongoose from 'mongoose'
import Environment from './config/Environment'
import { initEvents } from './controllers/NodeEvent.controller'
import ngrok from 'ngrok';

console.log(`

888b     d888 8888888 8888888b.   .d88888b.         8888888b.  8888888888  .d8888b.  88888888888 
8888b   d8888   888   888   Y88b d88P" "Y88b        888   Y88b 888        d88P  Y88b     888     
88888b.d88888   888   888    888 888     888        888    888 888        Y88b.          888     
888Y88888P888   888   888   d88P 888     888        888   d88P 8888888     "Y888b.       888     
888 Y888P 888   888   8888888P"  888     888        8888888P"  888            "Y88b.     888     
888  Y8P  888   888   888 T88b   888     888 888888 888 T88b   888              "888     888     
888   "   888   888   888  T88b  Y88b. .d88P        888  T88b  888        Y88b  d88P     888     
888       888 8888888 888   T88b  "Y88888P"         888   T88b 8888888888  "Y8888P"      888    

~   ${new Date()}   ~

`);

/* Puesta en marcha */
Server.listen(Server.get('port'))
  .once("listening", () => console.log(` ✓ - Servidor accesible de manera local desde http://127.0.0.1:${Server.get('port')}`))
  .on("error", error => {
    console.error(" ‼ - Ocurrió un error: ", error)
    process.exit(0)
  })

/* COnexión a base de datos */
Mongoose.set('strictQuery', false)
Mongoose.connect(Environment.MonogoDB.uri)
Mongoose.connection
  .once('open', () => {
    initEvents()
    console.log(` ✓ - Se ha establecido la conexión con la base de datos`)
  })
  .on('error', error => {
    console.error(" ‼ - Ocurrió un error: ", error)
    process.exit(0)
  })

/* Conexión al túnel de ngrok */
if(Environment?.ngrok?.authtoken) {
  ngrok.connect(Environment.ngrok)
    .then(result => {
      console.log(` ✓ - Servidor accesible de manera remota desde ${result}`)
    })
    .catch(error => {
      console.error(" ‼ - Ocurrió un error: ", error)
      process.exit(0)
    })
} else {
  console.log(` ‼ - No se encontró un usuario válido para crear el túnel, por lo que solamente se puede hacer uso de la API de manera local`)
}
