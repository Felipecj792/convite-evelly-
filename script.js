(function() {
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
      // Substitui pronomes possessivos
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
          // Mantém capitalização
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
  confirmBtn.addEventListener('click', function() {
    if (confirmBtn.classList.contains('confirmed')) return;

    const nome = confirmBtn.dataset.nome || '';
    const sobrenome = confirmBtn.dataset.sobrenome || '';
    const acompanhante = confirmBtn.dataset.acompanhante || '';

    const assunto = `Confirmação de presença — ${nome} ${sobrenome}`;
    let corpo = `Olá Evelly!\n\n${nome} ${sobrenome} confirmou presença na festa de aniversário.\n`;
    corpo += acompanhante
      ? `Vai levar acompanhante: ${acompanhante}.\n`
      : `Vai sozinho(a), sem acompanhante.\n`;
    corpo += `\nLocal: Cerimonial le Composé— Rua Tupinua, Vale do sol\nData: Sábado, 10 de agosto de 2026 às 19h30\n\nAté lá! 🎉`;

    const link = `mailto:${EMAIL_ANFITRIA}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = link;

    confirmBtn.textContent = 'Presença confirmada ✓';
    confirmBtn.classList.add('confirmed');
    confirmNote.textContent = 'obrigado por confimar';

    confirmedMsg.textContent = `Que alegria te ter com a gente, ${nome}! Sua confirmação já foi enviada.`;
    confirmedPanel.classList.add('show');
  });

  hideError();
  confirmedPanel.classList.remove('show');
})();
