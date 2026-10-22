const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create test users (Engenheiros)
  const engenheiro1 = await prisma.engenheiro.create({
    data: {
      nome: "João Silva",
      email: "joao@engineer.com",
      senha: "123456", // senha simples para testes - em produção use bcrypt
    },
  });

  const engenheiro2 = await prisma.engenheiro.create({
    data: {
      nome: "Maria Oliveira",
      email: "maria@engineer.com",
      senha: "123456",
    },
  });

  // Create test clients
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: "Construtora ABC Ltda",
      email: "contato@construcoraabc.com",
      telefone: "(11) 98888-7777",
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: "Engenharia XYZ",
      email: "contato@engenhariaxyz.com",
      telefone: "(21) 97777-6666",
    },
  });

  // Create test projects
  const projeto1 = await prisma.projeto.create({
    data: {
      titulo: "Residencial Green Valley",
      descricao: "Conjunto habitacional com 50 unidades",
      status: "em_andamento",
      prioridade: "alta",
      cliente: { connect: { id: cliente1.id } },
      engenheiro: { connect: { id: engenheiro1.id } },
    },
  });

  const projeto2 = await prisma.projeto.create({
    data: {
      titulo: "Predial Centro-Sul",
      descricao: "Edifício comercial de 10 Andares",
      status: "planejamento",
      prioridade: "media",
      cliente: { connect: { id: cliente2.id } },
      engenheiro: { connect: { id: engenheiro2.id } },
    },
  });

  // Create work diaries
  await prisma.diarioObra.createMany({
    data: [
      {
        data: new Date("2024-01-15"),
        descricao: "Fundação escavada com sucesso",
        observacoes: "Profundidade 2.5m",
        fotos: ["foto1.jpg", "foto2.jpg"],
        projetoId: projeto1.id,
        engenheiroId: engenheiro1.id,
      },
      {
        data: new Date("2024-01-20"),
        descricao: "Estrutura de concreto armado",
        observacoes: "Laje executada",
        fotos: ["foto3.jpg"],
        projetoId: projeto1.id,
        engenheiroId: engenheiro1.id,
      },
    ],
  });

  // Create measurements
  await prisma.medicao.createMany({
    data: [
      {
        descricao: "Area do terreno",
        valor: 500.5,
        unidade: "m2",
        data: new Date("2024-01-15"),
        projetoId: projeto1.id,
      },
      {
        descricao: "Volume de concreto",
        valor: 150.2,
        unidade: "m3",
        data: new Date("2024-01-20"),
        projetoId: projeto1.id,
      },
    ],
  });

  // Create files
  await prisma.arquivo.createMany({
    data: [
      {
        nome: "Projeto_Basico.pdf",
        tipo: "pdf",
        caminho: "/files/projetos/basico.pdf",
        versao: 1,
        projetoId: projeto1.id,
      },
      {
        nome: "Laudo_Tecnico.pdf",
        tipo: "pdf",
        caminho: "/files/projetos/laudo.pdf",
        versao: 1,
        projetoId: projeto2.id,
      },
    ],
  });

  // Create budgets
  await prisma.orcamento.createMany({
    data: [
      {
        nome: "Orçamento Básico",
        descricao: "Orçamento inicial de serviços",
        valor: 15000.0,
        dataCriacao: new Date("2024-01-10"),
        projetoId: projeto1.id,
      },
      {
        nome: "Orçamento Completo",
        descricao: "Orçamento detalhado com todas as especificações",
        valor: 30000.0,
        dataCriacao: new Date("2024-01-15"),
        projetoId: projeto2.id,
      },
    ],
  });

  console.log("Seed finalizado com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });