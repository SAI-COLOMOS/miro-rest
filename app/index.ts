import Server from "./server"
import "./database"
import localtunnel from "localtunnel";
Server.listen(Server.get('port'));

console.log("Holaaaaa");

(async () => {
    const tunnel = await localtunnel({ port: 3000 });
  
    // the assigned public url for your tunnel
    // i.e. https://abcdefgjhij.localtunnel.me
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
- Servidor en línea en ${tunnel.url}

    `)
  
    tunnel.on('close', () => {
      console.warn("¡La conexión con el túnel ha sido cerrada!")
    });
  })();