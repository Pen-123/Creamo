/* script.js — Creamocrypt Encoder: Searchable dropdown, typewriter effect, all ciphers.
   Built for Pen Renewed (2025-2026). Robust, accessible, and error-handled. © 2025 Yappinghood, AGPL-3.0 or proprietary.
*/

const PBKDF2_ITERATIONS = 10000;

const cipherInfo = {
    base64: "Base64: Encodes text into a 64-character alphabet. Not for secrecy — transport-friendly.",
    base32: "Base32: Encodes bytes into a 32-character alphabet (RFC4648). Useful for case-insensitive tokens.",
    hex: "Hex: Encodes bytes to hexadecimal pairs. Common for binary/text interchange.",
    caesar: "Caesar: Shift letters by a numeric shift (1-25). Enter number in the key input.",
    rot13: "ROT13: Simple letter rotation (13). Symmetric and used for simple obfuscation.",
    morse: "Morse: Dots (.) and dashes (-). Use space between letters and / for word separators.",
    url: "URL Encode/Decode: Percent-encoding for transport in URLs.",
    xor: "XOR: Symmetric XOR with a repeating key. Binary-safe; output is Base64.",
    aes256: "AES-256: Encrypt/Decrypt using passphrase (CryptoJS). For PBKDF2-derived keys use AES-256 (PBKDF2).",
    "aes256-pbkdf2": "AES-256 (PBKDF2): Derive encryption key using PBKDF2 with embedded salt for stronger keying.",
    vigenere: "Vigenère: Polyalphabetic substitution using an alphabetic keyword.",
    sha256: "SHA-256: Cryptographic hash (one-way). Use under Encrypt to compute the digest.",
    md5: "MD5: Legacy hash function (one-way). Not recommended for security use-cases."
};

// DOM elements
const nativeSelect = document.getElementById('cipherSelect');
const customSelect = document.getElementById('customSelect');
const selectControl = document.getElementById('selectControl');
const cipherList = document.getElementById('cipherList');
const cipherFilter = document.getElementById('cipherFilter');
const selectedLabel = document.getElementById('selectedLabel');
const infoContent = document.getElementById('info-content');
const keyRow = document.getElementById('keyRow');
const keyInput = document.getElementById('keyInput');
const keyLabel = document.getElementById('keyLabel');
const saltRow = document.getElementById('saltRow');
const saltInput = document.getElementById('saltInput');
const inputText = document.getElementById('inputText');
const outputEl = document.getElementById('output');
const typedContent = document.getElementById('typedContent');
const caretEl = document.getElementById('caret');
const copyBtn = document.getElementById('copyBtn');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const clearBtn = document.getElementById('clearBtn');
const typewriterToggle = document.getElementById('typewriterToggle');
const typeSpeed = document.getElementById('typeSpeed');

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing encoder...');
    inputText.focus();
    inputText.select();
    buildOptions();
    initSelection();
    setOutput('No output yet.');
});

// Focus handlers
inputText.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    inputText.focus();
    inputText.select();
});
keyInput.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    keyInput.focus();
});
saltInput.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    saltInput.focus();
});
encryptBtn.addEventListener('click', e => {
    e.stopPropagation();
    encrypt();
});
decryptBtn.addEventListener('click', e => {
    e.stopPropagation();
    decrypt();
});
clearBtn.addEventListener('click', e => {
    e.stopPropagation();
    inputText.value = '';
    keyInput.value = '';
    saltInput.value = '';
    setOutput('No output yet.');
    inputText.focus();
});

// Smart global click
document.addEventListener('click', e => {
    if (!customSelect.contains(e.target) && 
        e.target !== inputText && 
        e.target !== keyInput && 
        e.target !== saltInput && 
        e.target !== encryptBtn && 
        e.target !== decryptBtn && 
        e.target !== clearBtn && 
        e.target !== copyBtn && 
        e.target !== typeSpeed && 
        e.target !== typewriterToggle) {
        closeDropdown();
        inputText.focus();
    }
});

