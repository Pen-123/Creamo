/* script.js — Advanced UI: searchable custom dropdown, typewriter effect, PBKDF2 AES option, more ciphers.
   Fixed typing glitch: Force textarea focus on load, click, and dropdown blur to prevent input lockout.
   Polished and robust: PBKDF2/AES blob format (salt:iv:cipher), safer defaults, error handling,
   keyboard navigation, no assumptions about developer environment.
*/

const PBKDF2_ITERATIONS = 10000; // reasonable default

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
const optionsList = document.getElementById('optionsList');
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
const themeToggle = document.getElementById('themeToggle');

// Force textarea focus on load and click to fix typing glitch
document.addEventListener('DOMContentLoaded', () => {
    inputText.focus();
});
inputText.addEventListener('click', () => {
    inputText.focus();
});

// Prevent dropdown from stealing focus
cipherFilter.addEventListener('blur', () => {
    inputText.focus();
});
document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
        closeDropdown();
        inputText.focus();
    }
});

// Build options list from native select
function buildOptions() {
    optionsList.innerHTML = '';
    for (let i = 0; i < nativeSelect.options.length; i++) {
        const opt = nativeSelect.options[i];
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.className = 'option';
        li.dataset.value = opt.value;
        li.tabIndex = 0;
        li.innerHTML = `<strong>${opt.textContent}</strong><small>${cipherInfo[opt.value] || ''}</small>`;
        optionsList.appendChild(li);
    }
}
buildOptions();

// Custom dropdown behaviors (searchable + keyboard)
function openDropdown() {
    cipherList.classList.remove('hidden');
    customSelect.setAttribute('aria-expanded', 'true');
    cipherFilter.value = '';
    filterOptions();
    cipherFilter.focus();
}
function closeDropdown() {
    cipherList.classList.add('hidden');
    customSelect.setAttribute('aria-expanded', 'false');
    selectControl.focus();
    inputText.focus(); // Ensure textarea regains focus after dropdown closes
}
selectControl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (cipherList.classList.contains('hidden')) openDropdown(); else closeDropdown();
});
selectControl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); openDropdown();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault(); openDropdown();
    }
});
cipherFilter.addEventListener('input', filterOptions);

optionsList.addEventListener('click', (e) => {
    const li = e.target.closest('.option');
    if (!li) return;
    chooseOption(li.dataset.value);
    closeDropdown();
});

optionsList.addEventListener('keydown', (e) => {
    const focused = document.activeElement;
    if (!focused || !focused.classList.contains('option')) return;
    if (e.key === 'ArrowDown') {
        e.preventDefault(); (focused.nextElementSibling || optionsList.firstElementChild).focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault(); (focused.previousElementSibling || optionsList.lastElementChild).focus();
    } else if (e.key === 'Enter') {
        e.preventDefault(); chooseOption(focused.dataset.value); closeDropdown();
    }
});

// Filter options by input
function filterOptions() {
    const q = (cipherFilter.value || '').trim().toLowerCase();
    Array.from(optionsList.children).forEach(li => {
        const txt = li.textContent.toLowerCase();
        li.style.display = txt.includes(q) ? '' : 'none';
    });
    // focus first visible
    const firstVisible = Array.from(optionsList.children).find(li => li.style.display !== 'none');
    if (firstVisible) firstVisible.focus();
}

// Synchronize selection with native select
function chooseOption(value) {
    nativeSelect.value = value;
    selectedLabel.textContent = nativeSelect.options[nativeSelect.selectedIndex].textContent;
    updateUIForCipher();
    inputText.focus(); // Return focus to textarea after selection
}
function initSelection() {
    selectedLabel.textContent = nativeSelect.options[nativeSelect.selectedIndex].textContent;
    updateUIForCipher();
}
initSelection();

// Close dropdown on outside click or escape
document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
        closeDropdown();
    }
});
document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape') {
        closeDropdown();
        inputText.focus();
    }
});

