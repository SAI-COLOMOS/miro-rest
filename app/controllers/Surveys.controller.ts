import { Request, Response } from 'express'
import { createCanvas } from '@napi-rs/canvas'
import { Chart } from 'chart.js/auto'
import PDFDocument from 'pdfkit'
import Form, { IForm } from '../models/Form'
import Agenda, { IEvent } from '../models/Agenda'
import Survey, { ISurvey, IAnswer, IQuestion } from '../models/Survey'
import User, { IUser } from '../models/User'
import { __Query, __Required } from '../middleware/ValidationControl'
import { ICharData, IImageData, IOpenAnswers, IOpenData } from '../types/Chart'
import { global_path } from '../server'
import fs from 'fs/promises'
import xlsx from 'xlsx'
import { Configuration, OpenAIApi } from 'openai'
import Environment from '../config/Environment'

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

export const createFile = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const survey: ISurvey | null = await Survey.findOne({ survey_identifier: req.params.id })
    if (!survey) return res.status(400).json({ message: `No se encontró la encuesta ${req.params.id}` })
    const event: IEvent | null = await Agenda.findOne({ event_identifier: survey.belonging_event_identifier })
    if (!event) return res.status(400).json({ message: `No se encontró evento para la encuesta ${req.params.id}` })

    const dispatch: string = String(req.query.dispatch)
    const withOpenAI: boolean = Boolean(String(req.query.withOpenAI).toLowerCase().trim() === 'true')
    switch (dispatch) {
      case 'pdf':
        await createPDF(event, survey, res, withOpenAI)
        break
      case 'xlsx':
        await createXlsx(event, survey, res)
        break
      case 'csv':
        await createCsv(event, survey, res)
        break

      default:
        return res.status(400).json({ message: 'Acción de dispatch no válida' })
    }
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    console.log(error)
    return res.status(statusCode).json(response)
  }
}

