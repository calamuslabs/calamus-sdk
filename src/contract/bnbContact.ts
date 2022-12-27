// @ts-ignore
import Calamus from "../abi/Calamus.json";
import {ChainItem, MainChainInfo, TestChainInfo} from '../data/chain';
import {BigNumber, ethers} from "ethers";
import {CALAMUS_API, CALAMUS_TESTNET_API, erc20TokenContractAbi} from "../data/const";
import {checkMetaMask} from "../metaMaskUtils";
import {calculateReleaseAmount, calculateReleaseFrequency} from "./utils";

const releaseRateMap = new Map([
    [0, "Second(s)"],
    [1, "Minute(s)"],
    [2, "Hour(s)"],
    [3, "Day(s)"],
    [4, "Week(s)"],
    [5, "Month(s)"],
    [6, "Year(s)"],
])

enum StreamStatus {
    NotStarted = 1,
    Cancelled,
    Completed,
    Proccesing
}

export type StreamToRow = {
    contractTitle: string,
    emailAddress: string,
    recipient: string,
    sender: string,
    tokenAbbr: string,
    tokenLogo: string,
    tokenId: string,
    tokenDecimal: number,
    status: StreamStatus,
    originStatus: StreamStatus,
    startTime: number,
    stopTime: number,
    type: string,
    chain: string,
    trxHash?: string,
    withdrawAmount: string,
    releaseAmount: string,
    ratePerTime: string,
    releaseRate: string,
    releaseFrequency: number,
    releaseFrequencyType: number,
    initialRelease: string,
    streamId: number,
    isVesting: boolean,
    transferPrivilege: number,
    cancelPrivilege: number
}

export const bnbLoadContract = async (network: string, test: boolean) => {
    console.log("bnb load contract");

    const {contractAddress} = test ? TestChainInfo[network] : MainChainInfo[network];
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, Calamus.abi, signer);
}

