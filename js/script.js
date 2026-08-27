// ================================================================
//  JS GLOBAL → js/script.js
//  Contém: Supabase config, STATE, navegação, sidebar,
//          busca, detail panel, responsividade,
//          quadras (listar/filtrar/favoritar/cadastrar/detalhar),
//          perfil (carregar dados reais do banco)
// ================================================================


// ---------- CONFIGURAÇÃO SUPABASE ----------

const SUPABASE_URL = 'https://spiaxfdynygwhpiixthw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaWF4ZmR5bnlnd2hwaWl4dGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjkwNjAsImV4cCI6MjEwMzM0NTA2MH0.f3ug1ZbsS37agcRQBYSuvo2-brpOkOmWQFnzECF52W4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ---------- PROTEÇÃO DE ROTA ----------
// Aguarda o DOM carregar antes de verificar sessão,
// evitando que o redirect aconteça antes dos elementos existirem.

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.replace('Index.html');
    return;
  }

  await loadUserInfo(session.user.id);
  switchTab('map');
  await initMap();
});


// ---------- ESTADO LOCAL ----------
// Usado apenas para controle de UI (filtro, busca, form)
// Os dados reais (quadras, favoritos) vêm do Supabase

const STATE = {
  filter:        'ALL',
  search:        '',
  formAmenities: [],
  formCoordinates: null
};


// ================================================================
//  SEÇÃO: USUÁRIO
//  Carrega nome e posição do perfil logado
// ================================================================

async function loadUserInfo(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, position')
    .eq('id', userId)
    .single();

  if (!profile) return;

  // Iniciais para o avatar (primeiras letras do nome)
  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  // Atualiza sidebar rodapé
  const sidebarName = document.getElementById('sidebar-user-name');
  const sidebarPos  = document.getElementById('sidebar-user-pos');
  const sidebarAv   = document.getElementById('sidebar-avatar');
  const topbarAv    = document.getElementById('topbar-avatar');

  if (sidebarName) sidebarName.textContent = profile.name;
  if (sidebarPos)  sidebarPos.textContent  = profile.position.replace('_', ' ');
  if (sidebarAv)   sidebarAv.textContent   = initials;
  if (topbarAv)    topbarAv.textContent     = initials;
}


// ================================================================
//  SEÇÃO: NAVEGAÇÃO ENTRE ABAS
// ================================================================

function switchTab(tab) {
  const validTabs = ['map', 'search', 'add', 'profile'];
  if (!validTabs.includes(tab)) return;

  validTabs.forEach(t => {
    const view = document.getElementById('view-' + t);
    const nav = document.getElementById('nav-' + t);
    if (view) view.style.display = 'none';
    if (nav) nav.classList.remove('active');
  });

  const activeView = document.getElementById('view-' + tab);
  const activeNav = document.getElementById('nav-' + tab);
  if (activeView) activeView.style.display = '';
  if (activeNav) activeNav.classList.add('active');

  const titles = {
    map: 'Ver no Mapa',
    search: 'Quadras Disponíveis',
    add: 'Cadastrar Quadra',
    profile: 'Perfil do Jogador'
  };
  const title = document.getElementById('page-title');
  if (title) title.textContent = titles[tab];

  if (tab === 'search') renderCourts();
  if (tab === 'profile') renderProfile();
  if (tab === 'map') {
    initMap().then(() => setTimeout(() => map?.invalidateSize(), 0));
  }

  closeSidebar();
}


// ================================================================
//  SEÇÃO: SIDEBAR MOBILE
// ================================================================

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}


// ================================================================
//  SEÇÃO: BUSCA GLOBAL
// ================================================================

function handleSearch(val) {
  STATE.search = val.toLowerCase();
  // Re-renderiza só se a aba de quadras estiver ativa
  if (document.getElementById('view-search').style.display !== 'none') {
    renderCourts();
  }
}


// ================================================================
//  SEÇÃO: RESPONSIVIDADE
// ================================================================

