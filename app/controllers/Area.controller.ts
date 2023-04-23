import { Request, Response } from "express"
import Place, { IArea, IPlace } from "../models/Place"
import { __Required, __Optional, __Query } from "../middleware/ValidationControl"

export const getAreas = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Query(req.query.items, `items`, `number`)
    __Query(req.query.page, `page`, `number`)

    const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
    const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
    let filterRequest = req.query.filter ? JSON.parse(String(req.query.filter)) : null

    if (filterRequest)
      Object.keys(filterRequest).forEach((key: string) => {
        if (key === "municipality")
          filterRequest.municipality = { $regex: filterRequest.municipality, $options: "i" }

        if (key === "colony")
          filterRequest.colony = { $regex: filterRequest.colony, $options: "i" }
      })

    if (req.query.search)
      filterRequest = { ...filterRequest, $or: [{ "place_name": { $regex: req.query.search, $options: "i" } }] }

    const places = await Place.find(filterRequest).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

    const areas: Array<IArea> = []

    if (places.length > 0)
      places.forEach((place: IPlace) => areas.push(...place.place_areas))

    return res.status(200).json({
      message: 'Listo',
      areas
    })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
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

    const area: IArea | undefined = place?.place_areas.find((area_iterated: IArea) => area_iterated.area_identifier === req.params.id2)

    return area
      ? res.status(200).json({
        message: "Listo",
        area
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
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updateArea = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Optional(req.body.area_name, `area_name`, `string`, null)
    __Optional(req.body.phone, `phone`, `string`, null)

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
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
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