# Resumo local das respostas — para a equipe

O grupo implementou um resumo local dos resultados para apoiar a análise após a validação. Primeiro, definiu o formato dos arquivos; em seguida, verificou o comando com dados inteiramente FICTÍCIOS. Os dois exemplos desta pasta não representam respostas de participantes nem resultados da sessão prevista.

Para o processamento posterior, o grupo estabeleceu o uso exclusivo de respostas anônimas. Antes de executar o comando, a equipe deverá revisar os textos livres e remover informações de identificação inseridas espontaneamente. Os CSVs reais deverão permanecer em local privado, fora do repositório, sem gravações, listas de contatos ou vínculo entre respostas e pessoas.

Após essa revisão, o grupo poderá executar o comando abaixo na raiz do projeto, com Node já disponível e sem instalar pacotes:

```bash
npm run validacao:resumo -- <respostas.csv> [observacoes.csv]
```

O segundo argumento é opcional; se informado, o arquivo precisa existir. Arquivos inexistentes ou inválidos produzem mensagem clara e código de saída 1. O comando não grava arquivos. Para caminhos com espaços, a equipe deverá utilizar aspas. Como a saída inclui os textos abertos, o grupo deverá conferir seu anonimato antes de exibir o terminal ou compartilhar o resumo.

## Formato esperado

- CSV UTF-8, com ou sem marca inicial BOM; primeira linha contém títulos distintos. O comando aceita vírgula ou ponto e vírgula, linhas LF/CRLF, células entre aspas, aspas escapadas por duplicação e quebras de linha dentro de células entre aspas. Os textos que contenham separadores deverão ficar entre aspas. Delimitadores ambíguos e linhas com quantidade incorreta de células são recusados.
- Respostas: 16 perguntas, com horário opcional exportado pelo Forms (`Carimbo de data/hora`, `Carimbo de data e hora`, `Data e hora` ou `Timestamp`). Horário e perfil não são exibidos no resumo. A equipe deverá manter o arquivo sem campos de identificação.
- O grupo definiu os títulos do [questionário](questionario.md) como referência: P1–P3, afirmações 1–8, R1 e A1–A4. As escalas são reconhecidas pelo número inicial de 1 a 8 e aceitam reordenação das colunas; numeração parcial ou repetida é recusada.
- Sem numeração das escalas, a equipe deverá preservar esta ordem: 3 perfis, 8 afirmações, recomendação e 4 abertas; o comando informa quando utiliza a ordem. Sem R1 ou A1–A4, a recomendação e as abertas também deverão permanecer nessa sequência após as escalas. O grupo definiu que as perguntas não serão embaralhadas no Forms.
- Notas inteiras: 1–5 nas oito afirmações, 0–10 na recomendação. Campo vazio é ausência de resposta, não zero. Cada média usa só suas respostas válidas; as distribuições mostram as contagens das cinco notas. Respondentes significa linhas não vazias, sem comprovar pessoas únicas.
- Observações: exatamente `tarefa,concluiu,tempo_min`, em qualquer ordem. `concluiu`: `sim`, `com ajuda` ou `não` (aceita `nao`, sem distinguir maiúsculas). O tempo é expresso em minutos, com ponto ou vírgula decimal, sem valores negativos, e pode ficar vazio quando não medido. Em arquivos separados por vírgula, tempos com vírgula decimal deverão ficar entre aspas.
- O grupo definiu uma linha de observação por tarefa tentada, sem linhas para tarefas não iniciadas. O observador deverá registrar o tempo até a interrupção ou conclusão, inclusive quando o limite for atingido. Falhas e ajuda permanecem no denominador de conclusão independente; o tempo médio inclui todas as tentativas com tempo informado e não representa somente conclusões bem-sucedidas.

O grupo organizou as respostas abertas por pergunta, sem relacionar os textos à mesma pessoa. O percentual de notas 9–10 utiliza somente as recomendações preenchidas e não corresponde a um índice calculado por subtração. Como a validação prevê uma sessão, o grupo deverá apresentar as contagens e os relatos como observações exploratórias, sem generalizar os percentuais para a comunidade.

O grupo também definiu que as opiniões sobre o vídeo serão guardadas separadamente dos testes práticos, em exportações distintas. A equipe não deverá atribuir conclusão, tempo de tarefa ou rapidez real de uso a quem apenas visualizar o vídeo.

## Verificação realizada com os exemplos fictícios

Após implementar o resumo, o grupo executou os exemplos pelos comandos abaixo e conferiu os cálculos apresentados:

```bash
npm run validacao:resumo -- docs/validacao/exemplos/respostas-exemplo.csv
npm run validacao:resumo -- docs/validacao/exemplos/respostas-exemplo.csv docs/validacao/exemplos/observacoes-exemplo.csv
```

No arquivo de respostas, o grupo utilizou separador vírgula, três linhas fictícias, uma nota de escala e uma recomendação vazias, além de textos com vírgula, aspas escapadas e quebra de linha. No arquivo de observações, utilizou ponto e vírgula e cinco tarefas, incluindo `com ajuda`, `não`, tempo decimal com vírgula e tempo não medido.

Nos exemplos fictícios, o grupo confirmou os seguintes resultados: 3 respondentes; médias das afirmações 1–8 = 4,00 / 3,00 / 4,67 / 4,00 / 4,67 / 4,00 / 3,50 / 4,67; recomendação média 8,50 com 50,00% de notas 9–10 (2 respostas válidas). Nas observações: T1 = 66,67% sem ajuda e média 2,33 min; T2 = 100,00% e 2,50 min; T3 = 33,33% e 3,67 min; T4 = 66,67% e 3,25 min; T5 = 66,67% e 3,00 min.
