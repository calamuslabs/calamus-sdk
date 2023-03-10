# Calamus SDK

SDK to interact with Calamus Finance

## JS SDK to interact with Calamus function

This package allows you to `createCalamusStream`, `getCalamusIncomingStream`, `getCalamusOutgoingStream`
, `getCalamusStreamByID`, `withdrawCalamusStream`, `cancelCalamusStream`, `transferCalamusStream`, `topupCalamusStream`
, `balanceOf`, `feeOf`

## Installation

`npm i calamus-sdk`

## Initialize

Before creating and interacting with Calamus streams, an instance must be created. All streams functions are methods following on this instance.

```javascript
import {Calamus} from "calamus-sdk";

/**
 * Initial Calamus.
 *
 * @param chain - Name of the chain will stream (now support only bnb)
 * @param isTestNetwork - true/false: is test network or not
 * @param covalentKey - Key get from covalent API
 *
 */
const CalamusInstance = new Calamus('bnb', false, 'covalent_key');
```

_You can register a Covalent API key at https://www.covalenthq.com/platform/#/auth/register/, and provide it to this command._

## Create Stream

```typescript
/**
 * Create Calamus Stream.
 *
 * @param releaseAmount (number): number token recipient can get
 * @param recipient (string): address of recipient,
 * @param startTime (number): stream will start at (second),
 * @param stopTime (number): stream will end at (second),
 * @param initialRelease (number):  initial token recipient can get when withdraw ( percent )
 * @param releaseFrequency (number): number of "releaseFrequencyType" between each release
 * @param releaseFrequencyType (number): unit of releaseFrequency, 1: second, 2: minute, 3: hour, 4: day, 5: week, 6: month, 7: year
 * @param transferPrivilege (number): who can transfer this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither"
 * @param cancelPrivilege (number): who can cancel this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither",
 * @param contractTitle (string): title of the contract (optional)
 * @param emailAddress (string): email address of recipient (optional)
 * @param tokenAddress:contract address of token sender want to stream
 *
 * @return Promise<{
 *  stream_id: id of stream, 
 *  trx_hash: hash of transaction
 * }>
 */

createCalamusStream({
    releaseAmount,
    recipient,
    startTime,
    stopTime,
    initialRelease,
    releaseFrequency,
    releaseFrequencyType,
    transferPrivilege,
    cancelPrivilege,
    contractTitle,
    emailAddress,
    tokenAddress
});

const CalamusInstance = new Calamus('bnb', false);
CalamusInstance.createCalamusStream({
    releaseAmount: 1,
    recipient: "0xF49f0bDbA38c55b65728c3C83b65DFd30A2e0C40",
    startTime: 1671624853,
    stopTime: 1671724853,
    initialRelease: 0,
    releaseFrequency: 1,
    releaseFrequencyType: 1,
    transferPrivilege: 1,
    cancelPrivilege: 1,
    contractTitle: 'New Contract 01',
    emailAddress: 'example@gmail.com',
    tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
})
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const result = await CalamusInstance.createCalamusStream({
    releaseAmount: 1,
    recipient: "0xF49f0bDbA38c55b65728c3C83b65DFd30A2e0C40",
    startTime: 1671624853,
    stopTime: 1671724853,
    initialRelease: 0,
    releaseFrequency: 1,
    releaseFrequencyType: 1,
    transferPrivilege: 1,
    cancelPrivilege: 1,
    contractTitle: 'New Contract 01',
    emailAddress: 'example@gmail.com',
    tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
})
```

## Get List Incoming Streams

