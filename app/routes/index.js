/* Importaciones */
import { Router } from 'express';

/* Varaibles */
const index = Router();

/* Rutas */
index.get('/', (req, res, next) => {
    res.render('index', {puerto: 3000})
})

index.post('/', (req, res, next) => {
    res.status(200).send({
        'data': {
            'status': 418,
            'message': `I'm a teapot`,
            'req': req.headers
        }
    });
})

index.put('/', (req, res, next) => {
    // Aquí va lo que quieras que haga
})

index.delete('/', (req, res, next) => {
    res.status(404);
})

/* Exportaciones */
export default index;