import { Request, Response } from "express"
import Agenda, { AgendaInterface } from "../models/Agenda"
import Card, { CardInterface } from "../models/Card"
import User, { UserInterface } from "../models/User"
import Environment from "../config/Environment"
import schedule from 'node-schedule'
import { mensaje, sendEmail } from "../config/Mailer"
import { __ThrowError, __Query, __Required, __Optional } from "../middleware/ValidationControl"

export const getAgenda = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Query(req.query.items, `items`, `number`)
    __Query(req.query.page, `page`, `number`)

    const currentDate = new Date()
    const user: UserInterface = new User(req.user)
    const history: boolean = Boolean(req.query.history)
    const avatar: boolean = Boolean(req.query.avatar)
    const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
    const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
    let filter_request = req.query.filter ? JSON.parse(String(req.query.filter)) : {}
    filter_request.starting_date = { $gt: currentDate }

    if (history)
      delete filter_request.starting_date

    if (req.query.search)
      filter_request = { ...filter_request, $or: [{ "name": { $regex: req.query.search, $options: "i" } }] }

    if (user.role === 'Encargado') {
      filter_request.belonging_area = user.assigned_area
      filter_request.belonging_place = user.place
    }

    if (user.role === 'Prestador') {
      filter_request.belonging_place = user.place
      filter_request.belonging_area = user.assigned_area
      filter_request['attendance.status'] = 'Disponible'
    }

    const events: AgendaInterface[] = await Agenda.find(filter_request).sort({ "starting_date": "desc" }).limit(items).skip(page * items)
    if (events.length === 0) return res.status(200).json({ message: 'Listo', events })

    const result: object[] = []
    if (avatar) {
      events.forEach((event: AgendaInterface) => {
        if (event.avatar) result.push({ avatar: event.avatar, event_identifier: event.event_identifier })
      })
    } else {
      events.forEach((event: AgendaInterface) => {
        const { avatar: _, ...objEvent } = event.toObject()
        result.push(objEvent)
      })
    }
    return res.status(200).json({ message: "Listo", events: result })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    if (statusCode === 500) console.log(error?.toString())
    return res.status(statusCode).json(response)
  }
}

