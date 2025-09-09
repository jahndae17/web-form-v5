/**
 * Browser-Compatible DIY QR Code Generator
 * Standalone implementation with no external dependencies
 * Based on ISO/IEC 18004:2015 standard
 */

class StandaloneDIYQRGenerator {
    constructor(options = {}) {
        this.initializeTables();
        this.initializeGaloisField();
        
        // Scanner compatibility mode options
        this.scannerOptimized = options.scannerOptimized !== false;
        this.scannerFriendlyMasks = [0, 1, 2, 6];
        this.errorCorrectionUpgrade = options.errorCorrectionUpgrade !== false;
    }

    initializeTables() {
        // ISO/IEC 18004:2015 Section 6.4.1 - Mode indicators
        this.MODE = {
            NUMERIC: 1,
            ALPHANUMERIC: 2, 
            BYTE: 4,
            KANJI: 8
        };

        // ISO/IEC 18004:2015 Section 6.5.1 - Error correction levels
        this.ERROR_LEVELS = {
            L: 0, M: 1, Q: 2, H: 3
        };

        // ISO/IEC 18004:2015 Section 7.3.3 - Character count indicator lengths
        this.CHAR_COUNT_BITS = {
            [this.MODE.NUMERIC]: [10, 12, 14],
            [this.MODE.ALPHANUMERIC]: [9, 11, 13],
            [this.MODE.BYTE]: [8, 16, 16],
            [this.MODE.KANJI]: [8, 10, 12]
        };

        // ISO/IEC 18004:2015 Section 6.4.3 - Alphanumeric character values
        this.ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

        this.initializeVersionTable();
        this.initializeFormatInfo();
        this.initializeAlignmentPatterns();

        // Function patterns
        this.FINDER_PATTERN = [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1],
            [1,1,1,1,1,1,1]
        ];

