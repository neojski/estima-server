var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var display = require('./display');
var mkdirp = require('mkdirp');
var touch = require('touch');

const logFile = 'dist/log.json';

function writeSync (file, data) {
  mkdirp.sync(path.dirname(file));
  fs.writeFileSync(file, data);
}

app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
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

app.use(express.static('css'));

app.get('/', function (req, res) {
  var data = fs.readFileSync('dist/scoreboard.html');
  res.send(data.toString());
});

function regenerateScoreboard() {
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(logFile));
  } catch (e) {
    data = [];
  }
  writeSync('dist/scoreboard.html', display(data));

  // backups
  writeSync('dist/scoreboard' + (new Date().toISOString()) + '.html', display(data));
}
regenerateScoreboard();

app.get('/add', function (req, res) {
  res.send(html);
});

app.post('/add', function (req, res) {
  // This should be synchronous operation so that no two clients write at the same time
  let newRow = {
    date: Date.now(),
    team: +req.body.team,
    question: (+req.body.question),
    from: +req.body.from,
    to: +req.body.to,
  };
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(logFile));
  } catch (e) {
    data = [];
  }
  data.push(newRow);
  writeSync(logFile, JSON.stringify(data));

  regenerateScoreboard();

  res.send('added:' + JSON.stringify(newRow) + html);
});

app.listen(3000, '0.0.0.0', function () {
  console.log('Estimathon app running on http://localhost:3000');
});
