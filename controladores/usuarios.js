const { query } = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const pwd = securePassword();

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  //verifica o não preenchimento de algum campo e retorna um aviso
  if (!nome) {
    res.status(400).json(`O nome é obrigatório.`);
    return;
  }
  if (!email) {
    res.status(400).json(`O e-mail é obrigatório.`);
    return;
  }
  if (!senha) {
    res.status(400).json(`A senha é obrigatória.`);
    return;
  }

  try {
    //verifica se o email inserido no cadastro já não está cadastrado
    const q1 = `select * from usuarios
                where email = $1`;
    const verificarEmail = await query(q1, [email]);

    if (verificarEmail.rowCount > 0) {
      res.status(400).json(`E-mail já está cadastrado.`);
      return;
    }

    //transforma a senha inserida no cadastro em um hash
    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
    const q2 = `insert into usuarios (nome, email, senha)
                values ($1, $2, $3)`;
    const cadastro = query(q2, [nome, email, hash]);

    //verifica se houve retorno da query, avisando erro caso não tenha dado resultado
    if (cadastro.rowCount === 0) {
      res.status(400).json(`Não foi possível cadastrar este usuário.`);
      return;
    }

    //resposta de sucesso à solicitação de cadastro de usuario
    res.status(200).json(`Usuário cadastrado com sucesso.`);
    return;
  } catch (error) {
    res.status(400).json(error.message);
    return;
  }
}

module.exports = {
  cadastrarUsuario
}