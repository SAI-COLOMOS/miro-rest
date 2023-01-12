import { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import JWT from "jsonwebtoken";
import Enviroment from "../config/Enviroment";
import { transporter } from "../config/Mailer";

function createToken(user: UserInterface, time: String) {
    return JWT.sign({
        id: user.id,
        time_stamp: user.createdAt
    },
        Enviroment.JWT.secret,
        {
            expiresIn: time === "" ? 86400 : time.toString()
        });
}

export const LoginPost = async (req: Request, res: Response) => {
    if (!req.body.email) {
        return res.status(400).json({
            message: "Faltan datos"
        });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(400).json({
            message: "Usuario no encontrado"
        });
    }

    if (await user.validatePassword(req.body.password)) {
        return res.status(200).json({
            message: "Sesión iniciada",
            token: createToken(user, "")
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
        });
    }

    if (await User.findOne({ email: req.body.email })) {
        return res.status(400).json({
            message: "Algunos datos ya están ocupados"
        });
    }

    try {
        const newUser = await new User(req.body).save();
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
        var user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(400).json({
                message: "Usuario no encontrado"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error
        })
    }

    const token = createToken(user, "5m")
    const newRoute = `localhost:3000/recoverPassword/${token}`

    try {
        await transporter.sendMail({
            from: '"Correo de prueba desde la api" <a19310153@gmail.com>',
            to: "a19310166@ceti.mx",
            subject: "El Miguel se la come entera",
            html: `
            <b>Porfavor haga click en el siguiente link si es que solicitó recuperación de contraseña</b>
            <a href=${newRoute}>=${newRoute}</a>
            `,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error
        })
    }

    return res.status(200).json({
        message: "Correo enviado",
        link: newRoute
    })
}