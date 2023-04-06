import { Request, Response } from "express"
import { __Query, __Optional, __Required } from "../middleware/ValidationControl"
import School from "../models/School"

export const getSchools = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Query(req.query.items, `items`, `number`)
    __Query(req.query.page, `page`, `number`)

    const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
    const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
    let filterRequest = req.query.filter ? JSON.parse(String(req.query.filter)) : null

    if (filterRequest)
      Object.keys(filterRequest).forEach((key: string) => {
        if (key === 'municipality')
          filterRequest.municipality = { $regex: filterRequest.municipality, $options: "i" }

        if (key === 'colony')
          filterRequest.colony = { $regex: filterRequest.colony, $options: "i" }
      })

    if (req.query.search)
      filterRequest = { ...filterRequest, $or: [{ "school_name": { $regex: req.query.search, $options: "i" } }] }

    const schools = await School.find(filterRequest).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

    return res.status(200).json({
      message: 'Listo',
      schools
    })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const getSchool = async (req: Request, res: Response): Promise<Response> => {
  try {
    const school = await School.findOne({ "school_identifier": req.params.id })

    return school
      ? res.status(200).json({
        message: "Listo",
        school
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

export const postSchool = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.school_name, `school_name`, `string`, null)
    __Required(req.body.municipality, `municipality`, `string`, null)
    __Required(req.body.street, `street`, `string`, null)
    __Required(req.body.postal_code, `postal_code`, `string`, null)
    __Required(req.body.exterior_number, `exterior_number`, `string`, null)
    __Required(req.body.colony, `colony`, `string`, null)
    __Required(req.body.phone, `phone`, `string`, null)
    __Optional(req.body.reference, `reference`, `string`, null)

    const school = await new School(req.body).save()

    return school
      ? res.status(201).json({
        message: `Escuela añadida`,
      })
      : res.status(500).json({
        message: `No se pudo crear la escuela`
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updateSchool = async (req: Request, res: Response): Promise<Response> => {
  try {
    Object.keys(req.body).forEach((key: string) => {
      if (req.body[key] === "")
        delete req.body[key]
    })

    __Optional(req.body.school_name, `school_name`, `string`, null)
    __Optional(req.body.municipality, `municipality`, `string`, null)
    __Optional(req.body.street, `street`, `string`, null)
    __Optional(req.body.postal_code, `postal_code`, `string`, null)
    __Optional(req.body.exterior_number, `exterior_number`, `string`, null)
    __Optional(req.body.colony, `colony`, `string`, null)
    __Optional(req.body.phone, `phone`, `string`, null)
    __Optional(req.body.reference, `reference`, `string`, null)

    const result = await School.updateOne({ "school_identifier": req.params.id }, req.body)

    return result.modifiedCount > 0
      ? res.status(200).json({
        message: "Se actualizó la información de la escuela"
      })
      : res.status(400).json({
        message: `No se encontró la escuela ${req.params.id}`
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const deleteSchool = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await School.deleteOne({ "school_identifier": req.params.id })

    return result.deletedCount !== 0
      ? res.status(200).json({
        message: "La escuela fue eliminada"
      })
      : res.status(400).json({
        message: `No se encontró la escuela ${req.params.id}`
      })
  } catch (error) {
    return res.status(500).json({
      message: `Ocurrió un error en el servidor`,
      error: error?.toString()
    })
  }
}