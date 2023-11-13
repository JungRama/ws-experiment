<script>
  import { io } from 'socket.io-client'

  // Establish a socket connection for user authentication
  // Try remove the token to get the error
  const socketUserAuth = io('http://localhost:8000/user', {
    auth: {
      token: '12345'
    }
  })
  socketUserAuth.on('connect', () => {
    console.log('user connect');
  })
  socketUserAuth.on('connect_error', error => {
    alert(error)
  })

  // Establish a socket connection for messaging
  const socket = io('http://localhost:8000')
  let socketId = null
  socket.on('connect', () => {
    socketId = socket.id
  })
  
  // Initialize variables for target room, messages, and message
  let targetRoom = null
  let messages = []
  let message = ''

  // Listen for 'receive-message' event and log the received message
  socket.on('receive-message', (message) => {
    console.log(message);
    messages = [...messages, message]
  })

  // Send a message
  const sendMessage = () => {
    const messageSent = {
      message,
      uId: socketId,
      time: new Date()
    }

    // Emit 'send-message' event with the message and target room
    socket.emit('send-message', messageSent, targetRoom)
    messages = [...messages, messageSent]
    message = ''
  }

  // Create a room
  const createRoom = () => {
    targetRoom = Math.random().toString(36).slice(-5).toUpperCase()
    socket.emit('join-room', targetRoom)
  }

  // Join a room
  const joinRoom = (form) => {
    const formData = new FormData(form.target);
    const formProps = Object.fromEntries(formData);
    targetRoom = formProps.roomId

    socket.emit('join-room', targetRoom, (message) => {
      const messageSent = {
        message,
        uId: socketId,
        time: new Date()
      }
      socket.emit('send-message', messageSent, targetRoom)
      messages = [...messages, messageSent]
    })
  }
</script>

<main>
  <div class="flex flex-col items-center justify-center w-[100vw] min-h-[100vh] bg-gray-100 text-gray-800 p-10">
    {#if !targetRoom}
      <button on:click={createRoom} class="text-center p-4 bg-black text-white rounded-lg w-[300px]">
        + Create New Room
      </button>
      <p class="my-5">or</p>
      <form on:submit|preventDefault={joinRoom} class="w-[300px] flex gap-2">
        <input name="roomId" class="flex items-center h-10 w-full rounded px-3 text-sm" type="text" placeholder="Enter room id">
        <button type="submit" class="bg-black text-white w-[70px] rounded-lg">
          Join
        </button>
      </form>
    
      <p class="mt-3">or <button on:click={() => {
        targetRoom = 'BROADCAST'
      }} class="text-underline font-bold">Broadcast to all user</button></p>  
    {:else}
    
    Room ID : {targetRoom ?? '-'}
    <div class="flex flex-col flex-grow w-full justify-end max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
      <div class="flex flex-col flex-grow h-0 p-4 overflow-auto">
        {#each messages as messageItem, index}
          {#if messageItem.uId === socketId}          
          <div class="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
            <div>
              <div class="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                <p class="text-sm">{messageItem.message}</p>
              </div>
              <span class="text-xs text-gray-500 leading-none">
                {new Date(messageItem.time).toLocaleTimeString()}
              </span>
            </div>
            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
          </div>
          {:else}
          <div class="flex w-full mt-2 space-x-3 max-w-xs">
            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
            <div>
              <div class="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                <p class="text-sm">
                  {messageItem.message}
                </p>
              </div>
              <span class="text-xs text-gray-500 leading-none">
                {new Date(messageItem.time).toLocaleTimeString()}
              </span>
            </div>
          </div>
          {/if}
        {/each}
        
        
      </div>
      
      <form on:submit|preventDefault={sendMessage} class="bg-gray-300 p-4">
        <input bind:value={message} class="flex items-center h-10 w-full rounded px-3 text-sm" type="text" placeholder="Type your message…">
      </form>
    </div>
    {/if}
  </div>
</main>