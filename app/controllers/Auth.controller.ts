import { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import JWT, { JwtPayload } from "jsonwebtoken";
import Enviroment from "../config/Enviroment";
import { link, sendEmail } from "../config/Mailer";

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
    if (!req.body.credential || !req.body.password) {
        return res.status(400).json({
            message: "Faltan datos"
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

        if (user) {
            if (await user.validatePassword(req.body.password)) {
                return res.status(200).json({
                    message: "Sesión iniciada",
                    user,
                    token: createToken(user, req.body.keepAlive ? "90d" : "3d")
                })
            }
        }

        return res.status(404).json({
            message: "Hubo un problema al tratar de iniciar sesión",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor",
            error
        })
    }
}

export const sendRecoveryToken = async (req: Request, res: Response) => {
    if (!req.body.credential) {
        return res.status(404).json({
            message: "Faltan datos"
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
            newRoute = `localhost:3000/auth/recovery?tkn=${token}`
            const from = `"Recuperación de contraseña SAI" ${Enviroment.Mailer.email}`
            const to = String(user.email)
            const subject = "Recuperación de contraseña"
            const body = link(newRoute)
            await sendEmail(from, to, subject, body)
        }

        return res.status(200).json({
            message: "Si se encontró el usuario se mandó un correo de recuperación",
            newRoute
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor",
        })
    }
}

export const recoverPassword = async (req: Request, res: Response) => {
    let token
    try {
        try {
            token = JWT.verify(String(req.query.tkn), Enviroment.JWT.secret) as JwtPayload
        } catch (error) {
            return res.status(400).json({
                message: "El link ha caducado",
            })
        }

        await User.findOne({ register: token.register }).sort({ "register": "desc" }).then(user => {
            if (user) {
                user.password = req.body.password
                user.save()
                return res.status(200).json({
                    message: "Se actualizó la contraseña del usuario"
                })
            }
        })

        return res.status(400).json({
            message: `No se pudo completar la operación`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor",
        })
    }
}