// ===== CREDENCIAIS DO SUPABASE =====
const SUPABASE_URL = 'https://kykocdauoighogdwjdle.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a29jZGF1b2lnaG9nZHdqZGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDc0NTAsImV4cCI6MjEwMDI4MzQ1MH0.Ss3NcMoC7WA6JuwvL3gybfZKRww9pJgIgeWnxpLq2Yc';

// ----- CONFIGURAÇÃO -----
const CODIGO_VALIDO = "MARINA15";
const EMAIL_ANFITRIA = "felipechat321@gmail.com";

// ----- DOM -----
const form = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const invite = document.getElementById('invite');
const errorMsg = document.getElementById('errorMsg');

const nomeInput = document.getElementById('nome');
const sobrenomeInput = document.getElementById('sobrenome');
const acompanhanteInput = document.getElementById('acompanhante');
const codigoInput = document.getElementById('codigo');

const confirmBtn = document.getElementById('confirmBtn');
const confirmNote = document.getElementById('confirmNote');
const confirmedPanel = document.getElementById('confirmedPanel');
const confirmedMsg = document.getElementById('confirmedMsg');

// ----- MODAL -----
const modal = document.getElementById('modalConfirmacao');
const modalEmail = document.getElementById('modalEmail');
const modalBtnConfirm = document.getElementById('modalBtnConfirm');
const modalBtnSkip = document.getElementById('modalBtnSkip');

// ----- TOAST (mensagens bonitas) -----
const toast = document.getElementById('toast');

// ----- FUNÇÃO PARA FORMATAR ACOMPANHANTE -----
function formatarAcompanhante(nome, sobrenome, acompanhante) {
  let texto = `${nome} ${sobrenome}`;
  
  if (acompanhante) {
    let acompanhanteFormatado = acompanhante
      .replace(/\b(minha|meu|meus|minhas)\b/gi, function(match) {
        const mapa = {
          'minha': 'sua',
          'meu': 'seu',
          'meus': 'seus',
          'minhas': 'suas'
        };
        const lower = match.toLowerCase();
        const substituido = mapa[lower] || match;
        return match[0] === match[0].toUpperCase() 
          ? substituido.charAt(0).toUpperCase() + substituido.slice(1)
          : substituido;
      });
    
    texto += ` e ${acompanhanteFormatado}`;
  }
  
  return texto;
}

// ----- FUNÇÕES DE APOIO -----
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('show');
  loginCard.classList.remove('shake');
  void loginCard.offsetWidth;
  loginCard.classList.add('shake');
}

function hideError() {
  errorMsg.classList.remove('show');
  loginCard.classList.remove('shake');
}

// ----- MOSTRAR TOAST (mensagem bonita) -----
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  
  toastMessage.textContent = message;
  
  if (type === 'success') {
    toastIcon.textContent = '✅';
    toast.className = 'toast show success';
  } else if (type === 'error') {
    toastIcon.textContent = '❌';
    toast.className = 'toast show error';
  } else {
    toastIcon.textContent = 'ℹ️';
    toast.className = 'toast show info';
  }
  
  // Esconde após 5 segundos
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

// ----- SALVAR NO SUPABASE -----
async function salvarConfirmacao(dados) {
  try {
    console.log('Enviando para Supabase:', dados);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/confirmacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(dados)
    });

    console.log('Resposta do Supabase:', response.status);

    if (!response.ok) {
      const erro = await response.text();
      console.error('Erro do Supabase:', erro);
      throw new Error(`Erro ${response.status}: ${erro}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    throw error;
  }
}

// ----- SALVAR ACESSO -----
async function salvarAcesso() {
  try {
    let ip = 'desconhecido';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ip = ipData.ip;
    } catch (e) {
      console.warn('Não foi possível obter o IP');
    }

    await fetch(`${SUPABASE_URL}/rest/v1/acessos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ 
        ip: ip, 
        user_agent: navigator.userAgent 
      })
    });
  } catch (error) {
    console.error('Erro ao salvar acesso:', error);
  }
}

