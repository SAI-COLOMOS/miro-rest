import { Request, Response } from "express";
import Card from "../models/Card";
import User from "../models/User";
import { __ThrowError } from "../config/ValidationControl"

export const getCards = async (req: Request, res: Response) => {
    try {
        !req.body.items ? null
            : typeof req.body.items === 'number' ? null
                : __ThrowError(`El campo 'items' debe ser tipo 'number'`)

        !req.body.page ? null
            : typeof req.body.page === 'number' ? null
                : __ThrowError(`El campo 'page' debe ser tipo 'number'`)

        !req.body.search ? null
            : typeof req.body.search === 'string' ? null
                : __ThrowError(`El campo 'search' debe ser tipo 'string'`)

        !req.body.filter ? null
            : typeof req.body.filter === 'object' ? null
                : __ThrowError(`El campo 'filter' debe ser tipo 'object'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0
        const filter: object = req.body.filter ?
            req.body.search ?
                {
                    ...req.body.filter,
                    $or: [
                        { "first_name": { $regex: '.*' + req.body.search + '.*' } },
                        { "first_last_name": { $regex: '.*' + req.body.search + '.*' } },
                        { "second_last_name": { $regex: '.*' + req.body.search + '.*' } },
                        { "register": { $regex: '.*' + req.body.search + '.*' } },
                        { "phone": { $regex: '.*' + req.body.search + '.*' } }
                    ]
                }
                : req.body.filter
            : null

        const users = await User.find(filter).sort({ "createdAt": "desc" })
        if (users.length > 0) {
            const cards = await Card.find({ 'provider_register': { $in: users.map(user => user.register) } }).limit(items).skip(page * items)
            if (cards.length > 0) {
                return res.status(200).json({
                    message: "Listo",
                    cards: cards
                })
            }
        }
        return res.status(404).json({
            message: "Sin resultados"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const getProviderHours = async (req: Request, res: Response) => {
    try {
        const card = await Card.findOne({ "provider_register": req.params.id })

        return card
            ? res.status(200).json({
                message: "Tarjetón de usuario encontrado",
                card: card.activities
            })
            : res.status(404).json({
                message: `El tarjetón del usuario ${req.params.id} no se encontró`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const AddHoursToCard = async (req: Request, res: Response) => {
    try {
        req.body.activity_name ? null : __ThrowError(`El campo 'activity_name' es obligatorio`)
        typeof req.body.activity_name === 'string' ? null : __ThrowError(`El campo 'activity_name' debe ser tipo 'string'`)

        req.body.hours ? null : __ThrowError(`El campo 'hours' es obligatorio`)
        typeof req.body.hours === 'number' ? null : __ThrowError(`El campo 'hours' debe ser tipo 'number'`)

        req.body.responsible_register ? null : __ThrowError(`El campo 'responsible_register' es obligatorio`)
        typeof req.body.responsible_register === 'string' ? null : __ThrowError(`El campo 'responsible_register' debe ser tipo 'string'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Card.updateOne({ "provider_register": req.params.id }, { $push: { "activities": req.body } })

        return result.modifiedCount > 0
            ? res.status(201).json({
                message: "Se añadieron las horas al prestador"
            })
            : res.status(404).json({
                message: `El usuario ${req.params.id} no se encontró`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const RemoveHoursFromCard = async (req: Request, res: Response) => {
    try {
        req.body._id ? null : __ThrowError(`El campo '_id' es obligatorio`)
        typeof req.body._id === 'string' ? null : __ThrowError(`El campo '_id' debe ser tipo 'string'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Card.updateOne({ "provider_register": req.params.id }, { $pull: { "activities": { "_id": req.body._id } } })

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: "Se eliminaron las horas del prestador"
            })
            : res.status(404).json({
                message: "No se encontró la actividad"
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}
