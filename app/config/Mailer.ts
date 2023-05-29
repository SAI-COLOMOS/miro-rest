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

export const sendGreeting = (register: string, place: string, area: string, email: string) => {
  const body: string = `
 <!DOCTYPE html>
 <html lang="en">
 
 <head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
 </head>
 
 <body style="width: 100%;margin-left: 0%;background-color: rgb(30, 26, 29); font-family: Lexend Deca, sans-serif; color:
   #e3f2fd;">
 
   <main style="padding-top: 20px;padding-bottom: 20px;">
     <img style="height: 108px;width: 352px; padding-left: 10px;" src="cid:SAI@logo" />
     <h2 style="text-align: center;">¡Bienvenido/a!</h2>
     <div style="padding-left: 10px;">
       <p>Bienvenido/a al ${area} del ${place}. Agradecemos que hayas decidido formar parte de nuestras actividades.</p>
 
       <p>A continuación encontrarás tus credenciales para ingresar a nuestra aplicación,
         desde donde podrás inscribirte a las diferentes actividades y eventos, además de
         revisar tu progreso:</p>
 
       <p><strong>Registro: </strong> ${register}</p>
       <p><strong>Contraseña: </strong> ${register}</p>
 
       <p>Si quieres revisar que la información con la que fuiste inscrito sea correcta,
         revisa la sección <i>Mi Perfil</i> en la aplicación.</p>
     </div>
   </main>
 
   <footer style="background-color: rgb(129, 1, 129);">
     <div style="padding: 10px 0px 10px 30px">
       <p>
         © 2023 SAI Copyright
       </p>
     </div>
   </footer>
 </body>
 
 </html>
 `
  sendEmail(email, '¡Bienvenido!', body)

}

export const sendEnrollmentNotification = (author: string, event: string, email: string) => {
  const body: string = `
  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="width: 100%;margin-left: 0%;background-color: rgb(30, 26, 29); font-family: Lexend Deca, sans-serif; color:
  #e3f2fd;">

  <main style="padding-top: 20px;padding-bottom: 20px;">
    <img style="height: 108px;width: 352px; padding-left: 10px;" src="cid:SAI@logo" />
    <h2 style="text-align: center;">¡Haz sido inscrito a un evento!</h2>
    <div style="padding-left: 10px;">
      <p>El encargado ${author} te ha inscrito al evento ${event}.</p>

      <p>Si quieres revisar la información del evento, puedes acceder a ésta en la sección <i>Eventos</i>
        de la aplicación.</p>
    </div>
  </main>

  <footer style="background-color: rgb(129, 1, 129);">
    <div style="padding: 10px 0px 10px 30px">
      <p>
        © 2023 SAI Copyright
      </p>
    </div>
  </footer>
</body>

</html>
  `

  sendEmail(email, 'Inscripción a evento', body)
}

export const sendRecoveryEmail = (link: string, email: string) => {
  const body: string = `
  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="width: 100%;margin-left: 0%;background-color: rgb(30, 26, 29); font-family: Lexend Deca, sans-serif; color:
  #e3f2fd;">

  <main style="padding-top: 20px;padding-bottom: 20px;">
    <img style="height: 108px;width: 352px; padding-left: 10px;" src="cid:SAI@logo" />
    <h2 style="text-align: center;">Recuperación de contraseña</h2>
    <div style="padding-left: 10px;">
      <p style="text-align= center;">Si usted solicitó la recuperación de contraseña por favor haga click en el siguiente botón, caso contrario
        ignore éste correo: </p>
    </div>
    <div style="text-align: center; padding-bottom: 20px">
      <a href="${link}"
        style="background-color: rgb(255, 170, 243);color: rgb(30, 26, 29);text-decoration: none; padding: 10px;border-radius: 5px;">
        Reestablecer aquí</a>
    </div>
  </main>

  <footer style="background-color: rgb(129, 1, 129);">
    <div style="padding: 10px 0px 10px 30px">
      <p>
        © 2023 SAI Copyright
      </p>
    </div>
  </footer>
</body>

</html>
  `

  sendEmail(email, 'Recuperación de contraseña', body)
}

export const sendConfirmationMessage = (register: string, email: string) => {
  const body: string = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="width: 100%;margin-left: 0%;background-color: rgb(30, 26, 29); font-family: Lexend Deca, sans-serif; color:
  #e3f2fd;">

  <main style="padding-top: 20px;padding-bottom: 20px;">
    <img style="height: 108px;width: 352px; padding-left: 10px;" src="cid:SAI@logo" />
    <h2 style="text-align: center;">¡Se cambió la contraseña exitosamente!</h2>
    <div style="padding-left: 10px;">
      <p>Se cambio la contraseña de su usuario ${register} a la proporcionada.</p>
      <p>En caso de no reconocer ésta acción favor de comunicarse con su encargado.</p>
    </div>
  </main>

  <footer style="background-color: rgb(129, 1, 129);">
    <div style="padding: 10px 0px 10px 30px">
      <p>
        © 2023 SAI Copyright
      </p>
    </div>
  </footer>
</body>

</html>
`
  sendEmail(email, 'Cambio de contraseñá', body)
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
  const body = `
  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="width: 100%;margin-left: 0%;background-color: rgb(30, 26, 29); font-family: Lexend Deca, sans-serif; color:
  #e3f2fd;">

  <main style="padding-top: 20px;padding-bottom: 20px;">
    <img style="height: 108px;width: 352px; padding-left: 10px;" src="cid:SAI@logo" />
    <h2 style="text-align: center;">¡Hay un nuevo evento disponible!</h2>
    <div style="padding-left: 10px;text-align: center;">
      <p>Las inscripciones para el evento ${event.name} han comenzado.</p>
      <p>Para poder inscribirte o revisar la información del evento debes de ingresar a la aplicación e ingresar a
        la sección <i>Eventos</i>.
      </p>
      <p>¡Es mejor que que te apures, puede que se agoten las vacantes!</p>
    </div>
  </main>

  <footer style="background-color: rgb(129, 1, 129);">
    <div style="padding: 10px 0px 10px 30px">
      <p>
        © 2023 SAI Copyright
      </p>
    </div>
  </footer>
</body>

</html>
  `

  users.forEach((user: IUser) => {
    setTimeout(() => sendEmail(user.email, subject, body), 2000)
  })
}