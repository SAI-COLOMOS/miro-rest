import {Request, Response, Router} from "express"
import Place, { PlaceInterface } from "../models/Place";
import User from "../models/User";
const routes = Router()

routes.post('/tests', async (req: Request, res: Response) => {
    try {
        
        const first_name = req.body.first_name.substring(0,2).toUpperCase();
        const first_last_name = req.body.first_last_name.substring(0,2).toUpperCase();
        const second_last_name = req.body.second_last_name ? req.body.second_last_name.substring(0,2).toUpperCase() : "XX";
        const place: any = await Place.findOne({"place_name": req.body.place})
        const area = place.place_areas.filter((item: any) => item.area_name === req.body.assignment_area ? true : null)
        const random: string = Math.floor(Math.random() * 999).toString()

        res.json({
            message: "Hola",
            register: `${first_last_name}${second_last_name}${first_name}${place.place_identifier}${area[0].area_identifier}${random}`
        })
    } catch (error) {
        res.status(500).json({
            message: "Ocurrió un error",
            error: error
        })
    }
})

routes.post('/tests/addPlace', async (req: Request, res: Response) => {
    try {
        const newPlace = new Place(req.body)
        await newPlace.save()
        res.status(201).json({
            message: "Listo",
            place: newPlace
        })
    } catch (error) {
        res.status(400).json({
            message: "Ocurrió un error",
            error: error
        })
    }

})

export default routes

// "register": "2023A0103002","first_name": "Miguel","last_name": "Sosa Guardado","age": "23","email": "misogu@live.com","phone": "3317789299","password": "$2b$10$9hpPvtPFTaJqRFyWtjVB5.btkybjT1M6SHP9DAZ6mAszdQIUIqPZ.","avatar": "/protected/default.png","emergency_contact": "Rosa Isela Guardado Alvarado","emergency_phone": "3317067111","blood_type": "RH O+","provider_type": "Presatador","place": "Bosque Los Colomos","assignment_area": "Centro de Educación y Cultura Ambiental","status": "Activo","school": "Centro de Enceñanza Técnica Industrial plantel Colomos","role": "Administrador","createdAt": "2023-01-09T01:39:52.126Z","updatedAt": "2023-01-09T01:39:52.126Z"