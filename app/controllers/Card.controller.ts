import { Request, Response } from "express";
import Card from "../models/Card";
import User from "../models/User";

function __ThrowError(message: string) { throw message }

export const getCards = async (req: Request, res: Response) => {
    let status = "Activo", flag = false
    try {
        if (req.body.status) {
            typeof req.body.status === "string" ?
                ['Activo', 'Suspendido', 'Inactivo', 'Finalizado'].map(s => req.body.status === s ? flag = true : null)
                : __ThrowError("El campo 'status' debe ser tipo 'string'")

            flag ? status = req.body.status : __ThrowError("El campo 'status' debe contener uno de las siguientes strings: 'Activo', 'Suspendido', 'Inactivo' o 'Finalizado'")
        }

        req.body.items ?
            typeof req.body.items === "number" ? null : __ThrowError("El campo 'items' debe ser tipo 'number'")
            : null

        req.body.page ?
            typeof req.body.page === "number" ? null : __ThrowError("El campo 'page' debe ser tipo 'number'")
            : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0

        await User.find({ 'status': status }).sort({ "createdAt": "desc" }).then(async users => {
            if (users.length > 0) {
                await Card.find({ 'provider_register': { $in: users.map(user => user.register) } }).limit(items).skip(page * items).then(result => {
                    if (result.length > 0) {
                        return res.status(200).json({
                            message: "Listo",
                            cards: result
                        })
                    }

                    return res.status(200).json({
                        message: "Sin resultados"
                    })
                })
            }
        }
        )
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
                    card: result.activities
                })
            }

            return res.status(404).json({
                message: `El tarjetón del usuario ${req.params.id} no se encontró`
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrio un error al conectarse al servidor"
        })
    }
}

export const CardPost = async (req: Request, res: Response) => {
    try {
        req.body.provider_register ?
            typeof req.body.provider_register === "string" ? null
                : __ThrowError("El campo 'provider_register' debe ser tipo 'string'")
            : __ThrowError("El campo 'provider_register' es obligatorio")
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        await new Card({ "provider_register": req.body.provider_register }).save().then(result => {
            if (result) {
                return res.status(201).json({
                    message: "Se creó el tarjetón del prestador"
                })
            }
            return res.status(500).json({
                message: "Ocurrió un error interno en la base de datos"
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor",
        })
    }
}

export const AddHoursToCard = async (req: Request, res: Response) => {
    try {
        req.body.activity_name ?
            typeof req.body.activity_name === "string" ? null
                : __ThrowError("El campo 'activity_name' debe ser tipo 'string'")
            : __ThrowError("El campo 'activity_name' es obligatorio")

        req.body.hours ?
            typeof req.body.hours === "number" ? null
                : __ThrowError("El campo 'hours' debe ser tipo 'number'")
            : __ThrowError("El campo 'hours' es obligatorio")

        req.body.responsible_register ?
            typeof req.body.responsible_register === "string" ? null
                : __ThrowError("El campo 'responsible_register' debe ser tipo 'string'")
            : __ThrowError("El campo 'responsible_register' es obligatorio")
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        await Card.updateOne({ "provider_register": req.params.id }, {
            $push: {
                "activities": {
                    "activity_name": req.body.activity_name,
                    "hours": req.body.hours,
                    "responsible_register": req.body.responsible_register
                }
            }
        }).then(result => {
            if (result.modifiedCount > 0) {
                return res.status(201).json({
                    message: "Se añadieron las horas al prestador"
                })
            }

            return res.status(404).json({
                message: `El usuario ${req.params.id} no se encontró`
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor"
        })
    }
}

export const RemoveHoursFromCard = async (req: Request, res: Response) => {
    try {
        req.body._id ?
            typeof req.body._id === "string" ? null
                : __ThrowError("El campo '_id' debe ser tipo 'string'")
            : __ThrowError("El campo '_id' es obligatorio")
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        await Card.updateOne({ "provider_register": req.params.id }, { $pull: { "activities": { "_id": req.body._id } } })
            .then(result => {
                if (result.modifiedCount > 0) {
                    return res.status(200).json({
                        message: "Se eliminaron las horas del prestador"
                    })
                }

                return res.status(404).json({
                    message: "No se encontró la actividad"
                })
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor"
        })
    }

}