```typescript
/**
 * Get Calamus Streams.
 *
 * @param address (string): wallet address (if this is not provided, address of current account on metamask will be used)
 *
 * @return Promise<ListStream[
 * <{
 *  cancelPrivilege (number): who can cancel this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither",
 *  chain (string): chain's name,
 *  contractTitle (string): title of contract 
 *  emailAddress (string): email address of recipient
 *  initialRelease (string): number of initial token recipient will get when withdraw
 *  isVesting (boolean): false
 *  originStatus (number): original status of stream, 1: "Not Started", 2: "Cancelled", 3: "Completed", 4: "Processing"
 *  status (number): current status of stream, 1: "Not Started", 2: "Cancelled", 3: "Completed", 4: "Processing"
 *  ratePerTime (string): number token stream in one unit time,
 *  recipient (string): wallet address of recipient
 *  sender (string): wallet address of sender
 *  releaseAmount (string): number of total token in stream
 *  releaseFrequency (number): number of time between each release (releaseFrequencyType)
 *  releaseFrequencyType (number): unit of releaseFrequency, 1: second, 2: minute, 3: hour, 4: day, 5: week, 6: month, 7: year
 *  releaseRate (string): token / one unit time
 *  startTime (number): time stream start
 *  stopTime (number): time stream end
 *  streamId (number): id of stream
 *  tokenAbbr (string): abbreviation for token 
 *  tokenDecimal (number): decimal of token
 *  tokenId (string): address of token
 *  tokenLogo (string): Logo of token (URL)
 *  transferPrivilege (number): who can transfer this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither"
 *  trxHash (string): hash of transaction
 *  type (string): type of stream in list (Icoming/Outgoing)
 *  withdrawAmount (string): number of token recipient have withdrawn
 * }>
 * ]>
 */

CalamusInstance.getCalamusIncomingStream("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const incomingList = await CalamusInstance.getCalamusIncomingStream("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36")
```

## Get List Outgoing Streams

```typescript
/**
 * Get Calamus Streams.
 *
 * @param address (string): wallet address (if this is not provided, address of current account on metamask will be used)
 *
 * @return Promise<ListStream[
 * <{
 *  cancelPrivilege (number): who can cancel this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither",
 *  chain (string): chain's name,
 *  contractTitle (string): title of contract 
 *  emailAddress (string): email address of recipient
 *  initialRelease (string): number of initial token recipient will get when withdraw
 *  isVesting (boolean): false
 *  originStatus (number): original status of stream, 1: "Not Started", 2: "Cancelled", 3: "Completed", 4: "Processing"
 *  status (number): current status of stream, 1: "Not Started", 2: "Cancelled", 3: "Completed", 4: "Processing"
 *  ratePerTime (string): number token stream in one unit time
 *  recipient (string): wallet address of recipient
 *  sender (string): wallet address of sender
 *  releaseAmount (string): number of total token in stream
 *  releaseFrequency (number): number of time between each release (releaseFrequencyType)
 *  releaseFrequencyType (number): unit of releaseFrequency, 1: second, 2: minute, 3: hour, 4: day, 5: week, 6: month, 7: year
 *  releaseRate (string): token / one unit time
 *  startTime (number): time stream start
 *  stopTime (number): time stream end
 *  streamId (number): id of stream
 *  tokenAbbr (string): abbreviation for token  
 *  tokenDecimal (number): decimal of token
 *  tokenId (string): address of token
 *  tokenLogo (string): Logo of token (URL)
 *  transferPrivilege (number): who can transfer this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither"
 *  trxHash (string): hash of transaction
 *  type (string): type of stream in list (Icoming/Outgoing)
 *  withdrawAmount (string): number of token recipient have withdrawn
 * }>
 * ]>
 */

CalamusInstance.getCalamusOutgoingStream("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const outGoingList = await CalamusInstance.getCalamusOutgoingStream("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36")
```

## Get Single Stream By ID

