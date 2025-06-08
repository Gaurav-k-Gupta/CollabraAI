import mongoose from "mongoose";


function connect(){
    mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log('Mongo DB connected!');
        })
        .catch(()=>{
            console.log('Error connecting to Mongo DB!');
        });
}


export default connect;