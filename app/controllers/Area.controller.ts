import { Request, Response } from "express"
import Place from "../models/Place"
import { __Required, __Optional, __Query } from "../middleware/ValidationControl"

export const addArea = async (req: Request, res: Response) => {
    try {
        __Required(req.body.area_name, `area_name`, `string`, null)

        __Required(req.body.phone, `phone`, `string`, null)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const place = await Place.findOne({ "place_identifier": req.params.id })

        if (place) {
            let serie = "01"
            const arr = place.place_areas.toObject()

            if (arr.length > 0) {
                const last_identifier = arr[arr.length - 1]
                const next_identifier = Number(last_identifier.area_identifier) + 1
                if (next_identifier < 10) {
                    serie = "0" + next_identifier
                } else {
                    serie = next_identifier.toString()
                }
            }

            const body: object = {
                "area_identifier": serie,
                "area_name": req.body.area_name,
                "phone": req.body.phone
            }

            const result = await Place.updateOne({ "place_identifier": req.params.id }, { $push: { "place_areas": body } })

            return result.modifiedCount > 0
                ? res.status(201).json({
                    message: `Se añadió el area`,
                })
                : res.status(404).json({
                    message: `No se encontró el parque ${req.params.id}`
                })
        }

        return res.status(404).json({
            message: `No se encontró el parque ${req.params.id}`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const updateArea = async (req: Request, res: Response) => {
    let update: object = {}
    try {
        __Optional(req.body.area_name, `area_name`, `string`, null)
        req.body.area_name ? update = { "place_areas.$.area_name": req.body.area_name } : null

        __Optional(req.body.phone, `phone`, `string`, null)
        req.body.phone ? update = { "place_areas.$.phone": req.body.phone } : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Place.updateOne({ "place_identifier": req.params.id, "place_areas.area_identifier": req.params.id2 }, { $set: update })

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: "El nombre del área fué modificado",
            })
            : res.status(404).json({
                message: `No se encontró el lugar ${req.params.id} o el área ${req.params.id2}`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const removeArea = async (req: Request, res: Response) => {
    try {
        const result = await Place.updateOne({ "place_identifier": req.params.id }, { $pull: { "place_areas": { "area_identifier": req.params.id2 } } })

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: "Se eliminó el área"
            })
            : res.status(404).json({
                message: "No se encontró el área"
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}