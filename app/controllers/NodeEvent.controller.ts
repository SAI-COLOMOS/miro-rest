import Agenda, { AgendaInterface } from '../models/Agenda'
import schedule from 'node-schedule'
import Environment from '../config/Environment'
import User from '../models/User'
import Card, { CardInterface } from '../models/Card'
import { mensaje, sendEmail } from '../config/Mailer'

export const publishEvent = async (event_identifier: string, time: string): Promise<void> => {
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

export const startEvent = async (event_identifier: string, time: string) => {
  schedule.scheduleJob(`start_${event_identifier}`, time,
    async function (event_identifier: string) {
      const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": event_identifier })
      if (!event) return
      event.attendance.status = 'En proceso'
      event.save()
    }.bind(null, event_identifier)
  )
}

export const endEvent = async (event_identifier: string, author_name: string, time: string): Promise<void> => {
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

export const initEvents = async () => {
  const currentDate: Date = new Date()
  const events: AgendaInterface[] = await Agenda.find({
    "publishing_date": { $gte: currentDate },
    "attendance.status": { $not: { $regex: "Concluido" } }
  }, { "avatar": 0 })

  events.forEach((event: AgendaInterface) => {
    publishEvent(event.event_identifier, event.publishing_date.toISOString())
    startEvent(event.event_identifier, event.starting_date.toISOString())
    endEvent(event.event_identifier, event.author_name, new Date(event.ending_date.getTime() + (1 * 1000 * 60 * 60)).toISOString())
  })
}