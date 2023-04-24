import { model, Document, Schema } from 'mongoose'
import Place, { IPlace, IArea } from './Place'
import { IQuestion, QuestionSchema } from './Survey'

export interface IForm extends Document {
  name: string
  description: string
  author_register: string
  belonging_area: string
  belonging_place: string
  belonging_event_identifier: string
  version: string
  form_identifier: string
  questions: IQuestion[]
}

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
  version: {
    type: String,
    default: '1.0'
  },
  form_identifier: {
    type: String,
    unique: true
  },
  questions: {
    type: [QuestionSchema],
    required: [true, 'Las preguntas son obligatorias']
  }
}, {
  timestamps: true,
  versionKey: false
})

SurveySchema.pre<IForm>('save', async function (next) {
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

      const form: IForm | null = await Form.findOne({ "form_identifier": identifier })

      if (form === null) {
        isUnique = true
        this.form_identifier = identifier
      }
    }
  }

  next()
})

const Form = model<IForm>("Form", SurveySchema)

export default Form