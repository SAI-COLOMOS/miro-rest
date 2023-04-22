import { Request, Response } from 'express'
import JWT, { JwtPayload } from 'jsonwebtoken'

import User from '../models/User'

import { authenticate, createToken } from '../services/Auth.services'
import { credentialValidation, logInValidation, passwordValidation } from '../validators/Auth.validator'

import { IUser } from '../types/User'
import { ICredential, ILogIn } from '../types/Auth'

import Environment from '../config/Environment'
import { sendEmail, messageMail, recoverPasswordMail } from '../services/Mailer.services'

export const LoginGet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { error } = logInValidation.validate(req.body)

    if (error) return res.status(400).json({ message: error.message })

    const requestData: ILogIn = req.body

    const user: IUser | null = await authenticate(requestData)

    return user && await user.validatePassword(requestData.password)
      ? res.status(200).json({
        message: 'Sesión iniciada',
        token: createToken(user, requestData.keepAlive ? '90d' : '3d')
      })
      : res.status(401).json({
        message: 'Hubo un problema al tratar de iniciar sesión',
      })
  } catch (error) {
    return res.status(500).json({
      message: 'Ocurrió un error en el servidor',
      error: error?.toString()
    })
  }
}

export const sendRecoveryToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { error } = credentialValidation.validate(req.body)

    if (error) return res.status(400).json({ message: error.message })

    const requestData: ICredential = req.body

    const user: IUser | null = await authenticate(requestData)

    if (user) {
      const token = createToken(user, '5d')
      const newRoute = `https://api.sai-colomos.dev/auth/recovery?token=${token}`
      const to = String(user.email)
      const subject = 'Recuperación de contraseña'
      const body = recoverPasswordMail(newRoute)
      await sendEmail(to, subject, body)
    }

    return res.status(200).json({ message: 'Si se encontró el usuario; Se mandó un correo de recuperación' })
  } catch (error) {
    return res.status(500).json({
      message: 'Ocurrió un error en el servidor',
      error: error?.toString()
    })
  }
}

export const recoverPassword = async (req: Request, res: Response): Promise<Response> => {
  let token: JwtPayload
  try {
    token = JWT.verify(String(req.query.token), Environment.JWT.secret) as JwtPayload
  } catch (error) {
    return res.status(400).json({
      message: 'El link ha caducado',
    })
  }

  try {
    const { error } = passwordValidation.validate(req.body)

    if (error) return res.status(400).json({ message: error.message })

    const user: IUser | null = await User.findOne({ register: token.register })

    if (user && !(await user.validatePassword(req.body.password))) {
      user.password = req.body.password
      user.save()
      const to = user.email
      const subject = 'Recuperación de contraseña'
      const body = messageMail('Se actualizó la contraseña de su usuario.')
      await sendEmail(to, subject, body)

      return res.status(200).json({ message: 'Se actualizó la contraseña del usuario' })
    }

    return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la actual' })
  } catch (error) {
    return res.status(500).json({
      message: 'Ocurrió un error en el servidor',
      error: error?.toString()
    })
  }
}