export const convertStream = async (streams: any[], currentAddress: string, chainName: string, isTestNetwork: boolean) => {
    try {
        let convertedStreams: StreamToRow[] = [];
        let streamIds: any[] = [];
        let addressNone = "0x0000000000000000000000000000000000000000"
        let contractDecimals = new Map([[addressNone, 18]]);
        let tokenMap = streams.filter(item => item.tokenAddress !== addressNone).map(item => item.tokenAddress);
        let tokenSet = new Set(tokenMap);
        tokenMap = Array.from(tokenSet.values());
        let promises = [];
        // @ts-ignore
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        if (tokenMap && tokenMap.length) {
            for (let i = 0; i < tokenMap.length; i++) {
                // @ts-ignore
                const tokenContractInstance = new ethers.Contract(tokenMap[i], erc20TokenContractAbi, provider);
                promises.push(tokenContractInstance.decimals());
            }
            const ftDecimals = await Promise.all(promises);
            for (let i = 0; i < tokenMap.length; i++) {
                contractDecimals.set(tokenMap[i], ftDecimals[i])
            }
        }
        let currentTime = Math.floor(new Date().getTime() / 1000);
        streams.forEach(stream => {
            let startTime = parseInt(stream.startTime);
            let stopTime = parseInt(stream.stopTime);

            let startTimeVSNow = currentTime - startTime;
            let stopTimeVSNow = currentTime - stopTime;
            let statusCode = parseInt(stream.status);
            if (statusCode === 1) {
                if (startTimeVSNow < 0) {
                    statusCode = StreamStatus.NotStarted;
                } else if (stopTimeVSNow > 0) {
                    statusCode = StreamStatus.Completed;
                } else {
                    statusCode = StreamStatus.Proccesing;
                }
            }
            let decimal = contractDecimals.get(stream.tokenAddress);
            let convertedRatePerTime = parseFloat(ethers.utils.formatUnits(BigNumber.from(stream.ratePerTime), decimal));
            let convertedReleaseAmount = parseFloat(ethers.utils.formatUnits(BigNumber.from(stream.releaseAmount), decimal));
            let convertedRemainingAmount = parseFloat(ethers.utils.formatUnits(BigNumber.from(stream.remainingBalance), decimal));
            let convertedWithdrawAmount = convertedReleaseAmount - convertedRemainingAmount;
            let convertedVestingRelease = parseFloat(stream.vestingRelease) / 100;
            let streamId = parseInt(stream.id);
            let releaseRate = ` / ${stream.releaseFrequency} ${releaseRateMap.get(parseInt(stream.releaseFrequencyType))}`;
            releaseRate = convertedRatePerTime.toFixed(4) + releaseRate;
            let convertedStream: StreamToRow = {
                contractTitle: "",
                emailAddress: "",
                recipient: stream.recipient,
                sender: stream.sender,
                tokenAbbr: "",
                tokenLogo: "",
                tokenDecimal: 0,
                tokenId: "",
                status: statusCode,
                originStatus: parseInt(stream.status),
                startTime: startTime,
                stopTime: stopTime,
                type: "Outgoing",
                chain: chainName,
                trxHash: "",
                withdrawAmount: convertedWithdrawAmount.toString(),
                releaseAmount: convertedReleaseAmount.toString(),
                ratePerTime: convertedRatePerTime.toString(),
                releaseFrequency: parseInt(stream.releaseFrequency),
                releaseFrequencyType: parseInt(stream.releaseFrequencyType),
                releaseRate: releaseRate,
                initialRelease: convertedVestingRelease.toFixed(2),
                streamId: streamId,
                isVesting: false,
                transferPrivilege: parseInt(stream.transferPrivilege),
                cancelPrivilege: parseInt(stream.cancelPrivilege)
            }

            convertedStreams.push(convertedStream);
            streamIds.push(streamId)
        });

        if (streamIds.length) {
            let recipientsReq = await fetch(`${isTestNetwork ? CALAMUS_TESTNET_API : CALAMUS_API}/api/recipient/get-recipients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stream_ids: streamIds,
                    chain: chainName.toLowerCase()
                })
            });

            let recipientsRes = await recipientsReq.json();
            if (recipientsRes) {
                // Need to check merge here
                for (let i = 0; i < convertedStreams.length; i++) {
                    let recipients = recipientsRes.filter((recipient: { stream_id: any; }) => recipient.stream_id == streamIds[i]);

                    if (recipients.length) {
                        let recipient = recipients[0];
                        let releaseRate = ` ${recipient.token_abbr.toUpperCase()} / ${convertedStreams[i].releaseFrequency} ${releaseRateMap.get(convertedStreams[i].releaseFrequencyType)}`;
                        convertedStreams[i].contractTitle = recipient.contract_title;
                        convertedStreams[i].emailAddress = recipient.email_address;
                        convertedStreams[i].tokenAbbr = recipient.token_abbr;
                        convertedStreams[i].tokenLogo = recipient.token_logo
                        convertedStreams[i].tokenDecimal = recipient.token_decimal;
                        convertedStreams[i].tokenId = recipient.token_id;
                        convertedStreams[i].isVesting = recipient.is_vesting;
                        convertedStreams[i].releaseRate = parseFloat(convertedStreams[i].ratePerTime).toFixed(2) + releaseRate;
                        convertedStreams[i].chain = recipient.chain;
                        convertedStreams[i].trxHash = recipient.trx_hash ? recipient.trx_hash : "";
                    }
                }
            }
        }
        return convertedStreams.sort((streamA, streamB) => (streamB.streamId - streamA.streamId));
    } catch (e) {
        console.log(e)
        return [];
    }
}

export const checkSigner = async (chain: string, test: boolean) => {
    let connectedMetamask = await checkMetaMask(chain, test);
    if (!connectedMetamask) {
        return null;
    }
    let account = null;
    // @ts-ignore
    const ethereum = window.ethereum;
    // @ts-ignore
    const allAccounts = await ethereum.request({method: 'eth_accounts'});
    if (allAccounts && allAccounts.length) {
        console.log('Success!', 'Wallet Connected!', 'success', 'account: ', allAccounts[0]);
        account = allAccounts[0];
    }
    return account;
}

export const getBalanceOf = async (account: any, calamusContract: any, streamId: string) => {
    if (!account) {
        return false;
    }
    const balance = await calamusContract.balanceOf(streamId, account);
    return balance.toString();
}

export const getFeeOf = async (account: any, calamusContract: any, tokenAddress: string) => {
    if (!account) {
        return false;
    }
    const fee = await calamusContract.feeOf(account, tokenAddress)
    return fee.toString();
}

export const createStream = async (account: any,
                                   calamusContract: any,
                                   releaseAmount: number,
                                   recipient: string,
                                   startTime: number,
                                   stopTime: number,
                                   initialRelease: number,
                                   releaseFrequency: number,
                                   releaseFrequencyType: number,
                                   transferPrivilege: number,
                                   cancelPrivilege: number,
                                   tokenAddress: string,
                                   networkInfo: ChainItem) => {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tokenContractInstance = new ethers.Contract(tokenAddress, erc20TokenContractAbi, signer);
    let fee = await getFeeOf(account, calamusContract, tokenAddress);
    fee = ethers.BigNumber.from(fee);
    let frequencyInSeconds = calculateReleaseFrequency(releaseFrequency, releaseFrequencyType)
    let correctAmount = calculateReleaseAmount(releaseFrequency, releaseFrequencyType, startTime, stopTime, releaseAmount, networkInfo.nativeCurrency.decimals, fee);

    if (tokenAddress !== networkInfo.contractAddress) {
        let approveRequest = await tokenContractInstance.approve(
            networkInfo.contractAddress,
            correctAmount
        );
        await approveRequest.wait();

        let createStreamRequest = await calamusContract.createStream(
            correctAmount,
            recipient,
            startTime,
            stopTime,
            initialRelease,
            frequencyInSeconds,
            transferPrivilege,
            cancelPrivilege,
            tokenAddress
        );

        let result = await createStreamRequest.wait();
        let createStreamEvent = result.events[0];
        return {stream_id: createStreamEvent.args.streamId.toString(), trx_hash: createStreamEvent.transactionHash}
    } else {
        console.log('a',correctAmount,
            recipient,
            startTime,
            stopTime,
            initialRelease,
            releaseFrequency,
            transferPrivilege,
            cancelPrivilege,
            tokenAddress,
            {value: correctAmount})
        let createStreamRequest = await calamusContract.createStream(
            correctAmount,
            recipient,
            startTime,
            stopTime,
            initialRelease,
            releaseFrequency,
            transferPrivilege,
            cancelPrivilege,
            tokenAddress,
            {value: correctAmount}
        );
        let result = await createStreamRequest.wait();
        let createStreamEvent = result.events[0];
        return {stream_id: createStreamEvent.args.streamId.toString(), trx_hash: createStreamEvent.transactionHash}
    }
};

export const withdrawFromStream = async (account: any, calamusContract: any, streamID: string, withdrawAmount: ethers.BigNumber) => {
    if (!account) {
        return false;
    }
    const withdrawRequest = await calamusContract.withdrawFromStream(streamID, withdrawAmount);
    const withdrawResponse = await withdrawRequest.wait();
    if (withdrawResponse.events && withdrawResponse.events.length) {
        let result = withdrawResponse.events[0];
        withdrawResponse.events.map((event: any) => {
            if (event.args && streamID === event.args.streamId) {
                result = {stream_id: event.args.streamId.toString(), trx_hash: event.transactionHash}
            }
        })
        return result;
    }
}

export const cancelStream = async (account: any, calamusContract: any, streamID: string) => {
    if (!account) {
        return false;
    }
    const cancelRequest = await calamusContract.cancelStream(streamID);
    const cancelResponse = await cancelRequest.wait();
    if (cancelResponse.events && cancelResponse.events.length) {
        let result = cancelResponse.events[0];
        cancelResponse.events.map((event: any) => {
            if (event.args && streamID === event.args.streamId.toString()) {
                result = {stream_id: event.args.streamId.toString(), trx_hash: event.transactionHash}
            }
        })
        return result;
    }
}

export const transferStream = async (account: any, calamusContract: any, streamID: string, contractAddress: string, newRecipient: string) => {
    if (!account) {
        return false;
    }
    const transferRequest = await calamusContract.transferStream(streamID, newRecipient);
    const transferResponse = await transferRequest.wait();
    if (transferResponse.events && transferResponse.events.length) {
        let result = transferResponse.events[0];
        transferResponse.events.map((event: any) => {
            if (event.args && streamID === event.args.streamId.toString()) {
                result = {stream_id: event.args.streamId.toString(), trx_hash: event.transactionHash}
            }
        })
        return result;
    }
}

export const topupStream = async (account: any, calamusContract: any, streamID: string, tokenAddress: string, networkInfo: ChainItem, amount: ethers.BigNumber) => {
    if (!account) {
        return false;
    }
    if (tokenAddress !== networkInfo.contractAddress) {
        // @ts-ignore
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContractInstance = new ethers.Contract(tokenAddress, erc20TokenContractAbi, signer);
        let approveRequest = await tokenContractInstance.approve(
            networkInfo.contractAddress,
            amount
        );
        await approveRequest.wait();
        const topupReqquest = await calamusContract.topupStream(
            streamID,
            amount
        );
        const topupResponse = await topupReqquest.wait();
        if (topupResponse.events && topupResponse.events.length) {
            let result = topupResponse.events[0];
            topupResponse.events.map((event: any) => {
                if (event.args && streamID === event.args.streamId.toString()) {
                    result = {stream_id: event.args.streamId.toString(), trx_hash: event.transactionHash}
                }
            })
            return result;
        }
    } else {
        const topupRequest = await calamusContract.topupStream(
            streamID,
            amount,
            {value: amount}
        );
        const topupResponse = await topupRequest.wait();
        if (topupResponse.events && topupResponse.events.length) {
            let result = topupResponse.events[0];
            topupResponse.events.map((event: any) => {
                if (event.args && streamID === event.args.streamId.toString()) {
                    result = {stream_id: event.args.streamId.toString(), trx_hash: event.transactionHash}
                }
            })
            return result;
        }
    }
}



