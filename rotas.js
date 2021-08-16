const express = require('express');
const { cadastrarUsuario } = require('./controladores/usuarios');

const rotas = express();

// cadastro e login de usuarios
rotas.post('/cadastro', cadastrarUsuario);

module.exports = rotas;