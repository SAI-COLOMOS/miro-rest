import {Request, Response, Router} from "express"
import Place, { PlaceInterface } from "../models/Place";
import User from "../models/User";
const routes = Router()

routes.post('/tests', async (req: Request, res: Response) => {
    try {
        const [year, month] = new Date().toISOString().split('-')
        const seasson = Number(month) < 6 ? 'A' : 'B'
        
        const place: any = await Place.findOne({"place_name": req.body.place})

        let area_id
        place.place_areas.forEach((area: any) => {
            if(area.area_name.includes(req.body.assignment_area)) {
                area_id = area.area_identifier
            }
        });

        place.place_areas.map((ar: any) => {
            console.log(ar);
            if(ar.area_name.includes(req.body.assignment_area)) {
                return ar.area_identifier
            }
        })
        
        const newRegister = `${year.toString()}${seasson}${place.place_identifier}${area_id}`

        const lastRegister = await User.find({"register": { $regex: newRegister + '.*' }}, 'register').sort({"register": "desc"})

        let id = "001"
        let number = 0
        if(lastRegister.length > 0) {
            number = Number(lastRegister[0].register.substring(lastRegister[0].register.length - 3)) + 1

            if(number < 10) {
                id = "00" + number
            } else if (number < 100) {
                id = "0" + number
            } else {
                id = number.toString()
            }
            console.log('No hay')
        }

        const newnewRegister = `${year.toString()}${seasson}${place.place_identifier}${area_id}${id}`


        res.json({
            lastRegister,
            newRegister,
            number,
            newnewRegister
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