import {model, Schema, Document, Model} from "mongoose"
import Bycrypt from "bcrypt"

import Place from "./Place";

export interface UserInterface extends Document {
    register: string
    first_name: string
    first_last_name: string
    second_last_name: string
    age: string
    email: string
    phone: string
    password: string
    emergency_contact: string
    emergency_phone: string
    blood_type: string
    provider_type: string
    place: string
    assignment_area: string
    status: string
    school: string
    role: string
    validatePassword: (password: string) => Promise<boolean>
}

const UserSchema = new Schema({
    register: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    first_last_name: {
        type: String,
        required: true,
        trim: true
    },
    second_last_name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        minLength: [10, 'El número telefónico tiene que ser igual a 10 digitos'],
        maxLength: [10, 'El número telefónico tiene que ser igual a 10 digitos']
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: '/protected/default.png'
    },
    emergency_contact: {
        type: String,
        required: true
    },
    emergency_phone: {
        type: String,
        minLength: [10, 'El número telefónico tiene que ser igual a 10 digitos'],
        maxLength: [10, 'El número telefónico tiene que ser igual a 10 digitos'],
        required: true
    },
    blood_type: {
        type: String,
        required: true,
        uppercase: true
    },
    provider_type: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    assignment_area: {
        type:  String,
        required: true
    },
    status: {
        type: String,
        enum: ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']
    },
    school: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

async function newRegisterForProvider(inputPlace: string, inputAssignment_area: string): Promise<string> {
    const [year, month] = new Date().toISOString().split('-')
    const seasson = Number(month) <= 6 ? 'A' : 'B'
    const place: any = await Place.findOne({"place_name": inputPlace})
    const area = place.place_areas.filter((item: any) => item.area_name === inputAssignment_area ? true : null)
    const lastRegister = await User.findOne().sort({"register": "desc"}).select('register').where({'register': { $regex: `${year}${seasson}${place.place_identifier}${area[0].area_identifier}` + '.*' }})
    let serie = "001"

    if(lastRegister) {
        let nextSerie = Number(lastRegister.register.substring(lastRegister.register.length - 3)) + 1

        if(nextSerie < 10) {
            serie = "00" + nextSerie
        } else if (nextSerie < 100) {
            serie = "0" + nextSerie
        } else {
            serie = nextSerie.toString()
        }
    }

    return `${year}${seasson}${place.place_identifier}${area[0].area_identifier}${serie}`
}

UserSchema.pre<UserInterface>("save", async function(next) {
    if(!this.isModified('password') || !this.isModified('register')) {
        return next()
    }

    newRegisterForProvider(this.place, this.assignment_area)
    .then(
        (response) => {
            console.log(response)
            this.register = response
        }
    ).catch(
        (error) => console.log(error)
    )

    console.log("Hola")

    this.password = await Bycrypt.hash(this.password, await Bycrypt.genSalt(10))

    next()
})

UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
    return await Bycrypt.compare(password, this.password)
}

const User = model<UserInterface>("Users", UserSchema)

export default User