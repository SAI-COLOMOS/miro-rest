import { model, Schema, Document } from "mongoose"

export interface AttendeeListInterface {
  attendee_register: string
  status: string
  check_in?: Date
}

export interface AttendanceInterface extends Document {
  attendee_list: AttendeeListInterface[]
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

const AttendeeListSchema = new Schema({
  attendee_register: {
    type: String,
    index: true,
    unique: true,
    required: [true, "El registro del usuario es obligatorio"]
  },
  status: {
    type: String,
    required: [true, "El status del usuario es obligatorio"],
    enum: ["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"]
  },
  check_in: {
    type: Date
  }
})

const AttendanceSchema = new Schema({
  attendee_list: [AttendeeListSchema],
  status: {
    type: String,
    required: [true, "El status es obligatorio"],
    enum: ["Disponible", "Concluido", "Concluido por sistema", "Vacantes completas", "En proceso"]
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
      status: "Disponible"
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

AgendaSchema.post<AgendaInterface>("save", async function () {
  if (this.isNew) {
    const id: String = this._id.toString()
    this.event_identifier = id.substring(id.length - 20, id.length)
    this.save()
  }
})

const Agenda = model<AgendaInterface>("Agenda", AgendaSchema)

export default Agenda