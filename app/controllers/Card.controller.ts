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
        const user = new User(req.user)
        const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
        const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
        let filter_request = req.query.filter ? JSON.parse(String(req.query.filter)) : null

        if (filter_request)
            Object.keys(filter_request).forEach((key: string) => {
                if (key === "year") {
                    filter_request.register = { $regex: '^' + filter_request[key] }
                    delete filter_request.year
                }

                if (key === "period") {
                    filter_request.register = { $regex: "^.{4}[" + filter_request[key] + "]" }
                    delete filter_request.period
                }
            })

        if (req.query.search)
            filter_request = {
                ...filter_request,
                $or: [
                    { "first_name": { $regex: req.query.search, $options: "i" } },
                    { "first_last_name": { $regex: req.query.search, $options: "i" } },
                    { "second_last_name": { $regex: req.query.search, $options: "i" } },
                    { "register": { $regex: req.query.search, $options: "i" } },
                    { "phone": { $regex: req.query.search } }
                ]
            }

        if (user.role === "Encargado") {
            filter_request.place = user.place
            filter_request.assigned_area = user.assigned_area
            filter_request.role = "Prestador"
        }

        const users = await User.find(filter_request).sort({ "createdAt": "desc" })
        let cards = null
        if (users.length > 0)
            cards = await Card.find({ 'provider_register': { $in: users.map(user => user.register) } }).limit(items).skip(page * items)

        return res.status(200).json({
            message: "Listo",
            cards: cards ? cards : []
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
                activities: card.activities
            })
            : res.status(400).json({
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

        __Required(req.body.responsible_register, `responsible_register`, `string`, null)

        __Optional(req.body.assignation_date, `assignation_date`, `string`, null, true)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Card.updateOne({ "provider_register": req.params.id }, { $push: { "activities": req.body } })

        if (result.modifiedCount > 0)
            CountHours(req.params.id, res)

        return result.modifiedCount > 0
            ? res.status(201).json({
                message: "Se añadieron las horas al prestador"
            })
            : res.status(400).json({
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
    let update: object = {}
    try {
        if (req.body.provider_register)
            __ThrowError("El campo 'provider_register' no se puede actualizar")

        __Optional(req.body.activity_name, `activity_name`, `string`, null)
        if (req.body.activity_name)
            update = { "activities.$.activity_name": req.body.activity_name }

        __Optional(req.body.hours, `hours`, `number`, null)
        if (req.body.hours)
            update = { ...update, "activities.$.hours": req.body.hours }

        __Optional(req.body.assignation_date, `assignation_date`, `string`, null, true)
        if (req.body.assignation_date)
            update = { ...update, "activities.$.assignation_date": req.body.assignation_date }
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Card.updateOne({ "provider_register": req.params.id, "activities._id": req.params.id2 },
            {
                $set: {
                    "activities.$.activity_name": req.body.activity_name,
                    "activities.$.assignation_date": req.body.assignation_date,
                    "activities.$.hours": req.body.hours
                }
            })

        if (result.modifiedCount > 0 && req.body.hours)
            CountHours(req.params.id, res)

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: "La información de la actividad se actualizó"
            })
            : res.status(400).json({
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

        if (result.modifiedCount > 0)
            CountHours(req.params.id, res)

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
        const card = await Card.findOne({ "provider_register": id })

        let count: number = 0
        if (card && card.activities.length > 0) {
            for (const activity of card.activities)
                count = count + activity.hours

            card.achieved_hours = count
            card.save()
        }
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}
