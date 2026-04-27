window.ImagesLDAP = (() => {
  const MAX_W = 1400, QUALITY = 0.78, MAX_IMAGES_PER_STEP = 4;
  function fileToImageData(file){
    return new Promise((resolve,reject)=>{
      if(!file || !file.type.startsWith('image/')) return reject(new Error('El fitxer no és una imatge'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No s’ha pogut llegir la imatge'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Imatge no vàlida'));
        img.onload = () => {
          const scale = Math.min(1, MAX_W / img.width);
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h);
          resolve({ id: `${Date.now()}_${Math.random().toString(16).slice(2)}`, name: file.name || 'captura.png', data: c.toDataURL('image/jpeg', QUALITY) });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function filesFromPaste(e){ return Array.from(e.clipboardData?.items || []).filter(i=>i.type.startsWith('image/')).map(i=>i.getAsFile()).filter(Boolean); }
  return { fileToImageData, filesFromPaste, MAX_IMAGES_PER_STEP };
})();
