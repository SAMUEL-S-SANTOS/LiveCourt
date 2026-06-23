const STATE = {
    courts: JSON.parse(localStorage.getItem('cf_courts')) || [
      {
        id: 1,
        name: "Arena Street Ball",
        location: "Parque do Mofarrej, Pinheiros",
        type: "OUTDOOR",
        rating: 4.8,
        route: "Estacionamento exclusivo ao lado do portão principal.",
        description: "Tabelas acrílicas profissionais e piso emborrachado com ótimo amortecimento.",
        amenities: ["Iluminada", "Água"]
      },
      {
        id: 2,
        name: "PlaySpace Indoor Club",
        location: "Av. Brigadeiro Luis Antônio, SP",
        type: "INDOOR",
        rating: 4.9,
        route: "Prédio azul de esquina com acesso pela guarita.",
        description: "Estações climatizadas, vestiários com ducha quente e bebedouro livre.",
        amenities: ["Iluminada", "Água", "Segurança", "Estacionamento"]
      }
    ],
    favorites:     JSON.parse(localStorage.getItem('cf_favs')) || [1],
    filter:        'ALL',
    search:        '',
    formType:      'OUTDOOR',
    formAmenities: []
  };

  // Persiste courts e favorites no localStorage
  function save() {
    localStorage.setItem('cf_courts', JSON.stringify(STATE.courts));
    localStorage.setItem('cf_favs',   JSON.stringify(STATE.favorites));
  }


  // ---------- NAVEGAÇÃO ENTRE ABAS ----------

  function switchTab(tab) {
    // Oculta todas as views e desativa todos os nav items
    ['map', 'search', 'add', 'profile'].forEach(t => {
      document.getElementById('view-' + t).style.display = 'none';
      document.getElementById('nav-'  + t).classList.remove('active');
    });

    // Exibe a view ativa e marca o nav item correspondente
    document.getElementById('view-' + tab).style.display = '';
    document.getElementById('nav-'  + tab).classList.add('active');

    // Atualiza o título da topbar
    const titles = {
      map:     'Ver no Mapa',
      search:  'Quadras Disponíveis',
      add:     'Cadastrar Quadra',
      profile: 'Perfil do Jogador'
    };
    document.getElementById('page-title').textContent = titles[tab] || '';

    // Renderiza o conteúdo dinâmico de cada aba
    if (tab === 'search')  renderCourts();
    if (tab === 'profile') renderProfile();

    closeSidebar();
  }


  // ---------- SIDEBAR MOBILE ----------

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.getElementById('sidebar-overlay').classList.toggle('show');
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebar-overlay').classList.remove('show');
  }


  // ---------- BUSCA GLOBAL ----------

  function handleSearch(val) {
    STATE.search = val.toLowerCase();
    // Só re-renderiza se a aba de quadras estiver ativa
    if (document.getElementById('view-search').style.display !== 'none') {
      renderCourts();
    }
  }


  // ---------- DETAIL PANEL ----------

  function openDetail(id) {
    const court = STATE.courts.find(c => c.id === id);
    if (!court) return;

    // Preenche os campos do painel
    document.getElementById('d-name').textContent        = court.name;
    document.getElementById('d-location').textContent    = court.location;
    document.getElementById('d-type').textContent        = court.type;
    document.getElementById('d-rating').textContent      = court.rating;
    document.getElementById('d-route').textContent       = court.route;
    document.getElementById('d-description').textContent = court.description;

    // Renderiza tags de comodidades
    const amEl = document.getElementById('d-amenities');
    amEl.innerHTML = court.amenities.length
      ? court.amenities.map(a => `<span class="tag">${a}</span>`).join('')
      : '<span style="color:#938F99; font-size:12px;">Sem comodidades registradas</span>';

    // Abre o painel
    document.getElementById('detail-panel').classList.add('open');
    document.getElementById('detail-overlay').style.display = 'block';
  }

  function closeDetail() {
    document.getElementById('detail-panel').classList.remove('open');
    document.getElementById('detail-overlay').style.display = 'none';
  }


  // ---------- RESPONSIVIDADE ----------

  function checkMobile() {
    const isMobile = window.innerWidth < 768;
    document.getElementById('hamburger-btn').style.display = isMobile ? 'flex' : 'none';
    document.getElementById('global-search').style.width   = isMobile ? '160px' : '280px';
  }
  window.addEventListener('resize', checkMobile);
  checkMobile();

  