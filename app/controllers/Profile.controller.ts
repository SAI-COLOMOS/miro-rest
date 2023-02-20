import { Request, Response } from "express"
import User from "../models/User"

export const ProfileGet = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ 'register': req.params.id })

        if (user) {
            return res.status(200).json({
                message: "Listo",
                user
            })
        }

        return res.status(404).json({
            message: `Usuario ${req.params.id} no encontrado`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error
        })
    }
}
