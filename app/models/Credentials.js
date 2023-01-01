import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const credentials_schema = new mongoose.Schema({
    user: String,
    password: String
});

credentials_schema.methods.encrypt_password = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

credentials_schema.methods.validate_password = function (password) {
    return bcrypt.compareSync(password, this.password);
}

export default mongoose.model('credentials', credentials_schema);