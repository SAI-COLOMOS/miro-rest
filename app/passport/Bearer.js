import Passport from "passport";
import Bearer from "passport-http-bearer";
import User from "../models/User.js";

Passport.use('bearerRegister', new Bearer.Strategy(
    function (token, done) {
        User.findOne({token: token}, function (error, user) {
            if(error) {
                return done(error);
            }

            if(!user) {
                return done(null, false);
            }

            return done(null, user, {scope: 'all'});
        })
    }
));