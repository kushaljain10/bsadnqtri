document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('inputText');
  const outputEl = document.getElementById('outputText');
  const translateBtn = document.getElementById('translateBtn');
  const copyOutputBtn = document.getElementById('copyOutputBtn');
  const copyContractBtn = document.getElementById('copyContractBtn');
  const toastEl = document.getElementById('toast');
  const contractText = '4wVtRm2CExz1CN3jp8ujNNhiCSKMVerdYPTXTby4pump';

  function randomLetter(upper) {
    const code = 97 + Math.floor(Math.random() * 26);
    return upper ? String.fromCharCode(code).toUpperCase() : String.fromCharCode(code);
  }

  // Generate gibberish: length is 2x original; include scrambled original letters
  function gibberish(text) {
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    return text.replace(/[A-Za-z]+/g, (word) => {
      const len = word.length;
      const targetLen = len * 2;

      // Base random letters
      const base = Array.from({ length: targetLen }, () => randomLetter(false));

      // Scrambled original letters (lowercase)
      const scrambled = shuffle(word.split('').map((c) => c.toLowerCase()));

      // Randomly choose positions to inject original letters
      const positions = shuffle(Array.from({ length: targetLen }, (_, i) => i));
      const injectPositions = positions.slice(0, len).sort((a, b) => a - b);
      injectPositions.forEach((pos, idx) => {
        base[pos] = scrambled[idx];
      });

      let raw = base.join('');

      // Preserve simple case patterns
      const allUpper = /^[A-Z]+$/.test(word);
      const capitalized = /^[A-Z][a-z]+$/.test(word);
      if (allUpper) return raw.toUpperCase();
      if (capitalized) return raw.charAt(0).toUpperCase() + raw.slice(1);
      return raw;
    });
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => { toastEl.classList.remove('show'); }, 1800);
  }

  translateBtn.addEventListener('click', () => {
    const input = inputEl.value || '';
    const out = gibberish(input);
    outputEl.value = out;
    copyOutputBtn.disabled = out.length === 0;
  });

  copyOutputBtn.addEventListener('click', async () => {
    const txt = outputEl.value;
    if (!txt) return;
    try { await navigator.clipboard.writeText(txt); } catch (e) {}
  });

  copyContractBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(contractText);
      showToast('Contract Address copied');
    } catch (e) {}
  });
});