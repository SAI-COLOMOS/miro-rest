import { Request, Response } from 'express'
import { __Required } from '../middleware/ValidationControl'
import { IForm } from '../models/Form'
import Form from '../models/Form'
import Agenda, { IEvent } from '../models/Agenda'
import Survey, { ISurvey } from '../models/Survey'
import User, { IUser } from '../models/User'
import { IAnswer } from '../models/Survey'
import { __Query } from '../middleware/ValidationControl'

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
    const formObj = form.toObject()
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