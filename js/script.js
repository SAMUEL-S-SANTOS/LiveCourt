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




  // Altera o filtro ativo e re-renderiza os cards
  function filterType(type) {
    STATE.filter = type;

    ['all', 'outdoor', 'indoor'].forEach(t =>
      document.getElementById('filter-' + t).classList.remove('active')
    );
    document.getElementById('filter-' + type.toLowerCase()).classList.add('active');

    renderCourts();
  }

  // Renderiza o grid de cards filtrando por tipo e busca
  function renderCourts() {
    const container = document.getElementById('court-grid');

    const filtered = STATE.courts.filter(court => {
      const typeOk   = STATE.filter === 'ALL' || court.type === STATE.filter;
      const searchOk = court.name.toLowerCase().includes(STATE.search)
                    || court.location.toLowerCase().includes(STATE.search);
      return typeOk && searchOk;
    });

    // Estado vazio
    if (!filtered.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px; color:#938F99;">
          <span class="material-symbols-outlined" style="font-size:40px; display:block; margin-bottom:10px;">error_outline</span>
          <div style="font-weight:700; color:white;">Nenhuma quadra encontrada</div>
          <div style="font-size:12px; margin-top:4px;">Ajuste os filtros ou a busca.</div>
        </div>`;
      return;
    }

    container.innerHTML = '';
    filtered.forEach(court => {
      const isFav = STATE.favorites.includes(court.id);

      const card = document.createElement('div');
      card.className = 'court-card';
      card.onclick   = () => openDetail(court.id);

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div style="flex:1; min-width:0;">
            <span class="badge mono" style="margin-bottom:8px; display:inline-block;">${court.type}</span>
            <div style="font-size:16px; font-weight:800; color:white; line-height:1.2;">${court.name}</div>
            <div style="font-size:12px; color:#938F99; margin-top:3px;">${court.location}</div>
          </div>
          <div class="fav-btn" onclick="toggleFav(${court.id}, event)" style="margin-left:10px;">
            <span class="material-symbols-outlined" style="font-size:16px; color:${isFav ? '#EF4444' : '#938F99'};">
              ${isFav ? 'favorite' : 'favorite_border'}
            </span>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #303030; padding-top:12px;">
          <span style="font-size:14px; font-weight:800; color:#FF5722;">${court.rating} ★</span>
          <button
            onclick="openDetail(${court.id}); event.stopPropagation()"
            style="height:34px; padding:0 16px; background:#FF5722; border:none; border-radius:10px; color:white; font-size:12px; font-weight:700; cursor:pointer; font-family:'Outfit',sans-serif;">
            VER QUADRA
          </button>
        </div>`;

      container.appendChild(card);
    });
  }

  // Toggle favorito (coração nos cards)
  function toggleFav(id, event) {
    if (event) event.stopPropagation();

    const idx = STATE.favorites.indexOf(id);
    if (idx === -1) STATE.favorites.push(id);
    else            STATE.favorites.splice(idx, 1);

    save();
    renderCourts();
    renderProfile();
  }







  // Alterna visual dos botões Outdoor / Indoor
  function selectType(type) {
    STATE.formType = type;
    document.getElementById('btn-outdoor').className = 'type-btn ' + (type === 'OUTDOOR' ? 'active' : 'inactive');
    document.getElementById('btn-indoor').className  = 'type-btn ' + (type === 'INDOOR'  ? 'active' : 'inactive');
  }

  // Toggle visual de comodidade selecionada
  function toggleAmenity(name, el) {
    const idx = STATE.formAmenities.indexOf(name);
    if (idx === -1) { STATE.formAmenities.push(name);    el.classList.add('selected'); }
    else            { STATE.formAmenities.splice(idx, 1); el.classList.remove('selected'); }
  }

  // Valida e salva a nova quadra no STATE e localStorage
  function saveNewCourt() {
    const name     = document.getElementById('form-name').value.trim();
    const location = document.getElementById('form-location').value.trim();
    const route    = document.getElementById('form-route').value.trim();

    if (!name || !location) {
      alert('Preencha o nome e a localização!');
      return;
    }

    STATE.courts.push({
      id:          Date.now(),
      name,
      location,
      type:        STATE.formType,
      rating:      5.0,
      route:       route || 'Sem rota cadastrada.',
      description: 'Nova quadra adicionada pela comunidade Court Finder.',
      amenities:   [...STATE.formAmenities]
    });

    save();

    // Reseta o formulário
    document.getElementById('form-name').value     = '';
    document.getElementById('form-location').value = '';
    document.getElementById('form-route').value    = '';
    STATE.formAmenities = [];
    document.querySelectorAll('#amenities-container .tag').forEach(el => el.classList.remove('selected'));
    selectType('OUTDOOR');

    alert('Quadra adicionada com sucesso!');
    switchTab('search');
  }







  // Atualiza contador e lista de quadras favoritas no perfil
  function renderProfile() {
    document.getElementById('fav-count').textContent = STATE.favorites.length;

    const list = document.getElementById('fav-list');

    if (!STATE.favorites.length) {
      list.innerHTML = `
        <div style="background:#1C1B1F; border:1px solid #303030; border-radius:16px; padding:24px; text-align:center; color:#938F99; font-size:13px;">
          Nenhuma quadra favorita ainda. Toque em ♥ para salvar.
        </div>`;
      return;
    }

    list.innerHTML = '';
    STATE.courts
      .filter(court => STATE.favorites.includes(court.id))
      .forEach(court => {
        const el = document.createElement('div');
        el.className = 'fav-court-card';
        el.onclick   = () => openDetail(court.id);
        el.innerHTML = `
          <div>
            <div style="font-size:14px; font-weight:700; color:white;">${court.name}</div>
            <div style="font-size:11px; color:#938F99; margin-top:2px;">${court.location}</div>
          </div>
          <span class="material-symbols-outlined" style="color:#EF4444; font-size:18px;">favorite</span>`;
        list.appendChild(el);
      });
  }
