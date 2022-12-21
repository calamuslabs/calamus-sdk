# Calamus SDK

SDK to interact with Calamus Finance

## JS SDK to interact with Calamus function

This package allows you to `createCalamusStream`, `getCalamusStream`

## Installation

`npm i calamus-sdk`

## Initial

Before creating and manipulating streams Calamus instance must be created. All streams functions are methods on this
instance.

```javascript
import {Calamus} from "calamus-sdk";

/**
 * Initial Calamus.
 *
 * @param chain - Name of the chain will stream (now support only bnb)
 * @param isTestNetwork - true/false: is test network or not
 *
 */
const CalamusInstance = new Calamus('bnb', false);
```

## Create Stream

```typescript
/**
 * Create Calamus Stream.
 *
 * @param releaseAmount (BigNumber): number token recipient can get
 * @param recipient (string): address of recipient,
 * @param startTime (number): stream will start at (second),
 * @param stopTime (number): stream will end at (second),
 * @param initialRelease (number):  initial token recipient can get when withdraw ( percent )
 * @param releaseFrequency (number): number token release in every second
 * @param transferPrivilege (number): who can transfer this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither"
 * @param cancelPrivilege (number): who can cancel this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither",
 * @param tokenAddress (string): token want to stream
 * @param contractTitle (string): title of the contract
 * @param emailAddress (string): email will be notified when stream change
 * @param tokenSymbol (string): symbol of token like 'BNB', 'BNBT', ...
 *
 * @return Promise<Event>
 */

createCalamusStream({
    releaseAmount,
    recipient,
    startTime,
    stopTime,
    initialRelease,
    releaseFrequency,
    transferPrivilege,
    cancelPrivilege,
    contractTitle,
    emailAddress,
    tokenSymbol
});

const CalamusInstance = new Calamus('bnb', false);
CalamusInstance.createCalamusStream({
    releaseAmount: 30,
    recipient: "0xF49f0bDbA38c55b65728c3C83b65DFd30A2e0C40",
    startTime: 1671624853,
    stopTime: 1671724853,
    initialRelease: 0,
    releaseFrequency: 1,
    transferPrivilege: 1,
    cancelPrivilege: 1,
    contractTitle: 'New Contract 01',
    emailAddress: 'example@gmail.com',
    tokenSymbol: "BNBT"
})
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Get List Incoming Streams

```typescript
/**
 * Get Calamus Streams.
 *
 * @param address (string): wallet address (if this not provide, address of current account on metamask will be use)
 *
 * @return Promise<ListStream[]>
 */

CalamusInstance.getCalamusIncomeStream("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Get List Outcome Streams

```typescript
/**
 * Get Calamus Streams.
 *
 * @param address (string): wallet address (if this not provide, address of current account on metamask will be use)
 *
 * @return Promise<ListStream[]>
 */

CalamusInstance.getCalamusOutcomeStream("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Get Single Stream By ID

```typescript
/**
 * Get Calamus Streams.
 *
 * @param streamID (string): id of stream
 *
 * @return Promise<ListStream[]>
 */
CalamusInstance.getCalamusStreamByID("24")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Withdraw Stream

```typescript
/**
 * Withdraw Stream.
 *
 * @param streamID (string): ID of stream
 * @param amount (string): amount token user want to withdraw
 * @param withdrawAll (boolean): withdraw all amount or not
 *
 * @return Promise<Event>
 */
CalamusInstance.withdrawCalamusStream("2", "10", false)
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Cancel Stream

```typescript
/**
 * Cancel Stream.
 *
 * @param streamID (string): ID of stream
 *
 * @return Promise<Event>
 */

CalamusInstance.cancelCalamusStream("24")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Transfer Stream

```typescript
/**
 * Transfer Stream.
 *
 * @param streamID (string): ID of stream
 * @param newRecipient (string): new recipient address
 *
 * @return Promise<Event>
 */

CalamusInstance.transferCalamusStream("23", "0x9d7d3aD17b87a4845C977eADc789B479e80af0A0")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Topup Stream

```typescript
/**
     * Topup Stream.
     *
     * @param streamID (string): ID of stream
     * @param tokenSymbol (string): token want to top up
     * @param amount (string): amount want to top up
     *
     * @return Promise<Event>
     */

CalamusInstance.topupCalamusStream("BNBT", "26", "10")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

## Get Balance

```typescript
/**
     * Balance of user in stream.
     *
     * @param streamID (string): ID of stream
     * @param address (string): wallet address (if this not provide, address of current account on metamask will be use)
     *
     * @return Promise<string>
     */

CalamusInstance.balanceOf("BNBT", "26", "10")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```