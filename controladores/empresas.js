const { query } = require('../conexao');
const axios = require('axios');

const cadastrarEmpresa = async (req, res) => {
  const { cnpj_pesquisado } = req.body;
  const { senha, ...dadosUsuario } = await req.usuario;
  
  if (!dadosUsuario) {
    res.status(400).json('Usuário precisa ser informado.');
    return;
  }

  if (!cnpj_pesquisado) {
    res.status(400).json(`O CNPJ é obrigatório.`);
    return;
  }

  const urlBase = `https://brasilapi.com.br/api/cnpj/v1/${cnpj_pesquisado}`;

  try {
    const q1 = `select * from empresas where cnpj = $1`;
    const empresaPesquisada = await query(q1, [cnpj_pesquisado]);

    if (empresaPesquisada.rowCount > 0) {
      res.status(400).json(`Empresa já está cadastrada.`);
      return;
    }

    const resposta = await axios.get(urlBase);
    
    const { cnpj, razao_social, nome_fantasia, ddd_telefone_1 } = resposta.data;

    const q2 = `insert into empresas (cnpj, razao_social, nome_fantasia, ddd_telefone_1)
                values ($1, $2, $3, $4)`
    const empresaCadastrada = await query(q2, [cnpj, razao_social, nome_fantasia, ddd_telefone_1]);
    
    if (empresaCadastrada.rowCount === 0) {
      res.status(400).json(`Não foi possível cadastrar a empresa.`);
      return;
    }

    res.json(`Empresa cadastrada com sucesso.`);
    return;
  } catch (error) {
    res.status(400).json(`CNPJ não encontrado. Não foi possível cadastrar a empresa.`);
    return;
  }
}

const listarEmpresasCadastradas = async (req, res) => {
  const { senha, ...dadosUsuario } = await req.usuario;

  if (!dadosUsuario) {
    res.status(400).json('Usuário precisa ser informado.');
    return;
  }

  try {
    const q1 = `select nome_fantasia, razao_social, cnpj from empresas`;
    const listaDeEmpresas = await query(q1, []);

    if (listaDeEmpresas.rowCount === 0) {
      res.status(400).json(`Não foi possível listar as empresas cadastradas.`);
      return;
    }

    res.status(200).json(listaDeEmpresas.rows);
    return
  } catch (error) {
    res.status(400).json(error.message);
    return;
  }
}

const editarEmpresa = async (req, res) => {
  const { senha, ...dadosUsuario } = await req.usuario;
  let {cnpj_pesquisado, cnpj_editado, razao_social_editado, nome_fantasia_editado, ddd_telefone_1_editado} = await req.body;

  if (!dadosUsuario) {
    res.status(400).json('Usuário precisa ser informado.');
    return;
  }

  if (!cnpj_pesquisado) {
    res.status(400).json('O CNPJ é obrigatório.');
    return;
  }

  try {
    const q1 = `select * from empresas where cnpj = $1`;
    const empresaPesquisada = await query(q1, [cnpj_pesquisado]);
    
    if (empresaPesquisada.rowCount === 0) {
      res.status(404).json('Empresa não encontrada.');
      return;
    }

    const { cnpj, razao_social, nome_fantasia, ddd_telefone_1 } = empresaPesquisada.rows[0];

    if (!cnpj_editado) {
      cnpj_editado = cnpj;
    }
    if (!razao_social_editado) {
      razao_social_editado = razao_social;
    }
    if (!nome_fantasia_editado) {
      nome_fantasia_editado = nome_fantasia;
    }
    if (!ddd_telefone_1_editado) {
      ddd_telefone_1_editado = ddd_telefone_1;
    }

    const q2 = `update empresas 
                set cnpj = $1, razao_social = $2, nome_fantasia = $3, ddd_telefone_1 = $4
                where cnpj = $5`;
    const empresaEditada = await query(q2, [cnpj_editado, razao_social_editado, nome_fantasia_editado, ddd_telefone_1_editado, cnpj_pesquisado]);

    if (empresaEditada.rowCount === 0) {
      res.status(400).json(`Não foi possível editar os dados dessa empresa.`);
      return;
    }

    res.status(200).json('Dados Atualizados com sucesso.');
    return;
  } catch (error) {
    res.status(400).json(error.message);
    return;
  }
}

const excluirEmpresa = async (req, res) => {
  const { senha, ...dadosUsuario } = await req.usuario;
  const { cnpj_pesquisado } = await req.body;

  if (!dadosUsuario) {
    res.status(400).json('Usuário precisa ser informado.');
    return;
  }

  if (!cnpj_pesquisado) {
    res.status(400).json('O CNPJ é obrigatório.');
    return;
  }

  try {
    const q1 = `select * from empresas where cnpj = $1`;
    const empresaPesquisada = await query(q1, [cnpj_pesquisado]);

    if (empresaPesquisada.rowCount === 0) {
      res.status(404).json(`Empresa não cadastrada.`);
      return;
    }

    const q2 = `delete from empresas where cnpj = $1`;
    const empresaExcluida = await query(q2, [cnpj_pesquisado]);

    if (empresaExcluida.rowCount === 0) {
      res.status(400).json(`Não foi possível excluir a empresa.`);
      return;
    }

    res.status(200).json(`Empresa excluída com sucesso.`);
    return;
  } catch (error) {
    res.status(400).json(error.message);
    return;
  }
}

module.exports = {
  listarEmpresasCadastradas,
  editarEmpresa,
  excluirEmpresa,
  cadastrarEmpresa
}