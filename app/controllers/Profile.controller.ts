import { Request, Response } from "express"
import User from "../models/User"
import Agenda, { AgendaInterface } from "../models/Agenda"
import Card from "../models/Card"

interface Request_body {
    message: string
    events: AgendaInterface[]
    achieved_hours?: number
    total_hours?: number
}

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
        const user = new User(req.user)
        const searched_user = await User.findOne({ 'register': req.params.id })

        if (searched_user) {
            const events = await Agenda.find({ "attendance.attendee_list.attendee_register": req.params.id, "attendance.status": "Disponible" }).sort({ "createdAt": "desc" })

            const card = await Card.findOne({ "provider_register": searched_user.register })

            const response_body: Request_body = {
                message: "Feed lista",
                events
            }

            if (user.role === "Prestador" && card) {
                response_body.achieved_hours = card.achieved_hours
                response_body.total_hours = card.total_hours
            }

            return res.status(200).json(response_body)
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
