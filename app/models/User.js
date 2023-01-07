import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
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
});

UserSchema.methods.encrypt_password = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

UserSchema.methods.validate_password = function (password) {
    return bcrypt.compareSync(password, this.password);
}

export default mongoose.model('users', UserSchema);