// Update UI when cipher changes
function updateUIForCipher() {
    const cipher = nativeSelect.value;
    infoContent.textContent = cipherInfo[cipher] || '';
    // Which ciphers need a key input?
    const needsKey = ['caesar', 'xor', 'aes256', 'aes256-pbkdf2', 'vigenere'].includes(cipher);
    keyRow.classList.toggle('hidden', !needsKey);
    saltRow.classList.toggle('hidden', cipher !== 'aes256-pbkdf2');

    if (cipher === 'caesar') {
        keyInput.type = 'number';
        keyInput.placeholder = 'Shift (numeric, default 3)';
        keyLabel.textContent = 'Shift';
    } else if (cipher === 'aes256' || cipher === 'aes256-pbkdf2') {
        keyInput.type = 'password';
        keyInput.placeholder = 'Passphrase (min 8 chars recommended)';
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
        keyInput.placeholder = 'Key / Not used';
        keyLabel.textContent = 'Key';
    }
    inputText.focus(); // Ensure textarea focus after UI update
}
nativeSelect.addEventListener('change', () => {
    selectedLabel.textContent = nativeSelect.options[nativeSelect.selectedIndex].textContent;
    updateUIForCipher();
});

// -- Utilities: encoding and cipher implementations --

// Unicode-safe Base64
function base64EncodeUnicode(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}
function base64DecodeUnicode(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

// Hex
function hexEncode(str) {
    const bytes = new TextEncoder().encode(str);
    return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
function hexDecode(hex) {
    hex = hex.replace(/\s+/g,'');
    if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
    const bytes = new Uint8Array(hex.length/2);
    for (let i=0;i<bytes.length;i++) bytes[i] = parseInt(hex.substr(i*2,2),16);
    return new TextDecoder().decode(bytes);
}

// Base32 (simple, padded)
const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(input) {
    const bytes = new TextEncoder().encode(input);
    let bits = '';
    for (let i = 0; i < bytes.length; i++) bits += bytes[i].toString(2).padStart(8,'0');
    while (bits.length % 5 !== 0) bits += '0';
    let output = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i+5);
        output += base32Alphabet[parseInt(chunk,2)];
    }
    while (output.length % 8 !== 0) output += '=';
    return output;
}
function base32Decode(input) {
    input = input.replace(/=+$/,'').toUpperCase();
    let bits = '';
    for (let i = 0; i < input.length; i++) {
        const idx = base32Alphabet.indexOf(input[i]);
        if (idx === -1) throw new Error('Invalid Base32 input');
        bits += idx.toString(2).padStart(5,'0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i+8),2));
    return new TextDecoder().decode(new Uint8Array(bytes));
}

// Caesar / ROT13
function caesarCipher(str, shift) {
    if (!Number.isFinite(shift)) shift = 3;
    return str.replace(/[a-zA-Z]/g, c => {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
    });
}
function rot13(str) { return caesarCipher(str, 13); }

// Morse
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
const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([k,v])=>[v,k]));
function toMorse(str) {
    return str.toUpperCase().split('').map(c => morseCode[c] || c).join(' ');
}
function fromMorse(str) {
    return str.split(' ').map(code => reverseMorse[code] || code).join('');
}

// URL encode
function urlEncode(str) { return encodeURIComponent(str); }
function urlDecode(str) { return decodeURIComponent(str.replace(/\+/g,' ')); }

// XOR (repeating key) -> base64 output for binary-safety
function xorEncrypt(str, key) {
    if (!key) throw new Error('XOR requires a key');
    const data = new TextEncoder().encode(str);
    const kbytes = new TextEncoder().encode(key);
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) out[i] = data[i] ^ kbytes[i % kbytes.length];
    let bin = '';
    for (let i = 0; i < out.length; i++) bin += String.fromCharCode(out[i]);
    return btoa(bin);
}
function xorDecrypt(b64, key) {
    if (!key) throw new Error('XOR requires a key');
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    const kbytes = new TextEncoder().encode(key);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i) ^ kbytes[i % kbytes.length];
    return new TextDecoder().decode(out);
}

// Vigenere
function vigenereCipher(str, key, encrypt=true) {
    if (!key) throw new Error('Missing keyword');
    key = key.toUpperCase().replace(/[^A-Z]/g,'');
    if (!key) throw new Error('Keyword must contain letters A-Z');
    let out = '';
    for (let i=0,j=0;i<str.length;i++) {
        const c = str[i];
        if (/[a-zA-Z]/.test(c)) {
            const base = c < 'a' ? 65 : 97;
            const k = key[j % key.length].charCodeAt(0) - 65;
            const shift = encrypt ? k : -k;
            out += String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
            j++;
        } else out += c;
    }
    return out;
}

// Hash helpers (CryptoJS)
function sha256Hash(str) { return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex); }
function md5Hash(str) { return CryptoJS.MD5(str).toString(CryptoJS.enc.Hex); }

// AES helpers
function aesEncryptPassphrase(plain, pass) {
    return CryptoJS.AES.encrypt(plain, pass).toString();
}
function aesDecryptPassphrase(cipherText, pass) {
    const decrypted = CryptoJS.AES.decrypt(cipherText, pass).toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error('Bad key or input for AES decryption.');
    return decrypted;
}

// AES-PBKDF2: produce a blob "saltHex:ivHex:cipherBase64"
function aesEncryptPBKDF2(plain, pass, iterations = PBKDF2_ITERATIONS) {
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const key = CryptoJS.PBKDF2(pass, salt, { keySize: 256/32, iterations: iterations });
    const iv = CryptoJS.lib.WordArray.random(128/8);
    const encrypted = CryptoJS.AES.encrypt(plain, key, { iv: iv });
    const saltHex = salt.toString(CryptoJS.enc.Hex);
    const ivHex = iv.toString(CryptoJS.enc.Hex);
    return `${saltHex}:${ivHex}:${encrypted.toString()}`;
}

function aesDecryptPBKDF2(blob, pass, iterations = PBKDF2_ITERATIONS) {
    const parts = (blob || '').split(':');
    if (parts.length < 3) throw new Error('Invalid AES-PBKDF2 blob (expected salt:iv:cipher).');
    const saltHex = parts[0];
    const ivHex = parts[1];
    const ct = parts.slice(2).join(':'); // support colons in cipher
    const salt = CryptoJS.enc.Hex.parse(saltHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const key = CryptoJS.PBKDF2(pass, salt, { keySize: 256/32, iterations: iterations });
    const decrypted = CryptoJS.AES.decrypt(ct, key, { iv: iv }).toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error('Bad key/salt or input for AES-PBKDF2 decryption.');
    return decrypted;
}

// Typewriter effect
let typingTimer = null;
let caretInterval = null;
function showWithTypewriter(text) {
    const speed = Math.max(5, Number(typeSpeed.value) || 40); // characters per second
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
        caretEl.style.visibility = (caretEl.style.visibility === 'visible') ? 'hidden' : 'visible';
    }, 500);
}
function showInstant(text) {
    clearInterval(typingTimer);
    clearInterval(caretInterval);
    typedContent.textContent = text;
    caretEl.style.visibility = 'hidden';
    copyBtn.style.display = text ? 'inline-block' : 'none';
}
function setOutput(text, isError=false) {
    try {
        text = String(text || '');
        if (typewriterToggle.checked) showWithTypewriter(text);
        else showInstant(text);
        outputEl.classList.toggle('error', !!isError);
    } catch (err) {
        // fallback to instant display
        showInstant(String(text));
        outputEl.classList.toggle('error', true);
    }
}

// Copy
copyBtn.addEventListener('click', () => {
    const text = typedContent.textContent || '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied';
        setTimeout(() => copyBtn.textContent = 'Copy', 1200);
    }).catch(() => {
        alert('Copy failed — select & copy manually.');
    });
});

