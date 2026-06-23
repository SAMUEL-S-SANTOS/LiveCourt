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


