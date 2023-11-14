import React, { useMemo, useState } from 'react';
import { gql, useMutation, useSubscription } from '@apollo/client';

const MESSAGE = gql(/* GraphQL */ `
  mutation SendMessage($message: String, $time: String, $clientId: String, $roomId: String) {
    sendMessage(message: $message, time: $time, clientId: $clientId, roomId: $roomId) {
      time
      message
      clientId
    }
  }
`);

const SUBSCRIBE = gql(/* GraphQL */ `
  subscription Subscription($roomId: String) {
    message(roomId: $roomId) {
      time
      clientId
      message
    }
  }
`)

interface IMessage {
  message: string;
  time: string;
  clientId: string
}

const YourComponent = () => {

  // Initialize state for the target room
  const [targetRoom, setTargetRoom] = useState<string|null>(null);

  // Generate a unique ID using Math.random() and store it in myId
  const myId = useMemo(() => {
    return Math.random().toString(36).slice(-5).toUpperCase()
  }, [])
  
  // Initialize state for the messages
  const [messages, setMessages] = useState<IMessage[] | []>([]);
  
  // Initialize state for the message input
  const [message, setMessage] = useState('');

  // Function to create a new room
  const createRoom = () => {
    // Generate a random room ID and set it as the target room
    setTargetRoom(Math.random().toString(36).slice(-5).toUpperCase())
    // Implement the createRoom logic
  };

  // Function to join an existing room
  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Set the target room to the input value
    setTargetRoom(e.currentTarget.roomId.value)
    // Implement the joinRoom logic
  };

  // Use a subscription to listen for new messages in the target room
  useSubscription(SUBSCRIBE,
    { 
      variables: { roomId: targetRoom },
      onData: ({data}) =>  {
        // Add the new message to the messages array
        setMessages([...messages, data.data.message])     
      }
    }
  );

  // Use a mutation to send a new message
  const [sendingMessage] = useMutation(MESSAGE);
  
  // Function to send a message
  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    // Send the message using the sendingMessage mutation
    sendingMessage({
      variables: {
        time: new Date(),
        message: message,
        clientId: myId,
        roomId: targetRoom
      }
    })
    // Clear the message input
    setMessage('')
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100vh] bg-gray-100 text-gray-800">
      {!targetRoom ? (
        <div>
          <button onClick={createRoom} className="text-center p-4 bg-black text-white rounded-lg w-[300px]">
            + Create New Room
          </button>
          <p className="my-5">or</p>
          <form onSubmit={joinRoom} className="w-[300px] flex gap-2">
            <input
              name="roomId"
              className="flex items-center h-10 w-full rounded px-3 text-sm"
              type="text"
              placeholder="Enter room id"
            />
            <button type="submit" className="bg-black text-white w-[70px] rounded-lg">
              Join
            </button>
          </form>

          <p className="mt-3">
            or{' '}
            <button
              onClick={() => {
                setTargetRoom('BROADCAST');
              }}
              className="text-underline font-bold"
            >
              Broadcast to all users
            </button>
          </p>
        </div>
      ) : (
        <div>
          <p>Room ID: {targetRoom ?? '-'}</p>
          <div className="flex flex-col items-center justify-center w-[400px] min-h-[80vh] bg-gray-100 text-gray-800 bg-white">
            <div className="flex flex-col flex-grow h-0 p-4 overflow-auto w-full">
              {messages.map((messageItem, index) => (
                <div
                  key={index}
                  className={`flex w-full mt-2 space-x-3 max-w-xs ${
                    messageItem?.clientId === myId ? 'ml-auto justify-end' : ''
                  }`}
                >
                  <div>
                    <div
                      className={`${
                        messageItem?.clientId === myId
                          ? 'bg-blue-600 text-white rounded-l-lg rounded-br-lg'
                          : 'bg-gray-300 rounded-r-lg rounded-bl-lg'
                      } p-3`}
                    >
                      <p className="text-sm">{messageItem.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 leading-none">
                      {new Date(messageItem?.time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="bg-gray-300 p-4 w-full">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex items-center h-10 w-full rounded px-3 text-sm"
                type="text"
                placeholder="Type your message…"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourComponent;
