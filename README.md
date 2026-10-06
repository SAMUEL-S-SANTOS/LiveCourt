# LiveCourt 🏀

O **LiveCourt** é uma aplicação web para encontrar, explorar e cadastrar quadras esportivas. O foco do projeto é aproximar jogadores de locais de jogo próximos, usando geolocalização, um mapa interativo e dados colaborativos.

## Funcionalidades

- Cadastro e login com Supabase Auth.
- Perfil de jogador.
- Mapa navegável com busca de locais e geolocalização.
- Lista de quadras com busca e filtros por ambiente.
- Cadastro colaborativo de quadras.
- Favoritos e acompanhamento de inscrições.

## Tecnologias

- HTML, CSS e JavaScript.
- Supabase Auth e PostgreSQL.
- Leaflet, CARTO e OpenStreetMap para o mapa.
- GitHub para versionamento.

## Executar localmente

Abra o projeto com um servidor HTTP, por exemplo o Live Preview do VS Code, e acesse:

```
http://127.0.0.1:3000/Index.html
```

> Não abra os arquivos diretamente pelo navegador usando `file://`, pois o Supabase Auth e os recursos de mapa dependem de um servidor HTTP.

## Configuração do Supabase

1. No Supabase, execute [supabase/001_auth_profiles.sql](supabase/001_auth_profiles.sql) no **SQL Editor**.
2. Em **Authentication → URL Configuration**, adicione:
   - `http://127.0.0.1:3000/Index.html`
   - a URL pública de produção, seguida de `/Index.html`
3. Mantenha o provedor **Email** ativo em **Authentication → Providers**.
4. Em ambiente hospedado, a confirmação de e-mail pode estar habilitada. Nesse caso, confirme o e-mail antes de tentar entrar.

## Conta de teste

A conta abaixo é uma sugestão para desenvolvimento local. Ela **não é criada automaticamente**: use a tela **Criar conta** do projeto, ou crie o usuário em **Authentication → Users** no Supabase, antes de utilizá-la.

| Campo | Valor sugerido |
| --- | --- |
| Nome | Jogador Teste |
| E-mail | `livecourt.teste@exemplo.com` |
| Senha | `LiveCourtTeste#2026` |
| Posição | Armador |

Depois de criar a conta, entre com o mesmo e-mail e senha em `Index.html`.

> Para produção, não use essa senha e não mantenha contas de demonstração com credenciais públicas.

## Estrutura

- `Index.html`: tela de login.
- `register.html`: tela de cadastro.
- `home.html`: aplicação autenticada. Mapa, Quadras, Cadastrar Quadra e Perfil são views internas do mesmo arquivo.
- `js/login.js`, `js/register.js`, `js/script.js`: lógica do Supabase e da interface.
- `supabase/001_auth_profiles.sql`: tabela de perfis, políticas RLS e trigger de criação de perfil.
