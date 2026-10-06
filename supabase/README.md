# Configuração de autenticação do LiveCourt

1. No Supabase, abra **SQL Editor** e execute `001_auth_profiles.sql`.
2. Em **Authentication > URL Configuration**, cadastre:
   - `http://127.0.0.1:3000/Index.html` para o Live Preview local;
   - a URL pública onde o site for publicado, seguida de `/Index.html`.
3. Em **Authentication > Providers > Email**, mantenha Email habilitado.
   - Em projetos hospedados, a confirmação de e-mail é habilitada por padrão. O usuário precisa abrir o e-mail de confirmação antes de entrar.
4. Teste o fluxo:
   - abra `Index.html`;
   - selecione **Criar conta**;
   - confirme o e-mail, caso o projeto peça confirmação;
   - entre e confirme que `home.html` abre;
   - verifique que a barra lateral troca entre Mapa, Quadras, Cadastrar Quadra e Perfil.

Nunca coloque uma chave `service_role` no código do navegador. O LiveCourt usa apenas a chave pública/anon do Supabase JS.