        this.ALIGNMENT_PATTERN = [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,1,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1]
        ];
    }

    initializeVersionTable() {
        this.VERSION_INFO = {};
        for (let version = 1; version <= 40; version++) {
            const size = 17 + 4 * version;
            this.VERSION_INFO[version] = {
                size: size,
                modules: size * size
            };
        }
    }

    initializeFormatInfo() {
        // Format information bit sequences
        this.FORMAT_INFO = {
            'L0': 0x77C4, 'L1': 0x72F3, 'L2': 0x7dAA, 'L3': 0x789D,
            'L4': 0x662F, 'L5': 0x6318, 'L6': 0x6C41, 'L7': 0x6976,
            'M0': 0x5412, 'M1': 0x5125, 'M2': 0x5E7C, 'M3': 0x5B4B,
            'M4': 0x45F9, 'M5': 0x40CE, 'M6': 0x4F97, 'M7': 0x4AA0,
            'Q0': 0x355F, 'Q1': 0x3068, 'Q2': 0x3F31, 'Q3': 0x3A06,
            'Q4': 0x24B4, 'Q5': 0x2183, 'Q6': 0x2EDA, 'Q7': 0x2BED,
            'H0': 0x1689, 'H1': 0x13BE, 'H2': 0x1CE7, 'H3': 0x19D0,
            'H4': 0x0762, 'H5': 0x0255, 'H6': 0x0D0C, 'H7': 0x083B
        };
    }

    initializeAlignmentPatterns() {
        this.ALIGNMENT_POSITIONS = {
            1: [],
            2: [6, 18],
            3: [6, 22],
            4: [6, 26],
            5: [6, 30]
        };
    }

    initializeGaloisField() {
        // Galois Field GF(2^8) for Reed-Solomon
        this.GF_EXP = new Array(512);
        this.GF_LOG = new Array(256);
        
        let x = 1;
        for (let i = 0; i < 255; i++) {
            this.GF_EXP[i] = x;
            this.GF_LOG[x] = i;
            x <<= 1;
            if (x & 0x100) {
                x ^= 0x11D;
            }
        }
        
        for (let i = 255; i < 512; i++) {
            this.GF_EXP[i] = this.GF_EXP[i - 255];
        }
    }

    // Data analysis and encoding
    analyzeData(data) {
        if (/^\d+$/.test(data)) return this.MODE.NUMERIC;
        
        // Check alphanumeric mode by testing each character (convert to uppercase)
        const isAlphanumeric = data.split('').every(char => this.ALPHANUMERIC_CHARS.includes(char.toUpperCase()));
        if (isAlphanumeric) {
            return this.MODE.ALPHANUMERIC;
        }
        
        return this.MODE.BYTE;
    }

    encodeData(data, mode, version) {
        let bits = [];
        
        // Mode indicator (4 bits)
        bits.push(...this.toBits(mode, 4));
        
        // Character count indicator
        const charCountBits = this.getCharCountBits(mode, version);
        bits.push(...this.toBits(data.length, charCountBits));
        
        // Data encoding
        switch (mode) {
            case this.MODE.NUMERIC:
                bits.push(...this.encodeNumeric(data));
                break;
            case this.MODE.ALPHANUMERIC:
                bits.push(...this.encodeAlphanumeric(data));
                break;
            case this.MODE.BYTE:
                bits.push(...this.encodeByte(data));
                break;
        }
        
        return bits;
    }

    getCharCountBits(mode, version) {
        const ranges = this.CHAR_COUNT_BITS[mode];
        if (version <= 9) return ranges[0];
        if (version <= 26) return ranges[1];
        return ranges[2];
    }

    encodeNumeric(data) {
        const bits = [];
        for (let i = 0; i < data.length; i += 3) {
            const group = data.substr(i, 3);
            const value = parseInt(group, 10);
            const bitLength = group.length === 3 ? 10 : group.length === 2 ? 7 : 4;
            bits.push(...this.toBits(value, bitLength));
        }
        return bits;
    }

    encodeAlphanumeric(data) {
        const bits = [];
        for (let i = 0; i < data.length; i += 2) {
            if (i + 1 < data.length) {
                const val = this.ALPHANUMERIC_CHARS.indexOf(data[i].toUpperCase()) * 45 + 
                           this.ALPHANUMERIC_CHARS.indexOf(data[i + 1].toUpperCase());
                bits.push(...this.toBits(val, 11));
            } else {
                bits.push(...this.toBits(this.ALPHANUMERIC_CHARS.indexOf(data[i].toUpperCase()), 6));
            }
        }
        return bits;
    }

    encodeByte(data) {
        const bits = [];
        
        // Convert string to bytes using proper encoding
        // QR standard expects ISO-8859-1 (Latin-1) for basic characters
        // but URLs and emails often need UTF-8 encoding
        const bytes = this.stringToBytes(data);
        
        for (let i = 0; i < bytes.length; i++) {
            bits.push(...this.toBits(bytes[i], 8));
        }
        return bits;
    }

    // Convert string to byte array with proper encoding
    stringToBytes(str) {
        const bytes = [];
        
        // For URLs, emails, and other web content, use UTF-8 encoding
        if (this.isWebContent(str)) {
            // UTF-8 encoding for web content
            const utf8Bytes = new TextEncoder().encode(str);
            return Array.from(utf8Bytes);
        }
        
        // For simple text, use ISO-8859-1 (Latin-1)
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode > 255) {
                // Non-Latin-1 character, force UTF-8
                const utf8Bytes = new TextEncoder().encode(str);
                return Array.from(utf8Bytes);
            }
            bytes.push(charCode);
        }
        return bytes;
    }

    // Detect if content is web-related and needs UTF-8
    isWebContent(str) {
        const webPatterns = [
            /^https?:\/\//i,    // URLs
            /^mailto:/i,        // Email
            /^tel:/i,           // Phone
            /^sms:/i,           // SMS
            /@.*\./,            // Email address
            /\.[a-z]{2,6}/i     // Domain names
        ];
        
        return webPatterns.some(pattern => pattern.test(str));
    }

    toBits(value, length) {
        const bits = [];
        for (let i = length - 1; i >= 0; i--) {
            bits.push((value >> i) & 1);
        }
        return bits;
    }

    addTerminatorAndPadding(bits, capacityBits) {
        // Add terminator
        const terminatorLength = Math.min(4, capacityBits - bits.length);
        for (let i = 0; i < terminatorLength; i++) {
            bits.push(0);
        }
        
        // Pad to byte boundary
        while (bits.length % 8 !== 0) {
            bits.push(0);
        }
        
        // Add pad codewords
        const padBytes = [0xEC, 0x11];
        let padIndex = 0;
        while (bits.length < capacityBits) {
            const padByte = padBytes[padIndex % 2];
            bits.push(...this.toBits(padByte, 8));
            padIndex++;
        }
        
        return bits;
    }

    // Error correction
    addErrorCorrection(data, version, errorLevel) {
        const levelKey = Object.keys(this.ERROR_LEVELS)[errorLevel];
        const ecCodewords = this.getErrorCorrectionCodewords(version, levelKey);
        
        // Convert bits to bytes
        const dataBytes = [];
        for (let i = 0; i < data.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8 && i + j < data.length; j++) {
                byte = (byte << 1) | data[i + j];
            }
            dataBytes.push(byte);
        }
        
        // Generate error correction
        const ecBytes = this.generateErrorCorrection(dataBytes, ecCodewords);
        
        // Combine and convert back to bits
        const result = [...dataBytes, ...ecBytes];
        const resultBits = [];
        for (const byte of result) {
            resultBits.push(...this.toBits(byte, 8));
        }
        
        return resultBits;
    }

    getErrorCorrectionCodewords(version, level) {
        const blocks = {
            1: { L: 7, M: 10, Q: 13, H: 17 },
            2: { L: 10, M: 16, Q: 22, H: 28 },
            3: { L: 15, M: 26, Q: 36, H: 44 },
            4: { L: 20, M: 36, Q: 52, H: 64 },
            5: { L: 26, M: 48, Q: 72, H: 88 }
        };
        return blocks[Math.min(version, 5)][level];
    }

    generateErrorCorrection(data, ecLength) {
        const generator = this.getGeneratorPolynomial(ecLength);
        const messageShifted = [...data, ...new Array(ecLength).fill(0)];
        const remainder = [...messageShifted];
        
        for (let i = 0; i < data.length; i++) {
            const coeff = remainder[i];
            if (coeff !== 0) {
                for (let j = 0; j < generator.length; j++) {
                    remainder[i + j] ^= this.gfMultiply(generator[j], coeff);
                }
            }
        }
        
        return remainder.slice(data.length);
    }

    getGeneratorPolynomial(degree) {
        let poly = [1];
        
        for (let i = 0; i < degree; i++) {
            const alpha_i = this.GF_EXP[i % 255];
            const newPoly = new Array(poly.length + 1).fill(0);
            
            for (let j = 0; j < poly.length; j++) {
                newPoly[j + 1] ^= poly[j];
                newPoly[j] ^= this.gfMultiply(poly[j], alpha_i);
            }
            poly = newPoly;
        }
        
        return poly.reverse();
    }

    gfMultiply(a, b) {
        if (a === 0 || b === 0) return 0;
        const logSum = (this.GF_LOG[a] + this.GF_LOG[b]) % 255;
        return this.GF_EXP[logSum];
    }

    // Matrix construction
    createMatrix(version) {
        const size = this.VERSION_INFO[version].size;
        const matrix = Array(size).fill().map(() => Array(size).fill(-1));
        
        this.placeFinderPatterns(matrix);
        this.placeSeparators(matrix);
        this.placeTimingPatterns(matrix);
        this.placeDarkModule(matrix, version);
        this.placeAlignmentPatterns(matrix, version);
        this.reserveFormatInfo(matrix);
        
        return matrix;
    }

    placeFinderPatterns(matrix) {
        const size = matrix.length;
        const positions = [[0, 0], [size - 7, 0], [0, size - 7]];
        
        for (const [row, col] of positions) {
            for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 7; c++) {
                    if (row + r >= 0 && row + r < size && col + c >= 0 && col + c < size) {
                        matrix[row + r][col + c] = this.FINDER_PATTERN[r][c];
                    }
                }
            }
        }
    }

    placeSeparators(matrix) {
        const size = matrix.length;
        
        // Top-left
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (i === 7 || j === 7) {
                    matrix[i][j] = 0;
                }
            }
        }
        
        // Top-right
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const row = i;
                const col = size - 8 + j;
                if (i === 7 || j === 0) {
                    matrix[row][col] = 0;
                }
            }
        }
        
        // Bottom-left
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const row = size - 8 + i;
                const col = j;
                if (i === 0 || j === 7) {
                    matrix[row][col] = 0;
                }
            }
        }
    }

    placeTimingPatterns(matrix) {
        const size = matrix.length;
        for (let i = 8; i < size - 8; i++) {
            matrix[6][i] = i % 2 === 0 ? 1 : 0;
            matrix[i][6] = i % 2 === 0 ? 1 : 0;
        }
    }

    placeDarkModule(matrix, version) {
        const pos = 4 * version + 9;
        if (pos < matrix.length) {
            matrix[pos][8] = 1;
        }
    }

    placeAlignmentPatterns(matrix, version) {
        const positions = this.ALIGNMENT_POSITIONS[version] || [];
        if (positions.length === 0) return;
        
        for (let i = 0; i < positions.length; i++) {
            for (let j = 0; j < positions.length; j++) {
                const row = positions[i];
                const col = positions[j];
                
                if ((row === 6 && col === 6) ||
                    (row === 6 && col === positions[positions.length - 1]) ||
                    (row === positions[positions.length - 1] && col === 6)) {
                    continue;
                }
                
                this.placeAlignmentPattern(matrix, row, col);
            }
        }
    }

    placeAlignmentPattern(matrix, centerRow, centerCol) {
        for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
                const row = centerRow + r;
                const col = centerCol + c;
                if (row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length) {
                    matrix[row][col] = this.ALIGNMENT_PATTERN[r + 2][c + 2];
                }
            }
        }
    }

    reserveFormatInfo(matrix) {
        const size = matrix.length;
        
        // Format info areas
        for (let col = 0; col <= 8; col++) {
            if (col !== 6) matrix[8][col] = 0;
        }
        
        for (let row = 0; row <= 8; row++) {
            if (row !== 6) matrix[row][8] = 0;
        }
        
        for (let row = size - 7; row < size; row++) {
            matrix[row][8] = 0;
        }
        
        for (let col = size - 8; col < size; col++) {
            matrix[8][col] = 0;
        }
    }

    // Data placement
    placeData(matrix, data) {
        const size = matrix.length;
        let dataIndex = 0;
        
        const dataBytes = [];
        for (let i = 0; i < data.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j < data.length) {
                    byte = (byte << 1) | data[i + j];
                } else {
                    byte = byte << 1;
                }
            }
            dataBytes.push(byte);
        }
        
        for (let col = size - 1; col > 0; col -= 2) {
            if (col === 6) col--;
            
            for (let i = 0; i < size; i++) {
                for (let c = 0; c < 2; c++) {
                    const currentCol = col - c;
                    const upward = ((col + 1) & 2) === 0;
                    const currentRow = upward ? size - 1 - i : i;
                    
                    if (currentRow >= 0 && currentRow < size && 
                        currentCol >= 0 && currentCol < size &&
                        matrix[currentRow][currentCol] === -1) {
                        
                        const byteIndex = Math.floor(dataIndex / 8);
                        const bitIndex = 7 - (dataIndex % 8);
                        
                        if (byteIndex < dataBytes.length) {
                            const bit = (dataBytes[byteIndex] >> bitIndex) & 1;
                            matrix[currentRow][currentCol] = bit;
                        } else {
                            matrix[currentRow][currentCol] = 0;
                        }
                        dataIndex++;
                    }
                }
            }
        }
    }

    // Mask patterns
    applyMask(matrix, maskPattern) {
        const size = matrix.length;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.isDataModule(matrix, row, col)) {
                    if (this.getMaskCondition(maskPattern, row, col)) {
                        matrix[row][col] = matrix[row][col] === 0 ? 1 : 0;
                    }
                }
            }
        }
    }

    getMaskCondition(pattern, row, col) {
        switch (pattern) {
            case 0: return (row + col) % 2 === 0;
            case 1: return row % 2 === 0;
            case 2: return col % 3 === 0;
            case 3: return (row + col) % 3 === 0;
            case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
            case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
            case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
            case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
            default: return false;
        }
    }

    isDataModule(matrix, row, col) {
        const size = matrix.length;
        
        // Function patterns
        if ((row < 9 && col < 9) || 
            (row < 9 && col >= size - 8) || 
            (row >= size - 8 && col < 9)) return false;
        
        // Timing patterns
        if (row === 6 || col === 6) return false;
        
        // Dark module
        if (row === 4 * 1 + 9 && col === 8) return false;
        
        // Format information
        if ((row === 8 && (col < 9 || col >= size - 8)) ||
            (col === 8 && (row < 9 || row >= size - 7))) return false;
        
        return true;
    }

    selectBestMask(matrix) {
        let bestMask = 0;
        let lowestPenalty = Infinity;
        
        // Scanner optimization: prefer scanner-friendly masks
        const masksToTest = this.scannerOptimized ? [...this.scannerFriendlyMasks, ...Array.from({length: 8}, (_, i) => i)] : Array.from({length: 8}, (_, i) => i);
        
        for (let mask of masksToTest) {
            const testMatrix = matrix.map(row => [...row]);
            this.applyMask(testMatrix, mask);
            const penalty = this.calculateMaskPenalty(testMatrix);
            
            if (penalty < lowestPenalty) {
                lowestPenalty = penalty;
                bestMask = mask;
                
                // Early exit for scanner-friendly masks if penalty is acceptable
                if (this.scannerOptimized && this.scannerFriendlyMasks.includes(mask) && penalty < 500) {
                    break;
                }
            }
        }
        
        return bestMask;
    }

    calculateMaskPenalty(matrix) {
        return this.penaltyRule1(matrix) + this.penaltyRule2(matrix) + 
               this.penaltyRule3(matrix) + this.penaltyRule4(matrix);
    }

    penaltyRule1(matrix) {
        let penalty = 0;
        const size = matrix.length;
        
        // Check rows
        for (let row = 0; row < size; row++) {
            let count = 1;
            for (let col = 1; col < size; col++) {
                if (matrix[row][col] === matrix[row][col - 1]) {
                    count++;
                } else {
                    if (count >= 5) penalty += count - 2;
                    count = 1;
                }
            }
            if (count >= 5) penalty += count - 2;
        }
        
        // Check columns
        for (let col = 0; col < size; col++) {
            let count = 1;
            for (let row = 1; row < size; row++) {
                if (matrix[row][col] === matrix[row - 1][col]) {
                    count++;
                } else {
                    if (count >= 5) penalty += count - 2;
                    count = 1;
                }
            }
            if (count >= 5) penalty += count - 2;
        }
        
        return penalty;
    }

    penaltyRule2(matrix) {
        let penalty = 0;
        const size = matrix.length;
        
        for (let row = 0; row < size - 1; row++) {
            for (let col = 0; col < size - 1; col++) {
                const color = matrix[row][col];
                if (matrix[row][col + 1] === color &&
                    matrix[row + 1][col] === color &&
                    matrix[row + 1][col + 1] === color) {
                    penalty += 3;
                }
            }
        }
        
        return penalty;
    }

    penaltyRule3(matrix) {
        let penalty = 0;
        const pattern1 = [1,0,1,1,1,0,1,0,0,0,0];
        const pattern2 = [0,0,0,0,1,0,1,1,1,0,1];
        
        for (let i = 0; i < matrix.length; i++) {
            penalty += this.findPattern(matrix[i], pattern1) * 40;
            penalty += this.findPattern(matrix[i], pattern2) * 40;
            
            const column = matrix.map(row => row[i]);
            penalty += this.findPattern(column, pattern1) * 40;
            penalty += this.findPattern(column, pattern2) * 40;
        }
        
        return penalty;
    }

    findPattern(line, pattern) {
        let count = 0;
        for (let i = 0; i <= line.length - pattern.length; i++) {
            let match = true;
            for (let j = 0; j < pattern.length; j++) {
                if (line[i + j] !== pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) count++;
        }
        return count;
    }

    penaltyRule4(matrix) {
        const size = matrix.length;
        let darkCount = 0;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (matrix[row][col] === 1) darkCount++;
            }
        }
        
        const percent = (darkCount * 100) / (size * size);
        const deviation = Math.abs(percent - 50);
        return Math.floor(deviation / 5) * 10;
    }

    // Format information
    placeFormatInfo(matrix, errorLevel, maskPattern) {
        const levelKey = Object.keys(this.ERROR_LEVELS)[errorLevel];
        const formatKey = levelKey + maskPattern;
        const formatBits = this.FORMAT_INFO[formatKey];
        
        if (!formatBits) return;
        
        const bits = this.toBits(formatBits, 15);
        const size = matrix.length;
        
        // Place format information
        matrix[8][0] = bits[0]; matrix[8][1] = bits[1]; matrix[8][2] = bits[2];
        matrix[8][3] = bits[3]; matrix[8][4] = bits[4]; matrix[8][5] = bits[5];
        matrix[8][7] = bits[6]; matrix[8][8] = bits[7];
        
        matrix[7][8] = bits[8]; matrix[5][8] = bits[9]; matrix[4][8] = bits[10];
        matrix[3][8] = bits[11]; matrix[2][8] = bits[12]; matrix[1][8] = bits[13];
        matrix[0][8] = bits[14];
        
        // Mirrored placement
        matrix[size-1][8] = bits[0]; matrix[size-2][8] = bits[1]; matrix[size-3][8] = bits[2];
        matrix[size-4][8] = bits[3]; matrix[size-5][8] = bits[4]; matrix[size-6][8] = bits[5];
        matrix[size-7][8] = bits[6];
        
        matrix[8][size-1] = bits[7]; matrix[8][size-2] = bits[8]; matrix[8][size-3] = bits[9];
        matrix[8][size-4] = bits[10]; matrix[8][size-5] = bits[11]; matrix[8][size-6] = bits[12];
        matrix[8][size-7] = bits[13]; matrix[8][size-8] = bits[14];
    }

    // Main generation function
    generateQRCode(data, options = {}) {
        const errorLevel = options.errorCorrectionLevel || 'M';
        
        // Scanner optimization
        const optimizedErrorLevel = this.optimizeErrorCorrectionForScanning(data, errorLevel);
        
        // Steps
        const mode = this.analyzeData(data);
        const version = this.determineVersion(data, mode, optimizedErrorLevel);
        const encodedData = this.encodeData(data, mode, version);
        const capacity = this.getTotalDataCapacity(version, optimizedErrorLevel);
        const paddedData = this.addTerminatorAndPadding(encodedData, capacity * 8);
        const errorLevelIndex = this.ERROR_LEVELS[optimizedErrorLevel];
        const correctedData = this.addErrorCorrection(paddedData, version, errorLevelIndex);
        
        const matrix = this.createMatrix(version);
        this.placeData(matrix, correctedData);
        const bestMask = this.selectBestMask(matrix);
        this.applyMask(matrix, bestMask);
        this.placeFormatInfo(matrix, errorLevelIndex, bestMask);
        
        return matrix;
    }

    determineVersion(data, mode, errorLevel) {
        for (let version = 1; version <= 40; version++) {
            const totalCapacity = this.getTotalDataCapacity(version, errorLevel);
            const overhead = this.calculateOverhead(data, mode, version);
            const availableCapacity = totalCapacity - overhead;
            
            let requiredCapacity;
            switch (mode) {
                case this.MODE.NUMERIC:
                    requiredCapacity = Math.ceil(data.length * 10 / 3) / 8;
                    break;
                case this.MODE.ALPHANUMERIC:
                    requiredCapacity = Math.ceil(data.length * 11 / 2) / 8;
                    break;
                case this.MODE.BYTE:
                    requiredCapacity = data.length;
                    break;
                default:
                    requiredCapacity = data.length;
            }
            
            if (requiredCapacity <= availableCapacity) {
                return version;
            }
        }
        return 1;
    }

    optimizeErrorCorrectionForScanning(data, requestedLevel) {
        if (!this.scannerOptimized || !this.errorCorrectionUpgrade) {
            return requestedLevel;
        }
        
        // Scanner optimization rules
        if (data.length < 10 && requestedLevel !== 'H') return 'H';
        if (data.includes('@') && requestedLevel === 'M') return 'H';
        if ((data.includes('://') || data.includes('mailto:') || data.includes('tel:')) && requestedLevel === 'M') return 'H';
        if (/[@#$%^&*(){}[\];:'"<>?]/.test(data) && data.length < 20 && requestedLevel === 'M') return 'H';
        
        // Check if data contains QR alphanumeric characters and is short
        const hasSpecialChars = data.split('').some(char => !this.ALPHANUMERIC_CHARS.includes(char.toUpperCase()) && !char.match(/[a-z]/));
        if (data.length <= 4 && !hasSpecialChars && requestedLevel !== 'H') return 'H';
        
        return requestedLevel;
    }

    getTotalDataCapacity(version, errorLevel) {
        const dataCapacities = {
            1: { L: 19, M: 16, Q: 13, H: 9 },
            2: { L: 34, M: 28, Q: 22, H: 16 },
            3: { L: 55, M: 44, Q: 34, H: 26 },
            4: { L: 80, M: 64, Q: 48, H: 36 },
            5: { L: 108, M: 86, Q: 62, H: 46 }
        };
        
        return dataCapacities[version] ? dataCapacities[version][errorLevel] : 19;
    }

    calculateOverhead(data, mode, version) {
        const modeIndicator = 4;
        const charCountIndicator = this.getCharCountBits(mode, version);
        const terminator = Math.min(4, 8);
        return Math.ceil((modeIndicator + charCountIndicator + terminator) / 8);
    }

    // Canvas rendering (replaces QRious functionality)
    renderToCanvas(matrix, canvas, options = {}) {
        const size = options.size || 200;
        const margin = options.margin || 4;
        const moduleSize = Math.floor((size - 2 * margin) / matrix.length);
        const actualSize = matrix.length * moduleSize + 2 * margin;
        
        canvas.width = actualSize;
        canvas.height = actualSize;
        
        const ctx = canvas.getContext('2d');
        
        // Clear background
        ctx.fillStyle = options.background || '#ffffff';
        ctx.fillRect(0, 0, actualSize, actualSize);
        
        // Draw modules
        ctx.fillStyle = options.foreground || '#000000';
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix.length; col++) {
                if (matrix[row][col] === 1) {
                    const x = margin + col * moduleSize;
                    const y = margin + row * moduleSize;
                    ctx.fillRect(x, y, moduleSize, moduleSize);
                }
            }
        }
        
        return canvas;
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.StandaloneDIYQRGenerator = StandaloneDIYQRGenerator;
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandaloneDIYQRGenerator;
}
