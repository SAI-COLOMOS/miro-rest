import { Request, Response } from "express"
import User, {UserInterface} from "../../models/User";

export const UserGet = (req: Request, res: Response) => {
    return res.status(200).json({
        message: "I'm a teapot",
        lo: req.user
    })
}

export const UsersPost = async (req: Request, res: Response) => {
    //if(!req.body.email) {
    //    return res.status(400).json({
    //        message: "Faltan datos"
    //    })
    //}

    //if(await User.findOne({email: req.body.email})) {
    //    return res.status(400).json({
    //        message: "Algunos datos ya están ocupados"
    //    })
    //}

    try {
        const newUser = await new User(req.body).save()
        return res.status(201).json({
            message: "Usuario creado",
            data: newUser
        })
    } catch (error: any) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error._message
        })
    }
}