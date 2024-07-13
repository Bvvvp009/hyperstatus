# My GraphQL Package

This package allows you to query status of hyperlane messages with user-provided parameters.

## Installation

```bash
npm install @bvvvp009/hyperstatus

```

## Usage 

```javascript

import { queryGraphQL } from '@bvvvp009/hyperstatus';


const POLLING_INTERVAL_MS = 5000; // Polling interval in milliseconds
const TIMEOUT_MS = 300000; // Timeout after 5 minutes

const checkDeliveryStatus = async (params) => {
  let timeoutId;

  const poll = async () => {
    try {
      const result = await queryGraphQL(params);
    
      if (result && result.length > 0 && result[0].is_delivered) {
        
        clearInterval(pollingId);
        clearTimeout(timeoutId);
        console.log('Message delivered:', result);
      } else {
        console.log ('Message not delivered yet, polling again...');
      }
    } catch (error) {
      console.error('Error during polling:', error);
      clearInterval(pollingId);
      clearTimeout(timeoutId);
      console.log ('Error during polling:', error)
    }
  };

  const pollingId = setInterval(poll, POLLING_INTERVAL_MS);

  timeoutId = setTimeout(() => {
    console.error('Polling timed out.');
    clearInterval(pollingId);
  }, TIMEOUT_MS);
};

// Example usage
export async function checkStatus(hash_id){
  const params = {
    search: hash_id
  };
  await checkDeliveryStatus(params);
}

//Example Import checkDeliveryStatus() accepted parameters originchain Tx Hash, Message ID, destination Tx Hash

checkStatus("0x533e82d9c9748f505173694aade070b3a2128c3984db9be590ed7a2b4967188a") 

```

### Build and publish the package

1. **Build the package**: Run `npm run build` to compile the TypeScript code.
2. **Publish the package**: Run `npm publish` to publish your package to npm.

With this setup, users can import your package, pass their own parameters, and use the provided functionality.
