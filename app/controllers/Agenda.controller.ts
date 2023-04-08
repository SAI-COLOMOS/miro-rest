import { Request, Response } from 'express'
import Agenda, { AgendaInterface, AttendeeInterface } from '../models/Agenda'
import Card, { CardInterface } from '../models/Card'
import User, { UserInterface } from '../models/User'
import Environment from '../config/Environment'
import schedule from 'node-schedule'
import { mensaje, sendEmail } from '../config/Mailer'
import { __ThrowError, __Query, __Required, __Optional } from '../middleware/ValidationControl'

export const getAgenda = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Query(req.query.items, `items`, `number`)
    __Query(req.query.page, `page`, `number`)

    const currentDate = new Date()
    const user: UserInterface = new User(req.user)
    const history: boolean = Boolean(String(req.query.history).toLowerCase() === 'true')
    const avatar: boolean = Boolean(req.query.avatar)
    const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
    const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
    const filterAvatar: { avatar?: number } = avatar ? {} : { avatar: 0 }
    let filterRequest = req.query.filter ? JSON.parse(String(req.query.filter)) : {}
    filterRequest.starting_date = { $gte: currentDate }

    if (history) delete filterRequest.starting_date

    if (req.query.search)
      filterRequest = { ...filterRequest, $or: [{ "name": { $regex: req.query.search, $options: "i" } }] }

    if (user.role === 'Encargado') {
      filterRequest.belonging_area = user.assigned_area
      filterRequest.belonging_place = user.place
      filterRequest['attendance.status'] = { $not: { $regex: "Concluido" } }
    }

    if (user.role === 'Prestador') {
      filterRequest.belonging_place = user.place
      filterRequest.belonging_area = user.assigned_area
      filterRequest['attendance.status'] = { $not: { $regex: "Concluido" } }
    }

    const events: AgendaInterface[] = await Agenda.find(filterRequest, filterAvatar).sort({ "starting_date": "asc" }).limit(items).skip(page * items)
    if (events.length === 0 || user.role !== 'Prestador') return res.status(200).json({ message: 'Listo', events })

    const filteredEvents: AgendaInterface[] = events.filter((event: AgendaInterface) => {
      const list: AttendeeInterface[] = event.attendance.attendee_list
      const registered: boolean = list.some((attendee: AttendeeInterface) => attendee.attendee_register === user.register)
      return registered || event.attendance.status === 'Disponible'
    })

    return res.status(200).json({ message: "Listo", events: filteredEvents })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    if (statusCode === 500) console.log(error?.toString())
    return res.status(statusCode).json(response)
  }
}

