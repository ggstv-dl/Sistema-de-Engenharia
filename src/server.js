
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

if (!process.env.JWT_SECRET) {
  throw new Error('Configure JWT_SECRET no arquivo .env antes de iniciar a API.');
}

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Remove a senha de qualquer objeto de usuário enviado ao frontend.
function usuarioPublico(engenheiro) {
  return {
    id: engenheiro.id,
    nome: engenheiro.nome,
    email: engenheiro.email,
    perfil: 'Engenheiro',
  };
}

function gerarToken(engenheiro) {
  return jwt.sign(
    {
      sub: engenheiro.id,
      email: engenheiro.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Rota inicial.
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do CRM de Engenharia Civil',
    status: 'online',
  });
});

// Verifica API e conexão com PostgreSQL.
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ api: 'online', banco: 'conectado' });
  } catch (erro) {
    console.error('Falha na conexão com o banco:', erro.message);
    res.status(503).json({ api: 'online', banco: 'indisponivel' });
  }
});

// Cadastro de engenheiro.
app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body || {};

    if (
      typeof nome !== 'string' ||
      typeof email !== 'string' ||
      typeof senha !== 'string'
    ) {
      return res.status(400).json({
        message: 'Informe nome, e-mail e senha válidos.',
      });
    }

    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (nomeNormalizado.length < 2 || nomeNormalizado.length > 100) {
      return res.status(400).json({
        message: 'O nome deve ter entre 2 e 100 caracteres.',
      });
    }

    if (
      emailNormalizado.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)
    ) {
      return res.status(400).json({
        message: 'Informe um endereço de e-mail válido.',
      });
    }

    if (senha.length < 8 || senha.length > 72) {
      return res.status(400).json({
        message: 'A senha deve ter entre 8 e 72 caracteres.',
      });
    }

    const existente = await prisma.engenheiro.findUnique({
      where: { email: emailNormalizado },
    });

    if (existente) {
      return res.status(409).json({
        message: 'Este e-mail já está cadastrado.',
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const engenheiro = await prisma.engenheiro.create({
      data: {
        nome: nomeNormalizado,
        email: emailNormalizado,
        senha: senhaHash,
      },
    });

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso.',
      usuario: usuarioPublico(engenheiro),
    });
  } catch (erro) {
    if (erro.code === 'P2002') {
      return res.status(409).json({
        message: 'Este e-mail já está cadastrado.',
      });
    }

    console.error('Erro no cadastro:', erro.message);
    return res.status(500).json({
      message: 'Não foi possível realizar o cadastro.',
    });
  }
});

// Login.
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        message: 'Informe e-mail e senha.',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const engenheiro = await prisma.engenheiro.findUnique({
      where: { email: emailNormalizado },
    });

    if (
      !engenheiro ||
      !(await bcrypt.compare(senha, engenheiro.senha))
    ) {
      return res.status(401).json({
        message: 'E-mail ou senha incorretos.',
      });
    }

    const token = gerarToken(engenheiro);

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      usuario: usuarioPublico(engenheiro),
    });
  } catch (erro) {
    console.error('Erro no login:', erro.message);
    return res.status(500).json({
      message: 'Não foi possível realizar o login.',
    });
  }
});

// Funcionalidades ainda não implementadas.

function autenticarToken(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Autenticação necessária.',
    });
  }

  const token = autorizacao.slice(7);

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      message: 'Token inválido ou expirado. Faça login novamente.',
    });
  }
}

app.get('/api/dashboard', autenticarToken, async (req, res) => {
  try {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [obrasAtivas, totalDiarios, custoMes, projetos, diarios] =
      await Promise.all([
        prisma.projeto.count({
          where: {
            status: 'em_andamento',
            engenheiroId: req.usuario.sub,
          },
        }),
        prisma.diarioObra.count({
          where: {
            engenheiroId: req.usuario.sub,
          },
        }),
        prisma.orcamento.aggregate({
          where: {
            projeto: {
              engenheiroId: req.usuario.sub,
            },
            dataCriacao: {
              gte: inicioMes,
            },
          },
          _sum: {
            valor: true,
          },
        }),
        prisma.projeto.findMany({
          where: {
            engenheiroId: req.usuario.sub,
          },
          select: {
            id: true,
            titulo: true,
            status: true,
            criadoEm: true,
          },
          orderBy: {
            atualizadoEm: 'desc',
          },
          take: 6,
        }),
        prisma.diarioObra.findMany({
          where: {
            engenheiroId: req.usuario.sub,
          },
          select: {
            id: true,
            descricao: true,
            data: true,
            criadoEm: true,
            projeto: {
              select: {
                titulo: true,
              },
            },
          },
          orderBy: {
            criadoEm: 'desc',
          },
          take: 5,
        }),
      ]);

    const atividades = diarios.map((diario) => ({
      tipo: 'diario',
      texto: `Diário de Obra — ${diario.projeto.titulo}: ${diario.descricao}`,
      quando: diario.criadoEm.toISOString(),
      autor: 'Engenheiro',
    }));

    return res.json({
      obrasAtivas: {
        valor: obrasAtivas,
        detalhe: 'Projetos em andamento',
      },
      diariosPendentes: {
        valor: totalDiarios,
        detalhe: 'Total de diários registrados; pendências não modeladas',
      },
      custoTotal: {
        valor: custoMes._sum.valor ?? 0,
        detalhe: 'Soma dos orçamentos criados neste mês',
      },
      eficiencia: {
        valor: null,
      },
      progressoObras: [],
      atividades,
    });
  } catch (erro) {
    console.error('Erro ao carregar dashboard:', erro.message);
    return res.status(500).json({
      message: 'Não foi possível carregar os dados do dashboard.',
    });
  }
});

app.post('/api/rdo/sync', (req, res) => {
  res.status(501).json({
    message: 'Sincronização do Diário de Obra ainda não implementada.',
  });
});

app.post('/api/projetos/:id/arquivos', (req, res) => {
  res.status(501).json({
    message: 'Upload de arquivos ainda não implementado.',
  });
});

app.post('/api/whatsapp/enviar-orcamento', (req, res) => {
  res.status(501).json({
    message: 'Integração com WhatsApp ainda não implementada.',
  });
});

// Tratamento de JSON inválido.
app.use((erro, req, res, next) => {
  if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
    return res.status(400).json({
      message: 'O corpo da requisição contém JSON inválido.',
    });
  }

  console.error('Erro inesperado:', erro.message);
  return res.status(500).json({
    message: 'Erro interno do servidor.',
  });
});

const server = app.listen(PORT, () => {
  console.log(`CRM API disponível em http://localhost:${PORT}`);
});

async function encerrarServidor() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', encerrarServidor);
process.on('SIGTERM', encerrarServidor);
