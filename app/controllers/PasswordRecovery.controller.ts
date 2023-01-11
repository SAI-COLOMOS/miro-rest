import { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import JWT from "jsonwebtoken";
import Enviroment from "../config/Enviroment";

function createToken(user: UserInterface) {
    return JWT.sign({
        id: user.id,
        time_stamp: user.createdAt
    },
        Enviroment.JWT.recoverySecret,
        {
            expiresIn: 86400
        });
}

export const RecoverPassword = async (req: Request, res: Response) => {

    const user = await User.findOne({ email: req.body.email });

    if (user) {
        return res.status(200).json({
            token: createToken(user)
        });
    }
    return res.status(418).json({
        message: "I'm a teapot"
    });
}