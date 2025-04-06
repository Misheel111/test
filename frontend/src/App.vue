<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
const host = 'http://localhost:3000'
interface HistoryDataI {
  // index?: number
  action?: string
  picture?: string | null
  createdAt?: string
}
const HistoryData = ref<HistoryDataI[]>([])

const time_range = ref<{
  start_hour?: number
  start_minute?: number
  end_hour?: number
  end_minute?: number
}>({})  
const picture = ref();
let ws: WebSocket;
const primaryURL = 'ws://localhost:3000/ws'
const secondaryURL = 'ws://localhost:3001/ws'
function connect(url: string){
  ws = new WebSocket(url)
  ws.onopen = () => {
    console.log('WebSocket connection opened')
  }
//..............................................receiving data................................................................
  ws.onmessage = handleWebSocketMessage
  // Connection closed or lost
  ws.onclose = () => {
    console.log(`Connection to ${url} closed`)
    if(url === primaryURL){
      console.log(`Attempting to connect to secondary URL: ${secondaryURL}`)
      connect(secondaryURL)
    }
    else{
      console.log('Could not connect to either server')
    }
  // Handling connection errors
  }
  ws.onerror = error => {
    console.error(`WebSocket error on ${url}:`, error)
    ws.close()
  }
}
//..............................................Storing Received Data........................................
const StreamImage = ref<string | null>(null)
const handleWebSocketMessage = (event: MessageEvent) => {
  const receivedMessage = JSON.parse(event.data)
  if (receivedMessage.type === 'History') {
    interface ReceivedMessageData {
      // index: number;
      action: string;
      picture: string | null;
      createdAt: string;
    }

    interface ReceivedMessage {
      datas: ReceivedMessageData[];
    }

    const receivedMessageTyped: ReceivedMessage = receivedMessage;

    receivedMessageTyped.datas?.forEach((data: ReceivedMessageData) => {
      const historyItem: HistoryDataI = {
      // index: data.index,
      action: data.action,
      picture: data.picture,
      createdAt: data.createdAt,
      };
      HistoryData.value.push(historyItem);
    });
  }
  else if (receivedMessage.type === 'Stream') {
    StreamImage.value = receivedMessage.img
  }
}
//..............................................Sending Data.......................................................
const sendData = (action: string) => {
  const data = {
    action: action,
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
    console.log('Sending data:', action)
  } else {
    console.error('WebSocket is not open. Cannot send data.')
  }
}


function validateTime(field: keyof typeof time_range.value){
  if (Object.keys(time_range.value).includes(field)){
    if ((time_range.value[field] ?? 0) < 0) time_range.value[field] = 0
    if(
      (field.includes('hour') && (time_range.value[field] ?? 0) > 23) ||
      (field.includes('minute') && (time_range.value[field] ?? 0) > 59)
    ) {
      time_range.value[field] = field.includes('hour') ? 23 : 59
    }
  }
}
const test = ref()
onMounted( async ()=>{
  connect(primaryURL)
  try{
    const response = await axios.get(host+'/')
    test.value = response.data
  }
  catch(error){
    console.error('Error fetching data:', error);
  }
  // sendData('get_history')
})
</script>
<template>
  <div class="home-container">
    <!-- <div class="device-container">

    </div> -->
    <div class="detail-container">
      <div class="left-side">
        <!-- <div class="time-container">
         <input
         v-model="time_range.start_hour"
         type="number"
         @input="validateTime('start_hour')"
         />
         <p>:</p>
          <input
          v-model="time_range.start_minute"
          type="number"
          @input="validateTime('start_minute')"
          />
          <p>&rarr;</p>
          <input
          v-model="time_range.end_hour"
          type="number"
          @input="validateTime('end_hour')"
          />
          <p>:</p>
          <input
          v-model="time_range.end_minute"
          type="number"
          @input="validateTime('end_minute')"
          />
        </div> -->
        <div class="history-container">
          <table>
            
            <thead>
              <tr>
                <th>№</th>
                <th>Үйлдэл</th>
                <th>Зураг</th>
                <th>Огноо</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in HistoryData" :key="index">
                <td>{{ index + 1 }}</td>
                <td> {{ item.action }} </td>
                <td><img v-if="item.picture" :src="item.picture"/></td>
                <td v-if="item.createdAt">{{ (new Date(item.createdAt)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="right-side">
        <div class="camera-container">
         <!-- {{ rececivedData }} -->
        <img v-if="StreamImage" :src="StreamImage" alt="Received Image">
        </div>
        
      </div>
    </div>
  </div>
</template>
<style scoped>
.class-label{
  position: absolute;
  top: 0;
  left: 0;
}
.home-container {
  display: flex;
  inset: 0;
  position: fixed;
  margin: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 16px;
  border: 5px solid #5f0808;
  gap: 16px;
  .device-container {
    width: 96px;
    height: 100%;
    border: 1px solid #888;
    border-radius: 16px;
  }
  .detail-container {
    display: flex;
    flex-grow: 1;
    gap: 16px;
    .left-side {
      height: 100%;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      .time-container {
        width: 100%;
        border-radius: 16px;
        border: 1px solid #888;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
          input {
            width: 100%;
            border-radius: 8px;
            border: 1px solid black;
            padding: 8px;
            font-size: 32px;
            text-align: center;
            color: black;
          }
          p{
            color: black;
            font-size: 32px;
           text-wrap: nowrap;
           text-align: center;
           font-weight: 900;
           padding: 0 4px;
          }
      }
      .history-container {
        width: 100%;
        flex-grow: 1;
        border-radius: 16px;
        border: 1px solid #888;
        display: flex;
        justify-content: center;
      }
              td, th{
                padding: 8px;
                color: black;
              }
          
    }
    .right-side {
      height: 100%;
      .camera-container {
        height: 100%;
        aspect-ratio: 4/3;
        border-radius: 16px;
        border: 1px solid #888;
        img{
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
          border-radius: 16px;
        }
      }
    }
  }
}
</style>