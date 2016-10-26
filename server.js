var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var display = require('./display');

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

let html = `
  <style>
    li { width: 300px; clear: both }
    label input { float: right }
  </style>
  <form method=POST>
    <li><label>team<input autocomplete=off name=team /></label>
    <li><label>question<input autocomplete=off name=question /></label>
    <li><label>from<input autocomplete=off name=from /></label>
    <li><label>to<input autocomplete=off name=to /></label>
    <li><input type=submit />
  </form>
`;

app.get('/add', function (req, res) {
  res.send(html);
});

app.use(express.static('dist'));
app.use(express.static('css'));

const logFile = 'dist/log.json';
function regenerateScoreboard() {
  let data = JSON.parse(fs.readFileSync(logFile));
  fs.writeFileSync('dist/scoreboard.html', display(data));

  // backups
  fs.writeFileSync('dist/scoreboard' + (new Date().toISOString()) + '.html', display(data));
}

app.get('/refresh', function (req, res) {
  regenerateScoreboard();
  res.send('regenerated');
});

app.post('/add', function (req, res) {
  // This should be synchronous operation so that no two clients write at the same time
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

  regenerateScoreboard();

  res.send('added:' + JSON.stringify(newRow) + html);
});

app.listen(3000, '0.0.0.0', function () {
  console.log('Estimathon app listening on port 3000!');
});
