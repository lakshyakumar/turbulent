import useWeb3Modal from './useWeb3Modal';

function useContract(contractAddress: any, contractABI: any) {
    const { web3 } = useWeb3Modal();
    if (!web3) return null;
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    return contract;
}

export default useContract;
