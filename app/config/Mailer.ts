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

export const sendEmail = async (from: String, to: String, subject: String, body: String) => {
    await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: body,
        attachments: [{
            filename: 'logo.png',
            path: './app/public/logo.png',
            cid: 'SAI@logo'
        }]
    })
}

export const link = (link: String) => {
    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>

    <body style="width: 100%;background-color: rgb(15, 15, 15); font-family: Lexend Deca, sans-serif; color: #e3f2fd;">

        <div style="width: 100%;padding-top: 20px;padding-bottom: 20px;">
            <div style="width: 100%; text-align: center;">
                <img style="height: 150px;width: 400px;" src="cid:SAI@logo" />
            </div>
            <div style="width: 100%; text-align: center;color: #e3f2fd;">
                <h2 style="text-align: center;">Por favor, haga click en el siguiente link si es que solicitó
                    recuperación de
                    contraseña</h2>
                <a href=${link}><button
                        style="color: #e3f2fd;background-color: #7b1fa2; border-radius: 5px;border-width: 0px;padding: 15px;-webkit-text-stroke: 0.5px;"><strong>Reestablecer</strong></button></a>
            </div>
        </div>

        
        </body>
        <footer style="width: 100%;color: #e3f2fd;">
            <div style="width: 100%;background-color: #4a148c;">
                <div style="padding: 10px 0px 10px 30px">
                    <p>
                        © 2023 SAI Copyright
                    </p>
                </div>
            </div>

        </footer>
        
    </html>
    `
}