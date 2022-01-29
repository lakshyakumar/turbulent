import { useEffect, useRef } from 'react';
import web3 from 'web3';
import Web3Modal from 'web3modal';
import { createGlobalState } from 'react-use';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface Props {
    connected: boolean;
    connect?(): Promise<unknown>;
    disconnect?(): Promise<void>;
    sendTransaction(tx: any): Promise<unknown> | undefined;
    createTransaction(from: string, to: string, value: string): any;
    web3?: any;
    provider?: any;
    address?: string | null;
    chainId?: number | null;
    networkId?: number | null;
    balance?: string;
    modal?: any;
}

const sharedState = createGlobalState<Props>({
    connected: false,
    sendTransaction: () => undefined,
    createTransaction: () => undefined
});

function useWeb3Modal(): Props {
    const [state, setState] = sharedState();
    const web3Ref = useRef<any>();
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                infuraId: '08c624bf743a4f67918ae51104ca5e63' // required
            }
        }
    };

    const initWeb3 = (provider: any) => {
        const web3: any = new Web3(provider);
        web3.eth.extend({
            methods: [
                {
                    name: 'chainId',
                    call: 'eth_chainId',
                    outputFormatter: web3.utils.hexToNumber
                }
            ]
        });
        return web3;
    };

    const getAccountBalance = async () => {
        if (!web3Ref.current) return;
        const [account] = await web3Ref.current.eth.getAccounts();
        if (account) {
            const balance = await web3Ref.current.eth.getBalance(account);
            setState((prev: Props) => ({
                ...prev,
                balance: Web3.utils.fromWei(balance)
            }));
        }
    };

    const subscribeProvider = async (provider: any) => {
        if (!provider.on) {
            return;
        }
        provider.on('close', () => {
            setState((prev: Props) => ({
                ...prev,
                connected: false
            }));
        });
        provider.on('accountsChanged', async (accounts: string[]) => {
            setState((prev: Props) => ({
                ...prev,
                address: accounts[0]
            }));
            getAccountBalance();
        });
        provider.on('chainChanged', async (chain: number) => {
            if (!web3Ref.current) return;
            const network = await web3Ref.current.eth.net.getId();
            setState((previous: Props) => ({
                ...previous,
                chainId: Number(chain),
                networkId: network
            }));
            getAccountBalance();
        });
    };

    const disconnect = async () => {
        if (state.provider && state.modal) {
            await state.modal.clearCachedProvider();
            setState((prev: Props) => ({
                ...prev,
                proivider: undefined,
                connected: false
            }));
        }
    };

    const onConnect = async () => {
        const provider = await state.modal.connect();
        await subscribeProvider(provider);
        const web3 = initWeb3(provider);
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        const net = await web3.eth.net.getId();
        const chain = await web3.eth.chainId();
        const balance = await web3.eth.getBalance(address);
        web3Ref.current = web3;
        setState((prev) => ({
            ...prev,
            connected: true,
            provider,
            web3,
            address,
            networkId: net,
            chainId: Number(chain),
            balance: web3.utils.fromWei(balance)
        }));
    };

    const createTransaction = (from: string, to: string, value: string) => {
        return {
            from,
            to,
            value: web3.utils.toWei(value ? Number(value).toFixed(18) : '0', 'ether')
        };
    };

    const sendTransaction = (_tx: any) => {
        if (!web3Ref.current) return;
        return new Promise((res, rej) => {
            web3Ref.current.eth
                .sendTransaction(_tx)
                .once('transactionHash', (txHash: string) => res(txHash))
                .catch((err: any) => rej(err));
        });
    };

    useEffect(() => {
        if (state.modal) {
            if (state.modal.cachedProvider) {
                onConnect();
            }
        } else {
            const web3Modal = new Web3Modal({
                cacheProvider: true,
                providerOptions
            });
            setState((prev) => ({
                ...prev,
                modal: web3Modal
            }));
        }
    }, [state.modal]);

    return {
        connected: state.connected,
        sendTransaction,
        createTransaction,
        balance: state.balance,
        address: state.address,
        connect: onConnect,
        web3: state.web3,
        provider: state.provider,
        chainId: state.chainId,
        networkId: state.networkId,
        disconnect: disconnect
    };
}

export default useWeb3Modal;
