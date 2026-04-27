window.PrintLDAP = (() => {
  let tempClasses = [];
  function mark(el, cls){ el.classList.add(cls); tempClasses.push([el,cls]); }
  function footerText(student){
    if(!student) return 'Dossier pendent d’identificació';
    const current = StorageLDAP.fullName(student.currentName, student.currentSurname) || '—';
    const original = StorageLDAP.fullName(student.originalName, student.originalSurname) || '—';
    if(student.verified) return `Dossier verificat · ${original} · ${student.fingerprint}`;
    return `⚠ Original: ${original} · Actual: ${current} · Autoria no coincident amb l’original`;
  }
  function before(appState){
    tempClasses = [];
    const student = appState.student ? StorageLDAP.verifyStudent(window.QUADERN_DADES.projectId, appState.student) : null;
    const name = StorageLDAP.fullName(student?.currentName, student?.currentSurname) || 'Alumne no identificat';
    const foot = footerText(student);
    UILDAP.updateIntegrity(student);
    document.querySelectorAll('.step').forEach(step => { step.dataset.student = name; step.dataset.integrityFooter = foot; });
    document.querySelectorAll('.answer-block').forEach(block => {
      const ta = block.querySelector('textarea');
      if(!ta || !ta.value.trim()) mark(block, 'print-empty');
      else ta.textContent = ta.value;
    });
    document.querySelectorAll('.evidence-block').forEach(block => {
      const stepId = block.querySelector('.dropzone')?.dataset.step;
      const imgs = appState.answers[stepId]?.images || [];
      if(!imgs.length) mark(block, 'print-empty');
      block.querySelectorAll('.image-card').forEach((card, idx) => { if(idx >= 4) mark(card, 'print-empty'); });
    });
    buildAnnexes(appState);
  }
  function buildAnnexes(appState){
    const root = document.getElementById('printAnnexes');
    root.innerHTML = '';
    window.QUADERN_DADES.activities.flatMap(a=>a.steps).forEach(step => {
      const imgs = appState.answers[step.id]?.images || [];
      if(imgs.length <= 4) return;
      const extra = imgs.slice(4);
      const sec = document.createElement('section');
      sec.className = 'evidence-annex';
      sec.innerHTML = `<h2>Annex d’evidències — Pas ${step.id}</h2><div class="annex-grid">${extra.map(img=>`<figure class="annex-image"><img src="${img.data}" alt="${img.name}"><span>${img.name}</span></figure>`).join('')}</div>`;
      root.appendChild(sec);
    });
  }
  function after(){
    tempClasses.forEach(([el,cls]) => el.classList.remove(cls));
    tempClasses = [];
    document.getElementById('printAnnexes').innerHTML = '';
  }
  return { before, after };
})();