// Custom dropdown
function buildOptions() {
    console.log('Building cipher options...');
    cipherList.innerHTML = '';
    for (let i = 0; i < nativeSelect.options.length; i++) {
        const opt = nativeSelect.options[i];
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.className = 'option';
        li.dataset.value = opt.value;
        li.tabIndex = 0;
        li.innerHTML = `<strong>${opt.textContent}</strong><small>${cipherInfo[opt.value] || ''}</small>`;
        cipherList.appendChild(li);
    }
}

function openDropdown() {
    console.log('Opening dropdown...');
    cipherList.classList.remove('hidden');
    customSelect.setAttribute('aria-expanded', 'true');
    cipherFilter.value = '';
    filterOptions();
    cipherFilter.focus();
}

function closeDropdown() {
    console.log('Closing dropdown...');
    cipherList.classList.add('hidden');
    customSelect.setAttribute('aria-expanded', 'false');
    inputText.focus();
}

selectControl.addEventListener('click', e => {
    e.stopPropagation();
    cipherList.classList.contains('hidden') ? openDropdown() : closeDropdown();
});

selectControl.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDropdown();
    }
});

cipherFilter.addEventListener('input', filterOptions);

optionsList.addEventListener('click', e => {
    const li = e.target.closest('.option');
    if (!li) return;
    chooseOption(li.dataset.value);
    closeDropdown();
});

optionsList.addEventListener('keydown', e => {
    const focused = document.activeElement;
    if (!focused || !focused.classList.contains('option')) return;
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        (focused.nextElementSibling || optionsList.firstElementChild).focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        (focused.previousElementSibling || optionsList.lastElementChild).focus();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        chooseOption(focused.dataset.value);
        closeDropdown();
    }
});

function filterOptions() {
    console.log('Filtering cipher options...');
    const q = (cipherFilter.value || '').trim().toLowerCase();
    Array.from(cipherList.children).forEach(li => {
        const txt = li.textContent.toLowerCase();
        li.style.display = txt.includes(q) ? '' : 'none';
    });
    const firstVisible = Array.from(cipherList.children).find(li => li.style.display !== 'none');
    if (firstVisible) firstVisible.focus();
}

function chooseOption(value) {
    console.log(`Selecting cipher: ${value}`);
    nativeSelect.value = value;
    selectedLabel.textContent = nativeSelect.options[nativeSelect.selectedIndex].textContent;
    updateUIForCipher();
}

function initSelection() {
    console.log('Initializing cipher selection...');
    selectedLabel.textContent = nativeSelect.options[nativeSelect.selectedIndex].textContent;
    updateUIForCipher();
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeDropdown();
    }
});

// UI updates
function updateUIForCipher() {
    const cipher = nativeSelect.value;
    console.log(`Updating UI for cipher: ${cipher}`);
    infoContent.textContent = cipherInfo[cipher] || 'Select a cipher, rizzler! 😜';
    const needsKey = ['caesar', 'xor', 'aes256', 'aes256-pbkdf2', 'vigenere'].includes(cipher);
    keyRow.classList.toggle('hidden', !needsKey);
    saltRow.classList.toggle('hidden', cipher !== 'aes256-pbkdf2');
    if (cipher === 'caesar') {
        keyInput.type = 'number';
        keyInput.placeholder = 'Shift (numeric, default 3)';
        keyLabel.textContent = 'Shift';
    } else if (cipher === 'aes256' || cipher === 'aes256-pbkdf2') {
        keyInput.type = 'password';
        keyInput.placeholder = 'Passphrase (min 8 chars)';
        keyLabel.textContent = 'Passphrase';
    } else if (cipher === 'xor') {
        keyInput.type = 'text';
        keyInput.placeholder = 'Key (text, repeated)';
        keyLabel.textContent = 'XOR Key';
    } else if (cipher === 'vigenere') {
        keyInput.type = 'text';
        keyInput.placeholder = 'Keyword (letters only)';
        keyLabel.textContent = 'Keyword';
    } else {
        keyInput.type = 'text';
        keyInput.placeholder = 'Key (not used)';
        keyLabel.textContent = 'Key';
    }
}
nativeSelect.addEventListener('change', chooseOption);