const createPDF = async (event: IEvent, survey: ISurvey, res: Response, withOpenAI: boolean): Promise<void> => {
  const dataArr: ICharData[] = []
  const openDataArr: IOpenData[] = []
  const openAnswers: IOpenAnswers[] = []
  for (const answer of survey.answers) {
    const question: IQuestion | undefined = survey.questions.find((question: IQuestion) => question.question_identifier === answer.question_referenced)
    if (!question) continue
    if (question.question_type === 'Abierta') {
      if (withOpenAI) openDataArr.push(await createOpenStats(answer.answer, question.interrogation))
      else openAnswers.push({ title: question.interrogation, answers: answer.answer })
      continue
    }
    if (!question.enum_options) continue

    const data: ICharData = {
      title: '',
      data: [],
      labels: [],
      type: '',
      comment: ''
    }

    data.title = question.interrogation

    if (question.question_type === 'Opción múltiple' || question.question_type === 'Selección múltiple') {
      const { values, newLabels } = createClosedStats(answer.answer, question.enum_options)
      data.data = values
      data.labels = newLabels
      data.type = 'closed'
    }

    if (question.question_type === 'Numérica' || question.question_type === 'Escala') {
      const { labels, resultData } = createNumericStats(answer.answer.map(answer => Number(answer)))
      data.labels = labels
      data.data = resultData
      data.type = 'numeric'
    }

    data.comment = await createClosedComments(data)

    dataArr.push(data)
  }

  const chartBuffers: IImageData[] = dataArr.map((data: ICharData) => createChart(data))
  const doc = new PDFDocument({ size: 'A4' })

  // Response headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=${event.event_identifier}.pdf`)
  doc.pipe(res)

  const logo: Buffer = await fs.readFile(`${global_path}/public/logo.png`)
  const regular = `${global_path}/public/fonts/LexendDeca-Regular.ttf`
  const bold = `${global_path}/public/fonts/LexendDeca-Bold.ttf`

  doc.on('pageAdded', () => {
    doc.image(logo, 25, 25, { scale: 0.09 })
    doc.font(bold).fontSize(12).text('Sistema de Administración de la Información', 230, 25)
    doc.font(regular).fontSize(10).text('Análisis de resultados')
    doc.moveDown()
    doc.moveDown()
    doc.moveDown()
  })

  doc.image(logo, 25, 25, { scale: 0.09 })
  doc.font(bold).fontSize(12).text('Sistema de Administración de la Información', 230, 25)
  doc.font(regular).fontSize(10).text('Análisis de resultados')
  doc.moveDown()
  doc.moveDown()
  doc.font(bold).fontSize(20).text(event.name, 50, doc.y, { align: 'center' })
  doc.moveDown()

  doc.fontSize(11)

  doc.text('Datos del autor')
  doc.text('Nombre: ', { continued: true })
  doc.font(regular).text(event.author_name, { continued: true })
  doc.font(bold).text('REG: ', doc.x + 20, doc.y, { continued: true })
  doc.font(regular).text(event.author_register)
  doc.moveDown()

  doc.font(bold).text('Lugar de ejecución: ', { continued: true })
  doc.font(regular).text(event.place)

  doc.font(bold).text('No. de encuestas realizadas: ', { continued: true })
  doc.font(regular).text(String(survey.answers[0].answer.length))

  doc.font(bold).text('ID de evento: ', { continued: true })
  doc.font(regular).text(event.event_identifier, { continued: true })
  doc.font(bold).text('ID de encuesta: ', doc.page.width - 465, doc.y, { continued: true })
  doc.font(regular).text(String(event.survey_identifier))

  const { date, hour } = createDate(new Date())
  doc.font(bold).text('Fecha: ', { continued: true })
  doc.font(regular).text(date, { continued: true })
  doc.font(bold).text('Hora: ', doc.page.width - 430, doc.y, { continued: true })
  doc.font(regular).text(hour)

  doc.moveDown()

  chartBuffers.forEach((imageData: IImageData) => {
    if (doc.y + (300 * 0.6) > doc.page.height) doc.addPage()
    doc.fontSize(15).list([imageData.title], 50, doc.y)
    doc.moveDown()
    doc.image(imageData.image, ((doc.page.width - (imageData.width * 0.6)) / 2), doc.y, { scale: 0.6 })
    doc.font(regular).fontSize(11).text(imageData.comment)
    doc.moveDown()
  })

  if (withOpenAI) openDataArr.forEach((data) => {
    if (doc.y + 50 > doc.page.height) doc.addPage()
    doc.fontSize(15).list([data.title], 50, doc.y)
    doc.fontSize(11).text(data.response)
    doc.moveDown()
  })
  else openAnswers.forEach((data) => {
    if (doc.y + 50 > doc.page.height) doc.addPage()
    doc.fontSize(15).list([data.title], 50, doc.y)
    doc.fontSize(11).list([data.answers], 50, doc.y, { listType: 'numbered' })
  })

  doc.end()
}

