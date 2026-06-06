# Verify contract on Mantle Sepolia

Single-file verification fails if **Via IR** is not enabled.
We deployed with `viaIR: true` in Hardhat.

## Method A - Standard JSON Input (recommended)

1. Open https://sepolia.mantlescan.xyz/verifyContract
2. Address: `0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c`
3. Compiler Type: **Solidity (Standard-Json-Input)**
4. Compiler Version: **v0.8.24+commit.e11b9ed9**
5. Upload file: `contracts/standard-input.json`
6. Contract name: `contracts/PersonalCFORegistry.sol:PersonalCFORegistry`
7. Constructor arguments: leave empty
8. Complete CAPTCHA -> Verify

## Method B - Single file (must enable Via IR)

If your form has **Via IR** checkbox under Advanced Configuration:

- Optimization: Yes
- Runs: 200
- EVM: paris
- **Via IR: Yes** (required)
- Paste full `PersonalCFORegistry.sol`

Without Via IR the bytecode will never match.
