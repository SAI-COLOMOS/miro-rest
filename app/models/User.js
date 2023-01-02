import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: '/protected/default.png'
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