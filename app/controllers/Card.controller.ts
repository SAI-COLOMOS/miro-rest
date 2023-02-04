import { Request, Response } from "express";
import Card from "../models/Card";

export const getCards = async (req: Request, res: Response) => {
    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0

        await Card.find().sort({ "createdAt": "desc" }).limit(items).skip(page * items).then(
            result => {
                if (result.length > 0) {
                    return res.status(200).json({
                        message: "Listo",
                        cards: result
                    })
                } else {
                    res.status(200).json({
                        message: "Sin resultados"
                    })
                }
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse con el servidor"
        })
    }
}

export const getProviderHours = async (req: Request, res: Response) => {
    try {
        await Card.findOne({ "provider_register": req.params.id }).then(result => {
            if (result) {
                return res.status(200).json({
                    message: "Tarjetón de usuario encontrado",
                    tarjeton: result.activities
                })
            } else {
                return res.status(404).json({
                    message: `No se encontró el tarjetón del usuario ${req.params.id}`
                })
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrio un error al conectarse al servidor"
        })
    }
}

export const CardPost = async (req: Request, res: Response) => {
    if (!req.body.provider_register) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    try {
        await new Card({ "provider_register": req.body.provider_register }).save().then(result => {
            if (result) {
                return res.status(201).json({
                    message: "Se creó el tarjetón del prestador"
                })
            } else {
                return res.status(500).json({
                    message: "Ocurrió un error interno en la base de datos"
                })
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor",
            error: error?.toString()
        })
    }
}

export const AddHoursToCard = async (req: Request, res: Response) => {
    if (!req.body.activity.activity_name || !req.body.activity.hours || !req.body.activity.responsible_register) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    try {
        await Card.updateOne({ "provider_register": req.params.id }, {
            $push: {
                "activities": {
                    "activity_name": req.body.activity.activity_name,
                    "hours": req.body.activity.hours,
                    "responsible_register": req.body.activity.responsible_register
                }
            }
        }).then(result => {
            if (result.modifiedCount > 0) {
                return res.status(201).json({
                    message: "Se añadieron las horas al prestador"
                })
            } else {
                return res.status(500).json({
                    message: "El usuario no se encontró"
                })
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor"
        })
    }
}

export const RemoveHoursFromCard = async (req: Request, res: Response) => {
    if (!req.body.activity_name || !req.body.responsible_register) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    try {
        await Card.updateOne({ "provider_register": req.params.id }, {
            $pull: {
                "activities": {
                    "activity_name": req.body.activity_name,
                    "responsible_register": req.body.responsible_register
                }
            }
        }).then(result => {
            if (result.modifiedCount > 0) {
                return res.status(200).json({
                    message: "Se eliminaron las horas del prestador"
                })
            } else {
                return res.status(404).json({
                    message: "No se encontró la actividad"
                })
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor"
        })
    }

}