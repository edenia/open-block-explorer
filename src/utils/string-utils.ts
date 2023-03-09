/* regex to validate EOSIO account name convention see: https://regex101.com/r/d8uKrG/1 */

export function isValidAccount(account: string): boolean {
    const regEx = /(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-z1-5]$)/;
    return regEx.exec(account) !== null;
}

export function isValidTransactionHex(hexString: string): boolean {
    const regEx = /^([0-9A-Fa-f]){64}$/g;
    return regEx.exec(hexString) !== null;
}

/**
 * Given a string representation of a number, returns that number with trailing zeroes trimmed (trailing `.` will
 * also be trimmed if all decimals are zero)
 *
 * @param number - a string representation of a number, e.g. "0.1100"
 *
 * @return supplied number-string with trailing zeroes trimmed
 */
export function trimZeroes(number: string): string {
    const floatingPointNumberRegex = /^-?(0|[1-9]\d*)(\.\d+)?$/;
    const trailingZeroesRegex = /(\.)?0+$/;
    const isNumber = floatingPointNumberRegex.test(number);

    if (!isNumber) {
        throw `Supplied string "${number}" does not represent a number`;
    }

    if (number === '0') {
        return number;
    }

    return number.replace(trailingZeroesRegex, '');
}