// Cipher implementations
function base64EncodeUnicode(str) {
    try {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    } catch (e) {
        throw new Error('Base64 encode failed, bro! 😭');
    }
}

function base64DecodeUnicode(b64) {
    try {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    } catch (e) {
        throw new Error('Base64 decode failed, check your input! 😡');
    }
}

function hexEncode(str) {
    try {
        return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(str));
    } catch (e) {
        throw new Error('Hex encode failed, bro! 😭');
    }
}

function hexDecode(hex) {
    try {
        return CryptoJS.enc.Hex.parse(hex).toString(CryptoJS.enc.Utf8);
    } catch (e) {
        throw new Error('Invalid hex string, Agent Pen would rage! 😡');
    }
}

function base32Encode(str) {
    try {
        return CryptoJS.enc.Base32.stringify(CryptoJS.enc.Utf8.parse(str));
    } catch (e) {
        throw new Error('Base32 encode failed, check your input! 😭');
    }
}

function base32Decode(str) {
    try {
        return CryptoJS.enc.Base32.parse(str).toString(CryptoJS.enc.Utf8);
    } catch (e) {
        throw new Error('Invalid Base32 input, rizzler! 😡');
    }
}

function caesarCipher(str, shift) {
    if (!Number.isFinite(shift)) shift = 3;
    return str.replace(/[a-zA-Z]/g, c => {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
    });
}

function rot13(str) {
    return caesarCipher(str, 13);
}

const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', '!': '-.-.--', ':': '---...', "'": '.----.', '"': '.-..-.', '/': '-..-.', '(': '-.--.',
    ')': '-.--.-', '&': '.-...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '@': '.--.-.', ' ': '/'
};
const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([k, v]) => [v, k]));
function toMorse(str) {
    return str.toUpperCase().split('').map(c => morseCode[c] || c).join(' ');
}
function fromMorse(str) {
    return str.split(' ').map(code => reverseMorse[code] || code).join('');
}

function urlEncode(str) {
    try {
        return encodeURIComponent(str);
    } catch (e) {
        throw new Error('URL encode failed, bro! 😭');
    }
}

function urlDecode(str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        throw new Error('Invalid URL-encoded input, rizzler! 😡');
    }
}

function xorEncrypt(str, key) {
    if (!key) throw new Error('XOR needs a key, bro! 😜');
    try {
        const data = new TextEncoder().encode(str);
        const kbytes = new TextEncoder().encode(key);
        const out = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) out[i] = data[i] ^ kbytes[i % kbytes.length];
        let bin = '';
        for (let i = 0; i < out.length; i++) bin += String.fromCharCode(out[i]);
        return btoa(bin);
    } catch (e) {
        throw new Error('XOR encrypt failed, check your input! 😭');
    }
}

function xorDecrypt(b64, key) {
    if (!key) throw new Error('XOR needs a key, bro! 😜');
    try {
        const binary = atob(b64);
        const out = new Uint8Array(binary.length);
        const kbytes = new TextEncoder().encode(key);
        for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i) ^ kbytes[i % kbytes.length];
        return new TextDecoder().decode(out);
    } catch (e) {
        throw new Error('XOR decrypt failed, bad key or input! 😡');
    }
}

function aesEncryptPassphrase(plain, pass) {
    try {
        return CryptoJS.AES.encrypt(plain, pass).toString();
    } catch (e) {
        throw new Error('AES encrypt failed, check your key! 😭');
    }
}

function aesDecryptPassphrase(cipherText, pass) {
    try {
        const decrypted = CryptoJS.AES.decrypt(cipherText, pass).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error('Bad key or input for AES decryption! 😡');
        return decrypted;
    } catch (e) {
        throw new Error('AES decrypt failed, bad key or input! 😡');
    }
}

