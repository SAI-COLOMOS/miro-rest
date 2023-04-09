import { Request, Response } from "express"
import User from "../models/User"
import Agenda, { AgendaInterface } from "../models/Agenda"
import Card from "../models/Card"

interface Request_body {
  enrolled_event: AgendaInterface | null
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
    const currentDate = new Date()
    let querySearch: { [index: string]: unknown } = { "attendance.status": { $not: { $regex: 'Concluido' } } }
    if (user.register === 'Prestador') querySearch["attendance.attendee_list.attendee_register"] = user.register
    else querySearch = {
      ...querySearch, $or: [
        { "author_register": user.register },
        { "attendance.attendee_list.attendee_register": user.register }
      ]
    }

    const enrolled_events: AgendaInterface[] = await Agenda.find(querySearch, { avatar: 0 }).sort({ "starting_date": "asc" })

    const responseBody: Request_body = { enrolled_event: enrolled_events.length === 0 ? null : enrolled_events[0] }

    if (user.role === 'Prestador') {
      const card = await Card.findOne({ "provider_register": user.register })

      const availableEvents: AgendaInterface[] = await Agenda.find({
        "belonging_place": user.place,
        "belonging_area": user.assigned_area,
        "attendance.status": "Disponible",
        "attendance.attendee_list.attendee_register": { $not: { $regex: user.register } },
        "starting_date": { $gte: currentDate }
      }, { avatar: 0 }).sort({ "starting_date": "asc" })

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
