import { Request, Response } from 'express'
import { __Required, __Optional, __Query, __ThrowError } from '../middleware/ValidationControl'
import Form, { FormInterface, QuestionInterface } from '../models/Form'
import User, { IUser } from '../models/User'
import FormTemplate, { FormTemplateInterface } from '../models/FormTemplate'

export const getForms = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.query.isTemplate) __ThrowError("El parámetro 'isTemplate' es obligatorio")
    __Query(req.body.isTemplate, 'isTemplate', 'boolean')
    __Query(req.query.items, 'items', 'number')
    __Query(req.query.page, 'page', 'number')
    __Query(req.query.isTemplate, 'isTemplate', 'boolean')

    const user: IUser = new User(req.user)
    const isTemplate: boolean = Boolean((String(req.query.isTemplate).toLowerCase() === 'true'))
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
          { "form_identifier": { $regex: req.query.search, $options: 'i' } }
        ]
      }

    const forms: FormTemplateInterface[] | FormInterface[] = isTemplate
      ? await FormTemplate.find(filterRequest).sort({ "createdAt": "desc" }).limit(items).skip(page * items)
      : await Form.find(filterRequest).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

    return res.status(200).json({
      message: 'Listo',
      forms
    })

  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

export const getForm = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.query.isTemplate) __ThrowError("El parámetro 'isTemplate' es obligatorio")
    __Query(req.body.isTemplate, 'isTemplate', 'boolean')

    const isTemplate: boolean = Boolean(String(req.query.isTemplate).toLowerCase() === 'true')
    const form: FormInterface | FormTemplateInterface | null = isTemplate
      ? await FormTemplate.findOne({ "form_identifier": req.params.id })
      : await Form.findOne({ "form_identifier": req.params.id })

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
    console.log(req.body)
    const user: IUser = new User(req.user)
    __Required(req.body.isTemplate, `isTemplate`, `boolean`, null)
    __Required(req.body.name, `name`, `string`, null)
    __Required(req.body.description, `description`, `string`, null)
    __Required(req.body.belonging_event_identifier, `belonging_event_identifier`, `string`, null)
    __Required(req.body.questions, `questions`, `array`, null)
    __Optional(req.body.version, `version`, `number`, null)

    if (user.role === 'Encargado') {
      req.body.belonging_place = user.place
      req.body.belonging_area = user.assigned_area
    } else if (user.role === 'Administrador') {
      __Required(req.body.belonging_area, `belonging_area`, `string`, null)
      __Required(req.body.belonging_place, `belonging_place`, `string`, null)
    }

    const isTemplate: boolean = Boolean(req.body.isTemplate)
    const questions: Array<QuestionInterface> = req.body.questions
    let last_identifier: string = "00"
    questions.forEach((question: QuestionInterface) => {
      __Required(question.interrogation, `interrogation`, `string`, null)
      __Required(question.question_type, `question_type`, `string`, ['Abierta', 'Numérica', 'Opción múltiple', 'Selección múltiple', 'Escala'])
      if ((/^Opción múltiple|Selección múltiple|Escala/).test(question.question_type))
        __Required(question.enum_options, `enum_options`, `array`, null)

      const number_identifier: number = Number(last_identifier) + 1
      if (number_identifier < 9)
        last_identifier = '0' + String(number_identifier)
      else
        last_identifier = String(number_identifier)

      question.question_identifier = last_identifier
    })

    req.body.author_register = user.register

    if (isTemplate) await new FormTemplate(req.body).save()
    else await new Form(req.body).save()

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

    __Required(req.body.isTemplate, `isTemplate`, `boolean`, null)
    __Optional(req.body.name, `name`, `string`, null)
    __Optional(req.body.description, `description`, `string`, null)
    __Optional(req.body.belonging_area, `belonging_area`, `string`, null)
    __Optional(req.body.belonging_place, `belonging_place`, `string`, null)
    __Optional(req.body.version, `version`, `number`, null)
    __Optional(req.body.questions, `questions`, `array`, null)

    const isTemplate: boolean = Boolean(req.body.isTemplate)
    if (req.body.questions) {
      const questions: Array<QuestionInterface> = req.body.questions
      let last_identifier: string = "00"
      questions.forEach((question: QuestionInterface) => {
        const number_identifier: number = Number(last_identifier) + 1
        if (number_identifier < 9)
          last_identifier = '0' + String(number_identifier)
        else
          last_identifier = String(number_identifier)

        question.question_identifier = last_identifier
      })
    }

    const result = isTemplate
      ? await FormTemplate.updateOne({ "form_identifier": req.params.id }, req.body)
      : await Form.updateOne({ "form_identifier": req.params.id }, req.body)

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
    __Required(req.body.isTemplate, `isTemplate`, `boolean`, null)
    const isTemplate: boolean = Boolean(req.body.isTemplate)
    const result = isTemplate
      ? await FormTemplate.deleteOne({ "form_identifier": req.params.id })
      : await Form.deleteOne({ "form_identifier": req.params.id })

    return result.deletedCount > 0
      ? res.status(200).json({
        message: 'Se eliminó el formulario'
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