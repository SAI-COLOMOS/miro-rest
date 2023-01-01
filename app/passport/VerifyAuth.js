export const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.status(401).redirect('/login');
};

export const isNotAuthenticated = (req, res, next) => {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.status(401).redirect('/dashboard');
};