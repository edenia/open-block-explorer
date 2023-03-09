import { describe, expect, it } from '@jest/globals';
import {
    isValidAccount,
    isValidTransactionHex,
    trimZeroes,
} from 'src/utils/string-utils';

describe('string utility functions', () => {
    describe('isValidAccount', () => {
        it('returns true for accounts with lowercase letters, numbers 1-5, containing non-terminating periods up to 13 characters', () => {
            const validAntelopeAccount = '.abcdef.12345';
            expect(isValidAccount(validAntelopeAccount)).toBe(true);
        });
        it('returns false for account names containing digits > 5', () => {
            const invalidAntelopeAccount = '123456';
            expect(isValidAccount(invalidAntelopeAccount)).toBe(false);
        });
        it('returns false for account names ending with a period', () => {
            const invalidAntelopeAccount = 'abc.';
            expect(isValidAccount(invalidAntelopeAccount)).toBe(false);
        });
        it('returns false for accounts names exceeding 13 characters', () => {
            const invalidAntelopeAccount = 'abcdefghijklmn';
            expect(isValidAccount(invalidAntelopeAccount)).toBe(false);
        });
    });

    describe('isValidTransactionHex', () => {
        it('returns true if value is 64 characters in length containing valid hex (0-9, A-F, a-f)', () => {
            const validTransactionHex =
        '0000000000000000000000000000000000000000000123456789abcdefABCDEF';
            expect(isValidTransactionHex(validTransactionHex)).toBe(true);
        });
        it('returns false if hex does not contain 64 characters', () => {
            const invalidTransactionHex = 'FFFFFF';
            expect(isValidTransactionHex(invalidTransactionHex)).toBe(false);
        });
        it('returns false if string does not contain valid uppercase characters', () => {
            const invalidTransactionHex = 'ABCDEFG';
            expect(isValidTransactionHex(invalidTransactionHex)).toBe(false);
        });
        it('returns false if string does not contain valid lowercase characters', () => {
            const invalidTransactionHex = 'abcdefg';
            expect(isValidTransactionHex(invalidTransactionHex)).toBe(false);
        });
    });

    describe('trimZeroes', () => {
        it('should correctly trim zeroes', () => {
            const rawInputs = [
                '0.0000',
                '0.0',
                '0',
                '0.10',
                '0.1',
                '1.0',
                '1.0000',
                '1.1',
                '1.10',
                '1.01',
            ];

            const expectedOutputs = [
                '0',
                '0',
                '0',
                '0.1',
                '0.1',
                '1',
                '1',
                '1.1',
                '1.1',
                '1.01',
            ];

            rawInputs.forEach((input, index) => {
                expect(trimZeroes(input)).toBe(expectedOutputs[index]);
            });
        });

        it('should throw an error when passed an invalid number', () => {
            const invalidInputs = [
                'a',
                '',
                'zero',
                '1.0 TLOS',
                '.',
                '1.',
                '0.',
            ];

            invalidInputs.forEach(input => expect(() => trimZeroes(input)).toThrow());
        });
    });
});
