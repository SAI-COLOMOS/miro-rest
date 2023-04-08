import { Request, Response } from "express"
import User from "../models/User"
import Agenda, { AgendaInterface } from "../models/Agenda"
import Card from "../models/Card"

interface Request_body {
  message: string
  enrolled_events: AgendaInterface[]
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

    const enrolled_events: AgendaInterface[] = await Agenda.find({
      "attendance.attendee_list.attendee_register": user.register,
      "starting_date": { $gte: currentDate },
      "attendance.status": { $not: { $regex: 'Concluido' } }
    }, { avatar: 0 }).sort({ "starting_date": "asc" })

    const response_body: Request_body = { message: "Feed lista", enrolled_events }

    if (user.role === "Prestador") {
      const card = await Card.findOne({ "provider_register": user.register })

      const availableEvents: AgendaInterface[] = await Agenda.find({
        "belonging_place": user.place,
        "belonging_area": user.assigned_area,
        "attendance.status": "Disponible",
        "attendance.attendee_list.attendee_register": { $not: { $regex: user.register } },
        "starting_date": { $gte: currentDate }
      }, { avatar: 0 }).sort({ "starting_date": "asc" })

      response_body.achieved_hours = card?.achieved_hours
      response_body.total_hours = card?.total_hours
      response_body.available_events = availableEvents
    }

    return res.status(200).json(response_body)

  } catch (error) {
    return res.status(500).json({
      message: `Ocurrió un error en el servidor`,
      error: error?.toString()
    })
  }
}
