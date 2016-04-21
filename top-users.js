// create a ranked list of the top npm
// users by download counts.
var request = require('request')
var topUsersMap = require('./top-npm-users')
var topUsersArray = []
Object.keys(topUsersMap).forEach(function (key) {
  topUsersArray.push({
    name: key,
    downloads: topUsersMap[key]
  })
})
topUsersArray.sort(function (a, b) {
  return b.downloads - a.downloads
})

module.exports = function (body, req, res) {
  request.get({
    url: 'https://registry.npmjs.org/' + body.package,
    json: true
  }, function (err, _res, body) {
    if (res && _res.statusCode >= 400) Error('unexpected response = ' + _res.statusCode)
    if (err) {
      console.error(err.message)
      res.status(500).send(err.message)
    } else {
      var rows = []
      addContributors(rows, body)
      rows.push({
        link: {
          text: "view leaders board",
          url: 'http://git.io/npm-top'
        }
      })
      res.status(200).send({
        rows: rows
      })
    }
  })
}

function addContributors (rows, body) {
  var maintainers = body.maintainers || []
  maintainers.forEach(function (maintainer) {
    maintainer.rank = -1
    topUsersArray.forEach(function (user, i) {
      if (user.name === maintainer.name) maintainer.rank = (i + 1)
    })
  })
  maintainers.sort(function (a, b) {
    return a.rank - b.rank
  })
  maintainers.forEach(function (c) {
    rows.push({
      text: (c.rank === -1 ? '*n/a*' : '*#' + c.rank + '*') + ' ' + c.name
    })
  })
}
