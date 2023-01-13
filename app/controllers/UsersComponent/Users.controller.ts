import { Request, Response } from "express"
import User, {UserInterface} from "../../models/User";

export const UsersGet = (req: Request, res: Response) => {
    return res.status(200).json({
        message: "I'm a teapot",
        lo: req.user
    })
}

export const UserGet = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({'register': req.params.id})
        if(user) {
            return res.status(200).json({
                message: "Listo",
                user
            })
        }

        res.status(200).json({
            message: `Usuario ${req.params.id} no encontrado`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error
        })
    }
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