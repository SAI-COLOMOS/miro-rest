export const Get = (req, res, next) => {
    res.status(404).render('404');
}

export const Post = (req, res, next) => {
    res.status(404).send({
        message: 'El recurso solicitado no existe.'
    });
}