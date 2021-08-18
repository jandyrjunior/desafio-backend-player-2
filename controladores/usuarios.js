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
    const q1 = `select * from usuario
                where email = $1`;
    const verificarEmail = await query(q1, [email]);

    if (verificarEmail.rowCount > 0) {
      res.status(400).json(`E-mail já está cadastrado.`);
      return;
    }

    //transforma a senha inserida no cadastro em um hash
    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
    const q2 = `insert into usuario (nome, email, senha)
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

const acessarPerfil = async (req, res) => {
  const { senha, ...dadosUsuario } = await req.usuario;

  if (!dadosUsuario) {
    res.status(400).json('Usuário precisa ser informado.');
    return;
  }

  try {
    res.status(200).json(dadosUsuario);
    return
  } catch (error) {
    res.status(400).json(error.message);
    return;
  }
}

const alterarPerfil = async (req, res) => {
  let { nome, email, senha } = req.body;
  const { senha: senhaAntiga, ...dadosUsuario } = await req.usuario;

  try {
    if (email) {
      const consultaEmail = await query(`select * from usuario where email = $1`, [email]);

      if (consultaEmail.rowCount > 0) {
        res.status(400).json('Não foi possível realizar as alterações. Email já cadastrado.');
        return;
      }
    }

    /*esse conjunto de if's foi criado pensando na possibilidade
   de o usuario nao querer atualizar todos os campos, entao
   os valores existentes sao inseridos nos campos que seriam atualizados
   sendo assim, mesmo que os campos obrigatorios nao sejam preenchidos
   pelo usuario, eles receberao um valor*/

    if (!nome) {
      nome = dadosUsuario.nome;
    }
    if (!email) {
      email = dadosUsuario.email;
    }
    if (!senha) {
      const q1 = `update usuario 
      set nome = $1, nome_loja = $2, email = $3
      where usuario.id = $4`

      const dadosAtualziados = await query(q1, [nome, email, dadosUsuario.id]);

      if (dadosAtualziados.rowCount === 0) {
        res.status(400).json('não foi possível atualizar os dados deste usuário.');
        return;
      }

      res.status(200).json('Dados atualizados com sucesso A.');
      return;
    }

    const novoHash = (await pwd.hash(Buffer.from(senha))).toString('hex');
    const q2 = `update usuario 
    set nome = $1, email = $2, senha = $3
    where usuario.id = $4`

    const dadosAtualziados = await query(q2, [nome, email, novoHash, dadosUsuario.id]);

    if (dadosAtualziados.rowCount === 0) {
      res.status(400).json('não foi possível atualizar os dados deste usuário.');
      return;
    }

    res.status(200).json('Dados atualizados com sucesso.');
    return;

  } catch (error) {
    res.status(400).json(error.message);
  }


}

module.exports = {
  cadastrarUsuario,
  acessarPerfil,
  alterarPerfil
}