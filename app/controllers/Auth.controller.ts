import { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import JWT, { JwtPayload } from "jsonwebtoken";
import Enviroment from "../config/Enviroment";
import { link, sendEmail } from "../config/Mailer";
import { Request, Response } from "express"
import User, { UserInterface } from "../models/User"
import JWT from "jsonwebtoken"
import Enviroment from "../config/Enviroment"

function createToken(user: UserInterface) {
    return JWT.sign({
        id: user.id,
    },
        Enviroment.JWT.secret,
        {
            expiresIn: "90d"
        })
}

export const LoginPost = async (req: Request, res: Response) => {
    if (!req.body.email) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return res.status(400).json({
            message: "Usuario no encontrado"
        })
    }

    if (await user.validatePassword(req.body.password)) {
        return res.status(200).json({
            message: "Sesión iniciada",
            token: createToken(user)
        })
    } else {
        return res.status(400).json({
            message: "Falló el inicio de sesión"
        })
    }
}

export const RegisterPost = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.email) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    if (await User.findOne({ email: req.body.email })) {
        return res.status(400).json({
            message: "Algunos datos ya están ocupados"
        })
    }

    try {
        const newUser = await new User(req.body).save()
        return res.status(201).json({
            message: "Usuario creado",
            data: newUser
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error
        })
    }
}

export const sendRecoveryToken = async (req: Request, res: Response) => {

    try {
        var user = await User.findOne({ email: req.body.email, phone: req.body.phone, register: req.body.register }).sort({ "register": "desc" })

        if (!user) {
            return res.status(200).json({
                status: 406,
                message: "Usuario no encontrado"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error
        })
    }

    const token = createToken(user)
    const newRoute = `localhost:3000/recovery/changePassword?tkn=${token}`

    try {
        // const from = `"Recuperación de contraseña SAI" ${Enviroment.Mailer.email}`
        // const to = "a19310166@ceti.mx"
        // const subject = "Recuperación de contraseña"
        // const body = link(newRoute)

        // sendEmail(from, to, subject, body)

    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error
        })
    }

    return res.status(200).json({
        message: "Correo enviado",
        route: newRoute
    })
}

export const recoverPassword = async (req: Request, res: Response) => {
    try {
        var token = JWT.verify(String(req.query.tkn), Enviroment.JWT.secret) as JwtPayload
    } catch (error) {
        return res.status(500).json({
            message: "El link ha caducado"
        })
    }

    try {
        var user = await User.findOne({ id: token.id }).sort({ "register": "desc" })
        if (!user) {
            return res.status(200).json({
                status: 406,
                message: "Usuario no encontrado"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error"
        })
    }

    try {
        user.password = req.body.password
        await user.save()
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error"
        })
    }

    return res.status(200).json({
        message: "Contraseña actualizada con éxico",
        data: {
            tkn: token.id
        }
    })
}