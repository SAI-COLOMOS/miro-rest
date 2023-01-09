import { Request, Response, NextFunction } from "express";
import User, {UserInterface} from "../models/User";

export const isAdministrador = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user);

    if(user.role == "Administrador") {
        return next();
    };

    return res.status(403).json({
        message: "Usuario no autorizado"
    });
};

export const isEncargado = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user);

    if(user.role == "Encargado") {
        return next();
    };

    return res.status(403).json({
        message: "Usuario no autorizado"
    });
};

export const isAdministradorOrEncargado = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user);

    if(user.role == "Encargado" || user.role == "Administrador") {
        return next();
    };

    return res.status(403).json({
        message: "Usuario no autorizado"
    });
};

export const isPrestador = (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.user);

    if(user.role == "Prestador") {
        return next();
    };

    return res.status(403).json({
        message: "Usuario no autorizado"
    });
}