var mongoose = require('mongoose');
var url = process.env.db || 'mongodb://localhost:27017/rentals';
mongoose.connect(url, { useNewUrlParser: true });
mongoose.connection.on('connected', ()=>{
    console.log('connected to db');
});

mongoose.connection.on('error', (err)=>{
    if(err){
        console.log('Error in connection to db,',err)
    }
})