// Complete Creamo Homepage and Cipher Tool
class CreamoApp {
    constructor() {
        this.currentView = 'home';
        this.binaryContainer = document.getElementById('binaryContainer');
        this.archivesModal = document.getElementById('archivesModal');
        this.portalModal = document.getElementById('portalModal');
        this.archivesContent = document.getElementById('archivesContent');
        this.homeContainer = document.querySelector('.home-container');
        this.creamocryptTool = document.getElementById('creamocryptTool');
        
        // TMDB Configuration - removed (moved to tv.html)
        
        this.init();
    }

    init() {
        this.setupHomepage();
        this.setupCipherTool();
        this.animateGiantText();
        this.createBackgroundBinary();
        this.setupEventListeners();
        document.getElementById('fightersBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.location.href = 'fighters.html';
            }, 800);
        });
    }

    setupEventListeners() {
        // Close archives modal with X button
        document.getElementById('closeArchives').addEventListener('click', () => {
            this.hideArchivesModal();
        });

        // Close portal modal with X button
        document.getElementById('closePortal').addEventListener('click', () => {
            this.hidePortalModal();
        });

        // Close modals when clicking outside
        this.archivesModal.addEventListener('click', (e) => {
            if (e.target === this.archivesModal) {
                this.hideArchivesModal();
            }
        });

        this.portalModal.addEventListener('click', (e) => {
            if (e.target === this.portalModal) {
                this.hidePortalModal();
            }
        });

        // Back to home button for cipher tool
        document.getElementById('backToHome').addEventListener('click', () => {
            this.showHomepage();
        });
    }

    setupHomepage() {
        // CreamoCrypt button - show cipher tool
        document.getElementById('creamocryptBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                this.showCipherTool();
            }, 800);
        });

        // Pen Archives button - load Archives.txt
        document.getElementById('archivesBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            this.loadArchivesFile();
        });

        // Portal button - show portal modal
        document.getElementById('portalBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            this.showPortalModal();
        });

        // TV button - redirect to separate page
        document.getElementById('tvBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.location.href = 'tv.html';
            }, 800);
        });

        // Portal menu options
        document.getElementById('deluxtablePortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://deluxtable.pages.dev', '_blank');
                this.hidePortalModal();
            }, 800);
        });

        document.getElementById('brainrotPortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://iankingsigma.github.io/tekken-8-website/', '_blank');
                this.hidePortalModal();
            }, 800);
        });

        document.getElementById('controlCentrePortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://controlc.pages.dev', '_blank');
                this.hidePortalModal();
            }, 800);
        });

        // Setup button animations
        const buttons = document.querySelectorAll('.home-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
            });
        });
    }

    setupCipherTool() {
        // Back to home button is already set up in setupEventListeners
        // Initialize cipher tool
        this.cipherTool = new CipherTool();
    }

    // All TV-related methods removed
    showCipherTool() {
        this.currentView = 'cipher';
        this.homeContainer.style.display = 'none';
        this.creamocryptTool.style.display = 'block';
        document.querySelector('.site-header').style.display = 'none';
        document.querySelector('.site-footer').style.display = 'none';
    }

    showHomepage() {
        this.currentView = 'home';
        this.homeContainer.style.display = 'flex';
        this.creamocryptTool.style.display = 'none';
        document.querySelector('.site-header').style.display = 'flex';
        document.querySelector('.site-footer').style.display = 'block';
    }

    // ... (rest of the class unchanged: ripple, binary animation, modal handling, archive loading, cipher tool)
}

    showPortalModal() {
        if (this.portalModal) {
            this.portalModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hidePortalModal() {
        if (this.portalModal) {
            this.portalModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    createRipple(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(26, 60, 139, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1;
        `;

        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    triggerBinaryAnimation(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const startX = rect.left + (rect.width / 2);
        const startY = rect.bottom;
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createBinaryStream(startX, startY, i);
            }, i * 80);
        }
    }

    createBinaryStream(startX, startY, index) {
        const binaryElement = document.createElement('div');
        binaryElement.className = 'binary-code';
        
        let binaryString = '';
        const length = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < length; i++) {
            binaryString += Math.random() > 0.5 ? '1' : '0';
        }
        
        binaryElement.textContent = binaryString;
        
        const duration = 1.5 + Math.random() * 1;
        const delay = index * 0.08;
        const rotation = -20 + Math.random() * 40;
        
        binaryElement.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            transform: rotate(${rotation}deg);
            color: ${this.getRandomBlueColor()};
            font-size: ${12 + Math.random() * 8}px;
            opacity: ${0.7 + Math.random() * 0.3};
        `;
        
        this.binaryContainer.appendChild(binaryElement);
        
        setTimeout(() => {
            if (binaryElement.parentNode) {
                binaryElement.parentNode.removeChild(binaryElement);
            }
        }, (duration + delay) * 1000);
    }

    getRandomBlueColor() {
        const colors = [
            '#051225', '#0a1a3a', '#1a3c8b', '#0a1a3a', '#051225'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createBackgroundBinary() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createBinaryStream(
                    Math.random() * window.innerWidth,
                    window.innerHeight + 50,
                    Math.floor(Math.random() * 3)
                );
            }
        }, 2000);
    }

    animateGiantText() {
        const giantText = document.getElementById('giantCreamo');
        let scale = 1;
        let growing = true;
        
        setInterval(() => {
            if (growing) {
                scale += 0.001;
                if (scale >= 1.015) growing = false;
            } else {
                scale -= 0.001;
                if (scale <= 0.985) growing = true;
            }
            giantText.style.transform = `scale(${scale})`;
        }, 50);
    }

    async loadArchivesFile() {
        try {
            this.showArchivesModal();
            this.archivesContent.innerHTML = '<div class="loading">Loading Archives.txt...</div>';
            
            const response = await fetch('Archives.txt');
            
            if (!response.ok) {
                throw new Error(`Failed to load Archives.txt: ${response.status} ${response.statusText}`);
            }
            
            const archivesData = await response.text();
            
            this.archivesContent.innerHTML = `
                <pre>${this.escapeHtml(archivesData)}</pre>
            `;
            
        } catch (error) {
            console.error('Error loading Archives.txt:', error);
            this.archivesContent.innerHTML = `
                <div class="error">
                    [ERROR] Failed to load Archives.txt<br>
                    ${error.message}<br>
                    Please ensure Archives.txt exists in the same directory.
                </div>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showArchivesModal() {
        this.archivesModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideArchivesModal() {
        this.archivesModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cipher Tool Implementation
class CipherTool {
    constructor() {
        this.PBKDF2_ITERATIONS = 10000;
        this.cipherInfo = {
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

        this.initCipherTool();
    }

    initCipherTool() {
        // DOM elements
        this.nativeSelect = document.getElementById('cipherSelect');
        this.customSelect = document.getElementById('customSelect');
        this.selectControl = document.getElementById('selectControl');
        this.cipherList = document.getElementById('cipherList');
        this.optionsList = document.getElementById('optionsList');
        this.cipherFilter = document.getElementById('cipherFilter');
        this.selectedLabel = document.getElementById('selectedLabel');

        this.infoContent = document.getElementById('infoContent');
        this.keyRow = document.getElementById('keyRow');
        this.keyInput = document.getElementById('keyInput');
        this.keyLabel = document.getElementById('keyLabel');
        this.saltRow = document.getElementById('saltRow');
        this.saltInput = document.getElementById('saltInput');

        this.inputText = document.getElementById('inputText');
        this.outputEl = document.getElementById('output');
        this.typedContent = document.getElementById('typedContent');
        this.caretEl = document.getElementById('caret');
        this.copyBtn = document.getElementById('copyBtn');

        this.encryptBtn = document.getElementById('encryptBtn');
        this.decryptBtn = document.getElementById('decryptBtn');
        this.clearBtn = document.getElementById('clearBtn');

        this.buildOptions();
        this.setupEventListeners();
        this.initSelection();
        this.setOutput('No output yet.');
    }

    buildOptions() {
        this.optionsList.innerHTML = '';
        for (let i = 0; i < this.nativeSelect.options.length; i++) {
            const opt = this.nativeSelect.options[i];
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.className = 'option';
            li.dataset.value = opt.value;
            li.tabIndex = 0;
            li.innerHTML = `<strong>${opt.textContent}</strong><small>${this.cipherInfo[opt.value] || ''}</small>`;
            this.optionsList.appendChild(li);
        }
    }

    setupEventListeners() {
        this.selectControl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.cipherList.classList.contains('hidden')) {
                this.openDropdown();
            } else {
                this.closeDropdown();
            }
        });

        this.cipherFilter.addEventListener('input', () => this.filterOptions());

        this.optionsList.addEventListener('click', (e) => {
            const li = e.target.closest('.option');
            if (!li) return;
            this.chooseOption(li.dataset.value);
            this.closeDropdown();
        });

        this.encryptBtn.addEventListener('click', () => this.encrypt());
        this.decryptBtn.addEventListener('click', () => this.decrypt());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.copyBtn.addEventListener('click', () => this.copyOutput());

        document.addEventListener('click', (e) => {
            if (!this.customSelect.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }

    openDropdown() {
        this.cipherList.classList.remove('hidden');
        this.customSelect.setAttribute('aria-expanded', 'true');
        this.cipherFilter.value = '';
        this.filterOptions();
        this.cipherFilter.focus();
    }

    closeDropdown() {
        this.cipherList.classList.add('hidden');
        this.customSelect.setAttribute('aria-expanded', 'false');
    }

    filterOptions() {
        const q = (this.cipherFilter.value || '').trim().toLowerCase();
        Array.from(this.optionsList.children).forEach(li => {
            const txt = li.textContent.toLowerCase();
            li.style.display = txt.includes(q) ? '' : 'none';
        });
    }

    chooseOption(value) {
        this.nativeSelect.value = value;
        this.selectedLabel.textContent = this.nativeSelect.options[this.nativeSelect.selectedIndex].textContent;
        this.updateUIForCipher();
    }

    initSelection() {
        this.selectedLabel.textContent = this.nativeSelect.options[this.nativeSelect.selectedIndex].textContent;
        this.updateUIForCipher();
    }

    updateUIForCipher() {
        const cipher = this.nativeSelect.value;
        this.infoContent.textContent = this.cipherInfo[cipher] || '';
        const needsKey = ['caesar', 'xor', 'aes256', 'aes256-pbkdf2', 'vigenere'].includes(cipher);
        this.keyRow.classList.toggle('hidden', !needsKey);
        this.saltRow.classList.toggle('hidden', cipher !== 'aes256-pbkdf2');

        if (cipher === 'caesar') {
            this.keyInput.type = 'number';
            this.keyInput.placeholder = 'Shift (numeric, default 3)';
            this.keyLabel.textContent = 'Shift';
        } else if (cipher === 'aes256' || cipher === 'aes256-pbkdf2') {
            this.keyInput.type = 'password';
            this.keyInput.placeholder = 'Passphrase (min 8 chars recommended)';
            this.keyLabel.textContent = 'Passphrase';
        } else if (cipher === 'xor') {
            this.keyInput.type = 'text';
            this.keyInput.placeholder = 'Key (text, repeated)';
            this.keyLabel.textContent = 'XOR Key';
        } else if (cipher === 'vigenere') {
            this.keyInput.type = 'text';
            this.keyInput.placeholder = 'Keyword (letters only)';
            this.keyLabel.textContent = 'Keyword';
        } else {
            this.keyInput.type = 'text';
            this.keyInput.placeholder = 'Key / Not used';
            this.keyLabel.textContent = 'Key';
        }
    }

    setOutput(text, isError=false) {
        try {
            text = String(text || '');
            this.showInstant(text);
            this.outputEl.classList.toggle('error', !!isError);
        } catch (err) {
            this.showInstant(String(text));
            this.outputEl.classList.toggle('error', true);
        }
    }

    showInstant(text) {
        this.typedContent.textContent = text;
        this.caretEl.style.visibility = 'hidden';
        this.copyBtn.style.display = text ? 'inline-block' : 'none';
    }

    copyOutput() {
        const text = this.typedContent.textContent || '';
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            this.copyBtn.textContent = 'Copied';
            setTimeout(() => this.copyBtn.textContent = 'Copy', 1200);
        }).catch(() => {
            alert('Copy failed — select & copy manually.');
        });
    }

    clear() {
        this.inputText.value = '';
        this.keyInput.value = '';
        this.saltInput.value = '';
        this.setOutput('No output yet.');
        this.inputText.focus();
    }

    encrypt() {
        const cipher = this.nativeSelect.value;
        const input = this.inputText.value || '';
        const key = this.keyInput.value || '';
        const salt = this.saltInput.value || '';
        try {
            if (!input) throw new Error('Please provide input text.');
            let out = '';
            switch (cipher) {
                case 'base64': out = this.base64EncodeUnicode(input); break;
                case 'base32': out = this.base32Encode(input); break;
                case 'hex': out = this.hexEncode(input); break;
                case 'caesar': {
                    const s = Number(key);
                    out = this.caesarCipher(input, Number.isFinite(s) ? s : 3); break;
                }
                case 'rot13': out = this.rot13(input); break;
                case 'morse': out = this.toMorse(input); break;
                case 'url': out = this.urlEncode(input); break;
                case 'xor': out = this.xorEncrypt(input, key); break;
                case 'aes256': {
                    if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                    out = this.aesEncryptPassphrase(input, key); break;
                }
                case 'aes256-pbkdf2': {
                    if (!key || key.length < 8) throw new Error('AES-PBKDF2 requires a passphrase (min 8 chars).');
                    out = this.aesEncryptPBKDF2(input, key, this.PBKDF2_ITERATIONS); break;
                }
                case 'vigenere': out = this.vigenereCipher(input, key, true); break;
                case 'sha256': out = this.sha256Hash(input); break;
                case 'md5': out = this.md5Hash(input); break;
                default: throw new Error('Unknown cipher');
            }
            this.setOutput(out, false);
        } catch (e) {
            this.setOutput('Error: ' + (e && e.message ? e.message : String(e)), true);
        }
    }

    decrypt() {
        const cipher = this.nativeSelect.value;
        const input = this.inputText.value || '';
        const key = this.keyInput.value || '';
        const salt = this.saltInput.value || '';
        try {
            if (!input) throw new Error('Please provide input text.');
            let out = '';
            switch (cipher) {
                case 'base64': out = this.base64DecodeUnicode(input); break;
                case 'base32': out = this.base32Decode(input); break;
                case 'hex': out = this.hexDecode(input); break;
                case 'caesar': {
                    const s = Number(key);
                    out = this.caesarCipher(input, Number.isFinite(s) ? -s : -3); break;
                }
                case 'rot13': out = this.rot13(input); break;
                case 'morse': out = this.fromMorse(input); break;
                case 'url': out = this.urlDecode(input); break;
                case 'xor': out = this.xorDecrypt(input, key); break;
                case 'aes256': {
                    if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                    out = this.aesDecryptPassphrase(input, key); break;
                }
                case 'aes256-pbkdf2': {
                    if (!key || key.length < 8) throw new Error('AES-PBKDF2 requires a passphrase (min 8 chars).');
                    out = this.aesDecryptPBKDF2(input, key, this.PBKDF2_ITERATIONS); break;
                }
                case 'vigenere': out = this.vigenereCipher(input, key, false); break;
                case 'sha256':
                case 'md5':
                    throw new Error('Hashes are one-way and cannot be decrypted.');
                default: throw new Error('Unknown cipher');
            }
            this.setOutput(out, false);
        } catch (e) {
            this.setOutput('Error: ' + (e && e.message ? e.message : String(e)), true);
        }
    }

    // Cipher implementations (kept from original)
    base64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    }

    base64DecodeUnicode(str) {
        return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    base32Encode(str) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let output = '';
        
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            bits += charCode.toString(2).padStart(8, '0');
        }
        
        while (bits.length % 5 !== 0) {
            bits += '0';
        }
        
        for (let i = 0; i < bits.length; i += 5) {
            const chunk = bits.substr(i, 5);
            const index = parseInt(chunk, 2);
            output += alphabet[index];
        }
        
        while (output.length % 8 !== 0) {
            output += '=';
        }
        
        return output;
    }

    base32Decode(str) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        str = str.toUpperCase().replace(/=+$/, '');
        let bits = '';
        let output = '';
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const index = alphabet.indexOf(char);
            if (index === -1) throw new Error('Invalid Base32 character');
            bits += index.toString(2).padStart(5, '0');
        }
        
        for (let i = 0; i < bits.length; i += 8) {
            const chunk = bits.substr(i, 8);
            if (chunk.length < 8) break;
            const charCode = parseInt(chunk, 2);
            output += String.fromCharCode(charCode);
        }
        
        return output;
    }

    hexEncode(str) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return hex.toUpperCase();
    }

    hexDecode(hex) {
        hex = hex.replace(/\s/g, '');
        if (hex.length % 2 !== 0) {
            throw new Error('Invalid hex string');
        }
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    caesarCipher(str, shift) {
        return str.replace(/[a-z]/gi, (char) => {
            const code = char.charCodeAt(0);
            const isUpper = code >= 65 && code <= 90;
            const base = isUpper ? 65 : 97;
            return String.fromCharCode(((code - base + shift + 26) % 26) + base);
        });
    }

    rot13(str) {
        return this.caesarCipher(str, 13);
    }

    toMorse(str) {
        const morseMap = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
            'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
            'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
            'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
            'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
            'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
            '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', '0': '-----', ' ': '/'
        };
        
        return str.toUpperCase().split('').map(char => {
            return morseMap[char] || char;
        }).join(' ');
    }

    fromMorse(morse) {
        const reverseMorse = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
            '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
            '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
            '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
            '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
            '--..': 'Z', '.----': '1', '..---': '2', '...--': '3',
            '....-': '4', '.....': '5', '-....': '6', '--...': '7',
            '---..': '8', '----.': '9', '-----': '0', '/': ' '
        };
        
        return morse.trim().split(' ').map(code => {
            return reverseMorse[code] || code;
        }).join('');
    }

    urlEncode(str) {
        return encodeURIComponent(str);
    }

    urlDecode(str) {
        return decodeURIComponent(str);
    }

    xorEncrypt(str, key) {
        if (!key) throw new Error('XOR requires a key');
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return this.base64EncodeUnicode(result);
    }

    xorDecrypt(str, key) {
        if (!key) throw new Error('XOR requires a key');
        const decoded = this.base64DecodeUnicode(str);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    }

    aesEncryptPassphrase(str, passphrase) {
        const salt = CryptoJS.lib.WordArray.random(128/8);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: 100
        });
        const iv = CryptoJS.lib.WordArray.random(128/8);
        const encrypted = CryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return salt.toString() + iv.toString() + encrypted.toString();
    }

    aesDecryptPassphrase(str, passphrase) {
        const salt = CryptoJS.enc.Hex.parse(str.substr(0, 32));
        const iv = CryptoJS.enc.Hex.parse(str.substr(32, 32));
        const encrypted = str.substring(64);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: 100
        });
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    aesEncryptPBKDF2(str, passphrase, iterations) {
        const salt = CryptoJS.lib.WordArray.random(128/8);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: iterations
        });
        const iv = CryptoJS.lib.WordArray.random(128/8);
        const encrypted = CryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return salt.toString() + iv.toString() + encrypted.toString();
    }

    aesDecryptPBKDF2(str, passphrase, iterations) {
        const salt = CryptoJS.enc.Hex.parse(str.substr(0, 32));
        const iv = CryptoJS.enc.Hex.parse(str.substr(32, 32));
        const encrypted = str.substring(64);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: iterations
        });
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    vigenereCipher(str, key, encrypt = true) {
        if (!key) throw new Error('Vigenère requires a keyword');
        key = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!key) throw new Error('Keyword must contain letters');
        
        let result = '';
        let keyIndex = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const charCode = char.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                const isUpper = charCode >= 65 && charCode <= 90;
                const base = isUpper ? 65 : 97;
                const keyChar = key[keyIndex % key.length];
                const keyShift = keyChar.charCodeAt(0) - 65;
                const shift = encrypt ? keyShift : 26 - keyShift;
                
                result += String.fromCharCode(((charCode - base + shift) % 26) + base);
                keyIndex++;
            } else {
                result += char;
            }
        }
        
        return result;
    }

    sha256Hash(str) {
        return CryptoJS.SHA256(str).toString();
    }

    md5Hash(str) {
        return CryptoJS.MD5(str).toString();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CreamoApp();
});
