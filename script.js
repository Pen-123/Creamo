const cipherInfo = {
    base64: "Base64: Encodes text to a 64-char alphabet. Not secure, just a vibe. Used by Ink Co. for quick comms. 🖊️",
    caesar: "Caesar: Shifts letters by a number (1-25). Old-school like OG Pen (1843-1875). Enter shift in key field.",
    base32: "Base32: Like Base64 but with 32 chars. Lowkey Pen Federation tech for stealth logs.",
    morse: "Morse Code: Dots (.) and dashes (-). Pen used it for ghost signals in Phase 4. 🕵️",
    aes256: "AES-256: Modern encryption, but browser-based? Risky like USPR’s nuke silos. Use a key (min 8 chars).",
    vigenere: "Vigenère: Polybius square cipher with a keyword. Pen’s protocol for encrypted treaties. Enter keyword."
};

document.getElementById('cipherSelect').addEventListener('change', () => {
    const cipher = document.getElementById('cipherSelect').value;
    document.getElementById('info-content').textContent = cipherInfo[cipher];
    document.getElementById('keyInput').classList.toggle('hidden', !['caesar', 'aes256', 'vigenere'].includes(cipher));
});

function encrypt() {
    const cipher = document.getElementById('cipherSelect').value;
    const input = document.getElementById('inputText').value;
    const key = document.getElementById('keyInput').value;
    let output = '';

    try {
        if (cipher === 'base64') {
            output = btoa(input);
        } else if (cipher === 'caesar') {
            const shift = parseInt(key) || 3;
            output = caesarCipher(input, shift);
        } else if (cipher === 'base32') {
            output = base32Encode(input);
        } else if (cipher === 'morse') {
            output = toMorse(input);
        } else if (cipher === 'aes256') {
            if (!key || key.length < 8) throw new Error('Yo bro, AES needs a key (8+ chars)! 😭');
            output = CryptoJS.AES.encrypt(input, key).toString();
        } else if (cipher === 'vigenere') {
            if (!key) throw new Error('Vigenère needs a keyword, rizzler! 😜');
            output = vigenereCipher(input, key, true);
        }
        displayOutput(output);
    } catch (e) {
        displayOutput(`Error: ${e.message} Skibidi toilet fail! 💀`);
    }
}

function decrypt() {
    const cipher = document.getElementById('cipherSelect').value;
    const input = document.getElementById('inputText').value;
    const key = document.getElementById('keyInput').value;
    let output = '';

    try {
        if (cipher === 'base64') {
            output = atob(input);
        } else if (cipher === 'caesar') {
            const shift = parseInt(key) || 3;
            output = caesarCipher(input, -shift);
        } else if (cipher === 'base32') {
            output = base32Decode(input);
        } else if (cipher === 'morse') {
            output = fromMorse(input);
        } else if (cipher === 'aes256') {
            if (!key || key.length < 8) throw new Error('AES needs a key (8+ chars)! 😭');
            output = CryptoJS.AES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            if (!output) throw new Error('Bad key or input 😭');
        } else if (cipher === 'vigenere') {
            if (!key) throw new Error('Vigenère needs a keyword 😭.');
            output = vigenereCipher(input, key, false);
        }
        displayOutput(output);
    } catch (e) {
        displayOutput(`Error: ${e.message} fail! 💀`);
    }
}

function displayOutput(text) {
    const outputEl = document.getElementById('output');
    outputEl.textContent = text || 'No output, type something! 😭';
    document.getElementById('copyBtn').classList.toggle('hidden', !text);
}

function copyOutput() {
    const output = document.getElementById('output').textContent;
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard.');
}

// Caesar Cipher
function caesarCipher(str, shift) {
    return str.replace(/[a-zA-Z]/g, (c) => {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
    });
}

// Base32 (Simplified, no external lib)
const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(str) {
    let bits = '';
    for (let i = 0; i < str.length; i++) {
        let bin = str.charCodeAt(i).toString(2).padStart(8, '0');
        bits += bin;
    }
    let output = '';
    for (let i = 0; i < bits.length; i += 5) {
        let chunk = bits.slice(i, i + 5).padEnd(5, '0');
        output += base32Alphabet[parseInt(chunk, 2)];
    }
    return output;
}

function base32Decode(str) {
    let bits = '';
    str = str.toUpperCase();
    for (let i = 0; i < str.length; i++) {
        let idx = base32Alphabet.indexOf(str[i]);
        if (idx === -1) throw new Error('Invalid Base32, bro! 😭');
        bits += idx.toString(2).padStart(5, '0');
    }
    let output = '';
    for (let i = 0; i < bits.length - 7; i += 8) {
        output += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
    }
    return output;
}

// Morse Code
const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
};

function toMorse(str) {
    return str.toUpperCase().split('').map(c => morseCode[c] || c).join(' ');
}

function fromMorse(str) {
    const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([k, v]) => [v, k]));
    return str.split(' ').map(code => reverseMorse[code] || code).join('');
}

// Vigenère Cipher
function vigenereCipher(str, key, encrypt) {
    let output = '';
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) throw new Error('Need a keyword, 😭');
    for (let i = 0, j = 0; i < str.length; i++) {
        let c = str[i];
        if (/[a-zA-Z]/.test(c)) {
            const base = c < 'a' ? 65 : 97;
            const keyChar = key[j % key.length].toUpperCase();
            const shift = encrypt ? keyChar.charCodeAt(0) - 65 : -(keyChar.charCodeAt(0) - 65);
            output += String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
            j++;
        } else {
            output += c;
        }
    }
    return output;
}
