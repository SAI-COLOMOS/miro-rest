import { model, Document, Schema, CallbackWithoutResultAndOptionalError } from 'mongoose'
import Place, { PlaceInterface, AreaInterface } from './Place'
import { QuestionInterface } from './Form'

export interface FormTemplateInterface extends Document {
  name: string
  description: string
  author_register: string
  belonging_area: string
  belonging_place: string
  belonging_event_identifier: string
  version: number
  form_identifier: string
  questions: QuestionInterface[]
}

const QuestionSchema = new Schema({
  interrogation: {
    type: String,
    required: [true, 'La interroagnte es obligatoria']
  },
  question_identifier: {
    type: String,
    index: true,
    required: [true, 'El identificador de pregunta es necesario']
  },
  question_type: {
    type: String,
    enum: ['Abierta', 'Numérica', 'Opción múltiple', 'Selección múltiple', 'Escala']
  },
  enum_options: {
    type: [String]
  }
}, {
  versionKey: false
})

const FormTemplateSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre del formulario es obligatorio']
  },
  description: {
    type: String,
    required: [true, 'La descripción del formulario es obligatoria']
  },
  author_register: {
    type: String,
    required: [true, 'El registro del autor es obligatorio']
  },
  belonging_area: {
    type: String,
    required: [true, 'El área de pertenencia es obligatoria']
  },
  belonging_place: {
    type: String,
    required: [true, 'El lugar de pertenencia es obligatorio']
  },
  belonging_event_identifier: {
    type: String,
    required: [true, 'El identificador del evento al que pertenece es obligatorio']
  },
  version: {
    type: Number,
    default: 1.0
  },
  form_identifier: {
    type: String,
    unique: true
  },
  questions: {
    type: [QuestionSchema],
    required: [true, 'Las preguntas son obligatorias']
  },
}, {
  timestamps: true,
  versionKey: false
})

FormTemplateSchema.pre<FormTemplateInterface>('save', async function (next: CallbackWithoutResultAndOptionalError) {
  if (this.isNew) {
    let isUnique: boolean = false
    const pool: string = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
    const place: PlaceInterface | null = await Place.findOne({ "place_name": this.belonging_place })
    const area: AreaInterface | undefined = place!.place_areas.find((areaItem: AreaInterface) => areaItem.area_name === this.belonging_area)

    let suffix: string = ""

    while (!isUnique) {
      for (let index = 0; index < 6; index++) {
        const random = Math.round(Math.random() * (pool.length - 1))
        suffix = suffix + pool.charAt(random)
      }
      const identifier = `${place!.place_identifier}${area!.area_identifier}${suffix}`

      const form: FormTemplateInterface | null = await FormTemplate.findOne({ "form_identifier": identifier })

      if (form === null) {
        isUnique = true
        this.form_identifier = identifier
      }
    }
  }

  next()
})

const FormTemplate = model<FormTemplateInterface>("FormTemplate", FormTemplateSchema)

export default FormTemplate