```typescript
/**
 * Get Calamus Streams.
 *
 * @param streamID (string): id of stream
 *
 * @return Promise<{
 *  cancelPrivilege (number): who can cancel this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither",
 *  chain (string): chain's name,
 *  contractTitle (string): title of contract 
 *  emailAddress (string): email address of recipient
 *  initialRelease (string): number of initial token recipient will get when withdraw
 *  isVesting (boolean): false
 *  originStatus (number): original status of stream, 1: "Not Started", 2: "Cancelled", 3: "Completed", 4: "Processing"
 *  status (number): current status of stream, 1: "Not Started", 2: "Cancelled", 3: "Completed", 4: "Processing"
 *  ratePerTime (string): number token stream in one unit time,
 *  recipient (string): wallet address of recipient
 *  sender (string): wallet address of sender
 *  releaseAmount (string): number of total token in stream
 *  releaseFrequency (number): number of time between each release (releaseFrequencyType)
 *  releaseFrequencyType (number): unit of releaseFrequency, 1: second, 2: minute, 3: hour, 4: day, 5: week, 6: month, 7: year
 *  releaseRate (string): token / one unit time
 *  startTime (number): time stream start
 *  stopTime (number): time stream end
 *  streamId (number): id of stream
 *  tokenAbbr (string): abbreviation for token  
 *  tokenDecimal (number): decimal of token
 *  tokenId (string): address of token
 *  tokenLogo (string): Logo of token (URL)
 *  transferPrivilege (number): who can transfer this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither"
 *  trxHash (string): hash of transaction
 *  type (string): type of stream in list (Icoming/Outgoing)
 *  withdrawAmount (string): number of token recipient have withdrawn
 * }>
 */
CalamusInstance.getCalamusStreamByID("24")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const stream = await CalamusInstance.getCalamusStreamByID("24")
```

## Withdraw Stream

```typescript
/**
 * Withdraw Stream.
 *
 * @param streamID (string): ID of stream
 * @param amount (string): amount of token user want to withdraw
 * @param withdrawAll (boolean): withdraw all amount or not
 *
 * @return Promise<{
 *  stream_id: id of stream, 
 *  trx_hash: hash of transaction
 * }>
 */
CalamusInstance.withdrawCalamusStream("2", "10", false)
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const result = await CalamusInstance.withdrawCalamusStream("2", "10", false)
```

## Cancel Stream

```typescript
/**
 * Cancel Stream.
 *
 * @param streamID (string): ID of stream
 *
 * @return Promise<{
 *  stream_id: id of stream, 
 *  trx_hash: hash of transaction
 * }>
 */

CalamusInstance.cancelCalamusStream("24")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const result = await CalamusInstance.cancelCalamusStream("24")
```

## Transfer Stream

```typescript
/**
 * Transfer Stream.
 *
 * @param streamID (string): ID of stream
 * @param newRecipient (string): new recipient address
 *
 * @return Promise<{
 *  stream_id: id of stream, 
 *  trx_hash: hash of transaction
 * }>
 */

CalamusInstance.transferCalamusStream("23", "0x9d7d3aD17b87a4845C977eADc789B479e80af0A0")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const result = await CalamusInstance.transferCalamusStream("23", "0x9d7d3aD17b87a4845C977eADc789B479e80af0A0")
```

## Topup Stream

```typescript
/**
 * Topup Stream.
 *
 * @param tokenAddress: address of token want to top up
 * @param streamID (string): ID of stream
 * @param amount (string): amount want to top up
 *
 * @return Promise<{
 *  stream_id: id of stream, 
 *  trx_hash: hash of transaction
 * }>
 */

CalamusInstance.topupCalamusStream("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "26", "10")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const result = await CalamusInstance.topupCalamusStream("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "26", "10")
```

## Get Balance

```typescript
/**
 * Balance of user in stream.
 *
 * @param streamID (string): ID of stream
 * @param address (string): wallet address (if this is not provided, address of current account on metamask will be used)
 *
 * @return Promise<string: balance of stream>
 */

CalamusInstance.balanceOf("15", "0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const result = await CalamusInstance.balanceOf("BNBT", "26", "10")
```

## Get fee of stream

```typescript
/**
 * Balance of user in stream.
 *
 * @param address (string): wallet address (if this not provide, address of current account on metamask will be use)
 * @param tokenAddress (string): address of token
 *
 * @return Promise<string: fee of stream>
 */

CalamusInstance.feeOf("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36", "0x599B507bcfC75C08dF2726Cb6EC533cef74a4E04")
    .then(result => console.log('Result: ', result)).catch(error => console.log('Error: ', error));
```

or use async await function

```typescript
const result = await CalamusInstance.feeOf("0xB775fa6D48ec0e8394bbD6bE52956Bde7e036a36", "0x599B507bcfC75C08dF2726Cb6EC533cef74a4E04")
```