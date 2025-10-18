/* Creamocrypt — script.js
   Modernized, cleaned, animations, unicode-safe Base64, better errors.
*/

const cipherInfo = {
    base64: "Base64: Encodes text into a 64-character alphabet. Not meant for secrecy — useful for transport and embeddings.",
    caesar: "Caesar: Shift letters by a number (1-25). Enter the numeric shift in the key field (e.g. 3).",
    base32: "Base32: Encodes binary to a 32-character alphabet (RFC 4648). Works well for text tokens.",
    morse: "Morse: Uses dots (.) and dashes (-). Spaces between letters and / between words.",
    aes256: "AES-256: Symmetric encryption. Uses a passphrase to derive a key (CryptoJS). Use a long passphrase.",
    vigenere: "Vigenère: Polyalphabetic substitution using keyword. Provide alphabetic keyword."
};

const cipherSelect = document.getElementById('cipherSelect');
const infoContent = document.getElementById('info-content');
const keyRow = document.getElementById('keyRow');
const keyInput = document.getElementById('keyInput');
const keyLabel = document.getElementById('keyLabel');
const inputText = document.getElementById('inputText');
const outputEl = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');

function updateUIForCipher() {
    const cipher = cipherSelect.value;
    infoContent.textContent = cipherInfo[cipher] || '';
    const needsKey = ['caesar', 'aes256', 'vigenere'].includes(cipher);
    keyRow.classList.toggle('hidden', !needsKey);
    // friendly placeholders
    if (cipher === 'caesar') {
        keyInput.placeholder = 'Shift (number 1-25). Default 3';
        keyLabel.textContent = 'Shift';
    } else if (cipher === 'aes256') {
        keyInput.placeholder = 'Passphrase (min 8 chars recommended)';
        keyLabel.textContent = 'Passphrase';
    } else if (cipher === 'vigenere') {
        keyInput.placeholder = 'Keyword (letters only)';
        keyLabel.textContent = 'Keyword';
    } else {
        keyInput.placeholder = 'Key (not used)';
        keyLabel.textContent = 'Key';
    }
}
cipherSelect.addEventListener('change', updateUIForCipher);
updateUIForCipher();

// buttons
document.getElementById('encryptBtn').addEventListener('click', encrypt);
document.getElementById('decryptBtn').addEventListener('click', decrypt);
document.getElementById('copyBtn').addEventListener('click', copyOutput);
document.getElementById('clearBtn').addEventListener('click', () => {
    inputText.value = '';
    keyInput.value = '';
    setOutput('No output yet.');
});

// Display output with small animation
function setOutput(text, isError = false) {
    outputEl.textContent = text || '';
    outputEl.classList.remove('fade');
    void outputEl.offsetWidth; // force reflow for animation
    outputEl.classList.add('fade');
    outputEl.classList.toggle('error', isError);
    copyBtn.style.display = text ? 'inline-block' : 'none';
}

// Unicode-safe Base64 via TextEncoder/TextDecoder
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

// Caesar cipher
function caesarCipher(str, shift) {
    if (!Number.isFinite(shift)) shift = 3;
    return str.replace(/[a-zA-Z]/g, c => {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
    });
}

// Base32 (RFC4648 basic implementation, limited to UTF-8 bytes)
const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(input) {
    // convert string to bytes
    const bytes = new TextEncoder().encode(input);
    let bits = '';
    for (let i = 0; i < bytes.length; i++) bits += bytes[i].toString(2).padStart(8, '0');
    while (bits.length % 5 !== 0) bits += '0';
    let output = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5);
        output += base32Alphabet[parseInt(chunk, 2)];
    }
    // Add padding
    while (output.length % 8 !== 0) output += '=';
    return output;
}
function base32Decode(input) {
    input = input.replace(/=+$/, '').toUpperCase();
    let bits = '';
    for (let i = 0; i < input.length; i++) {
        const idx = base32Alphabet.indexOf(input[i]);
        if (idx === -1) throw new Error('Invalid Base32 input');
        bits += idx.toString(2).padStart(5, '0');
    }
    // take bytes
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
}

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
const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([k, v]) => [v, k]));

function toMorse(str) {
    return str.toUpperCase().split('').map(c => morseCode[c] || c).join(' ');
}
function fromMorse(str) {
    return str.split(' ').map(code => reverseMorse[code] || code).join('');
}

// Vigenère
function vigenereCipher(str, key, encrypt = true) {
    if (!key) throw new Error('Missing keyword');
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) throw new Error('Keyword must contain letters A-Z');
    let output = '';
    for (let i = 0, j = 0; i < str.length; i++) {
        const c = str[i];
        if (/[a-zA-Z]/.test(c)) {
            const base = c < 'a' ? 65 : 97;
            const k = key[j % key.length].charCodeAt(0) - 65;
            const shift = encrypt ? k : -k;
            output += String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
            j++;
        } else {
            output += c;
        }
    }
    return output;
}

// Encrypt / Decrypt handlers
function encrypt() {
    const cipher = cipherSelect.value;
    const input = inputText.value || '';
    const key = keyInput.value || '';
    try {
        if (!input) throw new Error('Please provide input text.');

        let out = '';
        switch (cipher) {
            case 'base64':
                out = base64EncodeUnicode(input);
                break;
            case 'caesar':
                const shiftEnc = parseInt(key);
                out = caesarCipher(input, Number.isFinite(shiftEnc) ? shiftEnc : 3);
                break;
            case 'base32':
                out = base32Encode(input);
                break;
            case 'morse':
                out = toMorse(input);
                break;
            case 'aes256':
                if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                out = CryptoJS.AES.encrypt(input, key).toString();
                break;
            case 'vigenere':
                out = vigenereCipher(input, key, true);
                break;
            default:
                throw new Error('Unknown cipher');
        }
        setOutput(out, false);
    } catch (e) {
        setOutput('Error: ' + e.message, true);
    }
}

function decrypt() {
    const cipher = cipherSelect.value;
    const input = inputText.value || '';
    const key = keyInput.value || '';
    try {
        if (!input) throw new Error('Please provide input text.');

        let out = '';
        switch (cipher) {
            case 'base64':
                out = base64DecodeUnicode(input);
                break;
            case 'caesar':
                const shiftDec = parseInt(key);
                out = caesarCipher(input, Number.isFinite(shiftDec) ? -shiftDec : -3);
                break;
            case 'base32':
                out = base32Decode(input);
                break;
            case 'morse':
                out = fromMorse(input);
                break;
            case 'aes256':
                if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                out = CryptoJS.AES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
                if (!out) throw new Error('Bad key or input for AES decryption.');
                break;
            case 'vigenere':
                out = vigenereCipher(input, key, false);
                break;
            default:
                throw new Error('Unknown cipher');
        }
        setOutput(out, false);
    } catch (e) {
        setOutput('Error: ' + e.message, true);
    }
}

function copyOutput() {
    const text = outputEl.textContent || '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied';
        setTimeout(() => copyBtn.textContent = 'Copy', 1200);
    }).catch(() => {
        alert('Copy failed — select & copy manually.');
    });
}

// Small theme toggle for fun
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const pressed = document.documentElement.classList.contains('light');
    themeToggle.setAttribute('aria-pressed', pressed.toString());
    themeToggle.textContent = pressed ? 'Dark Theme' : 'Light Theme';
});
