import { Request, Response } from "express"
import Agenda, { AgendaInterface, AttendeeListInterface } from "../models/Agenda"
import User, { UserInterface } from '../models/User'
import { __CheckEnum, __ThrowError, __Required, __Optional } from "../middleware/ValidationControl"

export const getAttendees = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event = await Agenda.findOne({ "event_identifier": req.params.id })

    return event
      ? res.status(200).json({
        message: `Listo`,
        attendees: event.attendance.attendee_list
      })
      : res.status(400).json({
        message: `No se encontró el evento ${req.params.id}`
      })
  } catch (error) {
    return res.status(500).json({
      message: "Ocurrió un error en el servidor",
      error: error?.toString()
    })
  }
}

export const AddAttendee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": req.params.id })
    if (!event)
      return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    if (event.attendance.attendee_list.length === event.vacancy)
      __ThrowError('El evento tiene todas las vacantes ocupadas')

    const user: UserInterface = new User(req.user)

    const alreadyRegistered: AttendeeListInterface | undefined = event?.attendance.attendee_list.find((attendee: AttendeeListInterface) => user.register === attendee.attendee_register)

    if (alreadyRegistered !== undefined)
      __ThrowError('El usuario ya está inscrito')

    event.attendance.attendee_list.push({
      attendee_register: user.register,
      status: 'Inscrito'
    })

    if (event.attendance.attendee_list.length === event.vacancy)
      event.attendance.status = 'Vacantes completas'

    event.markModified('attendance.attendee_list')

    event.save()

    return res.status(201).json({
      message: `Se añadió el usuario a la lista`
    })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const CheckAttendace = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.attendee_register, `attendee_register`, `string`, null)

    const event: AgendaInterface | null = await Agenda.findOne({
      "event_identifier": req.params.id,
      "attendance.attendee_list.attendee_register": req.body.attendee_register
    })

    if (!event)
      return res.status(400).json({
        message: `No se encontró el evento ${req.params.id}`
      })

    const limitDate = new Date(event.starting_date.getTime() + event.tolerance * 60 * 1000)
    const currentDate = new Date()

    currentDate > limitDate ? req.body.status = 'Asistió' : req.body.status = 'Retardo'

    await Agenda.updateOne({ "event_identifier": req.params.id, "attendance.attendee_list.attendee_register": req.body.attendee_register }, {
      $set: {
        "attendance.attendee_list.$.status": req.body.status,
        "attendance.attendee_list.$.check_in": new Date().toISOString()
      }
    })

    return res.status(200).json({
      message: 'Se actualizó el estado de asistencia del usuario'
    })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updateAttendee = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.attendee_register, `attendee_register`, `string`, null)
    __Optional(req.body.status, `status`, `string`, ["Inscrito", "Desinscrito"])

    const result = await Agenda.updateOne({ "event_identifier": req.params.id, "attendance.attendee_list.attendee_register": req.body.attendee_register }, { $set: { "attendance.attendee_list.$.status": req.body.status } })

    return result.modifiedCount > 0
      ? res.status(200).json({
        message: `Se modificó el estado del usuario`
      })
      : res.status(400).json({
        message: `No se encontró el evento ${req.params.id} o el usuario ${req.body.attendee_register}`
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}