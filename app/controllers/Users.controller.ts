import { Request, Response } from "express"
import User, { UserInterface } from "../models/User";
import { CardPost } from "./Card.controller";

export const UsersGet = async (req: Request, res: Response) => {
    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0

        await User.find().sort({ "createdAt": "desc" }).limit(items).skip(page * items).then(
            (result) => {
                if (result.length > 0) {
                    return res.status(200).json({
                        message: "Listo",
                        users: result
                    })
                } else {
                    res.status(200).json({
                        message: `Sin resultados`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )


    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }

}

export const UserGet = async (req: Request, res: Response) => {
    try {
        await User.findOne({ 'register': req.params.id }).then(
            (result) => {
                if (result) {
                    return res.status(200).json({
                        message: "Listo",
                        user: result
                    })
                } else {
                    res.status(404).json({
                        message: `Usuario ${req.params.id} no encontrado`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}

export const UserPost = async (req: Request, res: Response) => {
    try {
        await new User(req.body).save().then(
            async (result) => {
                if (result) {
                    return res.status(201).json({
                        message: "Usuario creado",
                        data: result
                    })
                } else {
                    return res.status(500).json({
                        message: "No se pudo crear el usuario",
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )
    } catch (error: any) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}

export const UserDelete = async (req: Request, res: Response) => {
    try {
        await User.deleteOne({ 'register': req.params.id }).then(
            (result) => {
                if (result.deletedCount !== 0) {
                    return res.status(200).json({
                        message: "Usuario eliminado",
                    })
                } else {
                    return res.status(404).json({
                        message: `Usuario ${req.params.id} no encontrado`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )

    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}

export const UserPatch = async (req: Request, res: Response) => {
    try {
        if (req.body.password || req.body.register) {
            return res.status(400).json({
                message: "Algunos campos no se pueden actualizar"
            })
        }

        await User.updateOne({ 'register': req.params.id }, req.body).then(
            (result) => {
                if (result.modifiedCount > 0) {
                    return res.status(200).json({
                        message: `Se actualizó la información del usuario ${req.params.id}`
                    })
                } else {
                    return res.status(404).json({
                        message: `Usuario ${req.params.id} no encontrado`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )

    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}