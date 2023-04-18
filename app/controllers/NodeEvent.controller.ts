import Agenda, { AgendaInterface } from '../models/Agenda'
import schedule from 'node-schedule'
import Environment from '../config/Environment'
import User from '../models/User'
import { mensaje, sendEmail } from '../config/Mailer'
import { addHoursToSeveral } from './Card.controller'

export const publishEvent = async (event_identifier: string, time: string): Promise<void> => {
  schedule.scheduleJob(event_identifier, time,
    async function (event_identifier: string) {
      const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": event_identifier })
      if (!event) return
      event.attendance.status = 'Disponible'
      event.has_been_published = true
      await event.save()
      const users = await User.find({ "status": "Activo", "role": "Prestador", "place": event.belonging_place, "assigned_area": event.belonging_area })
      const from = `"SAI" ${Environment.Mailer.email}`
      const subject = '¡Hay un evento disponible para tí!'
      const body = mensaje(`La inscripción para el evento  ${event.name} ya comenzó.`)
      for (const user of users) {
        sendEmail(from, user.email, subject, body)
      }
    }.bind(null, event_identifier)
  )
}

export const startEvent = async (event_identifier: string, time: string) => {
  schedule.scheduleJob(`start_${event_identifier}`, time,
    async function (event_identifier: string) {
      const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": event_identifier })
      if (!event) return
      event.attendance.status = 'En proceso'
      await event.save()
    }.bind(null, event_identifier)
  )
}

export const aboutToStartEvent = async (event_identifier: string, time: string) => {
  schedule.scheduleJob(`aboutToStart_${event_identifier}`, time,
    async function (event_identifier: string) {
      const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": event_identifier })
      if (!event) return
      event.attendance.status = 'Por empezar'
      await event.save()
    }.bind(null, event_identifier)
  )
}

export const endEvent = async (event_identifier: string, time: string): Promise<void> => {
  schedule.scheduleJob(`end_${event_identifier}`, time,
    async function (event_identifier: string) {
      const event = await Agenda.findOne({ "event_identifier": event_identifier })

      if (!event || event.attendance.status === 'Concluido' || event.attendance.status === 'Concluido por sistema') return

      event.attendance.status = 'Concluido por sistema'
      await event.save()
      if (event.attendance.attendee_list.length === 0) return
      addHoursToSeveral(event)
    }.bind(null, event_identifier)
  )
}

export const initEvents = async () => {
  const currentDate: Date = new Date()
  const events: AgendaInterface[] = await Agenda.find({
    "attendance.status": { $not: { $regex: "Concluido" } }
  }, { "avatar": 0 })

  console.log('Eventos a analizar: ' + events.length)

  for (const event of events) {
    if (event.attendance.status === 'Borrador') {
      console.log('El evento ' + event.event_identifier + ' es un borrador')
      continue
    }

    if (currentDate >= event.ending_date) {
      console.log(`Se concluyó en el momento el evento ${event.event_identifier}`)
      event.attendance.status = 'Concluido por sistema'
      if (event.attendance.attendee_list.length === 0) {
        event.save()
        continue
      }
      addHoursToSeveral(event)
      event.markModified('attendance.attendee_list')
      event.save()
      continue
    } else {
      console.log(`Se agendó el término del evento ${event.event_identifier}`)
      endEvent(event.event_identifier, new Date(event.ending_date.getTime() + (1 * 1000 * 60 * 60)).toISOString())
    }

    if (!event.has_been_published && currentDate >= event.publishing_date) {
      console.log(`Se habilitó en el momento el evento ${event.event_identifier}`)
      event.attendance.status = 'Disponible'
      event.has_been_published = true

      const users = await User.find({
        "status": "Activo",
        "role": "Prestador",
        "place": event.belonging_place,
        "assigned_area": event.belonging_area
      })

      const from = `"SAI" ${Environment.Mailer.email}`
      const subject = '¡Hay un evento disponible para tí!'
      const body = mensaje(`La inscripción para el evento  ${event.name} ya comenzó.`)
      for (const user of users) {
        sendEmail(from, user.email, subject, body)
      }
    } else if (!event.has_been_published) {
      console.log(`se agendó la publicación del evento ${event.event_identifier}`)
      publishEvent(event.event_identifier, event.publishing_date.toISOString())
    }

    if (currentDate >= event.starting_date && event.attendance.status !== 'En proceso') {
      console.log(`Se empezó en el momento el evento ${event.event_identifier}`)
      event.attendance.status = 'En proceso'
    }
    else if (currentDate < event.starting_date && event.attendance.status !== 'En proceso') {
      if (new Date(event.starting_date.getTime() - (2 * 1000 * 60 * 60)) < currentDate) {
        console.log(`Se cambió a por comenzar el evento ${event.event_identifier}`)
        event.attendance.status = 'Por comenzar'
      } else {
        console.log(`Se agendó el cambio de por comenzar el evento ${event.event_identifier}`)
        aboutToStartEvent(event.event_identifier, new Date(event.starting_date.getTime() - (2 * 1000 * 60 * 60)).toISOString())
      }
      console.log(`Se agendó el comienzo del evento ${event.event_identifier}`)
      startEvent(event.event_identifier, event.starting_date.toISOString())
    }

    await event.save()
  }
}