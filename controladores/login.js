const { query } = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const pwd = securePassword();

const logarUsuario = async (req, res) => {
  const { email, senha } = req.body;

  //verifica o preenchimento dos campos para login
  if (!email) {
    res.status(400).json(`O e-mail é obrigatório.`);
    return;
  }
  if (!senha) {
    res.status(400).json(`A senha é obrigatória.`);
    return;
  }

  try {
    const q1 = `select * from usuario
                  where email = $1`;
    const cadastro = await query(q1, [email]);

    //verifica se o email existe no banco de dados
    if (cadastro.rowCount === 0) {
      res.status(404).json(`E-mail não cadastrado.`);
      return;
    }

    const usuario = cadastro.rows[0];

    //compara a senha inserida no login com o hash cadastrado no banco
    const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, 'hex'));
    
    //verifica os possiveis resultados da verificação acima
    switch (result) {
      case securePassword.INVALID_UNRECOGNIZED_HASH:
      case securePassword.INVALID:
        res.status(400).json(`Email ou senha incorretos.`);
        return;
      case securePassword.VALID:
        break;
      case securePassword.VALID_NEEDS_REHASH:
        try {
          const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
          const q2 = `update usuario
                           set senha = $1
                           where email = $2`
          await query(q2, [hash, email]);
        } catch {
          
        }
        break;
    }

    //recebe o token gerado pela autenticação do usuario
    const token = jwt.sign({
      id: usuario.id
    }, jwtSecret, {
        expiresIn: '2h'
    });

    res.status(200).json(token);
    return;
  } catch (error) {
    res.status(400).json(error.message);
    return;
  }
}

module.exports = {
  logarUsuario
}