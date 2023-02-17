import { Request, Response, NextFunction } from "express"
import User from "../models/User"

export const isAdministrador = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user)

    if (user.role == "administrador") {
        return next()
    }

    return res.status(403).json({
        message: "Usuario no autorizado"
    })
}

export const isEncargado = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user)

    if (user.role == "encargado") {
        return next()
    }

    return res.status(403).json({
        message: "Usuario no autorizado"
    })
}

export const isAdministradorOrEncargado = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user)

    if (user.role == "encargado" || user.role == "administrador") {
        return next()
    }

    return res.status(403).json({
        message: "Usuario no autorizado"
    })
}

export const isPrestador = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user)

    if (user.role == "prestador") {
        return next()
    }

    return res.status(403).json({
        message: "Usuario no autorizado"
    })
}