import passport from "passport";

export const Get = (req, res, next) => {
    res.status(200).render('login/login');
}

export const Post = passport.authenticate('login', {
    successRedirect: '/dashboard',
    //failureRedirect: '/login',
    failureMessage: true,
    passReqToCallback: true
});