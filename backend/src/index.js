"use strict";
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Set the limit to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Set the limit to 50mb


app.get('/', (req, res) => {
  res.status(200).json({text:'Hello World!'});
});

app.listen(port, () => {
    console.log('Hello World!');
    console.log(`My port is ${port}`);
});

// const bodyParser = require('body-parser');
// app.use(bodyParser.json({limit: '50mb'})); // Set the limit to 50mb
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // Set the limit to 50mb
// .................................................................WSS..............................................
const wsport = 3001;
const WebSocket = require('ws');
const WSs = new WebSocket.Server({ port: 3001});
    console.log('WebSocket server started on port 3001');
WSs.on('connection', async (current_client) => {
      console.log('Client connected');
        try{
            const history = await History.find({}).sort({createdAt: -1});
            const convertData = history.map((item, index) => {
                return {
                    // index: index + 1,
                    picture: item.picture,
                    action: item.action,
                    createdAt: item.createdAt,
                }
            })
            current_client.send(JSON.stringify({message: "History fetched successfully", datas: convertData}));
            console.log('Sent history to client:', convertData);
        }
        catch (error) {
            console.error("Error fetching history:", error);
            current_client.send("Internal Server Error");
        }

        
        current_client.on('message', async (message) => {
            try{
                const history = await History.find({}).sort({createdAt: -1});
                const convertData = history.map((item, index) => {
                    return {
                        // index: index + 1,
                        picture: item.picture,
                        action: item.action,
                        createdAt: item.createdAt,
                    }
                })
                current_client.send(JSON.stringify({type: "History", data: convertData}));
                console.log('Sent history to client:', convertData);
            }
            catch (error) {
                console.error("Error fetching history:", error);
                current_client.send("Internal Server Error");
            }
        });
        current_client.on('close', () => {
            console.log('Client disconnected');
        })
    })

//...........................................................MongoDB..................................................
//   console.log('Client connected');

//   try {
//     // Get the most recent picture from the database
//     const latestPicture = await History.findOne().sort({ date: -1 });

//     if (latestPicture) {
//       ws.send(JSON.stringify(latestPicture));
//       console.log('Sent latest picture to client');
//     } else {
//       console.log('No picture found');
//     }
//   } catch (error) {
//     console.error('Error retrieving picture:', error);
//   }

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
      
//   });

  // .................................................................Mongoose..............................................
const mongoose = require('mongoose');
mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
});
mongoose.connection.on("error", (err) => {
    console.log(`Could not connect to MongoDB because of ${err}`);
    process.exit(1);
});
var mongoURI = "mongodb+srv://misheel:jYce1lOVThe4d3Gm@misheel.ubszxk2.mongodb.net/"
mongoose.connect(mongoURI, {
    dbName: "test"
})

//......................................................................model..............................................

const Schema = mongoose.Schema;
const historySchema = new Schema({
    picture:{
        type: String,
        required: false,
    },
    action:{
        type: String,
        required: true,
    },
},
{
    timestamps: true,
});
const History = mongoose.model('History', historySchema);
//..................................................................controller............................................

const saveHistory = async (req, res) => {
    try{
        const body = req.body;
        console.log("Received body:", body);
        if (!body?.action) {
            return res.status(400).json({message: "Invalid data"});
        }
        const newHistory = new History(body);
        await newHistory.save();

        console.log("History saved successfully");
        res.status(200).send(newHistory._id);
        WSs.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({type: "History", data: [newHistory]}));
            }
        })
    }
    catch (error) {
        console.error("Error saving history:", error);
        res.status(500).send("Internal Server Error");
    }
}
const setStreaming = async (req, res) => {
    const {...body} = req.body;
    try{
        if(body?.img)
        WSs.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({type: "Stream", img: body.img}));
            }
        })
    }
    catch (error) {
        console.error("Error saving history:", error);
        res.status(500).send("Internal Server Error");
    }
}
//...................................................................route..............................................
app.post('/saveHistory', saveHistory);
// http://192.168.0.113:3000/saveHistory




    // const fs = require('fs');
app.use('/upload', express.raw({ type: 'application/octet-stream', limit: '10mb' }));

app.post('/upload/:id', (req, res) => {
    const buffer = req.body;
    console.log('Received image buffer:', buffer);

    const base64Image = buffer.toString('base64');
    const imageData = `data:image/jpeg;base64,${base64Image}`;
    console.log('Image Data:', imageData);

    const params = req.params;
    console.log('Received image id:', params.id);

    WSs.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({type: "Stream", img: imageData }));
        }
    })
    return res.status(200).json({message: "Image received successfully"});
});

// app.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });