import { model, Schema, Document } from "mongoose"

export interface AreaInterface extends Document {
  area_identifier: string
  area_name: string,
  phone: string
}

export interface PlaceInterface extends Document {
  place_identifier: string
  avatar: string
  place_name: string
  municipality: string
  street: string
  postal_code: string
  exterior_number: string
  colony: string
  phone: string
  reference: string
  place_areas: AreaInterface[]
}

const AreaSchema = new Schema({
  area_identifier: {
    type: String,
    index: true,
  },
  area_name: {
    type: String,
    required: [true, "El nombre del área es necesario"]
  },
  phone: {
    type: String,
    required: [true, "El número de contacto es necesario"]
  }
}, {
  timestamps: true,
  versionKey: false
})

const PlaceSchema = new Schema({
  place_identifier: {
    type: String,
    unique: true,
    index: true,
  },
  avatar: {
    type: String,
  },
  place_name: {
    type: String,
    required: [true, "El nombre del lugar en necesario"],
    unique: true
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
  },
  place_areas: [AreaSchema]
}, {
  versionKey: false,
  timestamps: true
})

PlaceSchema.pre<PlaceInterface>("save", async function (next) {

  if (this.isNew) {
    let serie = "01"

    const last_identifier = await Place.findOne().sort({ "place_identifier": "desc" })

    if (last_identifier) {
      const next_identifier: number = Number(last_identifier.place_identifier) + 1

      next_identifier < 10
        ? serie = "0" + next_identifier
        : serie = next_identifier.toString()
    }

    this.place_identifier = serie
  }

  next()
})

const Place = model<PlaceInterface>("Places", PlaceSchema)

export default Place