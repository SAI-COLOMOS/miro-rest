import { Request, Response } from "express"
import Place from "../models/Place"

export const PlacePost = async (req: Request, res: Response) => {
    try {
        await new Place(req.body).save().then(result => {
            if (result) {
                return res.status(201).json({
                    message: `Parque añadido`,
                    place: result
                })
            }
            return res.status(500).json({
                message: `No se pudo crear el parque`
            })
        }).catch(error => {
            return res.status(500).json({
                message: `Hubo un error interno con la base de datos`
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error con el servidor`
        })
    }
}

export const addArea = async (req: Request, res: Response) => {
    try {
        await Place.updateOne({ "place_identifier": req.params.id }, { $push: { "place_areas": req.body } })
            .then(result => {
                if (result.modifiedCount > 0) {
                    return res.status(201).json({
                        message: `Se añadió el area`,
                    })
                }
                return res.status(500).json({
                    message: `No se pudo añadir el area`
                })
            }).catch(error => {
                return res.status(500).json({
                    message: `Ocurrió un error interno con la base de datos`
                })
            })
    } catch (error) {
        return res.status(500).json({
            message: `Hubo un error con el servidor`
        })
    }
}