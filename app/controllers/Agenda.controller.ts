import { Request, Response } from "express";
import Agenda from "../models/Agenda";
import Card from "../models/Card";
import User from "../models/User";
import Enviroment from "../config/Enviroment";
import schedule from 'node-schedule'
import { mensaje, sendEmail } from "../config/Mailer"
import { __ThrowError, __Query, __Required, __Optional } from "../middleware/ValidationControl"

export const getAgenda = async (req: Request, res: Response) => {
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
                    $or: [{ "name": { $regex: '.*' + req.body.search + '.*' } }]
                }
                : JSON.parse(String(req.query.filter))
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
        __Required(req.body.name, `name`, `string`, null)

        __Required(req.body.description, `description`, `string`, null)

        __Required(req.body.offered_hours, `offered_hours`, `number`, null)

        __Required(req.body.vacancy, `vacancy`, `number`, null)

        __Required(req.body.starting_date, `starting_date`, `string`, null, true)

        __Required(req.body.ending_date, `ending_date`, `string`, null, true)

        __Required(req.body.author_register, `author_register`, `string`, null)

        __Required(req.body.publishing_date, `publishing_date`, `string`, null, true)

        __Required(req.body.place, `place`, `string`, null)

        __Required(req.body.belonging_place, `belonging_place`, `string`, null)

        __Required(req.body.belonging_area, `belonging_area`, `string`, null)

        __Optional(req.body.is_template, `is_template`, `boolean`, null)
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
        }

        return event
            ? res.status(201).json({
                message: "Evento creado",
                event: event
            })
            : res.status(500).json({
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

        __Required(req.body.modifier_register, `modifier_register`, `string`, null)

        __Optional(req.body.is_template, `is_template`, `boolean`, null)

        __Optional(req.body.name, `name`, `string`, null)

        __Optional(req.body.description, `description`, `string`, null)

        __Optional(req.body.offered_hours, `offered_hours`, `number`, null)

        __Optional(req.body.vacancy, `vacancy`, `number`, null)

        __Optional(req.body.place, `place`, `string`, null)

        __Optional(req.body.publishing_date, `publishing_date`, `string`, null, true)

        __Optional(req.body.starting_date, `starting_date`, `string`, null, true)

        __Optional(req.body.ending_date, `ending_date`, `string`, null, true)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    const is_publishing_date: boolean = req.body.publishing_date ? true : false
    const is_ending_date: boolean = req.body.ending_date ? true : false
    const event_status: boolean = req.body.attendance.status ? true : false

    try {
        if (event_status) {
            const event: any = await Agenda.findOne({ "event_identifier": req.params.id })
            if (event) {
                event.attendance.status = req.body.attendance.status
                event.save()
                delete req.body.attendance
            }

            if (event && event.attendance.status === "concluido") {
                for (let attendee of event.attendance.attendee_list) {
                    const result = await Card.updateOne({ "provider_register": attendee.attendee_register },
                        {
                            $push: {
                                "activities": {
                                    "activity_name": event.name,
                                    "hours": event.offered_hours,
                                    "responsible_register": req.body.modifier_register
                                }
                            }
                        }
                    )
                }
            }

            if (Object.keys(req.body).length === 0) {
                return res.status(200).json({
                    message: `Se actualizó la información del evento ${req.params.id}`
                })
            }
        }

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