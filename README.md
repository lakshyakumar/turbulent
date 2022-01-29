# Turbulent

`turbulent` is a `React.js`/`Next.js` hook library for blockchain interface, it is a wrapper around `web3Modal` library to provide a shared gloabl hook for sharing the connection status, addresses, providers and much more.

## Installation

Use the package manager [npm](https://docs.npmjs.com/try-the-latest-stable-version-of-npm) to install `turbulent`.

```bash
npm install turbulent
```

## Usage

```javascript
# Importing the hooks
import { web3Modal, useContract } from 'turbulent';

# Extracting the features from the 'useWeb3Modal' hook
const { connect, connected, address, balance, chainId } = useWeb3Modal();

# Use 'connect' function
<button onClick={connect}> Connect </button>

# use 'useContract' hook to call methods from the contract
const Contract = useContract(contractAddress, contractABI);
const balance = await Contract.methods.balanceOf(address).call();
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)