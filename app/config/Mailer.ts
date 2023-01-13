import Enviroment from "./Enviroment"

const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: Enviroment.Mailer.email,
        pass: Enviroment.Mailer.appPass,
    },
})

export const link = (link: String) => {
    return `<b>Porfavor haga click en el siguiente link si es que solicitó recuperación de contraseña</b>
    <a href=${link}>=${link}</a>`
}

export const sendEmail = async (from: String, to: String, subject: String, body: String) => {
    await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: body

    })
}
