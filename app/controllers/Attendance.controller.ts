import { Request, Response } from "express"
import Agenda from "../models/Agenda"
import { __CheckEnum, __ThrowError } from "../middleware/ValidationControl"

export const getAttendees = async (req: Request, res: Response) => {
    try {
        await Agenda.findOne({ "event_identifier": req.params.id }).then(result => {
            if (result) {
                return res.status(200).json({
                    message: `Listo`,
                    attendees: result.attendance.attendee_list
                })
            } else {
                return res.status(404).json({
                    message: `No se encontró el evento ${req.params.id}`
                })
            }
        }).catch(error => {
            return res.status(500).json({
                message: `Ocurrió un error interno con la base de datos`
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error al conectarse al servidor`
        })
    }
}

export const AddAttendee = async (req: Request, res: Response) => {
    try {
        req.body.attendee_register ?
            typeof req.body.attendee_register === 'string' ? null
                : __ThrowError(`El campo 'attendee_register' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'attendee_register' es obligatorio`)

        req.body.status ?
            typeof req.body.status === 'string' ? null
                : __ThrowError(`El campo 'status' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'status' es obligatorio`)

        __CheckEnum(["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"], req.body.status) ? null
            : __ThrowError(`El campo 'status' debe contener solo una de las siguientes strings 'Inscrito', 'Desinscrito', 'Asistió', 'Retardo', 'No asistió'`)

        req.body.check_in ?
            typeof req.body.check_in === 'string' ? null
                : __ThrowError(`El campo 'check_in' debe ser tipo 'string' con la fecha en formato ISO`)
            : __ThrowError(`El campo 'check_in' es obligatorio`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const event = await Agenda.findOne({ "event_identifier": req.params.id })
        if (event) {
            try {
                const temp = event.toObject()
                temp.attendance.attendee_list.length < temp.vacancy ? null
                    : __ThrowError("El evento tiene todas las vacantes ocupadas")
            } catch (error) {
                return res.status(400).json({
                    error
                })
            }
        }

        await Agenda.updateOne({ "event_identifier": req.params.id }, {
            $push: {
                "attendance.attendee_list": req.body
            }
        }).then(result => {
            if (result.modifiedCount > 0) {
                return res.status(201).json({
                    message: `Se añadió el usuario a la lista`
                })
            } else {
                return res.status(404).json({
                    message: `No se encontró el evento ${req.params.id}`
                })
            }
        }).catch(error => {
            return res.status(500).json({
                message: `Ocurrió un error interno con la base de datos`,
                error: error?.toString()
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error al conectarse al servidor`,
            error: error?.toString()
        })
    }
}

export const updateAttendee = async (req: Request, res: Response) => {
    let update = {}
    try {
        req.body.status ?
            typeof req.body.status === 'string' ? null
                : __ThrowError(`El campo 'status' debe ser tipo 'string'`)
            : null

        if (req.body.status) {
            let status_enum = false
            for (let str of ["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"]) {
                req.body.status === str ? status_enum = true : null
            }
            status_enum ? { ...update, "attendance.attendee_list.$.status": req.body.status } : __ThrowError(`El campo 'status' debe contener solo una de las siguientes strings 'Inscrito', 'Desinscrito', 'Asistió', 'Retardo', 'No asistió'`)
        }

        req.body.check_in ?
            typeof req.body.check_in === 'string' ? { ...update, "attendance.attendee_list.$.check_in": req.body.check_in }
                : __ThrowError(`El campo 'check_in' debe ser tipo 'string' con la fecha en formato ISO`)
            : null


    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        await Agenda.updateOne({ "event_identifier": req.params.id, "attendance.attendee_list.attendee_register": req.body.attendee_register }, { $set: update }).then(result => {
            if (result.modifiedCount > 0) {
                return res.status(200).json({
                    message: `Se modificó el estado del usuario`
                })
            } else {
                return res.status(404).json({
                    message: `No se encontró el evento ${req.params.id} o el usuario ${req.body.attendee_register}`
                })
            }
        }).catch(error => {
            return res.status(500).json({
                message: `Ocurrió un error interno con la base de datos`
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error al conectarse al servidor`
        })
    }
}