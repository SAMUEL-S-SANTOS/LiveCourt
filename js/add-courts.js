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
