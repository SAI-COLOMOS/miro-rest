import passport from "passport";
import Local from "passport-local";
import Credentials from "../models/Credentials.js";

passport.serializeUser((credential, done) => {
    done(null, credential.id);
});

passport.deserializeUser(async (id, done) => {
    const credential = await Credentials.findById(id);
    done(null, credential);
});

passport.use('signup', new Local.Strategy({
    usernameField: 'user',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, user, password, done) => {
    if(await Credentials.findOne({user: user})) {
        console.error(`El usuario ${user} ya existe.`);
        done(null, false);
    } else {
        const credential = new Credentials();
        credential.user = user;
        credential.password = credential.encrypt_password(password);
        await credential.save();
        done(null, credential);
    }
}));

passport.use('login', new Local.Strategy({
    usernameField: 'user',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, user, password, done) => {
    user = await Credentials.findOne({user});
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