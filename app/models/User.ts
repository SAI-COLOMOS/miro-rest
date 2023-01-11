import {model, Schema, Document} from "mongoose"
import Bycrypt from "bcrypt"

export interface UserInterface extends Document {
    register: string
    first_name: string
    last_name: string
    age: string
    email: string
    phone: string
    password: string
    emergency_contact: string
    emergency_phone: string
    blood_type: string
    provider_type: string
    from: string
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
    last_name: {
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
        unique: true,
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
    from: {
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

UserSchema.pre<UserInterface>("save", async function(next) {
    if(!this.isModified('password')) {
        return next()
    }

    this.password = await Bycrypt.hash(this.password, await Bycrypt.genSalt(10))

    next()
})

UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
    return await Bycrypt.compare(password, this.password)
}

export default model<UserInterface>("Users", UserSchema)