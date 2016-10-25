var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

let html = `
  <form method=POST>
    <label>team<input name=team /></label>
    <label>question<input name=question /></label>
    <label>from<input name=from /></label>
    <label>to<input name=to /></label>
    <input type=submit />
  </form>
`;

app.get('/add', function (req, res) {
  res.send(html);
});

app.use(express.static('dist'));

app.post('/add', function (req, res) {
  // This should be synchronous operation so that no two clients write at the same time
  const logFile = 'log.json';
  let data = JSON.parse(fs.readFileSync(logFile));
  let newRow = {
    date: Date.now(),
    team: +req.body.team,
    question: (+req.body.question) - 1, // internally, we number questions from 0
    from: +req.body.from,
    to: +req.body.to,
  };
  data.push(newRow);
  fs.writeFileSync(logFile, JSON.stringify(data));

  res.send('added:' + JSON.stringify(newRow) + html);
});

app.listen(3000, '0.0.0.0', function () {
  console.log('Estimathon app listening on port 3000!');
});
