import { Request, Response } from "express";
import Card from "../models/Card";
import User from "../models/User";
import { __ThrowError, __Query, __Required, __Optional } from "../middleware/ValidationControl"

export const getCards = async (req: Request, res: Response) => {
    try {
        __Query(req.query.items, `items`, `number`)

        __Query(req.query.page, `page`, `number`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
        const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
        const filter: object = req.query.filter ?
            req.query.search ?
                {
                    ...JSON.parse(String(req.query.filter)),
                    $or: [
                        { "first_name": { $regex: '.*' + req.query.search + '.*' } },
                        { "first_last_name": { $regex: '.*' + req.query.search + '.*' } },
                        { "second_last_name": { $regex: '.*' + req.query.search + '.*' } },
                        { "register": { $regex: '.*' + req.query.search + '.*' } },
                        { "phone": { $regex: '.*' + req.query.search + '.*' } }
                    ]
                }
                : JSON.parse(String(req.query.filter))
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
        return res.status(204).json({
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
            : res.status(204).json({
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
        __Required(req.body.activity_name, `activity_name`, `string`, null)

        __Required(req.body.hours, `hours`, `number`, null)

        __Optional(req.body.assignation_date, `assignation_date`, `string`, null, true)

        __Required(req.body.responsible_register, `responsible_register`, `string`, null)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Card.updateOne({ "provider_register": req.params.id }, { $push: { "activities": req.body } })

        result.modifiedCount > 0 ? CountHours(req.params.id, res) : null

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

export const UpdateHoursFromCard = async (req: Request, res: Response) => {
    let update = {}
    try {
        req.body.provider_register ? __ThrowError("El campo 'provider_register' no se puede actualizar") : null

        __Optional(req.body.activity_name, `activity_name`, `string`, null)
        req.body.activity_name ? update = { "activities.$.activity_name": req.body.activity_name } : null

        __Optional(req.body.hours, `hours`, `number`, null)
        req.body.hours ? update = { ...update, "activities.$.hours": req.body.hours } : null

        __Optional(req.body.assignation_date, `assignation_date`, `string`, null, true)
        req.body.assignation_date ? update = { ...update, "activities.$.assignation_date": req.body.assignation_date } : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Card.updateOne({ "provider_register": req.params.id, "activities._id": req.params.id2 },
            { $set: update })

        result.modifiedCount > 0 && req.body.hours ? CountHours(req.params.id, res) : null

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: "La información de la actividad se actualizó",
            })
            : res.status(404).json({
                message: `No se encontró el tarjetón del usuario ${req.params.id} o la actividad ${req.params.id2}`,
            })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}

export const RemoveHoursFromCard = async (req: Request, res: Response) => {
    try {
        const result = await Card.updateOne({ "provider_register": req.params.id }, { $pull: { "activities": { "_id": req.params.id2 } } })

        result.modifiedCount > 0 ? CountHours(req.params.id, res) : null

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

const CountHours = async (id: string, res: Response) => {
    try {
        const card: any = await Card.findOne({ "provider_register": id })

        let count: number = 0
        if (card.activities.length > 0) {
            for (const activity of card.activities) {
                count = count + activity.hours
            }
        }

        card.achieved_hours = count
        card.save()
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}
