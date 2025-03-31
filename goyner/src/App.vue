<script setup lang="ts">
import { ref } from 'vue'
const time_range = ref<{
  start_hour: number
  start_minute: number
  end_hour: number
  end_minute: number
}>({})  
function validateTime(field){
  if (this.time_range[field]<0) this.time_range[field]=0
  if(
    (field.includes('hour') && this.time_range[field]>23) ||
    (field.includes('minute') && this.time_range[field]>59)
  ) {
    this.time_range[field] = field.includes('hour') ? 23 : 59
  }
}
interface HistoryDataI {
  index: number
  action: string
  image: string | null
  date: string
}
const history_datas = ref<HistoryDataI[]>([
  {
    index: 1,
    action: "Uploaded image",
    image: "https://example.com/image1.jpg",
    date: "2025-03-31T10:15:00Z"
  },
  {
    index: 2,
    action: "Deleted image",
    image: null,
    date: "2025-03-31T10:30:00Z"
  },
  {
    index: 3,
    action: "Edited image",
    image: "https://example.com/image2.jpg",
    date: "2025-03-31T11:00:00Z"
  },
  {
    index: 4,
    action: "Restored image",
    image: "https://example.com/image3.jpg",
    date: "2025-03-31T11:45:00Z"
  },
  {
    index: 5,
    action: "Archived history",
    image: null,
    date: "2025-03-31T12:00:00Z"
  }
]);
</script>
<template>
  <div class="home-container">
    <div class="device-container">

    </div>
    <div class="detail-container">
      <div class="left-side">
        <div class="time-container">
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
        </div>
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
              <tr v-for="history_data in history_datas" :key="history_data.index">
                <td>{{ history_data.index }}</td>
                <td>{{ history_data.action }}</td>
                <td>{{ history_data.image }}</td>
                <td>{{ history_data.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="right-side">
        <div class="camera-container">
          <img src="https://example.com/image3.jpg" alt="Camera" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;">
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
      }
    }
  }
}
</style>