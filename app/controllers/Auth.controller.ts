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
    if(!req.body.email) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    const user = await User.findOne({email: req.body.email})
    
    if(!user) {
        return res.status(400).json({
            message: "Usuario no encontrado"
        })
    }

    if(await user.validatePassword(req.body.password)) {
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
    if(!req.body.email) {
        return res.status(400).json({
            message: "Faltan datos"
        })
    }

    if(await User.findOne({email: req.body.email})) {
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