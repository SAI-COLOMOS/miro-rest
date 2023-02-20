import { Request, Response } from "express"
import Place from "../models/Place"
import { __ThrowError } from "../middleware/ValidationControl"

export const getPlaces = async (req: Request, res: Response) => {
    try {
        !req.body.items ? null
            : typeof req.body.items === "number" ? null
                : __ThrowError("El campo 'items' debe ser tipo 'number'")

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
                    $or: [{ "place_name": { $regex: '.*' + req.body.search + '.*' } }]
                }
                : req.body.filter
            : null

        const places = await Place.find(filter).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

        return places.length > 0
            ? res.status(200).json({
                message: 'Listo',
                places: places
            })
            : res.status(404).json({
                message: 'Sin resultados'
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
            : res.status(404).json({
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
        req.body.place_name ? null : __ThrowError(`El campo 'place_name' es obligatorio`)
        typeof req.body.place_name === 'string' ? null : __ThrowError(`El campo 'place_name' debe ser tipo 'string'`)
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
                place: place
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
        !req.body.place_name ? null
            : typeof req.body.place_name === 'string' ? null
                : __ThrowError(`El campo 'place_name' debe ser tipo 'string'`)
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
            : res.status(404).json({
                message: `No se encontró el lugar ${req.params.id}`
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
        !req.body.area_name ? null
            : typeof req.body.area_name === 'string' ? null
                : __ThrowError(`El campo 'area_name' debe ser tipo 'string'`)
        req.body.area_name ? update = { "place_areas.$.area_name": req.body.area_name } : null
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

export const addArea = async (req: Request, res: Response) => {
    try {
        req.body.area_name ? null : __ThrowError(`El campo 'area_name' es obligatorio`)
        typeof req.body.area_name === 'string' ? null : __ThrowError(`El campo 'area_name' debe ser tipo 'string'`)
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
                "area_name": req.body.area_name
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

export const removeArea = async (req: Request, res: Response) => {
    try {
        req.body.area_identifier ? null : __ThrowError(`El campo 'area_identifier' es obligatorio`)
        typeof req.body.area_identifier === 'string' ? null : __ThrowError(`El campo 'area_identifier' debe ser tipo 'string'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await Place.updateOne({ "place_identifier": req.params.id }, { $pull: { "place_areas": { "area_identifier": req.body.area_identifier } } })

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