function aesEncryptPBKDF2(plain, pass, iterations = PBKDF2_ITERATIONS) {
    try {
        const salt = CryptoJS.lib.WordArray.random(128/8);
        const key = CryptoJS.PBKDF2(pass, salt, { keySize: 256/32, iterations });
        const iv = CryptoJS.lib.WordArray.random(128/8);
        const encrypted = CryptoJS.AES.encrypt(plain, key, { iv });
        const saltHex = salt.toString(CryptoJS.enc.Hex);
        const ivHex = iv.toString(CryptoJS.enc.Hex);
        return `${saltHex}:${ivHex}:${encrypted.toString()}`;
    } catch (e) {
        throw new Error('AES-PBKDF2 encrypt failed, check your key! 😭');
    }
}

function aesDecryptPBKDF2(blob, pass, iterations = PBKDF2_ITERATIONS) {
    try {
        const parts = (blob || '').split(':');
        if (parts.length < 3) throw new Error('Invalid AES-PBKDF2 blob (expected salt:iv:cipher)! 😡');
        const saltHex = parts[0];
        const ivHex = parts[1];
        const ct = parts.slice(2).join(':');
        const salt = CryptoJS.enc.Hex.parse(saltHex);
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const key = CryptoJS.PBKDF2(pass, salt, { keySize: 256/32, iterations });
        const decrypted = CryptoJS.AES.decrypt(ct, key, { iv }).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error('Bad key/salt or input for AES-PBKDF2 decryption! 😡');
        return decrypted;
    } catch (e) {
        throw new Error('AES-PBKDF2 decrypt failed, bad key or input! 😡');
    }
}

function vigenereCipher(str, key, encrypt = true) {
    if (!key) throw new Error('Vigenère needs a keyword, rizzler! 😜');
    try {
        key = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!key) throw new Error('Keyword must contain letters A-Z! 😡');
        let out = '';
        for (let i = 0, j = 0; i < str.length; i++) {
            const c = str[i];
            if (/[a-zA-Z]/.test(c)) {
                const base = c < 'a' ? 65 : 97;
                const k = key[j % key.length].charCodeAt(0) - 65;
                const shift = encrypt ? k : -k;
                out += String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
                j++;
            } else {
                out += c;
            }
        }
        return out;
    } catch (e) {
        throw new Error('Vigenère cipher failed, check your input! 😭');
    }
}

function sha256Hash(str) {
    try {
        return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
    } catch (e) {
        throw new Error('SHA-256 hash failed, bro! 😭');
    }
}

function md5Hash(str) {
    try {
        return CryptoJS.MD5(str).toString(CryptoJS.enc.Hex);
    } catch (e) {
        throw new Error('MD5 hash failed, bro! 😭');
    }
}

// Typewriter effect
let typingTimer = null;
let caretInterval = null;
function showWithTypewriter(text) {
    console.log('Starting typewriter effect...');
    const speed = Math.max(5, Number(typeSpeed.value) || 40);
    const msPerChar = Math.max(6, Math.round(1000 / speed));
    clearInterval(typingTimer);
    clearInterval(caretInterval);
    caretEl.style.visibility = 'visible';
    let i = 0;
    typedContent.textContent = '';
    copyBtn.style.display = text ? 'inline-block' : 'none';
    typingTimer = setInterval(() => {
        typedContent.textContent += text.charAt(i) || '';
        i++;
        if (i > text.length) {
            clearInterval(typingTimer);
            setTimeout(() => { caretEl.style.visibility = 'hidden'; }, 800);
        }
    }, msPerChar);
    caretInterval = setInterval(() => {
        caretEl.style.visibility = caretEl.style.visibility === 'visible' ? 'hidden' : 'visible';
    }, 500);
}

function showInstant(text) {
    console.log('Showing output instantly...');
    clearInterval(typingTimer);
    clearInterval(caretInterval);
    typedContent.textContent = text;
    caretEl.style.visibility = 'hidden';
    copyBtn.style.display = text ? 'inline-block' : 'none';
}

function setOutput(text, isError = false) {
    try {
        text = String(text || '');
        if (typewriterToggle.checked) showWithTypewriter(text);
        else showInstant(text);
        outputEl.classList.toggle('error', isError);
    } catch (e) {
        showInstant('Error: Output failed, skibidi toilet vibes! 💀');
        outputEl.classList.add('error');
    }
}

