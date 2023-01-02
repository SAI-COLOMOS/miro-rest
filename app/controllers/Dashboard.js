
import User from "../models/User.js";

export const Get = async (req, res, next) => {
    const user = await User.findById({_id: req.user.id}).then(
        (error, docs) => {
            if (!error) {
                return docs;
            } else {
                return error;
            }
        }
    ).catch(
        (error) => {
            return error;
        }
    );

    res.status(200).render('dashboard', {
        peticion: req.user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        user: JSON.stringify(user)
    });   
};

export const Put = (req, res, next) => {
    const data = req.body;
    User.create(data, (error, docs) => {
        if(error) {
            return res.status(400).send({
                message: `We got an error: ${error}.`
            });
        }
        res.status(201).send({
            message: `Success.`,
            data: docs
        });
    });
};