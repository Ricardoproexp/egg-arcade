# Omlet Arcade Revival

Cria uma aplicação web responsiva completa e interativa que recrie visualmente o Omlet Arcade original, em português de Portugal. O utilizador sente falta da aplicação encerrada e pediu um clone o mais idêntico possível; preserva o visual reconhecível, não faças uma landing page nem um redesign SaaS. Título "Omlet Arcade · Recriação". Usa tema escuro carvão/antracite, laranja forte (#ff6b17 aproximadamente), texto branco, texto secundário cinzento, acentos rosa em badges de transmissões, separadores finos, cartões compactos de gaming, ícones claros. A navegação original inclui Feed, Ao vivo, Jogos/Descobrir, Comunidades e Chat, mais botão circular laranja central "+" para Publicar / Transmitir / Gravar. Cabeçalho com mascote controlpad laranja inspirado no Omlet, nome "Omlet Arcade", pesquisa e avatar do utilizador. Rodapé discreto "Recriação independente · conteúdo de demonstração". Não afirmar ligação à empresa original, contas recuperadas ou comunidade real.

REFERÊNCIAS PÚBLICAS VISUAIS REAIS: https://img.apponic.com/241/24/1491b3da7d084a17667f3be5b0e2465b.jpg (Descobrir jogos / streamers / comunidades, fundo escuro e botões laranja); https://cdn.gamersantai.com/2021/09/omlet-arcade-stream-meet-and-play-android.jpg (navegação e feed); https://techylist.com/wp-content/uploads/2023/07/Omlet-Arcade3.webp (interface stream moderna e navegação inferior); https://blue.kumparan.com/image/upload/fl_progressive%2Cfl_lossy%2Cc_fill%2Cf_auto%2Cq_auto%3Abest%2Cw_640/v1641359912/hjgkaikps9mov6y4r11s.png (Feed, Live Now, Viewer Games e PUBG, botão +). Investiga/abre as imagens se puderes. Usar imagens de jogos e avatares adequados; não repetir a mesma imagem em todos os cartões.

CONSTRUÇÃO: Entrega o próprio produto utilizável desde o primeiro ecrã, sem barreira de login inicial. Faz um shell desktop de três colunas: navegação vertical à esquerda, feed central amplo e coluna direita de comunidades/jogadores; mobile com navegação fixa em baixo, botão + central, feed de ponta a ponta com espaçamento equilibrado. Exibe um pequeno chip discreto "Demonstração" no topo, pois conteúdo inicial é de exemplo. No topo do conteúdo, tabs Seguindo / Para ti / Ao vivo e filtros de jogos. Hero compacto com ilustração gaming e texto de comunidade, sem marketing gigante. Stream cards de Minecraft, PUBG Mobile, Free Fire, Mobile Legends e Roblox, com thumbs, título, streamer, jogo e contadores marcados como exemplos. Feed de publicações de gamers com avatar, nível, tempo, texto, imagem opcional, gostar/comentar/partilhar/guardar. Interface visual cuidada, densa mas legível, com screenshots/arte gaming de qualidade e cores do original.

FLUXOS QUE TÊM DE FUNCIONAR:
1. Navegação real entre Feed, Ao vivo, Descobrir/Jogos, Comunidades, Chat e Perfil, com destaque ativo e manutenção da responsividade.
2. Pesquisa global realmente filtra jogos, criadores e publicações; filtros por jogo funcionam e estado vazio tem mensagem clara.
3. Gostar, guardar e seguir/desseguir atualizam imediatamente e persistem em localStorage. Os contadores iniciais e utilizadores são dados de demonstração.
4. Botão "+" abre menu acessível; Publicar abre compositor com texto e escolha de jogo, aceitar imagem local via ficheiro (com limite razoável e validação) seria ótimo. Publicações novas aparecem no feed e persistem após reload. Comentar abre painel e permite adicionar comentários persistentes. Partilhar usa Web Share ou copia link e mostra feedback verdadeiro.
5. Perfil local editável (nome, handle, bio, jogo preferido), separado de qualquer identidade original; mostra publicações próprias, guardados e comunidades seguidas, persiste localmente.
6. Comunidades: cartões por jogo com entrar/sair, página de comunidade com descrição e feed filtrado, criar comunidade local funcional e persistente. Esclarece que são comunidades neste dispositivo.
7. Chat: lista de salas por jogo e uma conversa inicial de exemplo claramente identificada. Pode enviar mensagens locais persistentes e criar sala local com nome/jogo. Não fingir que mensagens são entregues a pessoas reais nem inventar respostas automáticas de pessoas reais.
8. Ao clicar num cartão de transmissão abrir página/modal de visualização com arte/video demonstrativo, informação do streamer, seguir e chat de demonstração. Vídeo demonstrativo HTML5 publicamente acessível, com controlos, ou thumbnail e reprodução de amostra honesta. Nunca chamar a stream demonstrativa "em direto" sem etiqueta "Demo". Não simular infraestrutura real nem recuperada.
9. A ação Transmitir abre estúdio de demonstração com título/jogo e explicação curta de que transmissão pública exige serviço de streaming. Se viável disponibiliza pré-visualização local da câmara/ecrã apenas após clique e permissões do browser, e gravação local via MediaRecorder com iniciar/parar e descarregar. Caso o browser não suporte, informa de forma útil sem crash. Não anuncies "ao vivo" para outros.
10. Notificações abre painel funcional com exemplos e marcar como lidas; alternar idioma não necessário. Botões só se houver ação real, sem destinos vazios.

PERSISTÊNCIA E QUALIDADE: Implementa persistência local robusta com defaults e tratamento de quota/storage indisponível, escapa conteúdo de utilizador/sem dangerous innerHTML, links seguros, validação de formulários, fechar modais com Escape e click fora, labels acessíveis, teclado, foco visível, scroll correto. Todos textos da app em PT-PT. Verifica desktop e mobile (390 px e 1440 px), corrige overflow e navegação em baixo. Testa fluxos centrais e build. Evita pedir decisões de rotina: faz escolhas sensatas e entrega app concreta. Não publiques abertamente; mantém projeto/preview privado/restrito se possível. Não ativar serviços pagos nem pedir credenciais. Preciso de uma versão de preview acessível para o utilizador experimentar, com relatório honesto das funcionalidades testadas e limites.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8973d747-ca35-426e-9d91-1dbc52ba3310).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
