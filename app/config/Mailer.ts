import { IEvent } from '../models/Agenda'
import User, { IUser } from '../models/User'
import Environment from "./Environment"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: Environment.Mailer.email,
    pass: Environment.Mailer.appPass,
  },
})

export const sendEmail = async (to: string, subject: string, body: string) => {
  await transporter.sendMail({
    from: `"SAI" ${Environment.Mailer.email}`,
    to: to,
    subject: subject,
    html: body,
    attachments: [{
      filename: 'logo.png',
      path: './public/logo.png',
      cid: 'SAI@logo'
    }]
  })
}

export const mensaje = (mensaje: String) => `
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
                <h2 style="text-align: center;">${mensaje}</h2>
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
          <img style="height: 100%;width: 400px;" src="cid:SAI@logo"/>
        </div>
        <div style="width: 100%; text-align: center;color: #e3f2fd;">
          <h2 style="text-align: center;font-size:15px;">
            Por favor, haga click en el siguiente link si es que solicitó
            recuperación de
            contraseña.</h2>
          <h2 style="text-align: center;font-size:15px;">
            En caso que no la haya solicitado ignore el correo.</h2>
          <a href='` + link + `'
            style="background-color: #4a148c;color: #e3f2fd;text-decoration: none; padding: 10px;border-radius: 5px;">Reestablecer
            aquí</a>
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

export const sendMailForPublishing = async (event: IEvent) => {
  const users: IUser[] = await User.find({
    "status": "Activo",
    "role": "Prestador",
    "place": event.belonging_place,
    "assigned_area": event.belonging_area
  })
  const subject = '¡Hay un evento disponible para tí!'
  const body = mensaje(`La inscripción para el evento  ${event.name} ya comenzó.`)

  users.forEach((user: IUser) => {
    sendEmail(user.email, subject, body)
  })
}