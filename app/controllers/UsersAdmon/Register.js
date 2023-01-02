import passport from "passport";

export const Get = (req, res, next) => {
    res.status(200).render('login/login');
}

export const Register_put = passport.authenticate('register', {
    successRedirect: '/dashboard',
    //failureMessage: true,
    //failWithError: true,
    passReqToCallback: true
});