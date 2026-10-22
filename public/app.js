/**
 * Simulador fiel ao Hub Web (C:\Users\Weber\hub-web):
 * - Na guia Code Lab exibe os 2 cards: "Palco" e "Code Web" com as animações do InternalCard.
 * - Clicar em qualquer um dos dois abre o respectivo iframe em TELA FULL (100vw x 100vh).
 * - Inclui todos os movimentos da tela principal (Home/Profile, menu lateral com stagger e hover,
 *   cards com levitação e zoom no ícone, guia rápido interativo e disciplinas).
 */
(function () {
  'use strict';

  const LAYER_ICON = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
  const MORE_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>`;

  const NAV_ITEMS = [
    {
      id: 'profile',
      title: 'Home',
      headerLabel: 'Meu perfil',
      desc: 'Painel inicial do professor e aluno PiCode',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    },
    {
      id: 'courses',
      title: 'Cursos',
      headerLabel: 'Meus Cursos e Trilhas',
      desc: 'Seu aprendizado começa aqui',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
      cards: [
        { title: 'Introdução à PiBoard', sub: '10 aulas práticas', time: 'há 2 horas', mode: 'palco' },
        { title: 'Robótica com ESP32', sub: '8 aulas • MicroPython & C++', time: 'há 1 dia', mode: 'code' },
        { title: 'Jogos e Animações no Palco', sub: '12 aulas • Blocos criativos', time: 'há 3 dias', mode: 'palco' },
      ],
    },
    {
      id: 'classes',
      title: 'Turmas',
      headerLabel: 'Minhas Turmas',
      desc: 'Gerencie suas turmas, alunos e entregas de projetos',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      cards: [
        { title: '6º Ano A — Robótica Maker', sub: '28 alunos', time: 'Ativa' },
        { title: '7º Ano B — Pensamento Computacional', sub: '24 alunos', time: 'Ativa' },
        { title: '9º Ano A — IoT com ESP32', sub: '22 alunos', time: 'Ativa' },
      ],
    },
    {
      id: 'planner',
      title: 'Meus Planejamentos',
      headerLabel: 'Meus Planejamentos',
      desc: 'Planos de aula alinhados à BNCC Computação',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
      cards: [
        { title: 'Semáforo Inteligente com PiBoard', sub: 'Bimestre 1 • 2 aulas', time: 'há 1 dia', mode: 'code' },
        { title: 'Contador de Pontos no Palco', sub: 'Bimestre 1 • 1 aula', time: 'há 4 dias', mode: 'palco' },
      ],
    },
    {
      id: 'code',
      title: 'Code Lab',
      headerLabel: 'Meus códigos',
      desc: 'Escolha o ambiente para programar em tela cheia',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
    },
    {
      id: 'vision_lab',
      title: 'Vision Lab',
      headerLabel: 'Vision Lab',
      desc: 'Organize seus projetos de Visão Computacional e IA',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
      cards: [
        { title: 'Reconhecimento Facial & Expressões', sub: 'Modelo de IA treinado', time: 'há 30 min', mode: 'palco' },
        { title: 'Detecção de Mão e Gestos', sub: 'Controle sprites e placas', time: 'há 2 horas', mode: 'palco' },
      ],
    },
    {
      id: 'stock',
      title: 'Estoque Maker',
      headerLabel: 'Estoque Maker',
      desc: 'Controle de kits PiBoard, placas ESP32, sensores e atuadores',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
      cards: [
        { title: 'Placas PiBoard V2', sub: '30 unidades disponíveis', time: 'Em estoque' },
        { title: 'Kits ESP32 Wi-Fi / Bluetooth', sub: '25 unidades disponíveis', time: 'Em estoque' },
        { title: 'Sensores Ultrassônicos e Servos', sub: '40 kits completos', time: 'Em estoque' },
      ],
    },
    {
      id: 'library',
      title: 'Biblioteca',
      headerLabel: 'Biblioteca',
      desc: 'Materiais de apoio, guias de pinagem e apostilas digitais',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
      cards: [
        { title: 'Guia Rápido PiBoard', sub: 'Mapa de portas e sensores integrados', time: 'PDF / Guia' },
        { title: 'Pinout ESP32 DevKit V1', sub: 'Referência de GPIOs, PWM e ADC', time: 'PDF / Guia' },
      ],
    },
    {
      id: 'community',
      title: 'Comunidade',
      headerLabel: 'Comunidade',
      desc: 'Projetos compartilhados por alunos e professores da rede PiCode',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
      cards: [
        { title: 'Labirinto com Joystick PiBoard', sub: 'Por Prof. Lucas • Abrir no Palco', time: 'Público', mode: 'palco' },
        { title: 'Estação Meteorológica ESP32', sub: 'Por Marina S. • Abrir no Code Web', time: 'Público', mode: 'code' },
      ],
    },
    {
      id: 'appointments',
      title: 'Suporte',
      headerLabel: 'Suporte',
      desc: 'Agendamentos pedagógicos e suporte técnico PiCode',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>`,
      cards: [
        { title: 'Central de Ajuda Web Serial', sub: 'Como conectar sua PiBoard ou ESP32 via USB', time: 'Tutorial' },
        { title: 'Agendar Mentoria Pedagógica', sub: 'Atendimento online com especialistas', time: 'Suporte' },
      ],
    },
  ];

  // Os 2 Cards do Code Lab pedidos: Palco e Code Web
  const CODELAB_CARDS = [
    {
      id: 'card-palco',
      title: 'Palco',
      sub: 'Animações, jogos, sprites e extensões interativas',
      tag: 'PiCode Palco',
      mode: 'palco',
      gradIndex: 0,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><polygon points="10 7 15 10 10 13 10 7" fill="currentColor"></polygon></svg>`,
    },
    {
      id: 'card-code-web',
      title: 'Code Web',
      sub: 'Programação embarcada e upload para PiBoard e ESP32',
      tag: 'Code Hub',
      mode: 'code',
      gradIndex: 1,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
    },
  ];

  const GUIDES = [
    {
      label: 'Como navegar pela plataforma?',
      instructions: 'Você pode navegar pelo Hub utilizando o menu à esquerda e selecionando a sessão que deseja ver.',
    },
    {
      label: 'Como abrir o Palco ou o Code Web?',
      instructions: 'Acesse a guia "Code Lab" no menu lateral e clique no card "Palco" ou no card "Code Web" para abrir o editor em tela cheia.',
    },
    {
      label: 'Como criar um novo projeto?',
      instructions: 'Entre no Code Lab, escolha entre o Palco ou o Code Web e monte seus blocos ou código MicroPython/C++.',
    },
    {
      label: 'Como acessar minhas turmas?',
      instructions: 'Selecione "Turmas" no menu à esquerda para visualizar os alunos e projetos de cada turma.',
    },
  ];

  const ALL_DISCIPLINES = [
    'Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Física',
    'Química', 'Biologia', 'Inglês', 'Artes', 'Robótica', 'Programação',
  ];

  let activeTab = 'code';
  let activeCodeMode = 'palco';
  let selectedDisciplines = ['Robótica', 'Programação'];

  const sidebarEl = document.getElementById('hub-sidebar');
  const sidebarNavEl = document.getElementById('sidebar-nav');
  const viewCodeFoldersEl = document.getElementById('view-code-folders');
  const viewProfileEl = document.getElementById('view-profile');
  const viewGenericEl = document.getElementById('view-generic');
  const genericContentEl = document.getElementById('generic-tab-content');
  const profileContentEl = document.getElementById('profile-page-content');
  const codelabCardsGridEl = document.getElementById('codelab-cards-grid');
  const headerPageLabel = document.getElementById('header-page-label');

  const fullscreenIdeOverlay = document.getElementById('fullscreen-ide-overlay');
  const btnExitFullscreenIde = document.getElementById('btn-exit-fullscreen-ide');
  const ideTopRightControls = document.querySelector('.ide-top-right-controls');

  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
  const iframePalco = document.getElementById('iframe-palco');
  const iframeCode = document.getElementById('iframe-code');

  const observedBodies = new WeakSet();

  function hasOpenModalInIframe(iframe) {
    try {
      const doc = iframe && iframe.contentDocument;
      if (!doc || !doc.body) return false;
      if (doc.body.classList && doc.body.classList.contains('ReactModal__Body--open')) {
        return true;
      }
      if (
        doc.querySelector(
          '[class*="modal_modal-overlay"], [class*="modal-overlay"], .ReactModal__Overlay, [class*="stage-wrapper_full-screen"]'
        )
      ) {
        return true;
      }
    } catch (e) {
      // ignora
    }
    return false;
  }

  function syncExitButtonVisibility() {
    if (!ideTopRightControls) return;
    const activeIframe = activeCodeMode === 'palco' ? iframePalco : iframeCode;
    const modalOpen = hasOpenModalInIframe(activeIframe);
    ideTopRightControls.classList.toggle('modal-open', modalOpen);
  }

  function attachIframeModalObserver(iframe) {
    try {
      const doc = iframe && iframe.contentDocument;
      if (!doc || !doc.body) return;
      if (observedBodies.has(doc.body)) {
        syncExitButtonVisibility();
        return;
      }
      observedBodies.add(doc.body);

      const observer = new MutationObserver(() => {
        syncExitButtonVisibility();
      });

      observer.observe(doc.body, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true,
      });

      syncExitButtonVisibility();
    } catch (e) {
      // ignora
    }
  }

  [iframePalco, iframeCode].forEach((iframe) => {
    if (!iframe) return;
    iframe.addEventListener('load', () => {
      attachIframeModalObserver(iframe);
    });
  });

  setInterval(() => {
    attachIframeModalObserver(iframePalco);
    attachIframeModalObserver(iframeCode);
    syncExitButtonVisibility();
  }, 200);

  function triggerIframeResize(iframe) {
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.dispatchEvent(new Event('resize'));
      }
    } catch (e) {
      // ignora
    }
  }

  function openFullscreenIde(mode) {
    if (mode) {
      setCodeMode(mode);
    }
    fullscreenIdeOverlay.classList.add('active');
    const activeIframe = activeCodeMode === 'palco' ? iframePalco : iframeCode;
    attachIframeModalObserver(activeIframe);
    syncExitButtonVisibility();
    setTimeout(() => triggerIframeResize(activeIframe), 30);
    setTimeout(() => triggerIframeResize(activeIframe), 150);
  }

  function closeFullscreenIde() {
    fullscreenIdeOverlay.classList.remove('active');
  }

  function setCodeMode(mode) {
    activeCodeMode = mode === 'code' ? 'code' : 'palco';

    iframePalco.classList.toggle('active', activeCodeMode === 'palco');
    iframeCode.classList.toggle('active', activeCodeMode === 'code');

    const activeIframe = activeCodeMode === 'palco' ? iframePalco : iframeCode;
    attachIframeModalObserver(activeIframe);
    syncExitButtonVisibility();
    setTimeout(() => triggerIframeResize(activeIframe), 30);
    setTimeout(() => triggerIframeResize(activeIframe), 150);
  }

  function buildInternalCardHtml({ index, gradIndex, title, sub, time, icon, mode }) {
    const g = typeof gradIndex === 'number' ? gradIndex : index % 6;
    const delay = (index * 0.06).toFixed(2);
    return `
      <div
        class="internal-card animate-card"
        style="animation-delay: ${delay}s"
        data-card-mode="${mode || ''}"
      >
        <div class="internal-card-banner grad-${g}">
          <div class="internal-card-watermark">${icon}</div>
          <div class="internal-card-center-icon">${icon}</div>
        </div>
        <div class="internal-card-grid-overlay"></div>
        <div class="internal-card-body">
          <button type="button" class="internal-card-more-btn" title="Opções" onclick="event.stopPropagation()">
            ${MORE_ICON}
          </button>
          <p class="internal-card-title">${title}</p>
          <div class="internal-card-footer">
            <div class="internal-card-footer-circle grad-${g}">
              ${icon}
            </div>
            <div class="internal-card-footer-meta">
              <span class="internal-card-footer-left">
                ${LAYER_ICON}
                <span>${sub}</span>
              </span>
              <span class="internal-card-footer-time">${time}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCodeLabCards() {
    codelabCardsGridEl.innerHTML = CODELAB_CARDS.map((card, index) =>
      buildInternalCardHtml({
        index,
        gradIndex: card.gradIndex,
        title: card.title,
        sub: card.sub,
        time: card.tag,
        icon: card.icon,
        mode: card.mode,
      })
    ).join('');

    codelabCardsGridEl.querySelectorAll('.internal-card').forEach((cardEl) => {
      cardEl.addEventListener('click', () => {
        const mode = cardEl.getAttribute('data-card-mode') || 'palco';
        openFullscreenIde(mode);
      });
    });
  }

  function renderProfileTab() {
    const certsHtml = [
      { title: 'Formação Robótica Educacional PiBoard', date: '15/10/2026' },
      { title: 'Programação Embarcada com ESP32 e IoT', date: '18/10/2026' },
    ]
      .map(
        (c, i) => `
      <div class="cert-item">
        <div class="cert-item-left">
          <div class="cert-badge-num">${i + 1}</div>
          <div>
            <div style="font-weight: 600; font-size: 14px">${c.title}</div>
            <div style="font-size: 12px; color: var(--gray-500)">${c.date}</div>
          </div>
        </div>
        <span style="font-size: 12px; font-weight: 600; color: var(--primary-700)">Visualizar ↗</span>
      </div>
    `
      )
      .join('');

    const recentProjectsHtml = [
      { title: 'Animação Interativa no Palco', date: 'Hoje', color: '#06b6d4', mode: 'palco' },
      { title: 'Monitoramento de Sensores PiBoard', date: 'Hoje', color: '#8b5cf6', mode: 'code' },
      { title: 'Automação com ESP32', date: 'Ontem', color: '#f97316', mode: 'code' },
    ]
      .map(
        (p) => `
      <div class="recent-project-item" style="border-left-color: ${p.color}" data-project-mode="${p.mode}">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: ${p.color}; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div style="flex: 1; min-width: 0">
          <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${p.title}</div>
          <div style="font-size: 11px; color: var(--gray-500)">${p.date}</div>
        </div>
        <span style="color: ${p.color}; font-size: 14px">↗</span>
      </div>
    `
      )
      .join('');

    const guidesHtml = GUIDES.map(
      (g, i) => `
      <div class="accordion-item ${i === 0 ? 'open' : ''}">
        <button type="button" class="accordion-btn">
          <span>${g.label}</span>
          <span>▾</span>
        </button>
        <div class="accordion-panel">${g.instructions}</div>
      </div>
    `
    ).join('');

    const disciplinesHtml = ALL_DISCIPLINES.map(
      (d) => `
      <button type="button" class="discipline-badge ${selectedDisciplines.includes(d) ? 'selected' : ''}" data-disc="${d}">
        ${d}
      </button>
    `
    ).join('');

    profileContentEl.innerHTML = `
      <div class="profile-grid-top animate-card">
        <div class="profile-box">
          <div class="profile-box-title">
            <span style="color: var(--primary-500)">🚀</span>
            <span>Boas-vindas à PiCode</span>
          </div>
          <div class="video-container">
            <video controls preload="metadata">
              <source src="https://picode-public.s3.amazonaws.com/hub-videos/Apresenta%C3%A7%C3%A3o+professores+com+intro+.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div class="profile-box">
          <div class="profile-box-title">
            <span style="color: #fb923c">🏆</span>
            <span>Meus Certificados</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px; flex: 1">
            ${certsHtml}
          </div>
        </div>
      </div>

      <div class="profile-box animate-card" style="animation-delay: 0.08s">
        <div class="profile-box-header">
          <div class="profile-box-title">
            <span>📁</span>
            <span>Meus Projetos Recentes</span>
          </div>
        </div>
        <div class="recent-projects-grid">
          ${recentProjectsHtml}
        </div>
      </div>

      <div class="profile-grid-top animate-card" style="animation-delay: 0.14s">
        <div class="profile-box">
          <div class="profile-box-title">
            <span>❓</span>
            <span>Guia Rápido</span>
          </div>
          <div>${guidesHtml}</div>
        </div>

        <div class="profile-box">
          <div class="profile-box-header">
            <div class="profile-box-title">
              <span>⚙️</span>
              <span>Configurações</span>
            </div>
            <button type="button" id="btn-toggle-dark" class="discipline-badge" style="padding: 6px 14px">
              🌙 Alternar Tema
            </button>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase">
            Disciplinas que leciono
          </div>
          <div class="disciplines-grid" id="disciplines-grid">
            ${disciplinesHtml}
          </div>
        </div>
      </div>
    `;

    profileContentEl.querySelectorAll('.recent-project-item').forEach((item) => {
      item.addEventListener('click', () => {
        const mode = item.getAttribute('data-project-mode') || 'palco';
        openFullscreenIde(mode);
      });
    });

    profileContentEl.querySelectorAll('.accordion-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('open');
      });
    });

    profileContentEl.querySelectorAll('[data-disc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-disc');
        if (selectedDisciplines.includes(d)) {
          selectedDisciplines = selectedDisciplines.filter((x) => x !== d);
        } else {
          selectedDisciplines.push(d);
        }
        renderProfileTab();
      });
    });

    const btnDark = document.getElementById('btn-toggle-dark');
    if (btnDark) {
      btnDark.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
      });
    }
  }

  function renderGenericTab(tabId) {
    const item = NAV_ITEMS.find((n) => n.id === tabId) || NAV_ITEMS[0];
    const cardsHtml = (item.cards || [])
      .map((card, index) =>
        buildInternalCardHtml({
          index,
          title: card.title,
          sub: card.sub,
          time: card.time,
          icon: item.icon,
          mode: card.mode,
        })
      )
      .join('');

    genericContentEl.innerHTML = `
      <div class="internal-page-header animate-header">
        <div class="internal-page-header-left">
          <div class="internal-page-icon">${item.icon}</div>
          <div>
            <h1 class="internal-page-title">${item.title}</h1>
            <p class="internal-page-desc">${item.desc}</p>
          </div>
        </div>
      </div>
      <div class="cards-grid">${cardsHtml}</div>
    `;

    genericContentEl.querySelectorAll('.internal-card').forEach((cardEl) => {
      cardEl.addEventListener('click', () => {
        const mode = cardEl.getAttribute('data-card-mode');
        if (mode) {
          openFullscreenIde(mode);
        }
      });
    });
  }

  function renderSidebar(animateStagger) {
    sidebarNavEl.innerHTML = NAV_ITEMS.map((item, idx) => {
      const delayStyle = animateStagger ? `style="animation-delay: ${(idx * 0.04).toFixed(2)}s"` : 'style="animation: none"';
      return `
        <button
          type="button"
          class="sidebar-nav-item ${item.id === activeTab ? 'active' : ''}"
          data-tab="${item.id}"
          ${delayStyle}
        >
          ${item.icon}
          <span>${item.title}</span>
        </button>
      `;
    }).join('');

    sidebarNavEl.querySelectorAll('.sidebar-nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        setActiveTab(targetTab);
      });
    });
  }

  function setActiveTab(tabId) {
    activeTab = tabId;
    const item = NAV_ITEMS.find((n) => n.id === tabId) || NAV_ITEMS[0];
    headerPageLabel.textContent = item.headerLabel || item.title;
    renderSidebar(false);

    viewCodeFoldersEl.classList.remove('active');
    viewProfileEl.classList.remove('active');
    viewGenericEl.classList.remove('active');

    if (tabId === 'code') {
      viewCodeFoldersEl.classList.add('active');
      renderCodeLabCards();
    } else if (tabId === 'profile') {
      viewProfileEl.classList.add('active');
      renderProfileTab();
    } else {
      viewGenericEl.classList.add('active');
      renderGenericTab(tabId);
    }
  }

  // Eventos de UI
  btnToggleSidebar.addEventListener('click', () => {
    sidebarEl.classList.toggle('collapsed');
  });

  btnCollapseSidebar.addEventListener('click', () => {
    sidebarEl.classList.add('collapsed');
  });

  btnExitFullscreenIde.addEventListener('click', () => {
    closeFullscreenIde();
  });

  document.querySelector('[data-tab-trigger="profile"]').addEventListener('click', () => {
    setActiveTab('profile');
  });

  document.getElementById('logo-home-link').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab('code');
  });

  // Inicialização na tela principal do Code Lab (com os 2 cards animados: Palco e Code Web)
  renderSidebar(true);
  setActiveTab('code');
  setCodeMode('palco');
})();
