import { Request, Response } from "express";

export const UserGet = (req: Request, res: Response) => {
    return res.status(418).json({
        message: "I'm a teapot"
    });
}