// ----- VERIFICAR SE JÁ ESTÁ LOGADO -----
function verificarLoginSalvo() {
  const dadosSalvos = localStorage.getItem('convidado_confirmado');
  if (dadosSalvos) {
    try {
      const dados = JSON.parse(dadosSalvos);
      
      // VERIFICA SE OS DADOS SÃO VÁLIDOS
      if (!dados.nome || !dados.sobrenome) {
        localStorage.removeItem('convidado_confirmado');
        return false;
      }
      
      const nome = dados.nome;
      const sobrenome = dados.sobrenome;
      const acompanhante = dados.acompanhante || '';

      const greeting = document.getElementById('greeting');
      greeting.textContent = `Olá, ${nome}!`;

      const rsvpName = document.getElementById('rsvpName');
      const rsvpText = formatarAcompanhante(nome, sobrenome, acompanhante);
      rsvpName.textContent = rsvpText;

      loginCard.classList.add('hidden');
      invite.classList.add('show');

      confirmBtn.dataset.nome = nome;
      confirmBtn.dataset.sobrenome = sobrenome;
      confirmBtn.dataset.acompanhante = acompanhante;

      if (dados.confirmado) {
        confirmBtn.textContent = 'Presença confirmada ✓';
        confirmBtn.classList.add('confirmed');
        confirmNote.textContent = 'Sua presença já foi confirmada!';
        confirmedMsg.textContent = `Que alegria te ter com a gente, ${nome}! Sua confirmação foi registrada.`;
        confirmedPanel.classList.add('show');
      }

      return true;
    } catch (e) {
      console.error('Erro ao recuperar dados salvos:', e);
      localStorage.removeItem('convidado_confirmado');
      return false;
    }
  }
  return false;
}

// ----- SUBMISSÃO DO FORM -----
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const sobrenome = sobrenomeInput.value.trim();
  const acompanhante = acompanhanteInput.value.trim();
  const codigo = codigoInput.value.trim().toUpperCase();

  if (!nome || !sobrenome || !codigo) {
    showError('Preencha nome, sobrenome e código para continuar.');
    return;
  }

  if (codigo !== CODIGO_VALIDO) {
    showError('⚠️ Código incorreto. Verifique e tente novamente.');
    return;
  }

  hideError();

  const dadosConvidado = {
    nome: nome,
    sobrenome: sobrenome,
    acompanhante: acompanhante,
    confirmado: false,
    data: new Date().toISOString()
  };
  localStorage.setItem('convidado_confirmado', JSON.stringify(dadosConvidado));

  salvarAcesso();

  const greeting = document.getElementById('greeting');
  greeting.textContent = `Olá, ${nome}!`;

  const rsvpName = document.getElementById('rsvpName');
  const rsvpText = formatarAcompanhante(nome, sobrenome, acompanhante);
  rsvpName.textContent = rsvpText;

  loginCard.classList.add('hidden');
  invite.classList.add('show');

  confirmBtn.dataset.nome = nome;
  confirmBtn.dataset.sobrenome = sobrenome;
  confirmBtn.dataset.acompanhante = acompanhante;
});

