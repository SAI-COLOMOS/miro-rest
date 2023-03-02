import { Request, Response } from "express"
import User from "../models/User"
import Agenda from "../models/Agenda"
import Card from "../models/Card"

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ 'register': req.params.id })

        return user
            ? res.status(200).json({
                message: "Listo",
                user
            })
            : res.status(400).json({
                message: `Usuario ${req.params.id} no encontrado`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const getFeed = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ 'register': req.params.id })

        if (user) {
            const events = await Agenda.find({ "attendance.attendee_list.attendee_register": req.params.id, "attendance.status": "Disponible" }).sort({ "createdAt": "desc" })

            const card = await Card.findOne({ "provider_register": user.register })

            return card && events
                ? res.status(200).json({
                    message: "Feed lista",
                    total_hours: card.total_hours,
                    achieved_hours: card.achieved_hours,
                    events: events
                })
                : res.status(400).json({
                    message: `No hay información por recuperar para el usuario ${req.params.id}`
                })
        }

        return res.status(400).json({
            message: `No se encontró el usuario ${req.params.id}`
        })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}