// Clear
clearBtn.addEventListener('click', () => {
    inputText.value = '';
    keyInput.value = '';
    saltInput.value = '';
    setOutput('No output yet.');
    inputText.focus(); // Focus textarea after clear
});

// Encrypt / Decrypt
encryptBtn.addEventListener('click', encrypt);
decryptBtn.addEventListener('click', decrypt);

function encrypt() {
    const cipher = nativeSelect.value;
    const input = inputText.value || '';
    const key = keyInput.value || '';
    const salt = saltInput.value || '';
    try {
        if (!input) throw new Error('Please provide input text.');
        let out = '';
        switch (cipher) {
            case 'base64': out = base64EncodeUnicode(input); break;
            case 'base32': out = base32Encode(input); break;
            case 'hex': out = hexEncode(input); break;
            case 'caesar': {
                const s = Number(key);
                out = caesarCipher(input, Number.isFinite(s) ? s : 3); break;
            }
            case 'rot13': out = rot13(input); break;
            case 'morse': out = toMorse(input); break;
            case 'url': out = urlEncode(input); break;
            case 'xor': out = xorEncrypt(input, key); break;
            case 'aes256': {
                if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                out = aesEncryptPassphrase(input, key); break;
            }
            case 'aes256-pbkdf2': {
                if (!key || key.length < 8) throw new Error('AES-PBKDF2 requires a passphrase (min 8 chars).');
                out = aesEncryptPBKDF2(input, key, PBKDF2_ITERATIONS); break;
            }
            case 'vigenere': out = vigenereCipher(input, key, true); break;
            case 'sha256': out = sha256Hash(input); break;
            case 'md5': out = md5Hash(input); break;
            default: throw new Error('Unknown cipher');
        }
        setOutput(out, false);
        inputText.focus(); // Return focus to textarea after encrypt
    } catch (e) {
        setOutput('Error: ' + (e && e.message ? e.message : String(e)), true);
        inputText.focus();
    }
}

function decrypt() {
    const cipher = nativeSelect.value;
    const input = inputText.value || '';
    const key = keyInput.value || '';
    const salt = saltInput.value || '';
    try {
        if (!input) throw new Error('Please provide input text.');
        let out = '';
        switch (cipher) {
            case 'base64': out = base64DecodeUnicode(input); break;
            case 'base32': out = base32Decode(input); break;
            case 'hex': out = hexDecode(input); break;
            case 'caesar': {
                const s = Number(key);
                out = caesarCipher(input, Number.isFinite(s) ? -s : -3); break;
            }
            case 'rot13': out = rot13(input); break;
            case 'morse': out = fromMorse(input); break;
            case 'url': out = urlDecode(input); break;
            case 'xor': out = xorDecrypt(input, key); break;
            case 'aes256': {
                if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                out = aesDecryptPassphrase(input, key); break;
            }
            case 'aes256-pbkdf2': {
                if (!key || key.length < 8) throw new Error('AES-PBKDF2 requires a passphrase (min 8 chars).');
                out = aesDecryptPBKDF2(input, key, PBKDF2_ITERATIONS); break;
            }
            case 'vigenere': out = vigenereCipher(input, key, false); break;
            case 'sha256':
            case 'md5':
                throw new Error('Hashes are one-way and cannot be decrypted.');
            default: throw new Error('Unknown cipher');
        }
        setOutput(out, false);
        inputText.focus(); // Return focus to textarea after decrypt
    } catch (e) {
        setOutput('Error: ' + (e && e.message ? e.message : String(e)), true);
        inputText.focus();
    }
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const pressed = document.documentElement.classList.contains('light');
    themeToggle.setAttribute('aria-pressed', pressed.toString());
    themeToggle.textContent = pressed ? 'Dark Theme' : 'Light Theme';
    inputText.focus(); // Keep textarea focused after theme toggle
});

// Initial state
setOutput('No output yet.');
updateUIForCipher();
