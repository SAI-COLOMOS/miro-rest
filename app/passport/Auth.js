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
        try {
            const user = new User();

            user.register = req.body.register;
            user.first_name = req.body.first_name;
            user.last_name = req.body.last_name;
            user.age = req.body.age;
            user.email = username;
            user.phone = req.body.phone;
            user.password = user.encrypt_password(password);
            user.emergency_contact = req.body.emergency_contact;
            user.emergency_phone = req.body.emergency_phone;
            user.blood_type = req.body.blood_type;
            user.provider_type = req.body.provider_type;
            user.from = req.body.from;
            user.assignment_area = req.body.assignment_area;
            user.status = req.body.status;
            user.school = req.body.school;
            user.role = req.body.role;

            await user.save();
            done(null, user);
        } catch (error) {
            done(error);
        }
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