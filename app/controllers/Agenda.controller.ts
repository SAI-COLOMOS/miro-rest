import { Request, Response } from "express";
import Agenda from "../models/Agenda";
import User from "../models/User";
import Enviroment from "../config/Enviroment";
import schedule from 'node-schedule'
import { mensaje, sendEmail } from "../config/Mailer"
import { __ThrowError } from "../middleware/ValidationControl"

export const getAgenda = async (req: Request, res: Response) => {
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
            $or: [{ "name": { $regex: '.*' + req.body.search + '.*' } }]
        } : null

        await Agenda.find(filter).sort({ "createdAt": "desc" }).limit(items).skip(page * items).then(result => {
            if (result.length > 0) {
                return res.status(200).json({
                    message: "Listo",
                    events: result
                })
            } else {
                return res.status(404).json({
                    message: "Sin resultados"
                })
            }
        }).catch(error => {
            return res.status(500).json({
                message: "Ocurrió un error interno con la base de datos"
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor"
        })
    }
}

export const getEvent = async (req: Request, res: Response) => {
    try {
        await Agenda.findOne({ "event_identifier": req.params.id }).then(result => {
            if (result) {
                return res.status(200).json({
                    message: "Listo",
                    event: result
                })
            } else {
                return res.status(404).json({
                    message: `No se encontró el evento ${req.params.id}`
                })
            }
        }).catch(error => {
            return res.status(500).json({
                message: "Ocurrió un error interno con la base de datos"
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor"
        })
    }
}

export const createEvent = async (req: Request, res: Response) => {
    try {
        req.body.is_template ?
            typeof req.body.is_template === 'boolean' ? null
                : __ThrowError(`El campo 'is_template' debe ser tipo 'boolean'`)
            : null

        req.body.name ?
            typeof req.body.name === "string" ? null
                : __ThrowError("El campo 'name' debe ser tipo 'string'")
            : __ThrowError("El campo 'name' es obligatorio")

        req.body.description ?
            typeof req.body.description === "string" ? null
                : __ThrowError("El campo 'description' debe ser tipo 'string'")
            : __ThrowError("El campo 'description' es obligatorio")

        req.body.offered_hours ?
            typeof req.body.offered_hours === "number" ? null
                : __ThrowError("El campo 'offered_hours' debe ser tipo 'number'")
            : __ThrowError("El campo 'offered_hours' es obligatorio")


        req.body.vacancy ?
            typeof req.body.vacancy === "number" ? null
                : __ThrowError("El campo 'vacancy' debe ser tipo 'number'")
            : __ThrowError("El campo 'vacancy' es obligatorio")

        req.body.starting_date ?
            typeof req.body.starting_date === "string" ? null
                : __ThrowError("El campo 'starting_date' debe ser tipo 'string' con la fecha en formato ISO")
            : __ThrowError("El campo 'starting_date' es obligatorio")

        req.body.ending_date ?
            typeof req.body.ending_date === "string" ? null
                : __ThrowError("El campo 'ending_date' debe ser tipo 'string' con la fecha en formato ISO")
            : __ThrowError("El campo 'ending_date' es obligatorio")

        req.body.author_register ?
            typeof req.body.author_register === "string" ? null
                : __ThrowError("El campo 'author_register' debe ser tipo 'string'")
            : __ThrowError("El campo 'author_register' es obligatorio")

        req.body.publishing_date ?
            typeof req.body.publishing_date === "string" ? null
                : __ThrowError("El campo 'publishing_date' debe ser tipo 'string' con la fecha en formato ISO")
            : __ThrowError("El campo 'publishing_date' es obligatorio")

        req.body.place ?
            typeof req.body.place === "string" ? null
                : __ThrowError("El campo 'place' debe ser tipo 'string'")
            : __ThrowError("El campo 'place' es obligatorio")

        req.body.belonging_area ?
            typeof req.body.belonging_area === "string" ? null
                : __ThrowError("El campo 'belonging_area' debe ser tipo 'string'")
            : __ThrowError("El campo 'belonging_area' es obligatorio")

        req.body.belonging_place ?
            typeof req.body.belonging_place === "string" ? null
                : __ThrowError("El campo 'belonging_place' debe ser tipo 'string'")
            : __ThrowError("El campo 'belonging_place' es obligatorio")

    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        await new Agenda(req.body).save().then(result => {
            if (result) {
                let time = result.publishing_date
                time.setHours(time.getHours() - 1)
                scheduleEmailNotifications(result.event_identifier.toString(), time.toISOString(), result.name.toString())
                time.setHours(time.getHours() + 2)
                endEvent(result.event_identifier.toString(), time.toISOString())
                return res.status(201).json({
                    message: "Evento creado",
                    event: result
                })
            } else {
                return res.status(500).json({
                    message: "No se pudo crear el evento"
                })
            }
        }).catch(error => {
            return res.status(500).json({
                message: "Ocurrió un error interno con la base de datos",
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor",
        })
    }
}

export const updateEvent = async (req: Request, res: Response) => {
    try {
        req.body.event_identifier || req.body.author_register || req.body.belonging_area || req.body.belonging_place ?
            __ThrowError("Algunos datos no se pueden modificar")
            : null

        req.body.is_template ?
            typeof req.body.is_template === 'boolean' ? null
                : __ThrowError(`El campo 'is_template' debe ser tipo 'boolean'`)
            : null

        req.body.modifier_register ?
            typeof req.body.modifier_register === 'string' ? null
                : __ThrowError(`El campo 'modifier_register' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'modifier_register' es obligatorio`)

        req.body.name ?
            typeof req.body.name === 'string' ? null
                : __ThrowError(`El campo 'name' debe ser tipo 'string'`)
            : null

        req.body.description ?
            typeof req.body.description === 'string' ? null
                : __ThrowError(`El campo 'description' debe ser tipo 'string'`)
            : null

        req.body.offered_hours ?
            typeof req.body.offered_hours === 'number' ? null
                : __ThrowError(`El campo 'offered_hours' debe ser tipo 'number'`)
            : null

        req.body.vacancy ?
            typeof req.body.vacancy === 'number' ? null
                : __ThrowError(`El campo 'vacancy' debe ser tipo 'number'`)
            : null

        req.body.place ?
            typeof req.body.place === 'string' ? null
                : __ThrowError(`El campo 'place' debe ser tipo 'string'`)
            : null

        req.body.publishing_date ?
            typeof req.body.publishing_date === 'string' ? null
                : __ThrowError(`El campo 'publishing_date' debe ser tipo 'string' con la fecha en formato ISO`)
            : null

        req.body.starting_date ?
            typeof req.body.starting_date === 'string' ? null
                : __ThrowError(`El campo 'starting_date' debe ser tipo 'string' con la fecha en formato ISO`)
            : null

        req.body.ending_date ?
            typeof req.body.ending_date === 'string' ? null
                : __ThrowError(`El campo 'ending_date' debe ser tipo 'string' con la fecha en formato ISO`)
            : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    const is_publishing_date: boolean = req.body.publishing_date ? true : false
    const is_ending_date: boolean = req.body.ending_date ? true : false

    try {
        await Agenda.updateOne({ "event_identifier": req.params.id }, req.body).then(async result => {
            if (result.modifiedCount > 0) {
                const event = is_ending_date || is_publishing_date ? await Agenda.findOne({ "event_identifier": req.params.id }) : null
                if (event && is_publishing_date) {
                    let time = event.publishing_date
                    time.setHours(time.getHours() - 1)
                    schedule.cancelJob(event.event_identifier.toString())
                    scheduleEmailNotifications(event.event_identifier.toString(), time.toISOString(), event.name.toString())
                }

                if (event && is_ending_date) {
                    let time = event.publishing_date
                    time.setHours(time.getHours() + 1)
                    schedule.cancelJob(`end_${event.event_identifier.toString()}`)
                    endEvent(event.event_identifier.toString(), time.toISOString())
                }

                return res.status(200).json({
                    message: `Se actualizó la información del evento ${req.params.id}`
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

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        await Agenda.deleteOne({ 'event_identifier': req.params.id }).then(result => {
            if (result.deletedCount !== 0) {
                return res.status(200).json({
                    message: "Evento eliminado"
                })
            } else {
                return res.status(404).json({
                    message: `No se encontró el evento ${req.params.id}`
                })
            }
        }).catch(error => {
            return res.status(500).json({
                message: "Ocurrió un error interno con la base de datos",
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor"
        })
    }
}

const scheduleEmailNotifications = async (event: string, time: string, name: string) => {
    schedule.scheduleJob(event, time, async function (name: string, event: string) {
        const users = await User.find({ "status": "Activo", "role": "Prestador" })
        const from = `"SAI" ${Enviroment.Mailer.email}`
        const subject = "Recuperación de contraseña"
        const body = mensaje(`La inscripción para el evento  ${name} empieza en una hora.`)
        for (let user of users) {
            const to = user.email
            await sendEmail(from, to, subject, body)
        }

        schedule.cancelJob(event)
    }.bind(null, name, event))
}

const endEvent = async (event: string, time: string) => {
    schedule.scheduleJob(`end_${event}`, time, async function (event: string) {
        const result = await Agenda.findOne({ "event_identifier": event })
        if (result?.attendance.status === "Disponible") {
            result.attendance.status = "Concluido por sistema"
            result.save()
        }
        schedule.cancelJob(`end_${event}`)
    }.bind(null, event))
}