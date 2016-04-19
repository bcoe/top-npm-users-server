/*
implementation of integration corresponding to
the following application meta-information:

{
  "type": "badge plus",
  "email": "ben@npmjs.com",
  "name": "npm Top Users",
  "homepage": "http://git.io/npm-top",
  "description": "indicate whether a module was built by a top npm user",
  "callback": "http://127.0.0.1:5555/auth",
  "webhook": "http://127.0.0.1:5555/callback"
}
*/
var bodyParser = require('body-parser')
var express = require('express')
var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// invoked with an access_token and
// corresponding email address. An effort
// should be made to validate the email address,
// and the token should be stored.
app.post('/auth', function (req, res) {
  console.log(req.body)
  res.status(200).send('pork chop sandwiches')
})

// invoked with a webhook signed with the
// access_token corresponding to `sender.email`.
app.post('/webhook', function (req, res) {
  console.log(req.body)
  res.status(200).send('pork chop sandwiches')
})

var port = process.env.PORT || 5555
var server = app.listen(port, function () {
  console.info('server listening on ', port)
})
