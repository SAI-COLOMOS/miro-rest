import { model, Schema, Document } from 'mongoose'

export interface AttendeeInterface {
  attendee_register: string
  first_name: string
  first_last_name: string
  second_last_name: string
  status: string
  check_in?: Date
  enrollment_date?: Date
}

export interface AttendanceInterface extends Document {
  attendee_list: AttendeeInterface[]
  status: string
}

export interface AgendaInterface extends Document {
  event_identifier: string
  name: string
  avatar: string
  description: string
  offered_hours: number
  tolerance: number
  vacancy: number
  attendance: AttendanceInterface
  starting_date: Date
  ending_date: Date
  author_register: string
  author_name: string
  publishing_date: Date
  place: string
  belonging_area: string
  belonging_place: string
  modifier_register: string
}

const AttendeeSchema = new Schema({
  attendee_register: {
    type: String,
    index: true,
    unique: true,
    required: [true, "El registro del usuario es obligatorio"]
  },
  first_name: {
    type: String,
    required: [true, "El nombre es necesario"],
    trim: true
  },
  first_last_name: {
    type: String,
    required: [true, "Un apellido es necesario"],
    trim: true
  },
  second_last_name: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: [true, "El status del usuario es obligatorio"],
    enum: ["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"]
  },
  check_in: {
    type: Date
  },
  enrollment_date: {
    type: Date
  }
})

const AttendanceSchema = new Schema({
  attendee_list: [AttendeeSchema],
  status: {
    type: String,
    required: [true, "El status es obligatorio"],
    enum: ["Disponible", "Concluido", "Concluido por sistema", "Vacantes completas", "En proceso", "Borrador", "Por publicar", "Por comenzar"]
  }
})

const AgendaSchema = new Schema({
  event_identifier: {
    type: String,
    unique: true,
    index: true
  },
  avatar: {
    type: String,
  },
  modifier_register: {
    type: String,
  },
  tolerance: {
    type: Number,
    required: [true, 'La tolerancia del evento es obligatoria']
  },
  name: {
    type: String,
    required: [true, "El nombre del evento es obligatorio"]
  },
  description: {
    type: String,
    required: [true, "La descripción del evento es obligatorio"]
  },
  offered_hours: {
    type: Number,
    required: [true, "La oferta de horas es obligatoria"]
  },
  vacancy: {
    type: Number,
    required: [true, "La cantidad de vacantes es obligatoria"]
  },
  attendance: {
    type: AttendanceSchema,
    default: {
      attendee_list: [],
      status: "Por publicar"
    }
  },
  starting_date: {
    type: Date,
    required: [true, "La fecha de inicio del evento es obligatoria"]
  },
  ending_date: {
    type: Date,
    required: [true, "La fecha de termino del evento es obligatoria"]
  },
  author_register: {
    type: String,
    required: [true, "El registro del autor es obligatorio"]
  },
  author_name: {
    type: String,
    required: [true, "El nombre del encargado es obligatorio"]
  },
  publishing_date: {
    type: Date,
    required: [true, "La fecha de publicación del evento es obligatoria"]
  },
  place: {
    type: String,
    required: [true, "El parque donde se va a llevar a cabo el evento es obligatoro"]
  },
  belonging_area: {
    type: String,
    required: [true, "El área al que pertene el parque es obligatoria"]
  },
  belonging_place: {
    type: String,
    required: [true, "El parque al que pertenece el evento es obligatorio"]
  }
}, {
  versionKey: false,
  timestamps: true
})

AgendaSchema.pre<AgendaInterface>("save", async function (next) {
  if (!this.isNew) next()

  const pool = '0123456789qwertyuioplkjhgfdsazxcvbnmMNBVCXZASDFGHJKLPOIUYTREWQ'
  let identifier: string = ''
  let flag: boolean = true
  while (flag) {
    for (let index = 0; index < 20; index++) {
      const random: number = Math.round(Math.random() * (pool.length - 1))
      identifier = identifier + pool[random]
    }
    const event: AgendaInterface | null = await Agenda.findOne({ "event_identifier": identifier })
    if (!event) {
      this.event_identifier = identifier
      flag = false
    }
    identifier = ''
  }
  next()
})

const Agenda = model<AgendaInterface>("Agenda", AgendaSchema)

export default Agenda