import { Request, Response } from "express"
import Place from "../models/Place"
import { __ThrowError, __Query, __Required, __Optional } from "../middleware/ValidationControl"

export const getPlaces = async (req: Request, res: Response) => {
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
                $or: [
                    { "place_name": { $regex: req.query.search, $options: "i" } }
                ]
            }

        const places = await Place.find(filter_request).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

        return res.status(200).json({
            message: 'Listo',
            places: places
        })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}

export const getPlace = async (req: Request, res: Response) => {
    try {
        const place = await Place.findOne({ "place_identifier": req.params.id })

        return place
            ? res.status(200).json({
                message: "Listo",
                place
            })
            : res.status(400).json({
                message: `No se encontró el parque ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const postPlace = async (req: Request, res: Response) => {
    try {
        __Required(req.body.place_name, `place_name`, `string`, null)

        __Required(req.body.municipality, `municipality`, `string`, null)

        __Required(req.body.street, `street`, `string`, null)

        __Required(req.body.postal_code, `postal_code`, `string`, null)

        __Required(req.body.exterior_number, `exterior_number`, `string`, null)

        __Required(req.body.colony, `colony`, `string`, null)

        __Required(req.body.phone, `phone`, `string`, null)

        __Optional(req.body.reference, `reference`, `string`, null)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const place = await new Place(req.body).save()

        return place
            ? res.status(201).json({
                message: `Parque añadido`,
            })
            : res.status(500).json({
                message: `No se pudo crear el parque`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const updatePlace = async (req: Request, res: Response) => {
    try {
        __Optional(req.body.place_name, `place_name`, `string`, null)

        __Optional(req.body.municipality, `municipality`, `string`, null)

        __Optional(req.body.street, `street`, `string`, null)

        __Optional(req.body.postal_code, `postal_code`, `string`, null)

        __Optional(req.body.exterior_number, `exterior_number`, `string`, null)

        __Optional(req.body.colony, `colony`, `string`, null)

        __Optional(req.body.phone, `phone`, `string`, null)

        __Optional(req.body.reference, `reference`, `string`, null)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Place.updateOne({ "place_identifier": req.params.id }, req.body)

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: "Se actualizó la información del lugar"
            })
            : res.status(400).json({
                message: `No se encontró el lugar ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const deletePlace = async (req: Request, res: Response) => {
    try {
        const result = await Place.deleteOne({ "place_identifier": req.params.id })

        return result.deletedCount !== 0
            ? res.status(200).json({
                message: "El lugar fue eliminado"
            })
            : res.status(400).json({
                message: `No se encontró el lugar ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}