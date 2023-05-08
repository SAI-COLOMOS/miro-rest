import { Request, Response } from "express"
import User from "../models/User"
import Agenda, { IEvent } from "../models/Agenda"
import Card, { ICard } from "../models/Card"

interface Request_body {
  enrolled_event: IEvent | null
  achieved_hours?: number
  total_hours?: number
  available_events?: object[]
}

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findOne({ 'register': req.params.id })

    return user
      ? res.status(200).json({
        message: "Listo",
        user
      })
      : res.status(400).json({
        message: `Usuario ${req.params.id} no encontrado`
      })
  } catch (error) {
    return res.status(500).json({
      message: "Ocurrió un error en el servidor",
      error: error?.toString()
    })
  }
}

export const getFeed = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = new User(req.user)
    let querySearch: { [index: string]: unknown } = { "attendance.status": { $not: { $regex: /^Concluido|Por publicar/ } } }
    if (user.role === 'Prestador') {
      querySearch["attendance.attendee_list.attendee_register"] = user.register
      querySearch["attendance.attendee_list.status"] = { $regex: /Inscrito|Asistió|Retardo|No asistió/ }
    } else querySearch = {
      ...querySearch, $or: [
        { "author_register": user.register },
        { "attendance.attendee_list.attendee_register": user.register, "attendance.attendee_list.status": 'Inscrito' }
      ]
    }

    const enrolled_events: IEvent[] = await Agenda.find(querySearch).sort({ "starting_date": "asc" })
    const responseBody: Request_body = { enrolled_event: enrolled_events.length === 0 ? null : enrolled_events[0] }

    if (user.role === 'Prestador') {
      console.log(user.register)
      const card: ICard | null = await Card.findOne({ "provider_regiister": user.register })

      const availableEvents: IEvent[] = await Agenda.find({
        "belonging_place": user.place,
        "belonging_area": user.assigned_area,
        "attendance.status": "Disponible",
        "attendance.attendee_list.attendee_register": { $not: { $regex: user.register } },
      }).sort({ "starting_date": "asc" })

      // console.log(card?.achieved_hours)
      // console.log(card?.total_hours)
      console.log(card)
      responseBody.achieved_hours = card?.achieved_hours
      responseBody.total_hours = card?.total_hours
      responseBody.available_events = availableEvents
    }

    return res.status(200).json(responseBody)
  } catch (error) {
    return res.status(500).json({
      message: `Ocurrió un error en el servidor`,
      error: error?.toString()
    })
  }
}
