-- AlterTable
ALTER TABLE "DiarioObra" ADD COLUMN     "atividade" TEXT,
ADD COLUMN     "clima" TEXT,
ADD COLUMN     "equipamentos" JSONB,
ADD COLUMN     "maoDeObra" JSONB;

-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN     "dataInicio" TIMESTAMP(3),
ADD COLUMN     "localizacao" TEXT;
