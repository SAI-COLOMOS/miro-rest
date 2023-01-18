import { model, Schema, Document, Model } from "mongoose"
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
        required: [true, "El registro es necesario"],
        unique: true,
        index: true
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
    age: {
        type: String,
        required: [true, "La edad es necesaria"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "El correo es necesario"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "El teléfono de contacto es necesario"],
        minLength: [10, 'El número telefónico tiene que ser igual a 10 digitos'],
        maxLength: [10, 'El número telefónico tiene que ser igual a 10 digitos']
    },
    password: {
        type: String,
        required: [true, "La contraseña es necesaria"]
    },
    avatar: {
        type: String,
        default: '/protected/default.png'
    },
    emergency_contact: {
        type: String,
        required: [true, "El contacto de emergencia es necesario"]
    },
    emergency_phone: {
        type: String,
        minLength: [10, 'El número telefónico tiene que ser igual a 10 digitos'],
        maxLength: [10, 'El número telefónico tiene que ser igual a 10 digitos'],
        required: [true, "El teléfono de emergencia es necesario"]
    },
    blood_type: {
        type: String,
        required: [true, "El tipo de sangre es necesario"],
        uppercase: true
    },
    provider_type: {
        type: String,
        required: [true, "El tipo de prestador es necesario"]
    },
    place: {
        type: String,
        required: [true, "El lugar es necesario"]
    },
    assignment_area: {
        type: String,
        required: [true, "El área de asignación es necesaria"]
    },
    status: {
        type: String,
        enum: ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']
    },
    school: {
        type: String,
        required: [true, "La escuela es necesaria"]
    },
    role: {
        type: String,
        enum: ['Administrador', 'Encargado', 'Prestador'],
        required: [true, "El rol es necesario"]
    }
}, {
    versionKey: false,
    timestamps: true
})

async function newRegisterForProvider(inputPlace: string, inputAssignment_area: string): Promise<string> {
    const [year, month] = new Date().toISOString().split('-')
    const seasson = Number(month) <= 6 ? 'A' : 'B'
    const place: any = await Place.findOne({ "place_name": inputPlace })
    const area = place.place_areas.filter((item: any) => item.area_name === inputAssignment_area ? true : null)
    const lastRegister = await User.findOne().sort({ "register": "desc" }).select('register').where({ 'register': { $regex: `${year}${seasson}${place.place_identifier}${area[0].area_identifier}` + '.*' } })
    let serie = "001"

    if (lastRegister) {
        let nextSerie = Number(lastRegister.register.substring(lastRegister.register.length - 3)) + 1

        if (nextSerie < 10) {
            serie = "00" + nextSerie
        } else if (nextSerie < 100) {
            serie = "0" + nextSerie
        } else {
            serie = nextSerie.toString()
        }
    }

    return `${year}${seasson}${place.place_identifier}${area[0].area_identifier}${serie}`
}

async function newRegisterForAdministratorOrManager(inputFirst_name: string, inputFirst_last_name: string, inputSecond_last_name: string, inputPlace: string, inputAssignment_area: string): Promise<string> {
    const first_name = inputFirst_name.substring(0, 2).toUpperCase();
    const first_last_name = inputFirst_last_name.substring(0, 2).toUpperCase();
    const second_last_name = inputSecond_last_name ? inputSecond_last_name.substring(0, 2).toUpperCase() : "XX"
    const place: any = await Place.findOne({ "place_name": inputPlace })
    const area = place.place_areas.filter((item: any) => item.area_name === inputAssignment_area ? true : null)
    const random: string = Math.floor(Math.random() * 999).toString()

    return `${first_last_name}${second_last_name}${first_name}${place.place_identifier}${area[0].area_identifier}${random}`
}

UserSchema.pre<UserInterface>("save", async function (next) {
    if (this.isModified('password')) {
        this.password = await Bycrypt.hash(this.password, await Bycrypt.genSalt(10))
    }

    if (this.isModified('register')) {
        if (this.role === "Prestador") {
            newRegisterForProvider(this.place, this.assignment_area).then(
                (response) => {
                    this.register = response
                }
            ).catch(
                (error) => console.log(error)
            )
        } else if (this.role === "Administrador" || this.role === "Encargado") {
            newRegisterForAdministratorOrManager(this.first_name, this.first_last_name, this.second_last_name, this.place, this.assignment_area).then(
                (response) => {
                    this.register = response
                }
            ).catch(
                (error) => console.log(error)
            )
        }
    }

    next()
})

UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
    return await Bycrypt.compare(password, this.password)
}

const User = model<UserInterface>("Users", UserSchema)

export default User