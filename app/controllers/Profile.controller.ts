import { Request, Response } from "express"
import User from "../models/User"
import Agenda, { AgendaInterface } from "../models/Agenda"
import Card from "../models/Card"

interface Request_body {
  message: string
  events: AgendaInterface[]
  achieved_hours?: number
  total_hours?: number
  available_events?: Array<object>
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

    const registeredEvents: AgendaInterface[] = await Agenda.find({
      "attendance.attendee_list.attendee_register": user.register,
      "attendance.status": "Disponible"
    }).sort({ "createdAt": "desc" })

    const response_body: Request_body = {
      message: "Feed lista",
      events: registeredEvents
    }

    if (user.role === "Prestador") {
      const card = await Card.findOne({ "provider_register": user.register })

      const events: AgendaInterface[] = await Agenda.find({
        "belonging_place": user.place,
        "belonging_area": user.assigned_area,
        "attendance.status": "Disponible",
        "attendance.attendee_list.attendee_register": { $not: { $regex: user.register } }
      }).sort({ "createdAt": "desc" })

      const filteredEvents: AgendaInterface[] = events.filter((event: AgendaInterface) => event.vacancy > event.attendance.attendee_list.length)

      const availableEvents: Array<object> = []

      filteredEvents.forEach((event: AgendaInterface) => {
        availableEvents.push({
          "name": event.name,
          "starting_date": event.starting_date.toISOString(),
          "place": event.place
        })
      })

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
