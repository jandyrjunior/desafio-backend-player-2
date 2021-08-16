const express = require('express');
const { logarUsuario } = require('./controladores/login');
const { cadastrarUsuario } = require('./controladores/usuarios');
const verificarLogin = require('./filtros/verificarLogin');

const rotas = express();

// cadastro e login de usuarios
rotas.post('/cadastro', cadastrarUsuario);
rotas.post('/login', logarUsuario);

//middleware de autenticação
rotas.use(verificarLogin);


module.exports = rotas;