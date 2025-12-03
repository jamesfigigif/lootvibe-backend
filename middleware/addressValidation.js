/**
 * Address Validation Middleware
 *
 * Validates cryptocurrency addresses to prevent loss of funds
 * Supports BTC and ETH with comprehensive format checking
 */

/**
 * Validate Bitcoin address
 * Supports: P2PKH (1...), P2SH (3...), Bech32 (bc1...)
 */
function isValidBTCAddress(address, testnet = false) {
    if (!address || typeof address !== 'string') {
        return false;
    }

    // Mainnet patterns
    const mainnetPatterns = [
        /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,     // P2PKH (Legacy)
        /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,     // P2SH (Script Hash)
        /^bc1[a-z0-9]{39,59}$/                 // Bech32 (SegWit)
    ];

    // Testnet patterns
    const testnetPatterns = [
        /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // P2PKH Testnet
        /^2[a-km-zA-HJ-NP-Z1-9]{25,34}$/,     // P2SH Testnet
        /^tb1[a-z0-9]{39,59}$/                 // Bech32 Testnet
    ];

    const patterns = testnet ? testnetPatterns : mainnetPatterns;

    return patterns.some(pattern => pattern.test(address));
}

/**
 * Validate Ethereum address
 * Supports standard 0x... format with checksum validation
 */
function isValidETHAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }

    // Basic format check
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return false;
    }

    // All lowercase or all uppercase = valid (no checksum)
    const addressWithout0x = address.slice(2);
    if (addressWithout0x === addressWithout0x.toLowerCase() ||
        addressWithout0x === addressWithout0x.toUpperCase()) {
        return true;
    }

    // Mixed case = validate checksum (EIP-55)
    return isValidETHChecksum(address);
}

/**
 * Validate Ethereum checksum (EIP-55)
 */
function isValidETHChecksum(address) {
    try {
        const crypto = require('crypto');
        const addressWithout0x = address.slice(2);
        const hash = crypto.createHash('sha3-256').update(addressWithout0x.toLowerCase()).digest('hex');

        for (let i = 0; i < 40; i++) {
            const char = addressWithout0x[i];
            const hashBit = parseInt(hash[i], 16);

            if (hashBit >= 8) {
                // Should be uppercase
                if (char !== char.toUpperCase()) {
                    return false;
                }
            } else {
                // Should be lowercase
                if (char !== char.toLowerCase()) {
                    return false;
                }
            }
        }

        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Express middleware to validate withdrawal address
 */
function validateWithdrawalAddress(req, res, next) {
    const { currency, address } = req.body;

    if (!currency) {
        return res.status(400).json({
            error: 'Currency is required',
            field: 'currency'
        });
    }

    if (!address) {
        return res.status(400).json({
            error: 'Withdrawal address is required',
            field: 'address'
        });
    }

    // Validate based on currency
    let isValid = false;
    let errorMessage = '';

    switch (currency.toUpperCase()) {
        case 'BTC':
            const testnet = process.env.NODE_ENV === 'development';
            isValid = isValidBTCAddress(address, testnet);
            errorMessage = `Invalid Bitcoin address. Expected format: ${testnet ? 'testnet (m..., 2..., tb1...)' : 'mainnet (1..., 3..., bc1...)'}`;
            break;

        case 'ETH':
            isValid = isValidETHAddress(address);
            errorMessage = 'Invalid Ethereum address. Expected format: 0x followed by 40 hexadecimal characters';
            break;

        default:
            return res.status(400).json({
                error: `Unsupported currency: ${currency}`,
                supportedCurrencies: ['BTC', 'ETH']
            });
    }

    if (!isValid) {
        return res.status(400).json({
            error: errorMessage,
            field: 'address',
            provided: address,
            currency
        });
    }

    // Address is valid, continue
    next();
}

/**
 * Validate address programmatically (non-middleware)
 */
function validateAddress(address, currency, testnet = false) {
    if (!address || !currency) {
        return {
            valid: false,
            error: 'Address and currency are required'
        };
    }

    switch (currency.toUpperCase()) {
        case 'BTC':
            const btcValid = isValidBTCAddress(address, testnet);
            return {
                valid: btcValid,
                error: btcValid ? null : 'Invalid Bitcoin address format'
            };

        case 'ETH':
            const ethValid = isValidETHAddress(address);
            return {
                valid: ethValid,
                error: ethValid ? null : 'Invalid Ethereum address format'
            };

        default:
            return {
                valid: false,
                error: `Unsupported currency: ${currency}`
            };
    }
}

/**
 * Sanitize address (trim whitespace, validate format)
 */
function sanitizeAddress(address) {
    if (!address || typeof address !== 'string') {
        return null;
    }

    // Trim whitespace
    let sanitized = address.trim();

    // Remove any spaces within the address
    sanitized = sanitized.replace(/\s/g, '');

    return sanitized;
}

module.exports = {
    validateWithdrawalAddress,
    validateAddress,
    sanitizeAddress,
    isValidBTCAddress,
    isValidETHAddress
};