function checkMobile() {
  const isMobile = window.innerWidth < 768;
  const hamburger = document.getElementById('hamburger-btn');
  const search = document.getElementById('global-search');
  if (hamburger) hamburger.style.display = isMobile ? 'flex' : 'none';
  if (search) search.style.width = isMobile ? '160px' : '280px';
}
window.addEventListener('resize', checkMobile);
checkMobile();


// ================================================================
//  SEÇÃO: DETAIL PANEL (slide-in)
//  Busca os dados da quadra no Supabase pelo ID
// ================================================================

async function openDetail(id) {
  const { data: court, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !court) return;

  // Preenche os campos do painel
  document.getElementById('d-name').textContent        = court.name;
  document.getElementById('d-location').textContent    = court.location;
  document.getElementById('d-type').textContent        = court.type;
  document.getElementById('d-rating').textContent      = court.rating;
  document.getElementById('d-route').textContent       = court.route        || 'Sem rota cadastrada.';
  document.getElementById('d-description').textContent = court.description  || 'Sem descrição.';

  // Renderiza tags de comodidades
  const amEl = document.getElementById('d-amenities');
  amEl.innerHTML = court.amenities?.length
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


// ================================================================
//  SEÇÃO: LISTA DE QUADRAS
//  Busca quadras no Supabase com filtro de tipo e busca por texto
// ================================================================

// Altera o chip de filtro ativo e re-renderiza
function filterType(type) {
  STATE.filter = type;

  ['all', 'outdoor', 'indoor'].forEach(t =>
    document.getElementById('filter-' + t).classList.remove('active')
  );
  document.getElementById('filter-' + type.toLowerCase()).classList.add('active');

  renderCourts();
}

// Busca e renderiza o grid de cards
async function renderCourts() {
  const container = document.getElementById('court-grid');
  container.innerHTML = '<p style="color:#938F99; padding:20px;">Carregando quadras...</p>';

  // Monta a query com filtros
  let query = supabase
    .from('courts')
    .select('*')
    .order('created_at', { ascending: false });

  if (STATE.filter !== 'ALL') {
    query = query.eq('type', STATE.filter);
  }
  if (STATE.search) {
    query = query.or(`name.ilike.%${STATE.search}%,location.ilike.%${STATE.search}%`);
  }

  const { data: courts, error } = await query;

  if (error || !courts?.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:60px; color:#938F99;">
        <span class="material-symbols-outlined" style="font-size:40px; display:block; margin-bottom:10px;">error_outline</span>
        <div style="font-weight:700; color:white;">Nenhuma quadra encontrada</div>
        <div style="font-size:12px; margin-top:4px;">Ajuste os filtros ou a busca.</div>
      </div>`;
    return;
  }

  // Busca IDs dos favoritos do usuário logado
  const { data: { user } } = await supabase.auth.getUser();
  let favIds = [];
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('court_id')
      .eq('user_id', user.id);
    favIds = favs?.map(f => f.court_id) || [];
  }

  // Renderiza os cards
  container.innerHTML = '';
  courts.forEach(court => {
    const isFav = favIds.includes(court.id);
    const card  = document.createElement('div');
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


// ================================================================
//  SEÇÃO: FAVORITOS
//  Toggle que insere ou remove da tabela "favorites" no Supabase
// ================================================================

async function toggleFav(courtId, event) {
  if (event) event.stopPropagation();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Entre na sua conta para salvar favoritos.');
    window.location.href = 'Index.html';
    return;
  }

  // Verifica se já existe o favorito
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id',  user.id)
    .eq('court_id', courtId)
    .single();

  if (existing) {
    // Já é favorito → remove
    await supabase.from('favorites').delete().eq('id', existing.id);
  } else {
    // Não é favorito → adiciona
    await supabase.from('favorites').insert({
      user_id:  user.id,
      court_id: courtId
    });
  }

  // Atualiza UI
  renderCourts();
  renderProfile();
}


// ================================================================
//  SEÇÃO: CADASTRAR QUADRA
//  Salva nova quadra na tabela "courts" do Supabase
// ================================================================

// Toggle visual de comodidade selecionada
function toggleAmenity(name, el) {
  const idx = STATE.formAmenities.indexOf(name);
  if (idx === -1) { STATE.formAmenities.push(name);    el.classList.add('selected'); }
  else            { STATE.formAmenities.splice(idx, 1); el.classList.remove('selected'); }
}

// Valida e envia o formulário para o Supabase
async function saveNewCourt() {
  const name     = document.getElementById('form-name').value.trim();
  const location = document.getElementById('form-location').value.trim();
  const route    = document.getElementById('form-route').value.trim();
  const type     = document.getElementById('type').value.toUpperCase();
  const btn      = document.getElementById('btn-save-court');

  if (!name || !location) {
    alert('Preencha o nome e a localização!');
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'SALVANDO...';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Sua sessão expirou. Entre novamente para publicar uma quadra.');
    window.location.href = 'Index.html';
    return;
  }

  const newCourt = {
    name,
    location,
    type,
    rating: 5.0,
    route: route || 'Sem rota cadastrada.',
    description: 'Quadra adicionada pela comunidade Court Finder.',
    amenities: [...STATE.formAmenities],
    created_by: user.id
  };
  if (STATE.formCoordinates) {
    newCourt.latitude = STATE.formCoordinates.latitude;
    newCourt.longitude = STATE.formCoordinates.longitude;
  }

  const { error } = await supabase.from('courts').insert(newCourt);

  btn.disabled    = false;
  btn.textContent = 'SALVAR E PUBLICAR QUADRA';

  if (error) {
    alert('Erro ao salvar quadra: ' + error.message);
    return;
  }

  // Reseta o formulário
  document.getElementById('form-name').value     = '';
  document.getElementById('form-location').value = '';
  document.getElementById('form-route').value    = '';
  STATE.formAmenities = [];
  document.querySelectorAll('#amenities-container .tag')
    .forEach(el => el.classList.remove('selected'));

  alert('Quadra publicada com sucesso!');
  switchTab('search');
}


// ================================================================
//  SEÇÃO: PERFIL DO JOGADOR
//  Busca dados reais do Supabase: perfil, inscrições e favoritos
// ================================================================

async function renderProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Busca perfil do jogador
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Conta inscrições ativas
  const { count: totalReg } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Busca favoritos com dados da quadra (join)
  const { data: favs } = await supabase
    .from('favorites')
    .select('court_id, courts(*)')
    .eq('user_id', user.id);

  // ---------- Atualiza card do jogador ----------
  if (profile) {
    const initials = profile.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    const nameEl     = document.getElementById('profile-name');
    const posEl      = document.getElementById('profile-position');
    const avatarEl   = document.getElementById('profile-avatar');

    if (nameEl)   nameEl.textContent   = profile.name;
    if (posEl)    posEl.textContent    = profile.position.replace('_', ' ');
    if (avatarEl) avatarEl.textContent = initials;
  }

  // ---------- Atualiza stats ----------
  const regCountEl = document.getElementById('reg-count');
  const favCountEl = document.getElementById('fav-count');
  if (regCountEl) regCountEl.textContent = totalReg  || 0;
  if (favCountEl) favCountEl.textContent = favs?.length || 0;

  // ---------- Lista de favoritos ----------
  const list = document.getElementById('fav-list');

  if (!favs?.length) {
    list.innerHTML = `
      <div style="background:#1C1B1F; border:1px solid #303030; border-radius:16px; padding:24px; text-align:center; color:#938F99; font-size:13px;">
        Nenhuma quadra favorita ainda. Toque em ♥ para salvar.
      </div>`;
    return;
  }

  list.innerHTML = '';
  favs.forEach(({ courts: court }) => {
    if (!court) return;
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

// ================================================================
//  MAPA: Leaflet + CartoDB (gratuito, sem chave)
// ================================================================
let map;
let userMarker;
let courtMarkers = [];
const DEFAULT_MAP_CENTER = [-23.55052, -46.63331];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
}

async function initMap() {
  if (!window.L || map) {
    if (map) map.invalidateSize();
    return;
  }

  map = L.map('live-map', { zoomControl: false, minZoom: 3 }).setView(DEFAULT_MAP_CENTER, 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map);

  map.on('moveend', () => {
    const center = map.getCenter();
    const subtitle = document.getElementById('map-location-subtitle');
    if (subtitle) subtitle.textContent = `Centro: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
  });

  await Promise.all([showUserLocation(), loadCourtMarkers()]);
  map.invalidateSize();
}