const createXlsx = async (event: IEvent, survey: ISurvey, res: Response): Promise<Response> => {
  try {
    let data = new Array(survey.answers[0].answer.length).fill({})
    survey.answers.forEach((answer: IAnswer) => {
      const question = survey.questions.find(({ question_identifier }: IQuestion) => question_identifier === answer.question_referenced)
      if (!question) return
      data = data.map((item, index) => {
        const info = answer.answer[index]
        if (Array.isArray(info)) item[question.interrogation] = info.reduce((acc, str, rindex) => {
          if (rindex === 0) return acc + str
          return acc + ', ' + str
        }, '')
        else item[question.interrogation] = info[index]
        return { ...item }
      })
    })
    const book = xlsx.utils.book_new()
    const sheet = xlsx.utils.json_to_sheet(data)
    xlsx.utils.book_append_sheet(book, sheet, survey.survey_identifier)
    const result = xlsx.write(book, { type: 'buffer' })
    res.setHeader('Content-Disposition', `attachment; filename=${event.event_identifier}.xlsx`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return res.send(result)
  } catch (error) {
    const statusCode: number = typeof error === 'string' ? 400 : 500
    const response: object = statusCode === 400 ? { error } : { message: 'Ocurrió un error en el servidor', error: error?.toString() }
    return res.status(statusCode).json(response)
  }
}

const createCsv = async (event: IEvent, survey: ISurvey, res: Response): Promise<Response> => {
  let data = new Array(survey.answers[0].answer.length + 1).fill([])
  data[0] = survey.answers.map(answer => {
    const question = survey.questions.find(({ question_identifier }) => question_identifier === answer.question_referenced)
    if (!question) return
    return question.interrogation
  })
  survey.answers.forEach((answer) => {
    data.forEach((item, index) => {
      if (index === 0) return
      const info = answer.answer[index - 1]
      if (Array.isArray(info)) data[index] = [...item, info.reduce((acc, str, rindex) => {
        if (rindex === 0) return str
        return acc + ' - ' + str
      })]
      else data[index] = [...item, info]
    })
  })

  const csv = data.map(row => row.join(',')).join('\n')
  res.set('Content-Disposition', `attachment;filename=${event.event_identifier}.csv`)
  res.set('Content-Type', 'text/csv')
  return res.send(csv)
}

const createNumericStats = (data: number[]) => {
  const bars = Math.ceil(Math.log2(data.length) + 1)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const width = (max - min) / bars

  const labels = []
  let beginFrom = min
  let endOn = beginFrom + width
  for (let i = 0; i < bars; i++) {
    const str = `${beginFrom} - ${endOn}`
    labels.push(str)
    beginFrom = width % 1 === 0 ? endOn + 1 : endOn + 0.1
    endOn += width
  }

  const resultData: number[] = new Array(labels.length).fill(0)
  for (const [index, label] of labels.entries()) {
    const min = Number(label.split(' ')[0])
    const max = Number(label.split(' ')[2])
    data.forEach((d: number) => d >= min && d <= max && resultData[index]++)
  }

  return { resultData, labels }
}

const createClosedStats = (data: string[] | string[][], labels: string[]) => {
  const result: number[] = new Array(labels.length).fill(0)
  const is2DArray: boolean = Array.isArray(data[0])
  let lengthCount: number = 0
  labels.forEach((label, index) => data.forEach((info) => {
    if (!Array.isArray(info)) info === label && result[index]++
    else info.forEach((a) => {
      lengthCount++
      a === label && result[index]++
    })
  }))
  const values = result.map((item: number) => Math.round((item * 100) / (is2DArray ? (lengthCount / labels.length) : data.length)))
  const newLabels = labels.map((label, index) => `${label} - ${values[index]}%`)
  return { values, newLabels }
}

const createDate = (date: Date): { date: string, hour: string } => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const formattedDate: string = `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`

  const formattedHour: string = `${date.getHours()}:${date.getMinutes()}`

  return { date: formattedDate, hour: formattedHour }
}

const createOpenStats = async (data: any, title: string): Promise<IOpenData> => {
  const result: IOpenData = {
    title,
    response: ''
  }

  const prompt: string = `Dame un resumen de las siguientes respuestas a la pregunta "${title}"\n${data.join('\n')}`

  const configuration = new Configuration({
    apiKey: Environment.openAPI.key,
  })
  const openai = new OpenAIApi(configuration)

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.3,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
  })
  if (response.data.choices[0].text)
    result.response = response.data.choices[0].text
  return result
}

const createClosedComments = async (charData: ICharData): Promise<string> => {
  const { title, data, labels } = charData
  const stringData: string[] = data.map((stat: number, index: number) => `${stat}% ${labels[index]}`)
  const prompt: string = `Dame un resumen del porcentaje de respuestas a la pregunta "${title}"\n${stringData.join('\n')}`
  let result: string = ''
  const configuration = new Configuration({
    apiKey: Environment.openAPI.key,
  })
  const openai = new OpenAIApi(configuration)

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.3,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
  })
  if (response.data.choices[0].text)
    result = response.data.choices[0].text
  return result
}

const createChart = (data: ICharData): IImageData => {
  const canvas = createCanvas(data.type === 'numeric' ? 500 : 300, 300)
  const ctx: any = canvas.getContext('2d')
  const colors: string[] = new Array(data.data.length).fill('').map(() => {
    const red: number = Math.round(Math.random() * 150) + 50
    const green: number = Math.round(Math.random() * 150) + 50
    const blue: number = Math.round(Math.random() * 150) + 50
    return `rgba(${red}, ${green}, ${blue}, 1)`
  })

  const chart = new Chart(ctx, {
    type: data.type === 'numeric' ? 'bar' : 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        label: data.title,
        data: data.data,
        backgroundColor: colors
      }]
    },
    options: {
      plugins: {
        legend: {
          display: data.type === 'closed'
        }
      }
    }
  })

  ctx.drawImage(chart.canvas, 0, 0)
  const result: IImageData = {
    image: canvas.toBuffer('image/png'),
    title: data.title,
    width: chart.width,
    comment: data.comment
  }
  return result
}