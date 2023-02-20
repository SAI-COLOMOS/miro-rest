import { Request, Response } from "express";
import Agenda from "../models/Agenda";
import User from "../models/User";
import Enviroment from "../config/Enviroment";
import schedule from 'node-schedule'
import { mensaje, sendEmail } from "../config/Mailer"
import { __ThrowError } from "../middleware/ValidationControl"

export const getAgenda = async (req: Request, res: Response) => {
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
                    $or: [{ "name": { $regex: '.*' + req.body.search + '.*' } }]
                }
                : req.body.filter
            : null

        const result = await Agenda.find(filter).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

        return result.length > 0
            ? res.status(200).json({
                message: "Listo",
                events: result
            })
            : res.status(404).json({
                message: "Sin resultados"
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const getEvent = async (req: Request, res: Response) => {
    try {
        const event = await Agenda.findOne({ "event_identifier": req.params.id })

        return event
            ? res.status(200).json({
                message: "Listo",
                event: event
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

export const createEvent = async (req: Request, res: Response) => {
    try {
        req.body.name ? null : __ThrowError(`El campo 'name' es obligatorio`)
        typeof req.body.name === 'string' ? null : __ThrowError(`El campo 'name' debe ser tipo 'string'`)

        req.body.description ? null : __ThrowError(`El campo 'description' es obligatorio`)
        typeof req.body.description === 'string' ? null : __ThrowError(`El campo 'description' debe ser tipo 'string'`)

        req.body.offered_hours ? null : __ThrowError(`El campo 'offered_hours' es obligatorio`)
        typeof req.body.offered_hours === 'number' ? null : __ThrowError(`El campo 'offered_hours' debe ser tipo 'number'`)

        req.body.vacancy ? null : __ThrowError(`El campo 'vacancy' es obligatorio`)
        typeof req.body.vacancy === 'number' ? null : __ThrowError(`El campo 'vacancy' debe ser tipo 'number'`)

        req.body.starting_date ? null : __ThrowError(`El campo 'starting_date' es obligatorio`)
        typeof req.body.starting_date === 'string' ? null : __ThrowError(`El campo 'starting_date' debe ser tipo 'string' con la fecha en formato ISO`)

        req.body.ending_date ? null : __ThrowError(`El campo 'ending_date' es obligatorio`)
        typeof req.body.ending_date === 'string' ? null : __ThrowError(`El campo 'ending_date' debe ser tipo 'string' con la fecha en formato ISO`)

        req.body.author_register ? null : __ThrowError(`El campo 'author_register' es obligatorio`)
        typeof req.body.author_register === 'string' ? null : __ThrowError(`El campo 'author_register' debe ser tipo 'string'`)

        req.body.publishing_date ? null : __ThrowError(`El campo 'publishing_date' es obligatorio`)
        typeof req.body.publishing_date === 'string' ? null : __ThrowError(`El campo 'publishing_date' debe ser tipo 'string' con la fecha en formato ISO`)

        req.body.place ? null : __ThrowError(`El campo 'place' es obligatorio`)
        typeof req.body.place === 'string' ? null : __ThrowError(`El campo 'place' debe ser tipo 'string'`)

        req.body.belonging_place ? null : __ThrowError(`El campo 'belonging_place' es obligatorio`)
        typeof req.body.belonging_place === 'string' ? null : __ThrowError(`El campo 'belonging_place' debe ser tipo 'string'`)

        req.body.belonging_area ? null : __ThrowError(`El campo 'belonging_area' es obligatorio`)
        typeof req.body.belonging_area === 'string' ? null : __ThrowError(`El campo 'belonging_area' debe ser tipo 'string'`)

        !req.body.is_template ? null
            : typeof req.body.is_template === 'boolean' ? null
                : __ThrowError(`El campo 'is_template' debe ser tipo 'boolean'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const event = await new Agenda(req.body).save()

        if (event) {
            let time = event.publishing_date
            time.setHours(time.getHours() - 1)
            scheduleEmailNotifications(event.event_identifier, time.toISOString(), event.name)
            time = event.ending_date
            time.setHours(time.getHours() + 1)
            endEvent(event.event_identifier, time.toISOString())
            return res.status(201).json({
                message: "Evento creado",
                event: event
            })
        }
        return res.status(500).json({
            message: "No se pudo crear el evento"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const updateEvent = async (req: Request, res: Response) => {
    try {
        req.body.event_identifier ? __ThrowError("El campo 'event_identifier' no se puede modificar") : null

        req.body.author_register ? __ThrowError("El campo 'author_register' no se puede modificar") : null

        req.body.belonging_area ? __ThrowError("El campo 'belonging_area' no se puede modificar") : null

        req.body.belonging_place ? __ThrowError("El campo 'belonging_place' no se puede modificar") : null

        !req.body.is_template ? null
            : typeof req.body.is_template === 'boolean' ? null
                : __ThrowError(`El campo 'is_template' debe ser tipo 'boolean'`)

        !req.body.modifier_register ? null
            : typeof req.body.modifier_register === 'string' ? null
                : __ThrowError(`El campo 'modifier_register' debe ser tipo 'string'`)

        !req.body.name ? null
            : typeof req.body.name === 'string' ? null
                : __ThrowError(`El campo 'name' debe ser tipo 'string'`)

        !req.body.description ? null
            : typeof req.body.description === 'string' ? null
                : __ThrowError(`El campo 'description' debe ser tipo 'string'`)

        !req.body.offered_hours ? null
            : typeof req.body.offered_hours === 'number' ? null
                : __ThrowError(`El campo 'offered_hours' debe ser tipo 'number'`)

        !req.body.vacancy ? null
            : typeof req.body.vacancy === 'number' ? null
                : __ThrowError(`El campo 'vacancy' debe ser tipo 'number'`)

        !req.body.place ? null
            : typeof req.body.place === 'string' ? null
                : __ThrowError(`El campo 'place' debe ser tipo 'string'`)

        !req.body.publishing_date ? null
            : typeof req.body.publishing_date === 'string' ? null
                : __ThrowError(`El campo 'publishing_date' debe ser tipo 'string' con la fecha en formato ISO`)

        !req.body.starting_date ? null
            : typeof req.body.starting_date === 'string' ? null
                : __ThrowError(`El campo 'starting_date' debe ser tipo 'string' con la fecha en formato ISO`)

        !req.body.ending_date ? null
            : typeof req.body.ending_date === 'string' ? null
                : __ThrowError(`El campo 'ending_date' debe ser tipo 'string' con la fecha en formato ISO`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    const is_publishing_date: boolean = req.body.publishing_date ? true : false
    const is_ending_date: boolean = req.body.ending_date ? true : false

    try {
        const result = await Agenda.updateOne({ "event_identifier": req.params.id }, req.body)

        if (result.modifiedCount > 0) {
            const event = is_ending_date || is_publishing_date ? await Agenda.findOne({ "event_identifier": req.params.id }) : null
            let time: Date

            if (event && is_publishing_date) {
                time = event.publishing_date
                time.setHours(time.getHours() - 1)
                schedule.cancelJob(event.event_identifier)
                scheduleEmailNotifications(event.event_identifier, time.toISOString(), event.name)
            }

            if (event && is_ending_date) {
                time = event.ending_date
                time.setHours(time.getHours() + 1)
                schedule.cancelJob(`end_${event.event_identifier}`)
                endEvent(event.event_identifier, time.toISOString())
            }

            return res.status(200).json({
                message: `Se actualizó la información del evento ${req.params.id}`
            })
        }
        return res.status(404).json({
            message: `No se encontró el evento ${req.params.id}`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const result = await Agenda.deleteOne({ 'event_identifier': req.params.id })

        if (result.deletedCount !== 0) {
            schedule.cancelJob(req.params.id)
            schedule.cancelJob(`end_${req.params.id}`)

            return res.status(200).json({
                message: "Evento eliminado"
            })
        }

        return res.status(404).json({
            message: `No se encontró el evento ${req.params.id}`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

const scheduleEmailNotifications = async (event: string, time: string, name: string) => {
    schedule.scheduleJob(event, time,
        async function (name: string, event: string) {
            const users = await User.find({ "status": "activo", "role": "prestador" })
            const from = `"SAI" ${Enviroment.Mailer.email}`
            const subject = "Recuperación de contraseña"
            const body = mensaje(`La inscripción para el evento  ${name} empieza en una hora.`)
            for (let user of users) {
                await sendEmail(from, user.email, subject, body)
            }

            schedule.cancelJob(event)
        }.bind(null, name, event))
}

const endEvent = async (event: string, time: string) => {
    schedule.scheduleJob(`end_${event}`, time,
        async function (event: string) {
            const result = await Agenda.findOne({ "event_identifier": event })
            if (result?.attendance.status === "disponible") {
                result.attendance.status = "concluido por sistema"
                result.save()
            }
            schedule.cancelJob(`end_${event}`)
        }.bind(null, event))
}