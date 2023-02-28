import { Request, Response } from "express"
import Place from "../models/Place"
import { __Required, __Optional, __Query } from "../middleware/ValidationControl"

export const getAreas = async (req: Request, res: Response) => {
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
                    $or: [{ "place_name": { $regex: '.*' + req.query.search + '.*' } }]
                }
                : JSON.parse(String(req.query.filter))
            : null

        const places: any = await Place.find(filter).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

        let areas: Array<any> = []

        if (places.length > 0) {
            for (let place of places) {
                place.place_areas.length > 0 ? areas = [...areas, ...place.place_areas] : null
            }
        }

        return res.status(200).json({
            message: 'Listo',
            areas
        })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}

export const getArea = async (req: Request, res: Response) => {
    try {
        const place: any = await Place.findOne({ "place_identifier": req.params.id })

        let area
        if (place) {
            for (let area_iterated of place.place_areas) {
                if (area_iterated.area_identifier === req.params.id2) {
                    area = area_iterated
                }
            }
        }

        return area
            ? res.status(200).json({
                message: "Listo",
                area: area
            })
            : res.status(400).json({
                message: `No se encontró el lugar ${req.params.id} o el área ${req.params.id2}`
            })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}

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
            const areas = place.place_areas

            if (areas.length > 0) {
                const last_identifier = areas[areas.length - 1].area_identifier

                const next_identifier = Number(last_identifier) + 1

                next_identifier < 10
                    ? serie = "0" + next_identifier
                    : serie = next_identifier.toString()
            }

            const result = await Place.updateOne({ "place_identifier": req.params.id }, {
                $push: {
                    "place_areas": {
                        "area_identifier": serie,
                        "area_name": req.body.area_name,
                        "phone": req.body.phone
                    }
                }
            })

            return result.modifiedCount > 0
                ? res.status(201).json({
                    message: `Se añadió el area`,
                })
                : res.status(400).json({
                    message: `No se encontró el parque ${req.params.id}`
                })
        }

        return res.status(400).json({
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
                message: "El área fue modificado",
            })
            : res.status(400).json({
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
            : res.status(400).json({
                message: "No se encontró el área"
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}