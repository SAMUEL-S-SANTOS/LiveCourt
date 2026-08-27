// ---------- CONFIGURAÇÃO SUPABASE ----------
// Substitua pelos seus dados em: https://supabase.com → Project Settings → API
const SUPABASE_URL = 'https://spiaxfdynygwhpiixthw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaWF4ZmR5bnlnd2hwaWl4dGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjkwNjAsImV4cCI6MjEwMzM0NTA2MH0.f3ug1ZbsS37agcRQBYSuvo2-brpOkOmWQFnzECF52W4';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Redireciona para o app se já houver sessão ativa
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) window.location.href = 'home.html';
}
checkSession();


// ---------- HANDLER: LOGIN ----------

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login');
    const errorEl = document.getElementById('login-error');
    const errorMsg = document.getElementById('login-error-text');

    // Oculta erro anterior
    errorEl.classList.remove('show');

    // Validação básica
    if (!email || !password) {
        errorMsg.textContent = 'Preencha e-mail e senha.';
        errorEl.classList.add('show');
        return;
    }

    // Estado de loading
    btn.disabled = true;
    btn.textContent = 'ENTRANDO...';

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorMsg.textContent = error.message === 'Email not confirmed' ? 'Confirme seu e-mail antes de entrar.' : 'E-mail ou senha incorretos.';
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'ENTRAR';
        return;
    }

    // Login OK → redireciona para o app
    window.location.href = 'home.html';
}

// Permite submeter com Enter
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
});