import { Request, Response } from "express";
import Card from "../models/Card";

export const getProviderHours = async (req: Request, res: Response) => {
    return res.status(200).json({
        message: "hola"
    })
}

export const CardPost = async (provider_register: String) => {
    try {
        await new Card({ "provider_register": provider_register }).save().then(result => {
            if (result) {
                console.log("Si lo creó")
            } else {
                console.log("Hubo un error")
            }
        }).catch(error => {
            console.log(error)
        })
    } catch (error) {
        console.log(error)
    }
}

export const CardPatch = async (req: Request, res: Response) => {
    if (!req.body.provider_register) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    try {
        await Card.updateOne({ "provider_register": req.body.provider_register }, {
            $push: {
                "hours": {
                    "activity_name": req.body.hours.activity_name,
                    "hours": req.body.hours.hours,
                    "responsible_register": req.body.hours.responsible_register
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