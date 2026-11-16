# Resumo local das respostas — para a equipe

Usar somente respostas anônimas e revisar os textos livres antes de processar: se alguém inserir identificação espontaneamente, removê-la. Não guardar gravações, listas de contatos ou vínculo entre respostas e pessoas. Não colocar resultados reais no repositório; manter os CSVs locais em local privado. Os dois arquivos de exemplo desta pasta são inteiramente FICTÍCIOS e não são resultados da sessão.

Na raiz do projeto, com Node já disponível, sem instalar pacotes:

```bash
npm run validacao:resumo -- <respostas.csv> [observacoes.csv]
```

O segundo argumento é opcional; se informado, o arquivo precisa existir. Arquivos inexistentes ou inválidos produzem mensagem clara e código de saída 1. Nenhum arquivo é gravado pelo comando. Usar aspas nos caminhos que contenham espaços. A saída inclui os textos abertos; conferir seu anonimato antes de exibir o terminal ou compartilhar o resumo.

## Formato esperado

- CSV UTF-8, com ou sem marca inicial BOM; primeira linha contém títulos distintos. Aceita vírgula ou ponto e vírgula, linhas LF/CRLF, células entre aspas, aspas escapadas por duplicação e quebras de linha dentro de células entre aspas. Colocar separadores de texto entre aspas. O comando recusa delimitador ambíguo ou linhas com quantidade incorreta de células.
- Respostas: 16 perguntas, com horário opcional exportado pelo Forms (`Carimbo de data/hora`, `Carimbo de data e hora`, `Data e hora` ou `Timestamp`). Horário e perfil não são exibidos no resumo. Não acrescentar campos de identificação.
- Usar os títulos do [questionário](questionario.md): P1–P3, afirmações 1–8, R1 e A1–A4. As escalas são reconhecidas pelo número inicial de 1 a 8; aceitam colunas de escala reordenadas. Numeração parcial ou repetida é recusada.
- Sem numeração das escalas, preservar esta ordem: 3 perfis, 8 afirmações, recomendação, 4 abertas; o comando avisa que usou a ordem. Sem R1 ou A1–A4, manter também a recomendação e as abertas nessa ordem após as escalas. Não embaralhar perguntas no Forms.
- Notas inteiras: 1–5 nas oito afirmações, 0–10 na recomendação. Campo vazio é ausência de resposta, não zero. Cada média usa só suas respostas válidas; as distribuições mostram as contagens das cinco notas. Respondentes significa linhas não vazias, sem comprovar pessoas únicas.
- Observações: exatamente `tarefa,concluiu,tempo_min`, em qualquer ordem. `concluiu`: `sim`, `com ajuda` ou `não` (aceita `nao`, sem distinguir maiúsculas). Tempo em minutos, com ponto ou vírgula decimal, não negativo; pode ficar vazio quando não medido. Se usar vírgula como separador, colocar o tempo com vírgula decimal entre aspas.
- Uma linha de observação por tarefa tentada; tarefas não tentadas não recebem linha. Registrar tempo observado até parar, inclusive no limite. Falhas e ajuda permanecem no denominador de conclusão independente; tempo médio inclui todas as tentativas com tempo, sem se passar por tempo de conclusão bem-sucedida.

As quatro perguntas abertas aparecem por pergunta, sem ligar textos à mesma pessoa. O percentual de notas 9–10 usa somente as recomendações preenchidas; não é um índice calculado por subtração. Com uma só sessão, apresentar contagens e relatos como observações exploratórias, sem generalizar percentuais para a comunidade.

Guardar resultados do plano por vídeo separados dos testes práticos, em exportações distintas. Não inferir conclusão, tempo de tarefa ou rapidez real de uso de quem só viu o vídeo.

## Executar os exemplos fictícios

```bash
npm run validacao:resumo -- docs/validacao/exemplos/respostas-exemplo.csv
npm run validacao:resumo -- docs/validacao/exemplos/respostas-exemplo.csv docs/validacao/exemplos/observacoes-exemplo.csv
```

Respostas: separador vírgula, três linhas fictícias, uma nota de escala e uma recomendação vazias; inclui texto com vírgula, aspas escapadas e quebra de linha. Observações: ponto e vírgula, cinco tarefas, incluindo `com ajuda`, `não`, tempo decimal com vírgula e tempo não medido.

Resultados esperados: 3 respondentes; médias das afirmações 1–8 = 4,00 / 3,00 / 4,67 / 4,00 / 4,67 / 4,00 / 3,50 / 4,67; recomendação média 8,50 com 50,00% de notas 9–10 (2 respostas válidas). Nas observações: T1 = 66,67% sem ajuda e média 2,33 min; T2 = 100,00% e 2,50 min; T3 = 33,33% e 3,67 min; T4 = 66,67% e 3,25 min; T5 = 66,67% e 3,00 min.
