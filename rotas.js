const express = require('express');
const { listarEmpresasCadastradas, editarEmpresa, excluirEmpresa, cadastrarEmpresa } = require('./controladores/empresas');
const { logarUsuario } = require('./controladores/login');
const { cadastrarUsuario, acessarPerfil, alterarPerfil } = require('./controladores/usuarios');
const verificarLogin = require('./filtros/verificarLogin');

const rotas = express();

// cadastro e login de usuarios
rotas.post('/cadastro', cadastrarUsuario);
rotas.post('/login', logarUsuario);

//middleware de autenticação
rotas.use(verificarLogin);

//usuarios
rotas.get('/perfil', acessarPerfil);
rotas.put('/perfil', alterarPerfil);

//empresas
rotas.post('/empresas', cadastrarEmpresa);
rotas.get('/empresas', listarEmpresasCadastradas);
rotas.patch('/empresas', editarEmpresa);
rotas.delete('/empresas', excluirEmpresa);

module.exports = rotas;