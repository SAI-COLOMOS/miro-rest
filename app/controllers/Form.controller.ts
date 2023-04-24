import { Request, Response } from 'express'
import { __Required, __Optional, __Query, __ThrowError } from '../middleware/ValidationControl'
import { IQuestion } from '../models/Survey'
import User, { IUser } from '../models/User'
import Form, { IForm } from '../models/Form'

export const getForms = async (req: Request, res: Response): Promise<Response> => {
  try {
    __Query(req.query.items, 'items', 'number')
    __Query(req.query.page, 'page', 'number')

    const user: IUser = new User(req.user)
    const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
    const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
    let filterRequest: { [index: string]: unknown } = req.query.filter ? JSON.parse(String(req.query.filter)) : {}

    if (user.role === 'Encargado') {
      filterRequest.belonging_area = user.assigned_area
      filterRequest.belonging_place = user.place
    }

    if (req.query.search)
      filterRequest = {
        ...filterRequest,
        $or: [
          { "name": { $regex: req.query.search, $options: 'i' } },
          { "form_identifier": { $regex: req.query.search, $options: 'i' } },
          { "version": { $regex: req.query.search, $options: 'i' } }
        ]
      }

    const forms: IForm[] = await Form.find(filterRequest).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

    return res.status(200).json({ message: 'Listo', forms })

  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const getForm = async (req: Request, res: Response): Promise<Response> => {
  try {
    const form: IForm | null = await Form.findOne({ "form_identifier": req.params.id })

    return form
      ? res.status(200).json({
        message: 'Listo',
        form
      })
      : res.status(400).json({
        message: `No se encontró el formulario ${req.params.id}`
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const createForm = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user: IUser = new User(req.user)
    __Required(req.body.name, `name`, `string`, null)
    __Required(req.body.description, `description`, `string`, null)
    __Required(req.body.belonging_event_identifier, `belonging_event_identifier`, `string`, null)
    __Required(req.body.questions, `questions`, `array`, null)
    __Optional(req.body.version, `version`, `number`, null)

    if (user.role === 'Encargado') {
      req.body.belonging_place = user.place
      req.body.belonging_area = user.assigned_area
    } else {
      __Required(req.body.belonging_area, `belonging_area`, `string`, null)
      __Required(req.body.belonging_place, `belonging_place`, `string`, null)
    }

    const questions: Array<IQuestion> = req.body.questions
    let lastIdentifier: string = "00"
    questions.forEach((question: IQuestion) => {
      __Required(question.interrogation, `interrogation`, `string`, null)
      __Required(question.question_type, `question_type`, `string`, ['Abierta', 'Numérica', 'Opción múltiple', 'Selección múltiple', 'Escala'])
      if ((/^Opción múltiple|Selección múltiple|Escala/).test(question.question_type))
        __Required(question.enum_options, `enum_options`, `array`, null)
      else delete question.enum_options

      const numberIdentifier: number = Number(lastIdentifier) + 1
      if (numberIdentifier < 9)
        lastIdentifier = '0' + String(numberIdentifier)
      else
        lastIdentifier = String(numberIdentifier)

      question.question_identifier = lastIdentifier
    })

    req.body.author_register = user.register

    await new Form(req.body).save()

    return res.status(201).json({
      message: 'Se creó el formulario'
    })

  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    console.log(response)
    return res.status(statusCode).json(response)
  }
}

export const updateForm = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = new User(req.user)
    if (req.body.form_identifier)
      __ThrowError("El campo 'form_identifier' no se puede modificar")
    if (req.body.author_register)
      __ThrowError("El campo 'author_register' no se puede modificar")
    if (req.body.belonging_event_identifier)
      __ThrowError("El campo 'belonging_event_identifier' no se puede modificar")

    if (user.role === 'Encargado') {
      if (req.body.belonging_area)
        __ThrowError("El campo 'belonging_area' no se puede modificar")
      if (req.body.belonging_place)
        __ThrowError("El campo 'belonging_place' no se puede modificar")
    }

    __Optional(req.body.name, `name`, `string`, null)
    __Optional(req.body.description, `description`, `string`, null)
    __Optional(req.body.belonging_area, `belonging_area`, `string`, null)
    __Optional(req.body.belonging_place, `belonging_place`, `string`, null)
    __Optional(req.body.version, `version`, `number`, null)
    __Optional(req.body.questions, `questions`, `array`, null)

    if (req.body.questions) {
      const questions: Array<IQuestion> = req.body.questions
      let lastIdentifier: string = "00"
      questions.forEach((question: IQuestion) => {
        const numberIdentifier: number = Number(lastIdentifier) + 1
        if (numberIdentifier < 9)
          lastIdentifier = '0' + String(numberIdentifier)
        else
          lastIdentifier = String(numberIdentifier)

        question.question_identifier = lastIdentifier
      })
    }

    const result = await Form.updateOne({ "form_identifier": req.params.id }, req.body)

    return result.modifiedCount > 0
      ? res.status(200).json({
        message: `Los datos del formulario ${req.params.id} se actualizaron`
      })
      : res.status(400).json({
        message: `No se encontró el formulario ${req.params.id}`
      })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const deleteForm = async (req: Request, res: Response): Promise<Response> => {
  try {
    const form: IForm | null = await Form.findOneAndDelete({ "form_identifier": req.params.id })

    if (!form) return res.status(400).json({ message: `No se encontró el formulario ${req.params.id}` })

    return res.status(200).json({ message: 'Se eliminó el formulario' })
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}