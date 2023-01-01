import mongoose from "mongoose";
import { env } from "../env.js";

mongoose.set('strictQuery', true);

const conection = mongoose.connect(
    env.monogodb.URI,
    {}
    ).then(
        (datebase) => {
            console.info('Conectado a la base de datos');
        }
    ).catch(
        (error) => {
            console.error(error);
        }
    );

export default conection;