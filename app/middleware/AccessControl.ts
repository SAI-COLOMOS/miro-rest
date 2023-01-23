import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt"
import Enviroment from "../config/Enviroment"
import User from "../models/User"

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: Enviroment.JWT.secret
}

export default new Strategy(options, async (payload, done) => {
    try {
        const user = await User.findOne({'register': payload.register})

        if(user) {
            return done(null, user)
        }
    
        return done(null, false)
    } catch (error) {
        return done(error)
    }
})