// ===== FUNÇÃO PARA CONFIRMAR PRESENÇA =====
async function confirmarPresenca(email) {
  const nome = confirmBtn.dataset.nome || '';
  const sobrenome = confirmBtn.dataset.sobrenome || '';
  const acompanhante = confirmBtn.dataset.acompanhante || '';

  try {
    // Salva no Supabase
    const resultado = await salvarConfirmacao({
      nome: nome,
      sobrenome: sobrenome,
      acompanhante: acompanhante || null,
      email: email || null,
      telefone: null,
      status: 'confirmado'
    });

    console.log('Salvo com sucesso:', resultado);

    // Atualiza localStorage
    const dadosSalvos = localStorage.getItem('convidado_confirmado');
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        dados.confirmado = true;
        dados.email = email || '';
        dados.data_confirmacao = new Date().toISOString();
        localStorage.setItem('convidado_confirmado', JSON.stringify(dados));
      } catch (e) {
        console.error('Erro ao salvar confirmação no localStorage:', e);
      }
    }

    // Mostra toast de sucesso
    showToast(`✅ Presença confirmada! ${email ? 'Um email foi enviado para você.' : ''}`, 'success');

    // Abre o email (se tiver email)
    if (email) {
      const assunto = `Confirmação de presença — ${nome} ${sobrenome}`;
      let corpo = `Olá Marina!\n\n${nome} ${sobrenome} confirmou presença no seu baile de 15 anos!\n`;
      corpo += acompanhante
        ? `Vai levar acompanhante: ${acompanhante}.\n`
        : `Vai sozinho(a), sem acompanhante.\n`;
      corpo += email ? `Email: ${email}\n` : '';
      corpo += `\n📍 Local: Jardim Casa das Palmeiras — Rua das Acácias, 245\n📅 Data: Sábado, 10 de agosto de 2026 às 19h30\n\nAté lá! 🎉`;

      const link = `mailto:${EMAIL_ANFITRIA}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      
      // Abre o email em uma nova janela
      setTimeout(() => {
        window.open(link, '_blank');
      }, 500);
    }

    // Atualiza UI
    confirmBtn.textContent = 'Presença confirmada ✓';
    confirmBtn.classList.add('confirmed');
    confirmNote.textContent = 'Sua presença foi confirmada! Você receberá um email com a localização.';

    confirmedMsg.textContent = `Que alegria te ter com a gente, ${nome}! Sua confirmação foi registrada. 📍`;
    confirmedPanel.classList.add('show');

  } catch (error) {
    console.error('Erro ao confirmar:', error);
    showToast(`❌ Erro ao confirmar presença: ${error.message}`, 'error');
  }
}

// ===== EVENTOS DO MODAL =====

// Abrir modal ao clicar em confirmar
confirmBtn.addEventListener('click', function() {
  if (confirmBtn.classList.contains('confirmed')) return;

  modalEmail.value = '';
  modalEmail.style.borderColor = '';
  modalEmail.style.boxShadow = '';
  modal.classList.add('active');
  setTimeout(() => modalEmail.focus(), 300);
});

// Confirmar com email
modalBtnConfirm.addEventListener('click', function() {
  const email = modalEmail.value.trim();

  // Validação básica
  if (email && !email.includes('@')) {
    modalEmail.style.borderColor = '#C1512E';
    modalEmail.style.boxShadow = '0 0 0 4px rgba(193,81,46,0.2)';
    modalEmail.focus();
    return;
  }

  modalEmail.style.borderColor = '';
  modalEmail.style.boxShadow = '';
  modal.classList.remove('active');
  confirmarPresenca(email || null);
});

// Pular (confirmar sem email)
modalBtnSkip.addEventListener('click', function() {
  modal.classList.remove('active');
  confirmarPresenca(null);
});

// Fechar modal clicando fora
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// Enter no campo de email
modalEmail.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    modalBtnConfirm.click();
  }
});

// ===== LIMPAR DADOS SALVOS (para teste) =====
// Descomente a linha abaixo para limpar o localStorage e forçar o login
// localStorage.removeItem('convidado_confirmado');

// ===== INICIALIZAÇÃO =====
// Verifica se tem dados salvos, se não tiver, mostra o login
const temDadosSalvos = verificarLoginSalvo();

// Se não tiver dados salvos, garante que o login está visível
if (!temDadosSalvos) {
  loginCard.classList.remove('hidden');
  invite.classList.remove('show');
  invite.style.display = 'none';
}

hideError();
confirmedPanel.classList.remove('show');