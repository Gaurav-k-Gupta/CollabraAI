import 'dotenv/config'

import http from 'http';
import app from './app.js';

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT;

const server = http.createServer(app);


const io = new Server(server , {
    cors:{
        origin : '*',
    }
});


io.use((socket , next)=>{
    try{

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

        if(!token){
            return next(new Error('Unauthorized user'))
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET)

        if(!decoded){
            return next(new Error('Unauthorized user!'))
        }

        socket.user = decoded;
        next();

    }catch(error){
        next(error)
    }
})



io.on('connection', socket => {
    console.log('some mf connected!')
  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { /* … */ });
});


server.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})