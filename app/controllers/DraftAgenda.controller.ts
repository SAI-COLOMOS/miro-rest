import { Request, Response } from 'express'
import Agenda, { IEvent } from '../models/Agenda'
import User, { IUser } from '../models/User'
import { __Query, __Optional, __ThrowError } from '../middleware/ValidationControl'

export const getDrafts = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Query(req.query.items, `items`, `number`)
    __Query(req.query.page, `page`, `number`)

    const user: IUser = new User(req.user)
    const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
    const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
    let filterRequest = req.query.filter ? JSON.parse(String(req.query.filter)) : {}

    if (filterRequest.createdAt) filterRequest.createdAt = { $gte: new Date(filterRequest.createdAt) }

    if (req.query.search)
      filterRequest = { ...filterRequest, $or: [{ "name": { $regex: req.query.search, $options: "i" } }] }

    if (user.role === 'Encargado') {
      filterRequest.belonging_area = user.assigned_area
      filterRequest.belonging_place = user.place
    }

    filterRequest['attendance.status'] = 'Borrador'

    const draftEvents: IEvent[] = await Agenda.find(filterRequest, { "avatar": 0 }).sort({ "createdAt": "asc" }).limit(items).skip(page * items)

    return res.status(200).json({ message: 'Listo', draftEvents })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    if (statusCode === 500) console.log(error?.toString())
    return res.status(statusCode).json(response)
  }
}

export const getDraft = async (req: Request, res: Response): Promise<Response> => {
  try {
    const avatar: boolean = Boolean(String(req.query.avatar).toLowerCase() === 'true')
    const filterAvatar: { avatar?: number } = avatar ? {} : { avatar: 0 }

    const draftEvent = await Agenda.findOne({ "event_identifier": req.params.id }, filterAvatar)

    if (!draftEvent) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    if (avatar) return res.status(200).json({ avatar: draftEvent.avatar })

    return res.status(200).json({ message: 'Listo', draftEvent })
  } catch (error) {
    return res.status(500).json({
      message: "Ocurrió un error en el servidor",
      error: error?.toString()
    })
  }
}

export const updateDraft = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (req.body.event_identifier)
      __ThrowError("El campo 'event_identifier' no se puede modificar")

    if (req.body.author_register)
      __ThrowError("El campo 'author_register' no se puede modificar")

    if (req.body.author_name)
      __ThrowError("El campo 'author_name' no se puede modificar")

    if (req.body.attendance)
      __ThrowError("El campo 'attendance' no se puede modificar desde éste endpoint")

    __Optional(req.body.belonging_area, `belonging_area`, `string`, null)
    __Optional(req.body.belonging_place, `belonging_place`, `string`, null)
    __Optional(req.body.tolerance, `tolerance`, `number`, null)
    __Optional(req.body.name, `name`, `string`, null)
    __Optional(req.body.description, `description`, `string`, null)
    __Optional(req.body.offered_hours, `offered_hours`, `number`, null)
    __Optional(req.body.penalty_hours, `penalty_hours`, `number`, null)
    __Optional(req.body.vacancy, `vacancy`, `number`, null)
    __Optional(req.body.place, `place`, `string`, null)
    __Optional(req.body.publishing_date, `publishing_date`, `string`, null, true)
    __Optional(req.body.starting_date, `starting_date`, `string`, null, true)
    __Optional(req.body.ending_date, `ending_date`, `string`, null, true)
    __Optional(req.body.avatar, `avatar`, `string`, null)

    const user: IUser = new User(req.user)
    req.body.modifier_register = user.register

    const result = await Agenda.updateOne({ "event_identifier": req.params.id }, req.body)

    if (result.modifiedCount <= 0) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    return res.status(200).json({ message: `Se actualizó la información del evento ${req.params.id}` })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}