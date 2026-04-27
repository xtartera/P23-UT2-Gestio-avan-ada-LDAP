window.UILDAP = (() => {
  const esc = (s='') => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function renderOverview(data){
    const acts = data.activities.length;
    const steps = data.activities.reduce((n,a)=>n+a.steps.length,0);
    const textSteps = data.activities.flatMap(a=>a.steps).filter(s=>['text','both'].includes(s.evidence)).length;
    const imageSteps = data.activities.flatMap(a=>a.steps).filter(s=>['image','both'].includes(s.evidence)).length;
    const multiSteps = data.activities.flatMap(a=>a.steps).filter(s=>s.allowMultipleImages).length;
    document.getElementById('overviewGrid').innerHTML = [
      ['Activitats', `${acts} blocs`, 'Itinerari organitzat per fases de treball.'],
      ['Passos', `${steps} passos`, 'Cada pas conté instruccions i espais d’evidència.'],
      ['Evidències', `${textSteps} text · ${imageSteps} imatge`, multiSteps ? `Una captura per defecte; ${multiSteps} passos admeten diverses captures.` : 'Una captura per defecte quan el pas demana imatge.'],
      ['Persistència', 'Local per alumne', 'Autodesat separat per identitat original del dossier.']
    ].map(([h,v,p])=>`<article class="overview-card"><strong>${esc(v)}</strong><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join('');
    if(!document.getElementById('integrityPanel')){
      document.getElementById('overview').insertAdjacentHTML('beforeend', `<section class="integrity-panel" id="integrityPanel" aria-live="polite"><h3>Control d’integritat del dossier</h3><div class="integrity-grid"><p><span>Estat</span><strong id="integrityStatus">Pendent d’identificació</strong></p><p><span>Alumne actual</span><strong id="integrityCurrent">—</strong></p><p><span>Alumne original</span><strong id="integrityOriginal">—</strong></p><p><span>Empremta</span><strong id="integrityFingerprint">—</strong></p></div></section>`);
    }
  }
  function updateIntegrity(student){
    const panel = document.getElementById('integrityPanel'); if(!panel) return;
    const current = StorageLDAP.fullName(student?.currentName, student?.currentSurname) || '—';
    const original = StorageLDAP.fullName(student?.originalName, student?.originalSurname) || '—';
    const status = student?.integrityLabel || 'Pendent d’identificació';
    panel.classList.toggle('integrity-alert', !!student && !student.verified);
    document.getElementById('integrityStatus').textContent = status;
    document.getElementById('integrityCurrent').textContent = current;
    document.getElementById('integrityOriginal').textContent = original;
    document.getElementById('integrityFingerprint').textContent = student?.fingerprint || '—';
  }
  function stepHTML(step){
    const needsText = ['text','both'].includes(step.evidence);
    const needsImage = ['image','both'].includes(step.evidence);
    const multi = step.allowMultipleImages === true;
    return `<article class="step" data-step="${esc(step.id)}">
      <div class="step-top"><span class="step-id">${esc(step.id)}</span><h3>${esc(step.title)}</h3></div>
      <div class="step-grid">
        <div class="step-main">
          <p>${esc(step.prompt)}</p>
          ${step.tasks ? `<ul class="tasks">${step.tasks.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          ${step.code ? `<div class="snippet"><div class="snippet-head">${esc(step.codeLang || 'snippet')}</div><pre><code>${esc(step.code)}</code></pre></div>` : ''}
          ${step.note ? `<p class="note">💡 ${esc(step.note)}</p>` : ''}
        </div>
        <div class="step-work">
          ${needsText ? `<div class="answer-block" data-field="text"><label class="field-label" for="answer_${esc(step.id)}">Resposta escrita</label><textarea class="answer" id="answer_${esc(step.id)}" data-step="${esc(step.id)}" placeholder="Escriu aquí la resposta..."></textarea></div>` : ''}
          ${needsImage ? `<div class="evidence-block" data-field="images" data-multiple="${multi ? 'true' : 'false'}"><span class="field-label">Evidència visual${multi ? ' · diverses captures' : ''}</span><div class="dropzone" tabindex="0" role="button" aria-label="Afegir imatge al pas ${esc(step.id)}" data-step="${esc(step.id)}"><span class="focus-pill">Ctrl+V preparat</span><div class="image-gallery" data-gallery="${esc(step.id)}"></div><p class="placeholder">Arrossega o enganxa amb Ctrl+V<span class="drop-hint">${multi ? 'Aquest pas admet diverses captures' : 'Aquest pas desa una única captura; una nova imatge substituirà l’anterior'}</span></p><div class="drop-actions"><label class="pick">${multi ? 'Selecciona imatges' : 'Selecciona imatge'}<input type="file" ${multi ? 'multiple' : ''} accept="image/*" data-file="${esc(step.id)}"></label></div></div></div>` : ''}
        </div>
      </div>
    </article>`;
  }
  function renderActivities(data){
    document.getElementById('activities').innerHTML = data.activities.map((a,i)=>`<section class="activity"><header class="activity-head"><div><span class="activity-tag">Activitat ${i+1}</span><h2>${esc(a.title)}</h2><p class="activity-objective">${esc(a.objective)}</p></div></header><div class="steps">${a.steps.map(s=>stepHTML(s)).join('')}</div></section>`).join('');
  }
  function renderGallery(stepId, images){
    const gal = document.querySelector(`[data-gallery="${CSS.escape(stepId)}"]`); if(!gal) return;
    const list = images || [];
    gal.classList.toggle('is-single', list.length === 1);
    gal.classList.toggle('is-multiple', list.length > 1);
    gal.innerHTML = list.map(img=>`<figure class="image-card" data-image-id="${esc(img.id)}"><img src="${img.data}" alt="${esc(img.name)}"><button type="button" data-remove-image="${esc(stepId)}:${esc(img.id)}" aria-label="Eliminar imatge">×</button><figcaption class="image-name">${esc(img.name)}</figcaption></figure>`).join('');
    const ph = gal.parentElement.querySelector('.placeholder'); if(ph) ph.style.display = list.length ? 'none' : '';
  }
  return { renderOverview, renderActivities, renderGallery, updateIntegrity };
})();
