import Enviroment from "./Enviroment"

const nodemailer = require("nodemailer")

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: Enviroment.Mailer.email,
        pass: Enviroment.Mailer.appPass,
    },
})

transporter.verify().then(() => {
    console.log('Transporter ready')
})