export const getEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const avatar: boolean = Boolean(req.query.avatar)
    const event = await Agenda.findOne({ "event_identifier": req.params.id })

    if (avatar && event) return res.status(200).json({ avatar: event.avatar })

    return event
      ? res.status(200).json({
        message: "Listo",
        event: event
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

export const createEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user: UserInterface = new User(req.user)
    req.body.belonging_place = user.place
    req.body.belonging_area = user.assigned_area
    req.body.author_register = user.register
    req.body.author_name = `${user.first_name} ${user.first_last_name}${user.second_last_name ? ` ${user.second_last_name}` : ''}`

    __Required(req.body.name, `name`, `string`, null)
    __Required(req.body.tolerance, `tolerance`, `number`, null)
    __Required(req.body.description, `description`, `string`, null)
    __Required(req.body.offered_hours, `offered_hours`, `number`, null)
    __Required(req.body.vacancy, `vacancy`, `number`, null)
    __Required(req.body.starting_date, `starting_date`, `string`, null, true)
    __Required(req.body.ending_date, `ending_date`, `string`, null, true)
    __Required(req.body.publishing_date, `publishing_date`, `string`, null, true)
    __Required(req.body.place, `place`, `string`, null)
    __Optional(req.body.avatar, `avatar`, `string`, null)

    const event: AgendaInterface = await new Agenda(req.body).save()
    let time: Date

    if (event) {
      time = event.publishing_date
      time.setHours(time.getHours() - 1)
      emailNotifications(event.event_identifier, '2023-04-04T00:16:17.545Z', event.name)

      time = event.ending_date
      time.setHours(time.getHours() + 1)
      endEvent(event.event_identifier, event.author_name, time.toISOString())
    }

    return event
      ? res.status(201).json({
        message: "Evento creado",
      })
      : res.status(500).json({
        message: "No se pudo crear el evento"
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updateEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (req.body.event_identifier)
      __ThrowError("El campo 'event_identifier' no se puede modificar")

    if (req.body.author_register)
      __ThrowError("El campo 'author_register' no se puede modificar")

    if (req.body.belonging_area)
      __ThrowError("El campo 'belonging_area' no se puede modificar")

    if (req.body.belonging_place)
      __ThrowError("El campo 'belonging_place' no se puede modificar")

    if (req.body.attendance)
      __ThrowError("El campo 'attendance' no se puede modificar desde éste endpoint")

    __Optional(req.body.is_template, `is_template`, `boolean`, null)
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

    const user: UserInterface = new User(req.user)
    req.body.modifier_register = user.register

    const result = await Agenda.updateOne({ "event_identifier": req.params.id }, req.body)

    if (result.modifiedCount > 0) {
      const event: AgendaInterface | null = req.body.ending_date || req.body.publishing_date
        ? await Agenda.findOne({ "event_identifier": req.params.id })
        : null

      let time: Date

      if (event && req.body.publishing_date) {
        time = event.publishing_date
        time.setHours(time.getHours() - 1)
        schedule.cancelJob(event.event_identifier)
        emailNotifications(event.event_identifier, time.toISOString(), event.name)
      }

      if (event && req.body.ending_date) {
        time = event.ending_date
        time.setHours(time.getHours() + 1)
        schedule.cancelJob(`end_${event.event_identifier}`)
        endEvent(event.event_identifier, event.author_name, time.toISOString())
      }

      return res.status(200).json({
        message: `Se actualizó la información del evento ${req.params.id}`
      })
    }

    return res.status(400).json({
      message: `No se encontró el evento ${req.params.id}`
    })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updateEventStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.status, `status`, `string`, ["Disponible", "Concluido"])

    const user: UserInterface = new User(req.user)
    req.body.modifier_register = user.register

    const event = await Agenda.findOne({ "event_identifier": req.params.id })

    if (!event) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    event.attendance.status = req.body.status

    if (event.attendance.status === 'Disponible') {
      event.save()
      return res.status(200).json({ message: `Se actualizó el status del evento ${req.params.id}` })
    }

    const currentDate: Date = new Date()
    for (const [index, attendee] of event.attendance.attendee_list.entries()) {
      if (attendee.status === 'Inscrito') {
        event.attendance.attendee_list[index].status = 'No asistió'
        continue
      }

      const card: CardInterface | null = await Card.findOne({ "provider_register": attendee.attendee_register })
      if (!card) continue

      card.activities.push({
        "activity_name": event.name,
        "hours": event.offered_hours,
        "responsible_register": event.author_register,
        "assignation_date": currentDate,
        "responsible_name": event.author_name
      })

      card.markModified('activities')
      card.save()
      event.save()
    }

    return res.status(200).json({ message: `Se actualizó el status del evento ${req.params.id}` })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const deleteEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await Agenda.deleteOne({ 'event_identifier': req.params.id })

    if (result.deletedCount !== 0) {
      schedule.cancelJob(req.params.id)
      schedule.cancelJob(`end_${req.params.id}`)

      return res.status(200).json({
        message: "Evento eliminado"
      })
    }

    return res.status(400).json({
      message: `No se encontró el evento ${req.params.id}`
    })
  } catch (error) {
    return res.status(500).json({
      message: "Ocurrió un error en el servidor",
      error: error?.toString()
    })
  }
}

const emailNotifications = async (event_identifier: string, time: string, event_name: string): Promise<void> => {
  schedule.scheduleJob(event_identifier, time,
    async function (name: string) {
      const users = await User.find({ "status": "Activo", "role": "Prestador" })
      const from = `"SAI" ${Environment.Mailer.email}`
      const subject = "Hay un evento pronto a estar disponible!"
      const body = mensaje(`La inscripción para el evento  ${name} empieza en una hora.`)
      for (const user of users) {
        console.log(user.email)
        await sendEmail(from, user.email, subject, body)
      }
    }.bind(null, event_name)
  )
}

const endEvent = async (event_identifier: string, author_name: string, time: string): Promise<void> => {
  schedule.scheduleJob(`end_${event_identifier}`, time,
    async function (event_identifier: string, author_name: string) {
      const event = await Agenda.findOne({ "event_identifier": event_identifier })

      if (!event || event.attendance.status === 'Concluido') return

      event.attendance.status = 'Concluido por sistema'
      const currentDate = new Date()
      for (const [index, attendee] of event.attendance.attendee_list.entries()) {
        if (attendee.status === 'Inscrito') {
          event.attendance.attendee_list[index].status = 'No asistió'
          continue
        }

        const card: CardInterface | null = await Card.findOne({ "provider_register": attendee.attendee_register })
        if (!card) continue

        card.activities.push({
          "activity_name": event.name,
          "hours": event.offered_hours,
          "responsible_register": event.author_register,
          "assignation_date": currentDate,
          "responsible_name": author_name
        })

        card.markModified('activities')
        card.save()
        event.save()
      }
    }.bind(null, event_identifier, author_name)
  )
}