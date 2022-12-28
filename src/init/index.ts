import {
    bnbLoadContract, convertStream, StreamToRow, cancelStream,
    checkSigner,
    getBalanceOf,
    withdrawFromStream,
    transferStream,
    createStream,
    topupStream,
    getFeeOf
} from "../contract/bnbContact";
import {ChainItem, MainChainInfo, TestChainInfo} from "../data/chain"
import {ethers} from "ethers";

declare type CreateStreamProps = {
    releaseAmount: number, // number token recipient can get
    recipient: string,
    startTime: number,
    stopTime: number,
    initialRelease: number, // initial token recipient can get when withdraw ( percent )
    releaseFrequency: number, // number token release in every second
    releaseFrequencyType: number, // type of frequency
    transferPrivilege: number // who can transfer this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither"
    cancelPrivilege: number // who can cancel this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither",
    tokenAddress: string // token want to stream,
    contractTitle: string;
    emailAddress: string;
};

declare type Token = { chainID: number, address: string, abbr: string, logo: string, decimal: number };

export class Calamus {
    network: string;
    isTestNetwork: boolean;
    token: Token = {chainID: 0, address: "", abbr: "", logo: "", decimal: 0};
    networkInfo: ChainItem;
    covanlentKey: string;

    /**
     * Initial variable for stream.
     *
     * @param chain - Name of the chain will stream
     * @param isTestNetwork - true/false: is test network or not
     * @param covalentKey - string: key get from covalent kpi
     *
     */
    constructor(chain: string, isTestNetwork: boolean, covalentKey: string) {
        this.network = chain;
        this.isTestNetwork = isTestNetwork;
        this.networkInfo = isTestNetwork ? TestChainInfo[chain] : MainChainInfo[chain];
        this.token.chainID = isTestNetwork ? TestChainInfo[chain].id : MainChainInfo[chain].id;
        this.covanlentKey = covalentKey;
    }

    /**
     * Create Calamus Stream.
     *
     * @param releaseAmount: number token recipient can get
     * @param recipient: address of recipient,
     * @param startTime: stream will start at,
     * @param stopTime: stream will end at,
     * @param initialRelease:  initial token recipient can get when withdraw ( percent )
     * @param releaseFrequency:  number of time between each release (releaseFrequencyType)
     * @param releaseFrequencyType: unit of releaseFrequency, 1: second, 2: minute, 3: hour, 4: day, 5: week, 6: month, 7: year
     * @param transferPrivilege: who can transfer this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither"
     * @param cancelPrivilege: who can cancel this stream, 0: "Only Recipient",1: "Only Sender",2: "Both",3: "Neither",
     * @param contractTitle: title of the contract
     * @param emailAddress: email will be notified when stream change
     * @param tokenAddress: address of token want to stream
     *
     * @return Promise<Event>
     */
    async createCalamusStream({
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
                              }: CreateStreamProps): Promise<unknown> {
        const account = await checkSigner(this.network, this.isTestNetwork);
        if (!account) {
            console.log('No Account found on metamask');
            return false;
        }
        const tokenInfo = await fetch(`https://api.covalenthq.com/v1/${this.token.chainID}/address/${account}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=false&key=${this.covanlentKey}`);
        const tokenInfoJson = await tokenInfo.json();
        let tokens = tokenInfoJson.data.items;
        let token = {
            chainId: this.token.chainID,
            amount: "",
            balance: "",
            name: "",
            abbr: "",
            decimal: "",
            address: "",
            logo: ""
        }
        const chainsInfo = this.isTestNetwork ? TestChainInfo : MainChainInfo;
        if (tokens && tokens.length) {
            for (let i = 0; i < tokens.length; i++) {
                if (tokenAddress === tokens[i]["contract_address"]) {
                    let updateTokenAddress = tokens[i]["contract_address"];
                    if (tokens[i]["contract_ticker_symbol"] === "PHOTON") {
                        updateTokenAddress = chainsInfo["evmos"].contractAddress;
                    }
                    if (tokens[i]["contract_ticker_symbol"] === "BNBT") {
                        updateTokenAddress = chainsInfo["bnb"].contractAddress;
                    }
                    if (tokens[i]["contract_ticker_symbol"] === "BNB") {
                        updateTokenAddress = chainsInfo["bnb"].contractAddress;
                    }
                    if (tokens[i]["contract_ticker_symbol"] === "MATIC") {
                        updateTokenAddress = chainsInfo["polygon"].contractAddress;
                    }
                    token = {
                        chainId: this.token.chainID,
                        amount: tokens[i]["quote"],
                        balance: tokens[i]["balance"],
                        name: tokens[i]["contract_name"],
                        abbr: tokens[i]["contract_ticker_symbol"],
                        decimal: tokens[i]["contract_decimals"],
                        address: updateTokenAddress,
                        logo: tokens[i]["logo_url"]
                    }
                }
            }
        }

        const calamusContract = await bnbLoadContract(this.network, this.isTestNetwork);
        try {
            return await createStream(account,
                calamusContract,
                releaseAmount,
                recipient,
                startTime,
                stopTime,
                initialRelease,
                releaseFrequency,
                releaseFrequencyType,
                transferPrivilege,
                cancelPrivilege,
                token.address,
                this.networkInfo)
        } catch (e) {
            console.error('Error when create Calamus stream:', e);
            return {error: true, message: e};
        }
    };


