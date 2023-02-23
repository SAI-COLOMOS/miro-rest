import { Request, Response } from "express"
import Agenda from "../models/Agenda"
import { __CheckEnum, __ThrowError, __Required, __Optional } from "../middleware/ValidationControl"

export const getAttendees = async (req: Request, res: Response) => {
    try {
        const event = await Agenda.findOne({ "event_identifier": req.params.id })

        return event
            ? res.status(200).json({
                message: `Listo`,
                attendees: event.attendance.attendee_list
            })
            : res.status(400).json({
                message: `No se encontró el evento ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const AddAttendee = async (req: Request, res: Response) => {
    try {
        __Required(req.body.attendee_register, `attendee_register`, `string`, null)

        __Required(req.body.status, `status`, `string`, ["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"])
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const event = await Agenda.findOne({ "event_identifier": req.params.id })
        if (event) {
            try {
                event.toObject().attendance.attendee_list.length < event.toObject().vacancy ? null
                    : __ThrowError("El evento tiene todas las vacantes ocupadas")
            } catch (error) {
                return res.status(400).json({
                    error
                })
            }
        }

        const result = await Agenda.updateOne({ "event_identifier": req.params.id }, {
            $push: {
                "attendance.attendee_list": req.body
            }
        })

        return result.modifiedCount > 0
            ? res.status(201).json({
                message: `Se añadió el usuario a la lista`
            })
            : res.status(404).json({
                message: `No se encontró el evento ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const updateAttendee = async (req: Request, res: Response) => {
    let update: object = {}
    try {
        req.body.attendee_register ? __ThrowError("El campo 'attendee_register' no se puede actualizar") : null

        __Optional(req.body.status, `status`, `string`, ["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"])
        req.body.status ? update = { "attendance.attendee_list.$.status": req.body.status } : null

        __Optional(req.body.check_in, `check_in`, `string`, null)
        req.body.check_in ? update = { ...update, "attendance.attendee_list.$.check_in": req.body.check_in } : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Agenda.updateOne({ "event_identifier": req.params.id, "attendance.attendee_list.attendee_register": req.params.id2 }, { $set: update })

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: `Se modificó el estado del usuario`
            })
            : res.status(404).json({
                message: `No se encontró el evento ${req.params.id} o el usuario ${req.body.attendee_register}`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}