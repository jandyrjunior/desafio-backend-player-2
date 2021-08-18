create database player_2;

create table if not exists usuario (
  id serial primary key,
  nome text not null,
  email text unique not null,
  senha text not null
);

create table if not exists empresas (
  id serial primary key,
  cnpj char(14) not null,
  razao_social text not null,
  nome_fantasia text not null,
  ddd_telefone_1 text not null
);

insert into empresas
(cnpj, 
 razao_social, 
 nome_fantasia, 
 ddd_telefone_1)
 values
 ('10545919000114',
  'Empresa A - Soluções e Serviços LTDA',
  'A Serviços',
  7134535864),
 ('12345678912014',
  'Empresa B Comercio de Automoveis LTDA',
  'Ponto B',
  '7133445566'),
 ('99887744552103',
  'Empresa C Construções LTDA',
  'A Construtora',
  '7155447788');