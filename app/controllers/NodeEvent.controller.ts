import Agenda, { IEvent } from '../models/Agenda'
import schedule from 'node-schedule'
import { addHoursToSeveral } from './Card.controller'
import { publishEvent, changeEventStatus, endEvent } from './Agenda.controller'

export const schedulePublication = async (event_identifier: string, time: string): Promise<void> => {
  schedule.scheduleJob(event_identifier, time,
    function (event_identifier: string) {
      publishEvent(event_identifier)
    }.bind(null, event_identifier)
  )
}

export const scheduleStart = async (event_identifier: string, time: string) => {
  schedule.scheduleJob(`start_${event_identifier}`, time,
    function (event_identifier: string) {
      changeEventStatus(event_identifier, 'En proceso')
    }.bind(null, event_identifier)
  )
}

export const scheduleAboutToStart = async (event_identifier: string, time: string) => {
  schedule.scheduleJob(`aboutToStart_${event_identifier}`, time,
    function (event_identifier: string) {
      changeEventStatus(event_identifier, 'Por comenzar')
    }.bind(null, event_identifier)
  )
}

export const shceduleEnd = async (event_identifier: string, time: string): Promise<void> => {
  schedule.scheduleJob(`end_${event_identifier}`, time,
    function (event_identifier: string) {
      endEvent(event_identifier)
    }.bind(null, event_identifier)
  )
}

export const initEvents = async () => {
  const currentDate: Date = new Date()
  const events: IEvent[] = await Agenda.find({
    "attendance.status": { $not: { $regex: "Concluido" } }
  }, { "avatar": 0 })

  console.log('Eventos a analizar: ' + events.length)

  for (const event of events) {
    if (event.attendance.status === 'Borrador') {
      console.log('El evento ' + event.event_identifier + ' es un borrador')
      continue
    }

    // Se hace el chequeo de hora de término

    if (currentDate >= event.ending_date) {
      console.log(`Se concluyó en el momento el evento ${event.event_identifier}`)
      if (event.attendance.attendee_list.length === 0) {
        endEvent(event.event_identifier, null, event)
        continue
      }
      addHoursToSeveral(event)
      continue
    } else {
      console.log(`Se agendó el término del evento ${event.event_identifier}`)
      shceduleEnd(event.event_identifier, new Date(event.ending_date.getTime() + (1 * 1000 * 60 * 60)).toISOString())
    }

    // Se hace el chequeo de publicación

    if (!event.has_been_published && currentDate >= event.publishing_date) {
      console.log(`Se habilitó en el momento el evento ${event.event_identifier}`)
      publishEvent(event.event_identifier, event)
    } else if (!event.has_been_published) {
      console.log(`se agendó la publicación del evento ${event.event_identifier}`)
      schedulePublication(event.event_identifier, event.publishing_date.toISOString())
    }

    if (currentDate >= event.starting_date && event.attendance.status !== 'En proceso') {
      console.log(`Se empezó en el momento el evento ${event.event_identifier}`)
      changeEventStatus(event.event_identifier, 'En proceso', event)
    }
    else if (event.attendance.status !== 'En proceso') {
      if (new Date(event.starting_date.getTime() - (2 * 1000 * 60 * 60)) < currentDate) {
        console.log(`Se cambió a por comenzar el evento ${event.event_identifier}`)
        changeEventStatus(event.event_identifier, 'Por comenzar', event)
      } else {
        console.log(`Se agendó el cambio de por comenzar el evento ${event.event_identifier}`)
        scheduleAboutToStart(event.event_identifier, new Date(event.starting_date.getTime() - (2 * 1000 * 60 * 60)).toISOString())
      }
      console.log(`Se agendó el comienzo del evento ${event.event_identifier}`)
      scheduleStart(event.event_identifier, event.starting_date.toISOString())
    }
  }
}