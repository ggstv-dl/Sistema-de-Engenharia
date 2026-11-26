# Checklist de gravação

O grupo preparou o [roteiro de 4:10](roteiro-video.md), a [narração](narracao.md) e as [legendas](legendas.srt). O apresentador fará a gravação; nenhum vídeo foi produzido nesta etapa.

## 1. Ambiente e dados, fora da captura

1. Conferir o [procedimento do ambiente](../validacao/ambiente.md), especialmente a seção 3 para API/front e a seção 4 para a conta fictícia. Reaproveitar os dados existentes; esta preparação não exige reset, restauração, migrate ou seed. Os comandos desse documento são para execução manual no computador de gravação, quando necessários.
2. Conferir `VITE_USE_MOCK=false` e a URL da API no ambiente efetivo do front, sem projetar `.env` ou `.env.local`; reiniciar o Vite se a configuração tiver mudado. Usar apenas a API real na tomada.
3. Preparar o cliente fictício e as duas imagens conforme os dados do roteiro. Se o ensaio já criou a obra, escolher uma identificação fictícia distinta para a nova tomada e mantê-la consistente no diário e no orçamento; não apagar dados para esconder o ensaio.
4. Usar conta de demonstração com nome fictício. Informar suas variáveis em terminal privado, sem salvar valores em arquivos ou projetar o terminal:

```bash
read -r -s -p 'Conta fictícia: ' VALIDACAO_EMAIL
printf '\n'
read -r -s -p 'Credencial da conta fictícia: ' VALIDACAO_SENHA
printf '\n'
export VALIDACAO_EMAIL VALIDACAO_SENHA
npm run video:check
```

O verificador faz apenas consultas e a autenticação necessária, sem criar ou editar cadastros. Ele não imprime dados de acesso nem conteúdo dos registros. Revisar toda ATENÇÃO; qualquer FALHA impede tratar o ambiente como conferido. API indisponível exige subir o banco e a API no computador do apresentador, sem usar o mock para simular aprovação.

5. Substituir `[equipe: nomes]` somente pela apresentação autorizada dos integrantes. Os resultados reais e as melhorias da validação permanecem fora da fala enquanto não estiverem documentados; não usar os exemplos fictícios como respostas do parceiro. O parceiro será citado somente como engenheiro autônomo, parceiro do projeto.

## 2. Tela e privacidade

- Resolução: 1920×1080 ou 1280×720, 30 fps; zoom do navegador em 110%. Conferir se os botões continuam visíveis.
- Usar uma janela limpa; fechar abas pessoais, esconder favoritos e desligar notificações. Enquadrar só a área necessária da aplicação.
- Cobrir identificação real no logotipo, perfil e cabeçalho usando recorte ou máscara no OBS; o texto fixo da marca também deve ser revisado. Ocultar os campos de acesso, ferramentas de desenvolvedor e qualquer sessão.
- Preparar o seletor de fotos numa pasta apenas com as amostras e um editor vazio para a mensagem. Não exibir pastas pessoais, listas de contatos, histórico ou respostas da validação.
- Na etapa do orçamento, usar Copiar mensagem e o rascunho vazio. Não clicar Enviar ao cliente, não abrir a conta pessoal do WhatsApp e não apertar Enviar.

## 3. Gravar no Linux

Usar OBS Studio já disponível no computador. Em Wayland, escolher a fonte **Captura de tela (PipeWire)** e selecionar a janela ou região limpa. Configurar 30 fps, a resolução escolhida e uma máscara para cada região que precisa ficar oculta.

Antes da tomada, fazer um teste de microfone de 10 segundos, ouvir com fones e ajustar o nível para evitar distorção. Gravar duas tomadas completas seguindo o roteiro; escolher a melhor. Guardar os brutos somente em `docs/video/bruto/` ou os arquivos de mídia diretamente em `docs/video/`, caminhos ignorados pelo Git.

Se houver falha, erro de login ou imagem indisponível, interromper e conferir antes de repetir a tomada. Não editar uma falha para sugerir sucesso. O arquivo deve apresentar apenas o que realmente funcionou.

## 4. Legendas e tempo

```bash
npm run video:legendas
npm run video:legendas -- --ppm 140 --deslocamento 0
```

O gerador usa as linhas `## Cena N - Título`, ritmo padrão de 140 palavras por minuto e pausa de 0,6 s entre cenas. O SRT inicial estima 4:04,369 para a narração atual; o plano de cliques dura 4:10. Esses tempos são estimativas da fala e do roteiro, não uma medição de gravação.

Após substituir a equipe ou ajustar a fala, gerar novamente. Usar `--ppm` para aproximar o ritmo geral e `--deslocamento` positivo para alinhar o início. Se os cortes ou as pausas mudarem entre cenas, ajustar também os blocos do SRT individualmente; um deslocamento global não corrige diferenças internas. Não ler os campos entre colchetes.

Carregar `legendas.srt` como legenda separada no YouTube. Para gravar as legendas na imagem, opcionalmente usar o filtro `subtitles` do ffmpeg; essa opção depende de suporte a legendas/libass no executável disponível.

## 5. Corte e exportação

Escolher no editor o começo e o fim da melhor tomada, preservando a sequência real. Se precisar cortar pelo terminal, usar `-ss` antes de `-i` e `-t` com os tempos efetivamente conferidos; não presumir que a duração planejada é a duração gravada.

Exportação solicitada, a partir da pasta que contém a entrada:

```bash
ffmpeg -i entrada.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart demonstracao.mp4
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 demonstracao.mp4
```

Para incorporar as legendas, executar da raiz do projeto com os caminhos de entrada e saída ajustados ao local real:

```bash
ffmpeg -i docs/video/entrada.mp4 -vf "subtitles=docs/video/legendas.srt" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart docs/video/demonstracao.mp4
```

Conferir duração entre 180 e 300 segundos e arquivo abaixo de 200 MB, além de assistir ao vídeo inteiro. Se necessário, reduzir resolução ou ajustar a compressão e conferir a legibilidade novamente. O verificador apenas informa a disponibilidade de ffmpeg e ffprobe; ele não os instala nem executa exportações.

## 6. Hospedagem

Publicar manualmente no YouTube como **não listado** ou no Google Drive com acesso **qualquer pessoa com o link**. Abrir o link em janela anônima, sem autenticação, e conferir reprodução, áudio e legendas. Só então preencher o link na seção Vídeo de demonstração do README.

## 7. Checagem final — oito itens

- [ ] Duração entre 3 e 5 minutos, medida no arquivo exportado.
- [ ] Áudio inteligível, sem distorção ou trechos inaudíveis.
- [ ] Nenhum dado pessoal, credencial ou sessão visível, inclusive na marca e nos seletores.
- [ ] Envio pelo WhatsApp não concluído; somente mensagem pronta mostrada.
- [ ] Última cena fala das limitações e encerra com agradecimento.
- [ ] Link abre e reproduz em janela anônima, sem login.
- [ ] Arquivo final abaixo de 200 MB.
- [ ] Nome do arquivo sem acentos, por exemplo `demonstracao.mp4`.

O resultado desta preparação está em [verificacoes.md](verificacoes.md). Nenhum link público ou resultado de gravação foi presumido.
