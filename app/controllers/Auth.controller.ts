import { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import JWT, { JwtPayload } from "jsonwebtoken";
import Enviroment from "../config/Enviroment";
import { link, sendEmail } from "../config/Mailer";

function createToken(user: UserInterface, time: String) {
    return JWT.sign({
        id: user.id
    },
        Enviroment.JWT.secret,
        {
            expiresIn: String(time)
        })
}

export const LoginPost = async (req: Request, res: Response) => {
    if (!req.body.credential || !req.body.password) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }
    let user
    try {
        if (req.body.credential.search('@') !== -1) {
            user = await User.findOne({ email: req.body.credential }).sort({ "register": "desc" })
        } else if (!Number.isNaN(req.body.credential) && req.body.credential.length === 10) {
            user = await User.findOne({ phone: req.body.credential }).sort({ "register": "desc" })
        } else {
            user = await User.findOne({ register: req.body.credential }).sort({ "register": "desc" })
        }
        if (!user) {
            return res.status(404).json({
                message: "No se encontró ningún usuario"
            })
        }
        if (!await user.validatePassword(req.body.password)) {
            return res.status(400).json({
                message: "Falló el inicio de sesión, la contraseña o el usuario es incorrecto"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor",
            error
        })
    }

    return res.status(200).json({
        message: "Sesión iniciada",
        token: createToken(user, "7d")
    })
}

export const sendRecoveryToken = async (req: Request, res: Response) => {
    let user, newRoute
    try {
        if (req.body.credential.search('@') !== -1) {
            user = await User.findOne({ email: req.body.credential }).sort({ "register": "desc" })
        } else if (!Number.isNaN(req.body.credential) && req.body.credential.length === 10) {
            user = await User.findOne({ phone: req.body.credential }).sort({ "register": "desc" })
        } else {
            user = await User.findOne({ register: req.body.credential }).sort({ "register": "desc" })
        }
        if (!user) {
            return res.status(404).json({
                message: "No se encontró ningún usuario"
            })
        }
        const token = createToken(user, "5m")
        newRoute = `localhost:3000/auth/changePassword?tkn=${token}`
        const from = `"Recuperación de contraseña SAI" ${Enviroment.Mailer.email}`
        const to = String(user.email)
        const subject = "Recuperación de contraseña"
        const body = link(newRoute)
        await sendEmail(from, to, subject, body)
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor",
            error
        })
    }

    return res.status(200).json({
        message: "Correo enviado",
    })
}

export const recoverPassword = async (req: Request, res: Response) => {
    let token, user
    try {
        try {
            token = JWT.verify(String(req.query.tkn), Enviroment.JWT.secret) as JwtPayload
        } catch (error) {
            return res.status(400).json({
                message: "El link ha caducado",
            })
        }
        user = await User.findById(token.id)
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado",
            })
        }
        user.password = req.body.password
        await user.save()
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error al connectarse con el servidor"
        })
    }

    return res.status(200).json({
        message: "Contraseña actualizada con éxito",
    })
}