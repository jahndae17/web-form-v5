// Let's implement format info generation from scratch according to ISO standard
// ISO/IEC 18004:2015 Section 7.9

function generateFormatInfo(errorLevel, maskPattern) {
    console.log('🔧 Generating Format Info from scratch\n');
    
    // Error correction level encoding (2 bits)
    const errorLevels = { 'L': 0b01, 'M': 0b00, 'Q': 0b11, 'H': 0b10 };
    const errorBits = errorLevels[errorLevel];
    
    // Mask pattern (3 bits)
    const maskBits = maskPattern & 0b111;
    
    // Combine to 5-bit data word
    const dataWord = (errorBits << 3) | maskBits;
    console.log(`Error level ${errorLevel}: ${errorBits.toString(2).padStart(2, '0')}`);
    console.log(`Mask pattern ${maskPattern}: ${maskBits.toString(2).padStart(3, '0')}`);
    console.log(`Data word: ${dataWord.toString(2).padStart(5, '0')} (${dataWord})`);
    
    // BCH(15,5) error correction
    // Generator polynomial: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 10100110111
    const generator = 0b10100110111; // 0x537
    
    // Encode using polynomial division
    let codeWord = dataWord << 10; // Shift data to upper bits
    
    for (let i = 14; i >= 10; i--) {
        if (codeWord & (1 << i)) {
            codeWord ^= generator << (i - 10);
        }
    }
    
    // Combine data and check bits
    const formatCode = (dataWord << 10) | codeWord;
    console.log(`Format code: ${formatCode.toString(2).padStart(15, '0')} (0x${formatCode.toString(16)})`);
    
    // XOR with mask pattern 0x5412 for final format info
    const maskedFormat = formatCode ^ 0x5412;
    console.log(`Masked format: ${maskedFormat.toString(2).padStart(15, '0')} (0x${maskedFormat.toString(16)})`);
    
    return maskedFormat;
}

// Test all combinations for M level
console.log('🧪 Testing M level with all masks:\n');
for (let mask = 0; mask < 8; mask++) {
    const result = generateFormatInfo('M', mask);
    console.log(`M${mask}: 0x${result.toString(16)}`);
}

console.log('\n🎯 Expected reference: 0x1f3d');

// Test what our reference might be
const refValue = 0x1f3d;
const unmasked = refValue ^ 0x5412;
console.log(`\nReference unmasked: 0x${unmasked.toString(16)} = ${unmasked.toString(2).padStart(15, '0')}`);

// Extract data word from unmasked
const dataWord = (unmasked >> 10) & 0b11111;
const errorLevel = (dataWord >> 3) & 0b11;
const maskPattern = dataWord & 0b111;

const errorLevelNames = ['M', 'L', 'H', 'Q'];
console.log(`Decoded error level: ${errorLevelNames[errorLevel]} (${errorLevel})`);
console.log(`Decoded mask pattern: ${maskPattern}`);
