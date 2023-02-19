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
        unique: true,
        index: true
    },
    area_name: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
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
        lowercase: true,
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

        const last_identifier = await Place.findOne().sort({ "place_identifier": "desc" }).select("place_identifier")

        if (last_identifier) {
            const next_identifier: number = Number(last_identifier) + 1

            if (next_identifier < 10) {
                serie = "0" + next_identifier
            } else {
                serie = next_identifier.toString()
            }
        }

        this.place_identifier = serie
    }

    // if (this.isModified("place_areas")) {
    //     let serie = "001"
    //     const obj = this.toObject()

    //     const name = obj.place_areas[obj.place_areas.length - 1].area_name
    //     let arr = this.place_areas.toObject()

    //     obj.place_areas.pop()
    //     obj.place_areas.sort(function (a: any, b: any) { return b.area_identifier - a.area_identifier })

    //     const last_identifier = obj.place_areas[0]
    //     const next_identifier = Number(last_identifier.area_identifier) + 1
    //     if (next_identifier < 10) {
    //         serie = "00" + next_identifier
    //     } else if (next_identifier < 100) {
    //         serie = "0" + next_identifier
    //     } else {
    //         serie = next_identifier.toString()
    //     }

    //     arr[arr.findIndex((area: AreaInterface) => area.area_name === name)].area_identifier = serie
    //     this.place_areas = arr
    // }

    next()
})

const Place = model<PlaceInterface>("Places", PlaceSchema)

export default Place