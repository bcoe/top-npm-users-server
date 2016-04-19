/*
this is an example npm Enterprise website integration, the app
corresponds to the following meta-information:

{
  "type": "badge plus",
  "email": "ben@npmjs.com",
  "name": "npm Top Users",
  "homepage": "http://git.io/npm-top",
  "description": "indicate whether a module was built by a top npm user",
  "callback": "http://top-npm-users-server.herokuapp.com/auth",
  "webhook": "http://top-npm-users-server.herokuapp.com/webhook"
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
  res.status(200).send('success')
})

// invoked with a webhook signed with the
// access_token corresponding to `sender.email`
// (/auth is invoked first, and you should store
//  this information so that you can validate
//  a signature).
//
// should respond with an annotation:
// {
//   status: 'green',
//   'status-message': 'module scanned',
//   description: 'my awesome integration',
//   'external-link': 'http://example.com/foo-package/audit',
//   'external-link-text': 'view details'
// }
app.post('/webhook', function (req, res) {
  console.log(req.body)
  res.status(200).send({
    status: 'green',
    'status-message': 'phew, user is popular',
    description: '300/40000 npm users',
    'external-link': 'http://git.io/npm-top'
  })
})

var port = process.env.PORT || 5555
var server = app.listen(port, function () {
  console.info('server listening on ', port)
})
