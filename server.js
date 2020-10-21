const express = require('express');

const app = express();
app.use(express.static(__dirname + "/public")); //allows serving of static files in public folder

const server = app.listen(8282, () => {
  console.log('App listening at port %s', server.address().port)
})