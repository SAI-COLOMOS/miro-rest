import Server from "./server"
import Mongoose from "mongoose"
import Environment from "./config/Environment"

Server.listen(Server.get('port'))

Mongoose.set('strictQuery', false)
Mongoose.connect(Environment.MonogoDB.uri)
Mongoose.connection.once('open', () => {
}).on('error', error => {
  console.error(error)
  process.exit(0)
})

console.log(`
888b     d888 8888888 8888888b.   .d88888b.         8888888b.  8888888888  .d8888b.  88888888888 
8888b   d8888   888   888   Y88b d88P" "Y88b        888   Y88b 888        d88P  Y88b     888     
88888b.d88888   888   888    888 888     888        888    888 888        Y88b.          888     
888Y88888P888   888   888   d88P 888     888        888   d88P 8888888     "Y888b.       888     
888 Y888P 888   888   8888888P"  888     888        8888888P"  888            "Y88b.     888     
888  Y8P  888   888   888 T88b   888     888 888888 888 T88b   888              "888     888     
888   "   888   888   888  T88b  Y88b. .d88P        888  T88b  888        Y88b  d88P     888     
888       888 8888888 888   T88b  "Y88888P"         888   T88b 8888888888  "Y8888P"      888     

~ ${new Date()} ~

- Servidor listo en http://127.0.0.1:${Server.get('port')}
`)