export const getEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const avatar: boolean = Boolean(String(req.query.avatar).toLowerCase() === 'true')
    const filterAvatar: { avatar?: number } = avatar ? {} : { avatar: 0 }
    const event = await Agenda.findOne({ "event_identifier": req.params.id }, filterAvatar)
    if (!event) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    if (avatar) return res.status(200).json({ avatar: event.avatar })

    let list: number = 0
    event.attendance.attendee_list.forEach((attendee: AttendeeInterface) => {
      if (attendee.status === 'Inscrito') list++
    })

    const mutatedEvent = { ...event.toObject(), registered_users: list }

    return res.status(200).json({
      message: "Listo",
      event: mutatedEvent
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
    if (user.role === 'Encargado') {
      req.body.belonging_place = user.place
      req.body.belonging_area = user.assigned_area
    } else {
      __Required(req.body.belonging_place, `belonging_place`, `string`, null)
      __Required(req.body.belonging_area, `belonging_area`, `string`, null)
    }

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

    if (!event) res.status(500).json({ message: "No se pudo crear el evento" })

    const currentDate: Date = new Date()
    if (event.publishing_date <= currentDate) {
      event.attendance.status = 'Disponible'
      event.save()
      const users = await User.find({ "status": "Activo", "role": "Prestador" })
      const from = `"SAI" ${Environment.Mailer.email}`
      const subject = '¡Hay un evento disponible para tí!'
      const body = mensaje(`La inscripción para el evento  ${event.name} ya se encuentra habilitada.`)
      for (const user of users) {
        sendEmail(from, user.email, subject, body)
      }
    } else {
      emailNotifications(event.event_identifier, event.publishing_date.toISOString())
    }

    const time: Date = event.ending_date
    time.setHours(time.getHours() + 1)
    endEvent(event.event_identifier, event.author_name, time.toISOString())

    startingEvent(event.event_identifier, event.starting_date.toISOString())

    return res.status(201).json({ message: "Evento creado" })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const updateEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    Object.keys(req.body).forEach((key: string) => {
      if (req.body[key] === "")
        delete req.body[key]
    })

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

    if (result.modifiedCount <= 0) return res.status(400).json({ message: `No se encontró el evento ${req.params.id}` })

    const event: AgendaInterface | null = req.body.ending_date || req.body.publishing_date
      ? await Agenda.findOne({ "event_identifier": req.params.id })
      : null

    if (event && req.body.publishing_date) {
      schedule.cancelJob(event.event_identifier)
      const currentDate: Date = new Date()
      if (event.publishing_date < currentDate) {
        event.attendance.status = 'Disponible'
        event.save()
        const users = await User.find({ "status": "Activo", "role": "Prestador" })
        const from = `"SAI" ${Environment.Mailer.email}`
        const subject = '¡Hay un evento disponible para tí!'
        const body = mensaje(`La inscripción para el evento  ${event.name} empieza en una hora.`)
        for (const user of users) {
          await sendEmail(from, user.email, subject, body)
        }
      } else {
        emailNotifications(event.event_identifier, event.publishing_date.toISOString())
      }
    }

    if (event && req.body.ending_date) {
      const time: Date = event.ending_date
      time.setHours(time.getHours() + 1)
      schedule.cancelJob(`end_${event.event_identifier}`)
      endEvent(event.event_identifier, event.author_name, time.toISOString())
    }

    if (event && req.body.starting_date) {
      schedule.cancelJob(`start_${event.event_identifier}`)
      startingEvent(event.event_identifier, event.starting_date.toISOString())
    }

    return res.status(200).json({ message: `Se actualizó la información del evento ${req.params.id}` })
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
      schedule.cancelJob(`start_${req.params.id}`)

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

const emailNotifications = async (event_identifier: string, time: string): Promise<void> => {
  schedule.scheduleJob(event_identifier, time,
    async function (event_identifier: string) {
      const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": event_identifier })
      if (!event) return
      event.attendance.status = 'Disponible'
      event.save()
      const users = await User.find({ "status": "Activo", "role": "Prestador", "place": event.belonging_place, "assigned_area": event.belonging_area })
      const from = `"SAI" ${Environment.Mailer.email}`
      const subject = '¡Hay un evento disponible para tí!'
      const body = mensaje(`La inscripción para el evento  ${event.name} empieza en una hora.`)
      for (const user of users) {
        sendEmail(from, user.email, subject, body)
      }
    }.bind(null, event_identifier)
  )
}

const startingEvent = async (event_identifier: string, time: string) => {
  schedule.scheduleJob(`start_${event_identifier}`, time,
    async function (event_identifier: string) {
      const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": event_identifier })
      if (!event) return
      event.attendance.status = 'En proceso'
      event.save()
    }.bind(null, event_identifier)
  )
}

const endEvent = async (event_identifier: string, author_name: string, time: string): Promise<void> => {
  schedule.scheduleJob(`end_${event_identifier}`, time,
    async function (event_identifier: string, author_name: string) {
      const event = await Agenda.findOne({ "event_identifier": event_identifier })

      if (!event || event.attendance.status === 'Concluido' || 'Concluido por sistema') return

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