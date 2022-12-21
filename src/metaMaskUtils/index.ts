import detectEthereumProvider from '@metamask/detect-provider';
import {MainChainInfo, TestChainInfo} from "../data/chain"
import {ethers} from "ethers";
const getNetworkId = async () => {
    if (typeof window !== "undefined") {
        // @ts-ignore
        return await window.ethereum.request({method: 'eth_chainId'});
    }
};
const addChainToMetamask = async (chain: string, test: boolean) => {
    try {
        const chainSettings = test ? TestChainInfo[chain] : MainChainInfo[chain];
        if (typeof window !== "undefined") {
            // @ts-ignore
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: ethers.utils.hexlify(chainSettings.id),
                        chainName: chainSettings.name,
                        rpcUrls: [chainSettings.rpcUrl],
                        nativeCurrency: chainSettings.nativeCurrency,
                        blockExplorerUrls: [chainSettings.blockExplorerUrl]
                    },
                ],
            });
            return true;
        }
    } catch (e) {
        console.error("Could not add or reject to connect", e)
        return false;
    }
};

const switchNetwork = async (chain: string, test: boolean) => {
    const currentChainId = await getNetworkId();
    const chainId = test ? TestChainInfo[chain].id : MainChainInfo[chain].id;
    if (currentChainId !== chainId) {
        try {
            if (typeof window !== "undefined") {
                // @ts-ignore
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{chainId: ethers.utils.hexlify(chainId)}],
                });
                return true;
            }
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            // @ts-ignore
            if (switchError.code === 4902) {
                return addChainToMetamask(chain, test);
            }
            return false;
        }
    }
    return true;
};

export const checkMetaMask = async (chain: string, test: boolean) => {
    if (typeof window !== "undefined") {
        const provider = await detectEthereumProvider();
        if (provider) {
            return switchNetwork(chain, test);
        } else {
            console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
            return false;
        }
    } else {
        return false;
    }
}

