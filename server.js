
const express = require('express')

const app = express()

app.use(express.static(__dirname + "/public")) //allows serving of static files in public folder

// catch 404 and forward them to error handler
// app.use((req, res, next) => {
//   const err = new Error('Not Found')
//   err.status = 404
//   next(err)
// })

// Error handler function
app.use((req, res, next) => {

  const error = app.get('env') === 'development' ? err : {}
  const status = err.status || 500

  //respond to the client
  res.status(status).json({
    error: {
      message: error.message
    }
  })

  //respond to console
  console.error(err)

})

// Start the server
const server = app.listen(8655, () => {
  console.log('App listening at port %s', server.address().port)
})