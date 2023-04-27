import { model, Document, Schema } from 'mongoose'
import Place, { IPlace, IArea } from './Place'

export interface IAnswer {
  question_referenced: string
  answer: string[] | string[][]
}

export interface IQuestion {
  interrogation: string
  question_identifier: string
  question_type: string
  enum_options?: string[]
}

export interface ISurvey extends Document {
  name: string
  description: string
  author_register: string
  belonging_area: string
  belonging_place: string
  belonging_event_identifier: string
  version: string
  form_identifier: string | null
  survey_identifier: string
  questions: IQuestion[]
  answers: IAnswer[]
}

const AnswerSchema = new Schema({
  question_referenced: {
    type: String,
    required: [true, 'El identificador de la pregunta es obligatorio']
  },
  answer: {
    type: []
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
    type: Schema.Types.Mixed
    // type: [String]
  }
}, {
  versionKey: false
})

const SurveySchema = new Schema({
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
    type: String,
    default: '1.0'
  },
  form_identifier: {
    type: String,
    index: true
  },
  survey_identifier: {
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

SurveySchema.pre<ISurvey>('save', async function (next) {
  if (this.isNew) {
    let isUnique: boolean = false
    const pool: string = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
    const place: IPlace | null = await Place.findOne({ "place_name": this.belonging_place })
    const area: IArea | undefined = place!.place_areas.find((areaItem: IArea) => areaItem.area_name === this.belonging_area)

    let suffix: string = ""

    while (!isUnique) {
      for (let index = 0; index < 6; index++) {
        const random = Math.round(Math.random() * (pool.length - 1))
        suffix = suffix + pool.charAt(random)
      }
      const identifier = `${place!.place_identifier}${area!.area_identifier}${suffix}`

      const survey: ISurvey | null = await Survey.findOne({
        $or: [
          { form_identifier: identifier },
          { survey_identifier: identifier }
        ]
      })

      if (survey === null) {
        isUnique = true
        this.survey_identifier = identifier
      }
    }
  }

  next()
})

const Survey = model<ISurvey>("Survey", SurveySchema)

export default Survey