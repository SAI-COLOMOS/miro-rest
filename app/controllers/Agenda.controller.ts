import { Request, Response } from "express";
import Agenda from "../models/Agenda";

function __ThrowError(message: string) { throw message }

export const createEvent = async (req: Request, res: Response) => {
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
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al conectarse al servidor",
            error: error?.toString()
        })
    }
}