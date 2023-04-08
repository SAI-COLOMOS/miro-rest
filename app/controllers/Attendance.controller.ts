import { Request, Response } from 'express'
import Agenda, { AgendaInterface, AttendeeInterface } from '../models/Agenda'
import User, { UserInterface } from '../models/User'
import { __CheckEnum, __ThrowError, __Required, __Optional } from '../middleware/ValidationControl'

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

export const addAttendee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": req.params.id })
    if (!event) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    let list: number = 0
    event.attendance.attendee_list.forEach((attendee: AttendeeInterface) => {
      if (attendee.status === 'Inscrito') list++
    })
    if (list === event.vacancy)
      __ThrowError('El evento tiene todas las vacantes ocupadas')

    const user: UserInterface = new User(req.user)

    const registeredIndex: number = event.attendance.attendee_list.findIndex((attendee: AttendeeInterface) => user.register === attendee.attendee_register)

    if (registeredIndex !== -1 && event.attendance.attendee_list[registeredIndex].status === 'Inscrito')
      __ThrowError('El usuario ya está inscrito')

    if (registeredIndex === -1)
      event.attendance.attendee_list.push({
        attendee_register: user.register,
        first_name: user.first_name,
        first_last_name: user.first_last_name,
        second_last_name: user.second_last_name,
        status: 'Inscrito'
      })
    else {
      event.attendance.attendee_list[registeredIndex].status = 'Inscrito'
      event.attendance.attendee_list[registeredIndex].enrollment_date = new Date()
    }

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

export const addSeveralAttendees = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": req.params.id })
    if (!event) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    const attendeeList: { register: string }[] = req.body.attendees

    for (const attendeeInList of attendeeList) {
      const index: number = event.attendance.attendee_list.findIndex((attendee: AttendeeInterface) => attendeeInList.register === attendee.attendee_register)

      if (index !== -1)
        event.attendance.attendee_list[index].status = 'Inscrito'
      else {
        const user: UserInterface | null = await User.findOne({ 'register': attendeeInList.register })
        if (!user) continue
        event.attendance.attendee_list.push({
          attendee_register: attendeeInList.register,
          first_name: user.first_name,
          first_last_name: user.first_last_name,
          second_last_name: user.second_last_name,
          status: 'Inscrito'
        })
      }
    }

    event.markModified('attendance.attendee_list')
    event.save()

    return res.status(201).json({ message: 'Se agregaron los prestadores que no estaban inscritos a la lista a la lista' })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const removeAttendee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": req.params.id })
    if (!event) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    const user: UserInterface = new User(req.user)

    const attendee_index: number = event.attendance.attendee_list.findIndex((attendee: AttendeeInterface) => attendee.attendee_register === user.register)

    if (attendee_index === -1) return res.status(400).json({ message: `El usuario no está inscrito al evento ${req.params.id}` })

    const limitDate: Date = new Date(event.attendance.attendee_list[attendee_index].enrollment_date!.getTime() + (6 * 1000 * 60 * 60))
    if (limitDate < new Date()) return res.status(400).json({ message: 'Ya no es posible desinscribirse del evento' })

    event.attendance.attendee_list[attendee_index].status = 'Desinscrito'
    event.markModified('attendance.attendee_list')
    event.save()

    return res.status(200).json({ message: 'Se desinscribió el usuario del evento' })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const checkAttendace = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.attendee_register, `attendee_register`, `string`, null)

    const event: AgendaInterface | null = await Agenda.findOne({
      "event_identifier": req.params.id,
      "attendance.attendee_list": {
        $elemMatch: {
          "attendee_register": req.body.attendee_register,
          "status": 'Inscrito'
        }
      }
    })

    if (!event)
      return res.status(400).json({ message: `No se encontró el evento ${req.params.id} o el usuario ${req.body.attendee_register} no está inscrito` })

    const limitDate = new Date(event.starting_date.getTime() + (event.tolerance * 60 * 1000))
    const currentDate = new Date()

    currentDate < limitDate ? req.body.status = 'Asistió' : req.body.status = 'Retardo'

    await Agenda.updateOne({ "event_identifier": req.params.id, "attendance.attendee_list.attendee_register": req.body.attendee_register }, {
      $set: {
        "attendance.attendee_list.$.status": req.body.status,
        "attendance.attendee_list.$.check_in": currentDate.toISOString()
      }
    })

    return res.status(200).json({ message: 'Se actualizó el estado de asistencia del usuario' })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updateAttendee = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.attendee_register, `attendee_register`, `string`, null)
    __Required(req.body.status, `status`, `string`, ["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"])

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