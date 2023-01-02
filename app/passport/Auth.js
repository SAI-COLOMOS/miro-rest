import passport from "passport";
import Local from "passport-local";
import Credentials from "../models/Credentials.js";
import User from "../models/User.js";

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use('register', new Local.Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req, username, password, done) => {
    if(await User.findOne({email: username})) {
        console.error(`El usuario ${username} ya existe.`);
        done(null, false);
    } else {
        const user = new User();
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.email = username;
        user.password = user.encrypt_password(password);
        await user.save();
        done(null, user);
    }
}));

passport.use('login', new Local.Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req, username, password, done) => {
    const user = await User.findOne({email: username});
    if(!user) {
        console.error('No existe el usuario.');
        return done(null, false);
    }

    if(!await user.validate_password(password)) {
        console.error('Las credenciales no coinciden.');
        return done(null, false);
    }

    done(null, user);
}));

export default passport;