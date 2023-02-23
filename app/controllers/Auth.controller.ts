import { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import JWT, { JwtPayload } from "jsonwebtoken";
import Enviroment from "../config/Enviroment";
import { link, mensaje, sendEmail } from "../config/Mailer";
import { __Optional, __Required, __ThrowError } from "../middleware/ValidationControl";

function createToken(user: UserInterface, time: String) {
    return JWT.sign({
        register: user.register
    },
        Enviroment.JWT.secret,
        {
            expiresIn: String(time)
        })
}

export const LoginGet = async (req: Request, res: Response) => {
    try {
        __Required(req.body.credential, "credential", "string")

        __Required(req.body.password, "password", "string")

        __Optional(req.body.keepAlive, "keepAlive", "boolean")
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    let user = null
    try {
        if (req.body.credential.search('@') !== -1) {
            user = await User.findOne({ email: req.body.credential }).sort({ "register": "desc" })
        } else if (!Number.isNaN(req.body.credential) && req.body.credential.length === 10) {
            user = await User.findOne({ phone: req.body.credential }).sort({ "register": "desc" })
        } else if (req.body.credential.length === 12) {
            user = await User.findOne({ register: req.body.credential }).sort({ "register": "desc" })
        }

        return user && await user.validatePassword(req.body.password)
            ? res.status(200).json({
                message: "Sesión iniciada",
                token: createToken(user, req.body.keepAlive ? "90d" : "3d")
            })
            : res.status(401).json({
                message: "Hubo un problema al tratar de iniciar sesión",
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const sendRecoveryToken = async (req: Request, res: Response) => {
    try {
        __Required(req.body.credential, `credential`, `string`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    let user, newRoute
    try {
        if (req.body.credential.search('@') !== -1) {
            user = await User.findOne({ email: req.body.credential }).sort({ "register": "desc" })
        } else if (!Number.isNaN(req.body.credential) && req.body.credential.length === 10) {
            user = await User.findOne({ phone: req.body.credential }).sort({ "register": "desc" })
        } else if (req.body.credential.length === 12) {
            user = await User.findOne({ register: req.body.credential }).sort({ "register": "desc" })
        }

        if (user) {
            const token = createToken(user, "5m")
            newRoute = `localhost:3000/auth/recovery?token=${token}`
            const from = `"SAI" ${Enviroment.Mailer.email}`
            const to = String(user.email)
            const subject = "Recuperación de contraseña"
            const body = link(newRoute)
            await sendEmail(from, to, subject, body)
        }

        return res.status(200).json({
            message: "Si se encontró el usuario; Se mandó un correo de recuperación",
            newRoute: newRoute
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const recoverPassword = async (req: Request, res: Response) => {
    let token
    try {
        token = JWT.verify(String(req.query.token), Enviroment.JWT.secret) as JwtPayload
    } catch (error) {
        return res.status(400).json({
            message: "El link ha caducado",
        })
    }

    try {
        __Required(req.body.password, `password`, `string`);

        (/^.*(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/).test(req.body.password)
            ? null
            : __ThrowError("La contraseña no cumple con la estructura deseada")
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const user = await User.findOne({ register: token.register }).sort({ "register": "desc" })

        if (user && !(await user.validatePassword(req.body.password))) {
            user.password = req.body.password
            user.save()
            const from = `"SAI" ${Enviroment.Mailer.email}`
            const to = user.email
            const subject = "Recuperación de contraseña"
            const body = mensaje("Se actualizó la contraseña de su usuario.")
            await sendEmail(from, to, subject, body)

            return res.status(200).json({
                message: "Se actualizó la contraseña del usuario"
            })
        }

        return res.status(400).json({
            message: "La nueva contraseña no puede ser igual a la actual"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}