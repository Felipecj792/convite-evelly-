// ===== CREDENCIAIS DO SUPABASE =====
const SUPABASE_URL = 'https://kykocdauoighogdwjdle.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a29jZGF1b2lnaG9nZHdqZGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDc0NTAsImV4cCI6MjEwMDI4MzQ1MH0.Ss3NcMoC7WA6JuwvL3gybfZKRww9pJgIgeWnxpLq2Yc';

// ----- CONFIGURAÇÃO -----
const CODIGO_VALIDO = "EVY723";
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

// ----- SALVAR NO SUPABASE -----
async function salvarConfirmacao(dados) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/confirmacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(dados)
    });

    if (!response.ok) {
      const erro = await response.text();
      console.error('Erro do Supabase:', erro);
      throw new Error('Erro ao salvar no Supabase');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
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
      const nome = dados.nome;
      const sobrenome = dados.sobrenome;
      const acompanhante = dados.acompanhante;

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

// ----- CONFIRMAR PRESENÇA -----
confirmBtn.addEventListener('click', async function() {
  if (confirmBtn.classList.contains('confirmed')) return;

  const nome = confirmBtn.dataset.nome || '';
  const sobrenome = confirmBtn.dataset.sobrenome || '';
  const acompanhante = confirmBtn.dataset.acompanhante || '';

  const email = prompt('Digite seu email (opcional):');
  const telefone = prompt('Digite seu telefone (opcional):');

  try {
    await salvarConfirmacao({
      nome: nome,
      sobrenome: sobrenome,
      acompanhante: acompanhante || null,
      email: email || null,
      telefone: telefone || null,
      status: 'confirmado'
    });

    const dadosSalvos = localStorage.getItem('convidado_confirmado');
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        dados.confirmado = true;
        dados.email = email || '';
        dados.telefone = telefone || '';
        dados.data_confirmacao = new Date().toISOString();
        localStorage.setItem('convidado_confirmado', JSON.stringify(dados));
      } catch (e) {
        console.error('Erro ao salvar confirmação:', e);
      }
    }

    const assunto = `Confirmação de presença — ${nome} ${sobrenome}`;
    let corpo = `Olá Marina!\n\n${nome} ${sobrenome} confirmou presença no seu baile de 15 anos!\n`;
    corpo += acompanhante
      ? `Vai levar acompanhante: ${acompanhante}.\n`
      : `Vai sozinho(a), sem acompanhante.\n`;
    corpo += email ? `Email: ${email}\n` : '';
    corpo += telefone ? `Telefone: ${telefone}\n` : '';
    corpo += `\nLocal: Jardim Casa das Palmeiras — Rua das Acácias, 245\nData: Sábado, 15 de agosto de 2026 às 19h30\n\nAté lá! 🎉`;

    const link = `mailto:${EMAIL_ANFITRIA}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = link;

    confirmBtn.textContent = 'Presença confirmada ✓';
    confirmBtn.classList.add('confirmed');
    confirmNote.textContent = 'Sua presença foi confirmada! O email foi aberto para envio.';

    confirmedMsg.textContent = `Que alegria te ter com a gente, ${nome}! Sua confirmação foi registrada.`;
    confirmedPanel.classList.add('show');

  } catch (error) {
    alert('Erro ao confirmar presença. Tente novamente.');
    console.error(error);
  }
});

// ----- INICIALIZAÇÃO -----
verificarLoginSalvo();
hideError();
confirmedPanel.classList.remove('show');