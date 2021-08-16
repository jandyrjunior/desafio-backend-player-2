const { query } = require('../conexao');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const verificarLogin = async(req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(404).json('Token não informado.');
        return;
    }

    try {
        const token = authorization.replace('Bearer ', '');
        const { id } = jwt.verify(token, jwtSecret);
        const queries = 'select * from usuarios where id = $1';
        const { rows, rowCount } = await query(queries, [id]);
        
        if (rowCount === 0) {
            res.status(404).json('Usuário não encontrado');
            return;
        }

        const usuario = rows[0];
        
        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(400).json(error.message);
        return;
    }
}

module.exports = verificarLogin;