function zoomMap(amount) {
  if (map) map.setZoom(map.getZoom() + amount);
}

function courtIcon() {
  return L.divIcon({
    className: 'livecourt-marker-wrapper',
    html: '<div class="livecourt-marker"><span class="material-symbols-outlined">sports_basketball</span></div>',
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
}

async function loadCourtMarkers() {
  if (!map) return;
  courtMarkers.forEach(marker => marker.remove());
  courtMarkers = [];

  const { data: courts, error } = await supabase
    .from('courts')
    .select('id, name, location, type, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  // Compatibilidade: enquanto as colunas ainda não existirem, a lista segue funcional.
  if (error || !courts) return;

  courts.forEach(court => {
    const latitude = Number(court.latitude);
    const longitude = Number(court.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const marker = L.marker([latitude, longitude], { icon: courtIcon() })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(court.name)}</strong><br><span>${escapeHtml(court.location || '')}</span><br><button class="map-popup-button" onclick="openDetail(${Number(court.id)})">Ver quadra</button>`);
    courtMarkers.push(marker);
  });
}

function showUserLocation() {
  const title = document.getElementById('map-location-title');
  const subtitle = document.getElementById('map-location-subtitle');
  if (!navigator.geolocation) {
    if (subtitle) subtitle.textContent = 'Geolocalização não é suportada neste navegador.';
    return Promise.resolve();
  }

  if (subtitle) subtitle.textContent = 'Obtendo sua localização…';
  return new Promise(resolve => navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const point = [latitude, longitude];
      userMarker?.remove();
      userMarker = L.circleMarker(point, {
        radius: 9, color: '#fff', weight: 2, fillColor: '#3B82F6', fillOpacity: 1
      }).addTo(map).bindPopup('Você está aqui');
      map.setView(point, 14);
      if (title) title.textContent = 'Sua localização';
      if (subtitle) subtitle.textContent = 'Mostrando quadras próximas a você';
      resolve();
    },
    () => {
      if (title) title.textContent = 'São Paulo';
      if (subtitle) subtitle.textContent = 'Permita a localização para ver as quadras mais próximas.';
      resolve();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  ));
}

async function searchMapLocation() {
  const input = document.getElementById('map-search');
  const query = input?.value.trim();
  if (!query) return;

  const button = document.getElementById('map-search-button');
  if (button) button.disabled = true;
  try {
    const response = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(query));
    const results = await response.json();
    if (!results?.length) {
      alert('Local não encontrado. Tente informar bairro, cidade ou endereço.');
      return;
    }
    const result = results[0];
    map.setView([Number(result.lat), Number(result.lon)], 15);
    const title = document.getElementById('map-location-title');
    const subtitle = document.getElementById('map-location-subtitle');
    if (title) title.textContent = result.display_name.split(',')[0];
    if (subtitle) subtitle.textContent = result.display_name;
  } catch {
    alert('Não foi possível buscar este local agora. Tente novamente.');
  } finally {
    if (button) button.disabled = false;
  }
}

function useCurrentLocationForCourt() {
  if (!navigator.geolocation) {
    alert('Geolocalização não é suportada neste navegador.');
    return;
  }
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    STATE.formCoordinates = { latitude, longitude };
    const field = document.getElementById('form-coordinates');
    if (field) field.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }, () => alert('Não foi possível obter sua localização. Verifique a permissão do navegador.'), {
    enableHighAccuracy: true, timeout: 10000
  });
}