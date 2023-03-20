import { Request, Response } from "express"
import Place, { AreaInterface, PlaceInterface } from "../models/Place"
import { __Required, __Optional, __Query } from "../middleware/ValidationControl"

export const getAreas = async (req: Request, res: Response): Promise<Response> => {
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
        let filter_request = req.query.filter ? JSON.parse(String(req.query.filter)) : null

        if (filter_request)
            Object.keys(filter_request).forEach((key: string) => {
                if (key === "municipality")
                    filter_request.municipality = { $regex: filter_request.municipality, $options: "i" }

                if (key === "colony")
                    filter_request.colony = { $regex: filter_request.colony, $options: "i" }
            })

        if (req.query.search)
            filter_request = {
                ...filter_request,
                $or: [{ "place_name": { $regex: req.query.search, $options: "i" } }]
            }

        const places = await Place.find(filter_request).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

        let areas: Array<AreaInterface> = []

        if (places.length > 0)
            places.forEach((place: PlaceInterface) => areas.push(...place.place_areas))

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

export const getAreasFromOnePlace = async (req: Request, res: Response): Promise<Response> => {
    try {
        const place = await Place.findOne({ "place_identifier": req.params.id })

        return place
            ? res.status(200).json({
                message: "Listo",
                areas: place.place_areas
            })
            : res.status(400).json({
                message: `No se encontró el parque ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}

export const getArea = async (req: Request, res: Response): Promise<Response> => {
    try {
        const place = await Place.findOne({ "place_identifier": req.params.id })

        let area
        if (place)
            place.place_areas.forEach((area_iterated: AreaInterface) => {
                if (area_iterated.area_identifier === req.params.id2) area = area_iterated
            })

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

export const addArea = async (req: Request, res: Response): Promise<Response> => {
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

            if (result.modifiedCount > 0)
                return res.status(201).json({
                    message: `Se añadió el area`,
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

export const updateArea = async (req: Request, res: Response): Promise<Response> => {
    try {
        __Optional(req.body.area_name, `area_name`, `string`, null)

        __Optional(req.body.phone, `phone`, `string`, null)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Place.updateOne({ "place_identifier": req.params.id, "place_areas.area_identifier": req.params.id2 },
            {
                $set: {
                    "place_areas.$.area_name": req.body.area_name,
                    "place_areas.$.phone": req.body.phone
                }
            })

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

export const removeArea = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await Place.updateOne({ "place_identifier": req.params.id },
            { $pull: { "place_areas": { "area_identifier": req.params.id2 } } })

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