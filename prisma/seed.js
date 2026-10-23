const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CUSTO_BCRYPT = 10;
const SENHA_PADRAO = '123456';

// Projeto não tem campo único; título + cliente identificam o projeto do seed.
async function obterOuCriarProjeto(dados) {
  const existente = await prisma.projeto.findFirst({
    where: { titulo: dados.titulo, clienteId: dados.clienteId },
  });

  if (existente) {
    return { projeto: existente, criado: false };
  }

  const projeto = await prisma.projeto.create({ data: dados });
  return { projeto, criado: true };
}

async function main() {
  const senhaHash = await bcrypt.hash(SENHA_PADRAO, CUSTO_BCRYPT);

  // Upsert por e-mail: rodar o seed de novo não quebra o e-mail único.
  // O update regrava o hash para corrigir bancos criados com senha em texto puro.
  const engenheiro1 = await prisma.engenheiro.upsert({
    where: { email: 'joao@engineer.com' },
    update: { senha: senhaHash },
    create: { nome: 'João Silva', email: 'joao@engineer.com', senha: senhaHash },
  });

  const engenheiro2 = await prisma.engenheiro.upsert({
    where: { email: 'maria@engineer.com' },
    update: { senha: senhaHash },
    create: { nome: 'Maria Oliveira', email: 'maria@engineer.com', senha: senhaHash },
  });

  const cliente1 = await prisma.cliente.upsert({
    where: { email: 'contato@construcoraabc.com' },
    update: {},
    create: {
      nome: 'Construtora ABC Ltda',
      email: 'contato@construcoraabc.com',
      telefone: '(11) 98888-7777',
    },
  });

  const cliente2 = await prisma.cliente.upsert({
    where: { email: 'contato@engenhariaxyz.com' },
    update: {},
    create: {
      nome: 'Engenharia XYZ',
      email: 'contato@engenhariaxyz.com',
      telefone: '(21) 97777-6666',
    },
  });

  const { projeto: projeto1, criado: criado1 } = await obterOuCriarProjeto({
    titulo: 'Residencial Green Valley',
    descricao: 'Conjunto habitacional com 50 unidades',
    status: 'em_andamento',
    prioridade: 'alta',
    clienteId: cliente1.id,
    engenheiroId: engenheiro1.id,
  });

  const { projeto: projeto2, criado: criado2 } = await obterOuCriarProjeto({
    titulo: 'Predial Centro-Sul',
    descricao: 'Edifício comercial de 10 Andares',
    status: 'planejamento',
    prioridade: 'media',
    clienteId: cliente2.id,
    engenheiroId: engenheiro2.id,
  });

  // Dados filhos só são criados junto com o projeto, para não duplicar em nova execução.
  if (criado1) {
    await prisma.diarioObra.createMany({
      data: [
        {
          data: new Date('2024-01-15'),
          descricao: 'Fundação escavada com sucesso',
          observacoes: 'Profundidade 2.5m',
          fotos: ['foto1.jpg', 'foto2.jpg'],
          projetoId: projeto1.id,
          engenheiroId: engenheiro1.id,
        },
        {
          data: new Date('2024-01-20'),
          descricao: 'Estrutura de concreto armado',
          observacoes: 'Laje executada',
          fotos: ['foto3.jpg'],
          projetoId: projeto1.id,
          engenheiroId: engenheiro1.id,
        },
      ],
    });

    await prisma.medicao.createMany({
      data: [
        {
          descricao: 'Area do terreno',
          valor: 500.5,
          unidade: 'm2',
          data: new Date('2024-01-15'),
          projetoId: projeto1.id,
        },
        {
          descricao: 'Volume de concreto',
          valor: 150.2,
          unidade: 'm3',
          data: new Date('2024-01-20'),
          projetoId: projeto1.id,
        },
      ],
    });

    await prisma.arquivo.create({
      data: {
        nome: 'Projeto_Basico.pdf',
        tipo: 'pdf',
        caminho: '/files/projetos/basico.pdf',
        versao: 1,
        projetoId: projeto1.id,
      },
    });

    await prisma.orcamento.create({
      data: {
        nome: 'Orçamento Básico',
        descricao: 'Orçamento inicial de serviços',
        valor: 15000.0,
        dataCriacao: new Date('2024-01-10'),
        projetoId: projeto1.id,
      },
    });
  }

  if (criado2) {
    await prisma.arquivo.create({
      data: {
        nome: 'Laudo_Tecnico.pdf',
        tipo: 'pdf',
        caminho: '/files/projetos/laudo.pdf',
        versao: 1,
        projetoId: projeto2.id,
      },
    });

    await prisma.orcamento.create({
      data: {
        nome: 'Orçamento Completo',
        descricao: 'Orçamento detalhado com todas as especificações',
        valor: 30000.0,
        dataCriacao: new Date('2024-01-15'),
        projetoId: projeto2.id,
      },
    });
  }

  console.log('Seed finalizado com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erro) => {
    console.error('Erro no seed:', erro);
    await prisma.$disconnect();
    process.exit(1);
  });
