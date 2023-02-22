import { model, Schema, Document } from "mongoose"

export interface AreaInterface extends Document {
    area_identifier: string
    area_name: string
}

export interface PlaceInterface extends Document {
    place_identifier: string
    place_name: string
    place_areas: AreaInterface
}

const AreaSchema = new Schema({
    area_identifier: {
        type: String,
        index: true
    },
    area_name: {
        type: String,
        required: true,
        index: true
    },
}, {
    versionKey: false
})

const PlaceSchema = new Schema({
    place_identifier: {
        type: String,
        unique: true,
        index: true
    },
    place_name: {
        type: String,
        required: true,
        unique: true,
        index: true
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

            if (next_identifier < 10) {
                serie = "0" + next_identifier
            } else {
                serie = next_identifier.toString()
            }
        }

        this.place_identifier = serie
    }

    next()
})

const Place = model<PlaceInterface>("Places", PlaceSchema)

export default Place