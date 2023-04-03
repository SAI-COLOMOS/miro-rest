import { Request, Response } from "express"
import Place, { PlaceInterface } from "../models/Place"
import { __ThrowError, __Query, __Required, __Optional } from "../middleware/ValidationControl"

export const getPlaces = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Query(req.query.items, `items`, `number`)
    __Query(req.query.page, `page`, `number`)

    const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
    const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
    const avatar: boolean = Boolean(req.query.avatar)
    let filter_request = req.query.filter ? JSON.parse(String(req.query.filter)) : null

    if (filter_request)
      Object.keys(filter_request).forEach((key: string) => {
        if (key === "municipality")
          filter_request.municipality = { $regex: filter_request.municipality, $options: "i" }

        if (key === "colony")
          filter_request.colony = { $regex: filter_request.colony, $options: "i" }
      })

    if (req.query.search)
      filter_request = { ...filter_request, $or: [{ "place_name": { $regex: req.query.search, $options: "i" } }] }

    const places: PlaceInterface[] = await Place.find(filter_request).sort({ "createdAt": "desc" }).limit(items).skip(page * items)
    if (places.length === 0) return res.status(200).json({ message: 'Listo', places })

    const result: object[] = []
    if (avatar) {
      places.forEach((place: PlaceInterface) => {
        if (place.avatar) result.push({ avatar: place.avatar, place_identifier: place.place_identifier })
      })
    } else {
      places.forEach((place: PlaceInterface) => {
        const { avatar: _, ...objPlace } = place.toObject()
        result.push(objPlace)
      })
    }
    return res.status(200).json({ message: 'Listo', places: result })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const getPlace = async (req: Request, res: Response): Promise<Response> => {
  try {
    const avatar: boolean = Boolean(req.query.avatar)
    const place = await Place.findOne({ "place_identifier": req.params.id })

    if (avatar && place) return res.status(200).json({ avatar: place.avatar })

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

export const postPlace = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.place_name, `place_name`, `string`, null)
    __Required(req.body.municipality, `municipality`, `string`, null)
    __Required(req.body.street, `street`, `string`, null)
    __Required(req.body.postal_code, `postal_code`, `string`, null)
    __Required(req.body.exterior_number, `exterior_number`, `string`, null)
    __Required(req.body.colony, `colony`, `string`, null)
    __Required(req.body.phone, `phone`, `string`, null)
    __Optional(req.body.reference, `reference`, `string`, null)

    const place = await new Place(req.body).save()

    return place
      ? res.status(201).json({
        message: `Parque añadido`,
      })
      : res.status(500).json({
        message: `No se pudo crear el parque`
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updatePlace = async (req: Request, res: Response): Promise<Response> => {
  try {
    Object.keys(req.body).forEach((key: string) => {
      if (req.body[key] === "")
        delete req.body[key]
    })

    __Optional(req.body.place_name, `place_name`, `string`, null)
    __Optional(req.body.municipality, `municipality`, `string`, null)
    __Optional(req.body.street, `street`, `string`, null)
    __Optional(req.body.postal_code, `postal_code`, `string`, null)
    __Optional(req.body.exterior_number, `exterior_number`, `string`, null)
    __Optional(req.body.colony, `colony`, `string`, null)
    __Optional(req.body.phone, `phone`, `string`, null)
    __Optional(req.body.reference, `reference`, `string`, null)

    const result = await Place.updateOne({ "place_identifier": req.params.id }, req.body)

    return result.modifiedCount > 0
      ? res.status(200).json({
        message: "Se actualizó la información del lugar"
      })
      : res.status(400).json({
        message: `No se encontró el lugar ${req.params.id}`
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const deletePlace = async (req: Request, res: Response): Promise<Response> => {
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