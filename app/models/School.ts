import { model, Schema, Document } from "mongoose"

export interface SchoolInterface extends Document {
    school_identifier: string
    school_name: string
    municipality: string
    street: string
    postal_code: string
    exterior_number: string
    colony: string
    phone: string
    reference: string
}

const SchoolSchema = new Schema({
    school_identifier: {
        type: String,
        unique: true,
        index: true,
    },
    school_name: {
        type: String,
        required: [true, "El nombre del lugar en necesario"],
        unique: true,
    },
    municipality: {
        type: String,
        required: [true, "El municipio es encesario"]
    },
    street: {
        type: String,
        required: [true, "La calle es necesaria"]
    },
    postal_code: {
        type: String,
        required: [true, "El código postal es necesario"]
    },
    exterior_number: {
        type: String,
        required: [true, "El número de dirección es necesario"]
    },
    colony: {
        type: String,
        required: [true, "La colonia es necesaria"]
    },
    phone: {
        type: String,
        required: [true, "El número de contacto es necesario"]
    },
    reference: {
        type: String
    }
}, {
    versionKey: false,
    timestamps: true
})

SchoolSchema.pre<SchoolInterface>("save", async function (next) {

    if (this.isNew) {
        let serie = "01"

        const last_identifier = await School.findOne().sort({ "school_identifier": "desc" })

        if (last_identifier) {
            const next_identifier: number = Number(last_identifier.school_identifier) + 1

            next_identifier < 10
                ? serie = "0" + next_identifier
                : serie = next_identifier.toString()
        }

        this.school_identifier = serie
    }

    next()
})

const School = model<SchoolInterface>("Schools", SchoolSchema)

export default School