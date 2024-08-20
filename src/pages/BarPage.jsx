import  { useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const BarPage = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Connect to the WebSocket server
  const { sendMessage, lastMessage, readyState } = useWebSocket(`${import.meta.env.VITE_WS_API_URL}?tableNum=1`, {
    onOpen: () => console.log('Connected to WebSocket'),
    onClose: () => console.log('WebSocket connection closed'),
    onError: (event) => console.error('WebSocket error:', event),
    onMessage: (event) => {
      const messageData = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    },
    shouldReconnect: (closeEvent) => true, // Automatically reconnect on close
  });

  // Handle the send message button click
  const handleClickSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(JSON.stringify({ type: 'chat', message: inputMessage }));
      setInputMessage(''); // Clear input after sending
    }
  };

  // WebSocket connection status
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
        {messages.map((message, index) => <div key={index}>
            
        </div>)}
        <button onClick={() => sendMessage(JSON.stringify({ type: "newOrder", payload: {
            user: "66ba503049336701f9a6076e",
            menuItems: [
                {
                    product: "66c3a97ad1dfc60cb9b3a4b2",
                    quantity: 1
                }
            ]
        } }))}>Send Message</button>
    </div>
  );
};

export default BarPage;