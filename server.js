require('dotenv').config();
var app = require('./app');

app.listen(process.env.PORT || 8082, () => {
  console.log('listening on port ' + (process.env.PORT || 8082));
})
