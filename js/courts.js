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