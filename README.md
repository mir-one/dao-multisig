# TON Multisig
Simple multlisig TON


## Installation

```bash
yarn
```

## Build

Compile with `func -SPA stdlib.fc multisig-code.fc multisig-code.fif`

## Client

Generate private key

```bash
npm run client:generate-key ./data/key
```

Copy public key from console and sent to admin

After server admin setups multisig smart contract, you are ready to submit transaction by running `npm run client:send-tx`.

Parameters: 
1. Receiving address
2. Amount in TON
3. Public address
4. Path to your private key.

Example:
```bash
npm run client:send-tx EQBW-Tltrbbg-HlmQC47uuEzP31OM1o5RtI5j7QSGxVrO1YD 0.1 PuZnMzx6J2E3obmLjtuQiBPbQrqFtEiKYg2+STwvp9i/ty7S ./data/key
```
## Server

Copy addresses to ./data/keys.pub

Prepare smart contract by running
`npm run multisig:create`.

Parameters: 
1. k = minimum number of signatures.
Example:

```bash
npm run multisig:create 2
```
Fund bounceable address with some TON.
Deploy smart contract by running

```bash
npm run multisig:deploy
```

Deploy takes no parameters.

Run server

```bash
npm run server:start
```