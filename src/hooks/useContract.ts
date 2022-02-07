import { useWeb3Modal } from './useWeb3Modal';

export function useContract(contractAddress: any, contractABI: any, key: string) {
    const { web3 } = useWeb3Modal(key);
    if (!web3) return null;
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    return contract;
}
