import { Request, Response } from "express";
import Card from "../models/Card";
import User from "../models/User";
import { __ThrowError } from "../middleware/ValidationControl"

export const getCards = async (req: Request, res: Response) => {
    try {
        req.body.items ?
            typeof req.body.items === "number" ? null : __ThrowError("El campo 'items' debe ser tipo 'number'")
            : null

        req.body.page ?
            typeof req.body.page === "number" ? null : __ThrowError("El campo 'page' debe ser tipo 'number'")
            : null

        req.body.search ?
            typeof req.body.search === 'string' ? null
                : __ThrowError(`El campo 'search' debe ser tipo 'string'`)
            : null

        req.body.filter ?
            typeof req.body.filter === 'object' ? null
                : __ThrowError(`El campo 'filter' debe ser tipo 'object'`)
            : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0
        let filter: object = req.body.filter ? req.body.filter : null
        req.body.search ? filter = {
            ...req.body.filter,
            $or: [
                { "first_name": { $regex: '.*' + req.body.search + '.*' } },
                { "first_last_name": { $regex: '.*' + req.body.search + '.*' } },
                { "second_last_name": { $regex: '.*' + req.body.search + '.*' } },
                { "register": { $regex: '.*' + req.body.search + '.*' } },
                { "phone": { $regex: '.*' + req.body.search + '.*' } }
            ]
        } : null

        await User.find(filter).sort({ "createdAt": "desc" }).then(async users => {
            if (users.length > 0) {
                await Card.find({ 'provider_register': { $in: users.map(user => user.register) } }).limit(items).skip(page * items)
                    .then(result => {
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
            return res.status(200).json({
                message: "Sin resultados"
            })
        }
        ).catch(error => {
            return res.status(500).json({
                message: "Ocurrió un error interno con la base de datos",
                error: error?.toString()
            })
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
                    card: result
                })
            }
            return res.status(404).json({
                message: `El tarjetón del usuario ${req.params.id} no se encontró`
            })
        }).catch(error => {
            return res.status(500).json({
                message: "Ocurrió un error interno con la base de datos",
                error: error?.toString()
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrio un error al conectarse al servidor"
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
        await Card.updateOne({ "provider_register": req.params.id }, { $push: { "activities": req.body } })
            .then(result => {
                if (result.modifiedCount > 0) {
                    return res.status(201).json({
                        message: "Se añadieron las horas al prestador"
                    })
                }
                return res.status(404).json({
                    message: `El usuario ${req.params.id} no se encontró`
                })
            }).catch(error => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
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
            }).catch(error => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor"
        })
    }
}
