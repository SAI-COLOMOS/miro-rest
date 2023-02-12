import { Request, Response } from "express";
import Agenda from "../models/Agenda";

function __ThrowError(message: string) { throw message }

export const getAgenda = async (req: Request, res: Response) => {
    try {
        req.body.items ?
            typeof req.body.items === "number" ? null : __ThrowError("El campo 'items' debe ser tipo 'number'")
            : null

        req.body.page ?
            typeof req.body.page === "number" ? null : __ThrowError("El campo 'page' debe ser tipo 'number'")
            : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0
        const filter: object = req.body.filters ? req.body.filters : null

        if (req.body.search) {
            await Agenda.find({
                $or: [
                    { "name": { $regex: '.*' + req.body.search + '.*' } },
                ]
            }).sort({ "createdAt": "desc" }).limit(items).skip(page * items).then(result => {
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
        } else {
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
        }
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

    try {
        await Agenda.updateOne({ "event_identifier": req.params.id }, { ...req.body, "modifier_register": req.body.modifier_register }).then(result => {
            if (result.modifiedCount > 0) {
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