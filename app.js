const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);


// Serve the React app
app.use(express.static(path.join(__dirname, './chat/dist')));



// models/Message.js

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// module.exports = Message;



// models/User.js

const userSchema = new mongoose.Schema({
    username: String,
    messages: [
        {
            content: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

const User = mongoose.model('User', userSchema);
// module.exports = User;



// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle chat events
    socket.on('chat message', async ({ user, message }) => {
        try {
            // Find or create the user
            let currentUser = await User.findOne({ username: user });

            if (!currentUser) {
                currentUser = new User({ username: user });
                await currentUser.save();
            }

            // Save the message to the user's messages array
            const newMessage = new Message({ user: currentUser._id, content: message });
            // await newMessage.save();
            const [savedMessage] = await Promise.all([
                newMessage.save(),
                currentUser.updateOne({ $push: { messages: newMessage } }),
            ]);

            // Update the user's messages array
            currentUser.messages.push(newMessage);
            await currentUser.save();

            // Emit the message to all connected clients
            io.emit('chat message', { user, message });
        } catch (error) {
            console.error(error);
        }
    });

    // // Handle user disconnection
    // socket.on('disconnect', () => {
    //     console.log('User disconnected');
    // });
});


// Set up Express routes and middleware

// Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


const MONGODB_URI = 'mongodb+srv://dinesh:gHmV3MC7f67sBAX8@cluster0.q52ue8y.mongodb.net/chap?retryWrites=true'

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        server.listen(3000, () => console.log('listening to PORT 3000...'))
    })
    .catch(error => {
        console.log(error);
    });