import { Request, Response, Router } from "express"
import Place, { PlaceInterface } from "../models/Place";
import User from "../models/User";
const routes = Router()

routes.post('/tests', async (req: Request, res: Response) => {
    console.log(req)

    return res.status(200).json({
        message: "Listo"
    })
})



export default routes

// "register": "2023A0103002","first_name": "Miguel","last_name": "Sosa Guardado","age": "23","email": "misogu@live.com","phone": "3317789299","password": "$2b$10$9hpPvtPFTaJqRFyWtjVB5.btkybjT1M6SHP9DAZ6mAszdQIUIqPZ.","avatar": "/protected/default.png","emergency_contact": "Rosa Isela Guardado Alvarado","emergency_phone": "3317067111","blood_type": "RH O+","provider_type": "Presatador","place": "Bosque Los Colomos","assigned_area": "Centro de Educación y Cultura Ambiental","status": "Activo","school": "Centro de Enceñanza Técnica Industrial plantel Colomos","role": "Administrador","createdAt": "2023-01-09T01:39:52.126Z","updatedAt": "2023-01-09T01:39:52.126Z"