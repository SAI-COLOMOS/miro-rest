import { Request, Response } from 'express'
import { createCanvas } from 'canvas'
import { Chart } from 'chart.js/auto'
import PDFDocument from 'pdfkit'
import Form, { IForm } from '../models/Form'
import Agenda, { IEvent } from '../models/Agenda'
import Survey, { ISurvey, IAnswer } from '../models/Survey'
import User, { IUser } from '../models/User'
import { __Query, __Required } from '../middleware/ValidationControl'

export const getSurveys = async (req: Request, res: Response): Promise<Response> => {
  try {
    const survey: ISurvey | null = await Survey.findOne({ survey_identifier: req.params.id })

    if (!survey) return res.status(400).json({ message: `No se encontró la encuesta ${req.params.id}` })

    return res.status(200).json({ message: 'Listo', survey })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const createSurvey = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Required(req.body.form_identifier, `form_identifier`, `string`, null)
    __Required(req.body.event_identifier, `event_identifier`, `string`, null)
    const { form_identifier, event_identifier } = req.body

    const user: IUser = new User(req.user)
    const form: IForm | null = await Form.findOne({ form_identifier })
    if (!form) return res.status(400).json({ message: `No se encontró el formulario ${form_identifier}` })
    const event: IEvent | null = await Agenda.findOne({ event_identifier })
    if (!event) return res.status(400).json({ message: `No se encontró el evento ${event_identifier}` })
    const { _id, ...formObj } = form.toObject()
    const survey: ISurvey = await new Survey({
      ...formObj,
      belonging_event_identifier: event.event_identifier,
      author_register: user.register
    }).save()
    event.survey_identifier = survey.survey_identifier
    await event.save()

    return res.status(201).json({ message: 'Encuesta creada' })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const deleteSurvey = async (req: Request, res: Response): Promise<Response> => {
  try {
    const survey_identifier = req.params.id
    const survey: ISurvey | null = await Survey.findOneAndDelete({ survey_identifier })
    if (!survey) return res.status(400).json({ message: `No se encontró la encuesta ${req.params.id}` })

    const event: IEvent | null = await Agenda.findOne({ event_identifier: survey.belonging_event_identifier })

    if (event) {
      event.survey_identifier = undefined
      await event.save()
    }
    return res.status(200).json({ message: 'Se eliminó la encuesta' })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const saveAnswers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const survey: ISurvey | null = await Survey.findOne({ survey_identifier: req.params.id })
    if (!survey) return res.status(400).json({ message: `No se encontró la encuesta ${req.params.id}` })

    const answers = req.body.answers
    Object.keys(answers).forEach((key: string) => {
      const index = survey.answers.findIndex((answer: IAnswer) => answer.question_referenced === key)
      if (index === -1) {
        survey.answers.push({
          question_referenced: key,
          answer: [answers[key]]
        })
      } else {
        survey.answers[index].answer.push(answers[key])
      }
    })
    survey.markModified('answers')
    await survey.save()
    return res.status(201).json({ message: `Se guardaron las respuestas en el formulario ${req.params.id}` })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const createChart = async (_req: Request, res: Response): Promise<void | Response> => {
  try {
    const chart: Buffer = createBarChar()
    const doc = new PDFDocument({ bufferPages: true })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=test.pdf')

    doc.pipe(res)

    doc.image(chart, { scale: 0.5 })

    doc.end()
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

const createBarChar = (): Buffer => {
  const canvas = createCanvas(500, 400)
  const ctx: any = canvas.getContext('2d')

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    }
  })

  ctx.drawImage(chart.canvas, 0, 0)
  return canvas.toBuffer('image/png')
}