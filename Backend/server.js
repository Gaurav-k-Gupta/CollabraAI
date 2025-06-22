import 'dotenv/config'

import http from 'http';
import app from './app.js';

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';

const PORT = process.env.PORT;

const server = http.createServer(app);


const io = new Server(server , {
    cors:{
        origin : '*',
    }
});


io.use(async (socket , next)=>{
    try{

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query?.projectId;

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return next(new Error('Invalid projectId'));
        }

        socket.project = await projectModel.findById(projectId);

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

    socket.roomId = socket.project._id.toString();

    socket.join(socket.roomId);
    console.log('some mf connected!')

    socket.on('project-message' , data =>{
        console.log(data);
        socket.broadcast.to(socket.roomId).emit('project-message' , data);
    })

  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { /* … */ });
});


server.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})