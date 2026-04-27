window.StorageLDAP = (() => {
  const SIGNATURE_VERSION = 'v2';
  const SIGNATURE_SALT = 'quadern-ldap-integritat-docent-v9.6';

  const safe = (s) => (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const fullName = (name, surname) => `${name || ''} ${surname || ''}`.trim();
  const keyFor = (projectId, name, surname) => `quadern_${safe(projectId)}_${safe(name)}_${safe(surname)}`;

  function randomToken(bytes = 16){
    const arr = new Uint8Array(bytes);
    if(window.crypto?.getRandomValues){ window.crypto.getRandomValues(arr); }
    else { for(let i=0;i<arr.length;i++) arr[i] = Math.floor(Math.random()*256); }
    return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
  }

  // SHA-256 síncron i sense dependències externes. No és una signatura amb clau secreta,
  // però és molt més robust que un hash curt FNV i evita canvis accidentals o trivials.
  function sha256(ascii) {
    function rightRotate(value, amount) { return (value>>>amount) | (value<<(32 - amount)); }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j;
    let result = '';
    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;
    let hash = sha256.h = sha256.h || [];
    let k = sha256.k = sha256.k || [];
    let primeCounter = k[lengthProperty];
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j>>8) return ''; // només caràcters de 8 bits; abans fem encodeURIComponent/unescape
      words[i>>2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);
    for (j = 0; j < words[lengthProperty];) {
      const w = words.slice(j, j += 16);
      const oldHash = hash.slice(0);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const a = hash[0], e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
        hash.pop();
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result.toUpperCase();
  }

  function canonicalIdentity(projectId, originalName, originalSurname, createdAt, originId){
    return JSON.stringify({
      version: SIGNATURE_VERSION,
      salt: SIGNATURE_SALT,
      projectId: safe(projectId),
      originalName: safe(originalName),
      originalSurname: safe(originalSurname),
      createdAt: createdAt || '',
      originId: originId || ''
    });
  }

  function legacyHashText(text){
    let h = 2166136261;
    for(let i=0;i<text.length;i++){
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).toUpperCase().padStart(8,'0');
  }
  function legacySignatureFor(projectId, originalName, originalSurname, createdAt){
    return `${safe(projectId).toUpperCase()}-${legacyHashText([projectId, originalName, originalSurname, createdAt].join('|')).slice(0,8)}`;
  }

  function signatureFor(projectId, originalName, originalSurname, createdAt, originId){
    const raw = unescape(encodeURIComponent(canonicalIdentity(projectId, originalName, originalSurname, createdAt, originId)));
    return `${safe(projectId).toUpperCase()}-S2-${sha256(raw).slice(0,16)}`;
  }

  function createStudent(projectId, name, surname){
    const createdAt = new Date().toISOString();
    const originId = randomToken(16);
    const student = {
      currentName: name,
      currentSurname: surname,
      originalName: name,
      originalSurname: surname,
      createdAt,
      originId,
      signatureVersion: SIGNATURE_VERSION,
      signature: signatureFor(projectId, name, surname, createdAt, originId)
    };
    return verifyStudent(projectId, student);
  }

  function normalizeStudent(projectId, student = {}){
    const originalName = (student.originalName ?? student.name ?? student.currentName ?? '').trim();
    const originalSurname = (student.originalSurname ?? student.surname ?? student.currentSurname ?? '').trim();
    const currentName = (student.currentName ?? student.name ?? originalName ?? '').trim();
    const currentSurname = (student.currentSurname ?? student.surname ?? originalSurname ?? '').trim();
    const createdAt = student.createdAt || new Date().toISOString();
    const originId = student.originId || student.originToken || `LEGACY-${legacyHashText([projectId, originalName, originalSurname, createdAt, student.signature || ''].join('|')).slice(0,12)}`;
    const signature = student.signature || signatureFor(projectId, originalName, originalSurname, createdAt, originId);
    return verifyStudent(projectId, { currentName, currentSurname, originalName, originalSurname, createdAt, originId, signatureVersion: student.signatureVersion || 'legacy', signature });
  }

  function verifyStudent(projectId, student){
    const originId = student.originId || `LEGACY-${legacyHashText([projectId, student.originalName, student.originalSurname, student.createdAt, student.signature || ''].join('|')).slice(0,12)}`;
    const expected = signatureFor(projectId, student.originalName, student.originalSurname, student.createdAt, originId);
    const legacyExpected = legacySignatureFor(projectId, student.originalName, student.originalSurname, student.createdAt);
    const isV2 = student.signature === expected;
    const isLegacyValid = student.signature === legacyExpected;
    const signatureValid = isV2 || isLegacyValid;
    const sameAuthor = safe(student.currentName) === safe(student.originalName) && safe(student.currentSurname) === safe(student.originalSurname);
    const upgradedSignature = isLegacyValid ? expected : (student.signature || expected);
    return {
      ...student,
      originId,
      signatureVersion: isV2 ? SIGNATURE_VERSION : (isLegacyValid ? 'legacy-compatible' : (student.signatureVersion || SIGNATURE_VERSION)),
      signature: upgradedSignature,
      expectedSignature: expected,
      legacyExpectedSignature: legacyExpected,
      signatureValid,
      sameAuthor,
      verified: signatureValid && sameAuthor,
      integrityLabel: signatureValid && sameAuthor ? 'Dossier verificat' : '⚠️ Autoria no coincident amb l’original',
      fingerprint: upgradedSignature || expected
    };
  }

  function read(key){ try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } }
  function write(key, data){
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return { ok:true };
    } catch (err) {
      const quota = err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      return { ok:false, message: quota ? 'No queda prou espai al navegador per desar totes les imatges. Elimina alguna captura o exporta el progrés abans de continuar.' : 'No s’ha pogut desar el progrés al navegador.' };
    }
  }
  function download(filename, text){ const blob = new Blob([text], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
  return { keyFor, read, write, download, createStudent, normalizeStudent, verifyStudent, signatureFor, fullName, safe };
})();
