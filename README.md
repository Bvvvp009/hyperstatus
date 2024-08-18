# @bvvvp009/hyperstatus

A package to query the status of Hyperlane messages with user-provided parameters.

## Installation

```bash
npm install @bvvvp009/hyperstatus

```

# Usage 

## Example 1: Normal Use


### QueryGraphQL

``` typescript

import { queryGraphQL } from '@bvvvp009/hyperstatus';

const fetchMessages = async () => {
  const params = { search: '0x1234...' };
  const messages = await queryGraphQL(params);
  console.log(messages);
};

fetchMessages();

```

### startPolling

```typescript

import { startPolling } from '@bvvvp009/hyperstatus';

const pendingMessageIds = ['0x123...', '0x456...']; //tx hash from the 

const handleMessages = (messages) => {
  messages.forEach(message => {
    console.log(`Message ${message.id} status: ${message.status}`);
  });
};

// Start polling every 60 seconds
startPolling(pendingMessageIds, 60000, handleMessages);

```

## Example 2: With React and React-Toastify

``` typescript

import React, { useState, useEffect } from 'react';
import { queryGraphQL, startPolling } from '@bvvvp009/hyperstatus';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function App() {


queryGraphQL({ search:'0xbf28e675bcc8fd109cb4162d1581c27d171bae36d762635a6e5dc8533b232d89' }).then(initialResults => {
// setresult(initialResults)
  // Start polling for pending messages
  console.log('initials results',initialResults)
  const pendingMessageIds = initialResults
    .filter(msg => msg.status === 'Pending' && !msg.isNonEVM)
    .map(msg => msg.id);
console.log("pending",pendingMessageIds)
  startPolling(pendingMessageIds,40000, (updatedMessages) => {
    console.log('Updated messages:', updatedMessages);
    // Handle updated messages (e.g., update UI, show notifications, etc.)

    const Msg = ({ closeToast, toastProps }) => (
      <div>
       <div>Message status {updatedMessages[0]?.status}</div> 
       <div>From:{updatedMessages[0]?.from || 'Unknown Chain'}</div>
       <div>To:{updatedMessages[0]?.to || 'Unknown Chain'}</div>
        
      </div>
    );
  toast(<Msg/>,{toastId:updatedMessages[0]?.details?.msg_id})
   
  });
});


  return (
   <div>
     
   <ToastContainer limit={3}/>
   </div>
  );
}

export default App;

```



### API
queryGraphQL(params: any): Promise<any[]>
Queries the GraphQL API with the provided parameters and returns an array of message objects.

checkPendingMessages(pendingMessageIds: string[]): Promise<any[]>
Checks the status of the pending messages and returns an array of updated message objects.

startPolling(pendingMessageIds: string[], interval: number, callback?: (messages: any[]) => void)
Starts polling for the status of the pending messages at the specified interval and calls the callback function with the updated messages.