    /**
     * Get Calamus Streams.
     *
     * @param address: wallet address
     *
     * @return Promise<ListStream[]>
     */
    async getCalamusIncomingStream(address?: string): Promise<StreamToRow[]> {
        const account = await checkSigner(this.network, this.isTestNetwork);
        if (!address) {
            address = account;
        }
        if (address) {
            const ownStreams = await fetch(this.networkInfo.subgraphUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        query GetRecipientStreams($recipient: String!) {
                            streams(where: {recipient: $recipient}) {
                                id
                                sender
                                releaseAmount
                                remainingBalance
                                startTime
                                stopTime
                                vestingRelease
                                ratePerTime
                                releaseFrequency
                                releaseFrequencyType
                                transferPrivilege
                                cancelPrivilege
                                recipient
                                tokenAddress
                                status
                            }
                        }
                    `,
                    variables: {
                        recipient: address,
                    },
                }),
            })

            const ownStreamsJson = await ownStreams.json();
            return await convertStream(ownStreamsJson.data.streams, address, this.network, this.isTestNetwork);
        } else return [];
    };

    /**
     * Get Calamus Streams.
     *
     * @param address: wallet address
     *
     * @return Promise<ListStream[]>
     */
    async getCalamusOutgoingStream(address?: string): Promise<StreamToRow[]> {
        const account = await checkSigner(this.network, this.isTestNetwork);
        if (!address) {
            address = account;
        }
        if (address) {
            const ownStreams = await fetch(this.networkInfo.subgraphUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        query GetOwnerStreams($owner: String!) {
                            streams(where: {sender: $owner}) {
                                id
                                sender
                                releaseAmount
                                remainingBalance
                                startTime
                                stopTime
                                vestingRelease
                                ratePerTime
                                releaseFrequency
                                releaseFrequencyType
                                transferPrivilege
                                cancelPrivilege
                                recipient
                                tokenAddress
                                status
                            }
                        }
                    `,
                    variables: {
                        owner: address,
                    },
                }),
            })

            const ownStreamsJson = await ownStreams.json();
            return await convertStream(ownStreamsJson.data.streams, address, this.network, this.isTestNetwork);
        } else return [];
    };

    /**
     * Get Calamus Streams.
     *
     * @param streamID: id of stream
     *
     * @return Promise<ListStream[]>
     */
    async getCalamusStreamByID(streamID: string): Promise<StreamToRow> {
        const account = await checkSigner(this.network, this.isTestNetwork);
        const ownStreams = await fetch(this.networkInfo.subgraphUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                        query GetStream($id: String!) {
                            stream(id: $id) {
                                id
                                sender
                                releaseAmount
                                remainingBalance
                                startTime
                                stopTime
                                vestingRelease
                                ratePerTime
                                releaseFrequency
                                releaseFrequencyType
                                transferPrivilege
                                cancelPrivilege
                                recipient
                                tokenAddress
                                status
                            }
                        }
                    `,
                variables: {
                    id: streamID,
                },
            }),
        })
        const ownStreamsJson = await ownStreams.json();
        const streamsConverted = await convertStream([ownStreamsJson.data.stream], account, this.network, this.isTestNetwork);
        return streamsConverted[0];
    };

    /**
     * Withdraw Stream.
     *
     * @param streamID: ID of stream
     * @param amount: amount token user want to withdraw
     * @param withdrawAll: withdraw all amount or not
     *
     * @return Promise<Event>
     */
    async withdrawCalamusStream(streamID: string, amount: string, withdrawAll: boolean): Promise<any> {
        const account = await checkSigner(this.network, this.isTestNetwork);
        const calamusContract = await bnbLoadContract(this.network, this.isTestNetwork);
        let balance = await getBalanceOf(account, calamusContract, streamID);
        balance = ethers.BigNumber.from(balance);
        let withdrawAmount = amount ? amount : "0";
        let convertedWithDrawAmount = ethers.utils.parseUnits(withdrawAmount, this.networkInfo.nativeCurrency.decimals);
        if (withdrawAll && convertedWithDrawAmount.lte(0)) {
            return {
                result: false,
                type: "withdraw",
                message: "Please enter amount greater than 0"
            }
        }
        if (withdrawAll && balance.gt(0)) {
            return await withdrawFromStream(account, calamusContract, streamID, balance);
        } else if (balance.gt(0) && balance.gte(convertedWithDrawAmount)) {
            return await withdrawFromStream(account, calamusContract, streamID, convertedWithDrawAmount);
        } else {
            return {
                result: false,
                type: "withdraw",
                message: "Balance is not enough to withdraw"
            }
        }
    };

    /**
     * Cancel Stream.
     *
     * @param streamID: ID of stream
     *
     * @return Promise<Event>
     */
    async cancelCalamusStream(streamID: string): Promise<any> {
        let account = await checkSigner(this.network, this.isTestNetwork);
        const calamusContract = await bnbLoadContract(this.network, this.isTestNetwork);
        if (!account) {
            console.log('No Account found on metamask');
            return false;
        }
        try {
            return await cancelStream(account, calamusContract, streamID);
        } catch (e) {
            console.log('Error when cancel stream', e);
            return {error: true, message: e}
        }

    };

    /**
     * Transfer Stream.
     *
     * @param streamID: ID of stream
     * @param newRecipient: new recipient address
     *
     * @return Promise<Event>
     */
    async transferCalamusStream(streamID: string, newRecipient: string): Promise<any> {
        let account = await checkSigner(this.network, this.isTestNetwork);
        const calamusContract = await bnbLoadContract(this.network, this.isTestNetwork);
        if (!account) {
            console.log('No Account found on metamask');
            return false;
        }
        try {
            return await transferStream(account, calamusContract, streamID, this.networkInfo.contractAddress, newRecipient);
        } catch (e) {
            console.log('Error when transfer stream', e);
            return {error: true, message: e}
        }
    };

    /**
     * Topup Stream.
     *
     * @param streamID: ID of stream
     * @param tokenAddress: address of token want to top up
     * @param amount: amount want to top up
     *
     * @return Promise<Event>
     */
    async topupCalamusStream(tokenAddress: string, streamID: string, amount: string): Promise<any> {
        let account = await checkSigner(this.network, this.isTestNetwork);
        const calamusContract = await bnbLoadContract(this.network, this.isTestNetwork);
        if (!account) {
            console.log('No Account found on metamask');
            return false;
        }
        const tokenInfo = await fetch(`https://api.covalenthq.com/v1/${this.token.chainID}/address/${account}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=false&key=${this.covanlentKey}`);
        const tokenInfoJson = await tokenInfo.json();
        let tokens = tokenInfoJson.data.items;
        let token = {
            chainId: this.token.chainID,
            amount: "",
            balance: "",
            name: "",
            abbr: "",
            decimal: "",
            address: "",
            logo: ""
        }
        const chainsInfo = this.isTestNetwork ? TestChainInfo : MainChainInfo;
        if (tokens && tokens.length) {
            for (let i = 0; i < tokens.length; i++) {
                if (tokenAddress === tokens[i]["contract_address"]) {
                    let updateTokenAddress = tokens[i]["contract_address"];
                    if (tokens[i]["contract_ticker_symbol"] === "PHOTON") {
                        updateTokenAddress = chainsInfo["evmos"].contractAddress;
                    }
                    if (tokens[i]["contract_ticker_symbol"] === "BNBT") {
                        updateTokenAddress = chainsInfo["bnb"].contractAddress;
                    }
                    if (tokens[i]["contract_ticker_symbol"] === "BNB") {
                        updateTokenAddress = chainsInfo["bnb"].contractAddress;
                    }
                    if (tokens[i]["contract_ticker_symbol"] === "MATIC") {
                        updateTokenAddress = chainsInfo["polygon"].contractAddress;
                    }
                    token = {
                        chainId: this.token.chainID,
                        amount: tokens[i]["quote"],
                        balance: tokens[i]["balance"],
                        name: tokens[i]["contract_name"],
                        abbr: tokens[i]["contract_ticker_symbol"],
                        decimal: tokens[i]["contract_decimals"],
                        address: updateTokenAddress,
                        logo: tokens[i]["logo_url"]
                    }
                }
            }
        }
        try {
            const amountBigNumber = ethers.BigNumber.from(amount);
            return await topupStream(account, calamusContract, streamID, token.address, this.networkInfo, amountBigNumber);
        } catch (e) {
            console.error('Error when Topup Calamus stream:', e);
            return {error: true, message: e}
        }
    };

    /**
     * Balance of user in stream.
     *
     * @param streamID (string): ID of stream
     * @param address (string): wallet address (if this not provide, address of current account on metamask will be use)
     *
     * @return Promise<string>
     */
    async balanceOf(streamID: string, address?: string): Promise<any> {
        if (!address) {
            address = await checkSigner(this.network, this.isTestNetwork);
        }
        const calamusContract = await bnbLoadContract(this.network, this.isTestNetwork);
        try {
            return await getBalanceOf(address, calamusContract, streamID);
        } catch (error) {
            console.log('Error when get balance of user in stream: ', error)
            return {error: true, message: error}
        }
    }

    /**
     * Fee of account or token
     *
     * @param address (string): wallet address (if this not provide, address of current account on metamask will be use)
     * @param tokenAddress (string): address of token
     *
     * @return Promise<string>
     */
    // @ts-ignore
    async feeOf(address?: string, tokenAddress: string): Promise<any> {
        if (!address) {
            address = await checkSigner(this.network, this.isTestNetwork);
        }
        const calamusContract = await bnbLoadContract(this.network, this.isTestNetwork);
        try {
            return await getFeeOf(address, calamusContract, tokenAddress);
        } catch (error) {
            console.log('Error when get balance of user in stream: ', error)
            return {error: true, message: error}
        }
    }

}