import { model, Schema, Document } from "mongoose";

export interface AttendeeListInterface extends Document {
    attendee_register: String,
    status: String,
    check_in: Date
}

export interface AttendanceInterface extends Document {
    attendee_list: AttendeeListInterface,
    status: String
}

export interface AgendaInterface extends Document {
    event_identifier: String,
    name: String,
    description: String,
    offered_hours: Number,
    vacancy: Number,
    attendance: AttendanceInterface,
    starting_date: Date,
    ending_date: Date,
    author_register: String,
    publishing_date: Date,
    place: String,
    belonging_area: String,
    belonging_place: String
}

const AgendaSchema = new Schema({
    event_identifier: {
        type: String,
        unique: true,
        index: true,
        required: [true, "El identificador de evento es obligatorio"]
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
        attendee_list: [{
            attendee_register: {
                type: String,
                required: [true, "El registro del usuario es obligatorio"]
            },
            status: {
                type: String,
                required: [true, "El status del usuario es obligatorio"],
                enum: ["Inscrito", "Desinscrito", "Asistió", "Retardo", "No asistió"]
            },
            check_in: {
                type: Date,
                required: [true, "La fecha de check in es obligatoria"]
            }
        }],
        status: {
            type: String,
            required: [true, "El status es obligatorio"],
            enum: ["Disponible", "Concluido", "Concluido por sistema"]
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
        required: [true, "El registro del autor es obligatoria"]
    },
    publishing_date: {
        type: Date,
        required: [true, "La fehca de publicación del evento es obligatoria"]
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

const Agenda = model<AgendaInterface>("Agenda", AgendaSchema)

export default Agenda