import { model, Document, Schema, CallbackWithoutResultAndOptionalError } from 'mongoose'
import Place, { PlaceInterface, AreaInterface } from './Place'

export interface AnswerInterface {
  question_referenced: string
  answer: string[]
}

export interface QuestionInterface {
  interrogation: string
  question_identifier: string
  question_type: string
  enum_options: string[]
}

export interface FormInterface extends Document {
  name: string
  description: string
  author_register: string
  belonging_area: string
  belonging_place: string
  belonging_event_identifier: string
  version: number
  form_identifier: string
  questions: QuestionInterface[]
  answers: AnswerInterface[]
}

const AnswerSchema = new Schema({
  question_referenced: {
    type: String,
    required: [true, 'El identificador de la pregunta es obligatorio']
  },
  answer: {
    type: [String]
  }
}, {
  versionKey: false
})

export const QuestionSchema = new Schema({
  interrogation: {
    type: String,
    required: [true, 'La interroagnte es obligatoria']
  },
  question_identifier: {
    type: String,
    index: true,
    required: true
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

const FormSchema = new Schema({
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
    type: String
  },
  version: {
    type: Number,
    default: 1.0.toFixed(1)
  },
  form_identifier: {
    type: String,
    unique: true
  },
  questions: {
    type: [QuestionSchema],
    required: [true, 'Las preguntas son obligatorias']
  },
  answers: {
    type: [AnswerSchema]
  }
}, {
  timestamps: true,
  versionKey: false
})

FormSchema.pre<FormInterface>('save', async function (next: CallbackWithoutResultAndOptionalError) {
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

      const form: FormInterface | null = await Form.findOne({ "form_identifier": identifier })

      if (form === null) {
        isUnique = true
        this.form_identifier = identifier
      }
    }
  }

  next()
})

const Form = model<FormInterface>("Form", FormSchema)

export default Form