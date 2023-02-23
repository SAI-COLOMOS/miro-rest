import { model, Schema, Document } from "mongoose";

export interface AttendeeListInterface extends Document {
    attendee_register: string,
    status: string,
    check_in: Date
}

export interface AttendanceInterface extends Document {
    attendee_list: AttendeeListInterface,
    status: string
}

export interface AgendaInterface extends Document {
    event_identifier: string,
    name: string,
    description: string,
    offered_hours: number,
    vacancy: number,
    attendance: AttendanceInterface,
    starting_date: Date,
    ending_date: Date,
    author_register: string,
    publishing_date: Date,
    place: string,
    belonging_area: string,
    belonging_place: string
}

const AttendeeListSchema = new Schema({
    attendee_register: {
        type: String,
        index: true,
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
        enum: ["Disponible", "Concluido", "Concluido por sistema"]
    }
})

const AgendaSchema = new Schema({
    event_identifier: {
        type: String,
        unique: true,
        index: true
    },
    modifier_register: {
        type: String,
    },
    is_template: {
        type: Boolean,
        default: false
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
    if (this.isNew) {
        const pool = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789"
        let randomString = ""
        let flag = true
        while (flag) {
            randomString = ""
            for (let i = 0; i < 20; i++) {
                randomString += pool.charAt(Math.floor(Math.random() * pool.length))
            }
            const event = await Agenda.findOne({ "event_identifier": randomString })
            event ? null : flag = false
        }
        this.event_identifier = randomString
    }

    next()
})

const Agenda = model<AgendaInterface>("Agenda", AgendaSchema)

export default Agenda