require('dotenv/config')
let url = process.env.DB_URL
var mongoose = require('mongoose');
mongoose.connect(url, { useNewUrlParser: true });
mongoose.connection.on('connected', ()=>{
    console.log('connected to db');
});

mongoose.connection.on('error', (err)=>{
    if(err){
        console.log('Error in connection to db,',err)
    }
})