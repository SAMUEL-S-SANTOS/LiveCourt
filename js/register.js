// ---------- CONFIGURAÇÃO SUPABASE ----------
// Substitua pelos seus dados em: https://supabase.com → Project Settings → API
const SUPABASE_URL = 'https://spiaxfdynygwhpiixthw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaWF4ZmR5bnlnd2hwaWl4dGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjkwNjAsImV4cCI6MjEwMzM0NTA2MH0.f3ug1ZbsS37agcRQBYSuvo2-brpOkOmWQFnzECF52W4';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Redireciona se já logado
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) window.location.href = 'index.html';
}
checkSession();


// ---------- ESTADO LOCAL ----------
let selectedPosition = null;  // valor da posição selecionada nos chips


// ---------- SELETOR DE POSIÇÃO ----------

function selectPosition(value, el) {
    selectedPosition = value;

    // Remove active de todos os chips e aplica no clicado
    document.querySelectorAll('.position-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}


// ---------- INDICADOR DE FORÇA DA SENHA ----------

function checkStrength(val) {
    const bar1 = document.getElementById('bar1');
    const bar2 = document.getElementById('bar2');
    const bar3 = document.getElementById('bar3');
    const label = document.getElementById('strength-label');

    const hasLen = val.length >= 6;
    const hasMixed = /[A-Z]/.test(val) && /[a-z]/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val) || /\d/.test(val);

    const score = [hasLen, hasMixed, hasSpecial].filter(Boolean).length;

    const colors = ['#EF4444', '#F59E0B', '#22C55E'];
    const labels = ['Fraca', 'Média', 'Forte'];

    // Reseta barras
    [bar1, bar2, bar3].forEach(b => b.style.background = '#303030');

    if (val.length === 0) { label.textContent = ''; return; }

    for (let i = 0; i < score; i++) {
        [bar1, bar2, bar3][i].style.background = colors[score - 1];
    }
    label.textContent = 'Senha ' + labels[score - 1];
    label.style.color = colors[score - 1];
}


// ---------- HANDLER: CADASTRO ----------

async function handleRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('btn-register');

    const feedback = document.getElementById('register-feedback');
    const feedbackText = document.getElementById('register-feedback-text');

    // Oculta feedback anterior
    feedback.classList.remove('show', 'error', 'success');

    // Validações
    if (!name) {
        showError('Informe seu nome completo.');
        return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        showError('Informe um e-mail válido.');
        return;
    }
    if (password.length < 6) {
        showError('A senha deve ter no mínimo 6 caracteres.');
        return;
    }
    if (!selectedPosition) {
        showError('Selecione sua posição em quadra.');
        return;
    }

    // Estado de loading
    btn.disabled = true;
    btn.textContent = 'CRIANDO CONTA...';

    // 1. Cria o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,    // salvo no metadata do auth
                position: selectedPosition
            }
        }
    });

    if (authError) {
        showError(authError.message === 'User already registered'
            ? 'Este e-mail já está cadastrado.'
            : 'Erro ao criar conta. Tente novamente.');
        btn.disabled = false;
        btn.textContent = 'CRIAR CONTA';
        return;
    }

    // 2. Insere o perfil na tabela "profiles" do banco
    //    (a tabela é criada pelo SQL no README abaixo)
    if (authData.user) {
        await supabase.from('profiles').insert({
            id: authData.user.id,   // mesmo UUID do auth
            name,
            email,
            position: selectedPosition
        });
    }

    // Sucesso — exibe tela de confirmação
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('success-screen').style.display = '';
}

// Exibe mensagem de erro no feedback box
function showError(msg) {
    const feedback = document.getElementById('register-feedback');
    const feedbackText = document.getElementById('register-feedback-text');
    feedbackText.textContent = msg;
    feedback.classList.add('show', 'error');
}