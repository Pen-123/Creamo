// Complete Creamo Homepage and Cipher Tool
class CreamoApp {
    constructor() {
        this.currentView = 'home';
        this.binaryContainer = document.getElementById('binaryContainer');
        this.archivesModal = document.getElementById('archivesModal');
        this.archivesContent = document.getElementById('archivesContent');
        this.homeContainer = document.querySelector('.home-container');
        this.creamocryptTool = document.getElementById('creamocryptTool');
        this.init();
    }

    init() {
        this.setupHomepage();
        this.setupCipherTool();
        this.animateGiantText();
        this.createBackgroundBinary();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close archives modal with X button
        document.getElementById('closeArchives').addEventListener('click', () => {
            this.hideArchivesModal();
        });

        // Close modal when clicking outside
        this.archivesModal.addEventListener('click', (e) => {
            if (e.target === this.archivesModal) {
                this.hideArchivesModal();
            }
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

        // Portal button - toggle portal menu
        document.getElementById('portalBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            this.togglePortalMenu();
        });

        // Portal menu options
        document.getElementById('deluxtablePortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://deluxtable.pages.dev', '_blank');
                this.hidePortalMenu();
            }, 800);
        });

        document.getElementById('tekkenPortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://iankingsigma.github.io/tekken-8-website/', '_blank');
                this.hidePortalMenu();
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
        // Back to home button
        document.getElementById('backToHome').addEventListener('click', () => {
            this.showHomepage();
        });

        // Initialize cipher tool
        this.cipherTool = new CipherTool();
    }

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

    togglePortalMenu() {
        const portalMenu = document.getElementById('portalMenu');
        if (portalMenu.classList.contains('hidden')) {
            this.showPortalMenu();
        } else {
            this.hidePortalMenu();
        }
    }

    showPortalMenu() {
        const portalMenu = document.getElementById('portalMenu');
        portalMenu.classList.remove('hidden');
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.handleClickOutsidePortal.bind(this));
        }, 10);
    }

    hidePortalMenu() {
        const portalMenu = document.getElementById('portalMenu');
        portalMenu.classList.add('hidden');
        document.removeEventListener('click', this.handleClickOutsidePortal.bind(this));
    }

    handleClickOutsidePortal(e) {
        const portalMenu = document.getElementById('portalMenu');
        const portalBtn = document.getElementById('portalBtn');
        if (!portalMenu.contains(e.target) && !portalBtn.contains(e.target)) {
            this.hidePortalMenu();
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
        
        // Create multiple binary streams
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createBinaryStream(startX, startY, i);
            }, i * 80);
        }
    }

    createBinaryStream(startX, startY, index) {
        const binaryElement = document.createElement('div');
        binaryElement.className = 'binary-code';
        
        // Generate random binary string
        let binaryString = '';
        const length = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < length; i++) {
            binaryString += Math.random() > 0.5 ? '1' : '0';
        }
        
        binaryElement.textContent = binaryString;
        
        // Randomize animation properties
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
        
        // Remove element after animation completes
        setTimeout(() => {
            if (binaryElement.parentNode) {
                binaryElement.parentNode.removeChild(binaryElement);
            }
        }, (duration + delay) * 1000);
    }

    getRandomBlueColor() {
        const colors = [
            '#0a1a3a', '#1a3c8b', '#2d4b8f', '#1a3c8b', '#0a1a3a'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createBackgroundBinary() {
        // Create occasional background binary effects
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
            // Show loading state
            this.showArchivesModal();
            this.archivesContent.innerHTML = '<div class="loading">Loading Archives.txt...</div>';
            
            // Fetch the Archives.txt file
            const response = await fetch('Archives.txt');
            
            if (!response.ok) {
                throw new Error(`Failed to load Archives.txt: ${response.status} ${response.statusText}`);
            }
            
            const archivesData = await response.text();
            
            // Display the content
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
        // Custom dropdown
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

        // Cipher operations
        this.encryptBtn.addEventListener('click', () => this.encrypt());
        this.decryptBtn.addEventListener('click', () => this.decrypt());
        this.clearBtn.addEventListener('click', () => this.clear());

        // Copy output
        this.copyBtn.addEventListener('click', () => this.copyOutput());

        // Close dropdown on outside click
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

    // Cipher implementations
    base64EncodeUnicode(str) {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    base64DecodeUnicode(b64) {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    hexEncode(str) {
        const bytes = new TextEncoder().encode(str);
        return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
    }

    hexDecode(hex) {
        hex = hex.replace(/\s+/g,'');
        if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
        const bytes = new Uint8Array(hex.length/2);
        for (let i=0;i<bytes.length;i++) bytes[i] = parseInt(hex.substr(i*2,2),16);
        return new TextDecoder().decode(bytes);
    }

    base32Encode(input) {
        const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
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

    base32Decode(input) {
        const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
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

    caesarCipher(str, shift) {
        if (!Number.isFinite(shift)) shift = 3;
        return str.replace(/[a-zA-Z]/g, c => {
            const base = c < 'a' ? 65 : 97;
            return String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
        });
    }

    rot13(str) { return this.caesarCipher(str, 13); }

    toMorse(str) {
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
        return str.toUpperCase().split('').map(c => morseCode[c] || c).join(' ');
    }

    fromMorse(str) {
        const reverseMorse = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H',
            '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P',
            '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
            '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
            '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9', '.-.-.-': '.', '--..--': ',',
            '..--..': '?', '-.-.--': '!', '---...': ':', '.----.': "'", '.-..-.': '"', '-..-.': '/', '-.--.': '(',
            '-.--.-': ')', '.-...': '&', '-.-.-.': ';', '-...-': '=', '.-.-.': '+', '-....-': '-', '..--.-': '_',
            '.--.-.': '@', '/': ' '
        };
        return str.split(' ').map(code => reverseMorse[code] || code).join('');
    }

    urlEncode(str) { return encodeURIComponent(str); }
    urlDecode(str) { return decodeURIComponent(str.replace(/\+/g,' ')); }

    xorEncrypt(str, key) {
        if (!key) throw new Error('XOR requires a key');
        const data = new TextEncoder().encode(str);
        const kbytes = new TextEncoder().encode(key);
        const out = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) out[i] = data[i] ^ kbytes[i % kbytes.length];
        let bin = '';
        for (let i = 0; i < out.length; i++) bin += String.fromCharCode(out[i]);
        return btoa(bin);
    }

    xorDecrypt(b64, key) {
        if (!key) throw new Error('XOR requires a key');
        const binary = atob(b64);
        const out = new Uint8Array(binary.length);
        const kbytes = new TextEncoder().encode(key);
        for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i) ^ kbytes[i % kbytes.length];
        return new TextDecoder().decode(out);
    }

    vigenereCipher(str, key, encrypt=true) {
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

    sha256Hash(str) { return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex); }
    md5Hash(str) { return CryptoJS.MD5(str).toString(CryptoJS.enc.Hex); }

    aesEncryptPassphrase(plain, pass) {
        return CryptoJS.AES.encrypt(plain, pass).toString();
    }

    aesDecryptPassphrase(cipherText, pass) {
        const decrypted = CryptoJS.AES.decrypt(cipherText, pass).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error('Bad key or input for AES decryption.');
        return decrypted;
    }

    aesEncryptPBKDF2(plain, pass, iterations = this.PBKDF2_ITERATIONS) {
        const salt = CryptoJS.lib.WordArray.random(128/8);
        const key = CryptoJS.PBKDF2(pass, salt, { keySize: 256/32, iterations: iterations });
        const iv = CryptoJS.lib.WordArray.random(128/8);
        const encrypted = CryptoJS.AES.encrypt(plain, key, { iv: iv });
        const saltHex = salt.toString(CryptoJS.enc.Hex);
        const ivHex = iv.toString(CryptoJS.enc.Hex);
        return `${saltHex}:${ivHex}:${encrypted.toString()}`;
    }

    aesDecryptPBKDF2(blob, pass, iterations = this.PBKDF2_ITERATIONS) {
        const parts = (blob || '').split(':');
        if (parts.length < 3) throw new Error('Invalid AES-PBKDF2 blob (expected salt:iv:cipher).');
        const saltHex = parts[0];
        const ivHex = parts[1];
        const ct = parts.slice(2).join(':');
        const salt = CryptoJS.enc.Hex.parse(saltHex);
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const key = CryptoJS.PBKDF2(pass, salt, { keySize: 256/32, iterations: iterations });
        const decrypted = CryptoJS.AES.decrypt(ct, key, { iv: iv }).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error('Bad key/salt or input for AES-PBKDF2 decryption.');
        return decrypted;
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreamoApp();
});
