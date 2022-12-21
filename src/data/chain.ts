export declare type ChainItem = {
    id: number,
    contractAddress: string,
    wssAddress: string,
    name: string,
    rpcUrl: string,
    nativeCurrency: {
        name: string,
        symbol: string,
        decimals: number
    },
    blockExplorerUrl: string,
    subgraphUrl: string;
};

type Chain = {
    [key: string]: ChainItem
};

export const MainChainInfo: Chain = {
    'bnb': {
        id: 56,
        contractAddress: "0x39A7545D5043be7E1C170925c41494383Dd7f5b1",
        wssAddress: "https://bsc-dataseed1.binance.org",
        name: "Bnb Mainnet",
        rpcUrl: "https://bsc-dataseed.binance.org/",
        nativeCurrency: {
            name: "Binance Coin",
            symbol: "BNB",
            decimals: 18
        },
        blockExplorerUrl: "https://bscscan.com",
        subgraphUrl: "https://api.thegraph.com/subgraphs/name/nghiattbss/calamus-bsc"
    }
};

export const TestChainInfo: Chain = {
    'bnb': {
        id: 97,
        contractAddress: "0x599B507bcfC75C08dF2726Cb6EC533cef74a4E04",
        wssAddress: "https://data-seed-prebsc-1-s3.binance.org:8545",
        name: "Bnb Testnet",
        rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        nativeCurrency: {
            name: "Binance Test Coin",
            symbol: "tBNB",
            decimals: 18
        },
        blockExplorerUrl: "https://testnet.bscscan.com",
        subgraphUrl: "https://api-bnb.calamus.finance/subgraphs/name/calamus-chapel"
    }
};

