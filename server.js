/*
this is an example npm Enterprise website add-on, the app
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

which was generated, and published to npm using:

https://www.npmjs.com/package/npmi-cli
*/
var bodyParser = require('body-parser')
var crypto = require('crypto')
var express = require('express')
var app = express()
var client = require('redis').createClient(process.env.REDISTOGO_URL || 'redis://127.0.01:6379')
var topUsers = require('./top-users')

app.use(bodyParser.text({
  type: 'application/json'
}))
app.use(bodyParser.urlencoded({extended: false}))

// invoked with an access_token and
// corresponding email address. An effort
// should be made to validate the email address,
// and the token should be stored.
app.post('/auth', function (req, res) {
  var body = JSON.parse(req.body)
  client.set(body.email, body.access_token, function (err) {
    if (err) console.error(err.message)
    res.status(200).send('success')
  })
})

// invoked with a webhook signed with the
// access_token corresponding to `sender.email`
// (/auth is invoked first, and you should store
//  this information so that you can validate
//  a signature).
//
// should respond with an annotation that looks
// a little something like this:
// {
//   rows: [{
//     image: {
//        url: 'http://www.example.com/img',
//        text: 'image alt'
//      },
//      link: {
//        url: 'http://www.example.com',
//        text: 'my awesome link'
//      },
//      text: 'hello *world*!'
//   }]
// }
app.post('/webhook', function (req, res) {
  var body = JSON.parse(req.body)
  // lookup access token.
  client.get(body.sender.email, function (err, accessToken) {
    if (err) return res.status(500).send(err.message)

    if (!validateSignature(req.headers['npm-signature'], req.body, accessToken)) {
      console.info('invalid signature')
      res.status(401).send('invalid signature')
    } else {
      console.info('signature validated')
      return topUsers (body, req, res)
    }
  })
})

// the payload is signed with a user's
// access token.
function validateSignature (expected, payload, accessToken) {
  var signature = 'sha256=' + hash(payload, accessToken)
  return signature === expected
}

function hash (payload, secret) {
  return crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

// start the server.
var port = process.env.PORT || 5555
var server = app.listen(port, function () {
  console.info('server listening on ', port)
})
