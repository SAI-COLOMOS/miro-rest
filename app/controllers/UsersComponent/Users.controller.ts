import { Request, Response } from "express"
import User, {UserInterface} from "../../models/User";

export const UsersGet = (req: Request, res: Response) => {
    return res.status(200).json({
        message: "I'm a teapot",
        lo: req.user
    })
}

export const UsersPost = async (req: Request, res: Response) => {
    try {
        const newUser = await new User(req.body).save()
        return res.status(201).json({
            message: "Usuario creado",
            data: newUser
        })
    } catch (error: any) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error
        })
    }
}