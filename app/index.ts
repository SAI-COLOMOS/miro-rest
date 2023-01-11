import Server from "./server"
import "./database"

Server.listen(Server.get('port'))
console.log(`Servidor listo en el puerto ${Server.get('port')}`)