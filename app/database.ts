import Mongoose, {ConnectOptions} from "mongoose";
import Enviroment from "./config/Enviroment";

Mongoose.set('strictQuery', false)

Mongoose.connect(Enviroment.MonogoDB.uri);

Mongoose.connection.once('open', () => {
    console.log(`Conectado a base de datos`);
}).on('error', error => {
    console.error(error);
    process.exit(0);
});