// Copy output
copyBtn.addEventListener('click', () => {
    console.log('Copying output...');
    const text = typedContent.textContent || '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
    }).catch(() => {
        console.error('Copy failed, manual vibes only!');
        alert('Copy failed — select & copy manually, rizzler! 😭');
    });
});

// Encrypt/Decrypt
function encrypt() {
    console.log('Encrypting...');
    const cipher = nativeSelect.value;
    const input = inputText.value || '';
    const key = keyInput.value || '';
    const salt = saltInput.value || '';
    try {
        if (!input) throw new Error('No input text, bro! 😜');
        let out = '';
        switch (cipher) {
            case 'base64': out = base64EncodeUnicode(input); break;
            case 'base32': out = base32Encode(input); break;
            case 'hex': out = hexEncode(input); break;
            case 'caesar':
                const shift = Number(key);
                if (!Number.isFinite(shift) || shift < 1 || shift > 25) throw new Error('Caesar needs a shift (1-25), rizzler! 😡');
                out = caesarCipher(input, shift); break;
            case 'rot13': out = rot13(input); break;
            case 'morse': out = toMorse(input); break;
            case 'url': out = urlEncode(input); break;
            case 'xor': out = xorEncrypt(input, key); break;
            case 'aes256':
                if (!key || key.length < 8) throw new Error('AES-256 needs a passphrase (8+ chars)! 😭');
                out = aesEncryptPassphrase(input, key); break;
            case 'aes256-pbkdf2':
                if (!key || key.length < 8) throw new Error('AES-256 PBKDF2 needs a passphrase (8+ chars)! 😭');
                if (!salt) throw new Error('AES-256 PBKDF2 needs a salt, bro! 😡');
                out = aesEncryptPBKDF2(input, key); break;
            case 'vigenere': out = vigenereCipher(input, key, true); break;
            case 'sha256': out = sha256Hash(input); break;
            case 'md5': out = md5Hash(input); break;
            default: throw new Error('Unknown cipher, skibidi vibes! 💀');
        }
        setOutput(out, false);
    } catch (e) {
        setOutput(`Error: ${e.message}`, true);
    }
}

function decrypt() {
    console.log('Decrypting...');
    const cipher = nativeSelect.value;
    const input = inputText.value || '';
    const key = keyInput.value || '';
    const salt = saltInput.value || '';
    try {
        if (!input) throw new Error('No input text, bro! 😜');
        let out = '';
        switch (cipher) {
            case 'base64': out = base64DecodeUnicode(input); break;
            case 'base32': out = base32Decode(input); break;
            case 'hex': out = hexDecode(input); break;
            case 'caesar':
                const shift = Number(key);
                if (!Number.isFinite(shift) || shift < 1 || shift > 25) throw new Error('Caesar needs a shift (1-25), rizzler! 😡');
                out = caesarCipher(input, -shift); break;
            case 'rot13': out = rot13(input); break;
            case 'morse': out = fromMorse(input); break;
            case 'url': out = urlDecode(input); break;
            case 'xor': out = xorDecrypt(input, key); break;
            case 'aes256':
                if (!key || key.length < 8) throw new Error('AES-256 needs a passphrase (8+ chars)! 😭');
                out = aesDecryptPassphrase(input, key); break;
            case 'aes256-pbkdf2':
                if (!key || key.length < 8) throw new Error('AES-256 PBKDF2 needs a passphrase (8+ chars)! 😭');
                if (!salt) throw new Error('AES-256 PBKDF2 needs a salt, bro! 😡');
                out = aesDecryptPBKDF2(input, key); break;
            case 'vigenere': out = vigenereCipher(input, key, false); break;
            case 'sha256':
            case 'md5':
                throw new Error('SHA-256 and MD5 are one-way hashes, can’t decrypt, rizzler! 😡');
            default: throw new Error('Unknown cipher, skibidi vibes! 💀');
        }
        setOutput(out, false);
    } catch (e) {
        setOutput(`Error: ${e.message}`, true);
    }
}
