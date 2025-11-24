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

  // Generate gibberish with random word lengths
  function gibberish(text) {
    function randomLenFor(originalLen) {
      const max = Math.min(20, Math.max(3, Math.round(originalLen * 1.5)));
      return 1 + Math.floor(Math.random() * max);
    }

    return text.replace(/[A-Za-z]+/g, (word) => {
      const newLen = randomLenFor(word.length);
      let raw = '';
      for (let i = 0; i < newLen; i++) raw += randomLetter(false);

      const allUpper = /^[A-Z]+$/.test(word);
      const capitalized = /^[A-Z][a-z]+$/.test(word);
      if (allUpper) return raw.toUpperCase();
      if (capitalized) return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      return raw.toLowerCase();
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