function generateBoard (data) {
  let correctAnswers =
    [0.2, 2, 20, 200, 2000,
     0.2, 2, 20, 200, 2000,
     0.2, 2, 20
    ];
  let teamNames = [
    "pierogi",
    "korale koloru korolowego",
    "red",
    "green",
    "blue",
    "asdfme",
    "321523",
    "empty",
  ];

  // team -> question -> answers
  let answers = {};

  for (let team = 0; team < teamNames.length; team++) {
    answers[team] = {};
    for (let question = 1; question <= correctAnswers.length; question++) {
      answers[team][question] = [];
    }
  }

  for (let row of data) {
    if (!answers[row.team]) {
      console.error('Invalid team', row);
      continue;
    }
    if (!answers[row.team][row.question]) {
      console.error('Invalid question', row);
      continue;
    }
    answers[row.team][row.question].push({from: row.from, to: row.to});
  }

  // isCorrect === true  then result is result
  // isCorrect === false then result is number of failures
  function questionScore (question, answers) {
    function isRight (answer) {
      let correctAnswer = correctAnswers[question];
      return (answer.from <= correctAnswer && correctAnswer <= answer.to);
    }

    let result = 0;
    let isCorrect = false;
    for (let answer of answers) {
      if (isRight (answer)) {
        result = Math.floor (answer.to / answer.from);
        if (result < 0) {
          result = Infinity;
        }
        isCorrect = true;
      } else {
        if (!isCorrect) {
          result++;
        } else {
          result = 1;
        }
        isCorrect = false;
      }
    }
    return { isCorrect, result };
  }

  function teamScore (teamAnswers) {
    let sum = 10;
    let numberOfGoodOnes = 0;
    for (let question = 1; question <= correctAnswers.length; question++) {
      let { isCorrect, result } = questionScore (question, teamAnswers[question]);
      if (isCorrect) {
        numberOfGoodOnes++;
        sum += result;
      }
    }
    return sum * Math.pow(2, correctAnswers.length - numberOfGoodOnes);
  }

  function row (teamAnswers) {
    let tds = [];
    for (let question = 1; question <= correctAnswers.length; question++) {
      let answers = teamAnswers[question];
      if (answers.length === 0) {
        tds.push('');
      } else {
        let { isCorrect, result } = questionScore(question, answers);
        if (isCorrect) {
          tds.push(result);
        } else {
          let xs = '';
          for (let i = 0; i < result; i++) {
            xs += 'x';
          }
          tds.push('<span style="color:red">' + xs + '</span>');
        }
      }
    }
    tds.push(teamScore(teamAnswers));
    return tds;
  }

  let header = ['team'];
  for (let question = 1; question <= correctAnswers.length; question++) {
    header.push(question);
  }
  header.push('score');
  thead = '<thead class="thead-inverse"><tr>' + header.map(x => {return '<td>' + x + '</td>'}).join('') + '</tr></thead>';

  let trs = [];
  for (let team = 0; team < teamNames.length; team++) {
    let teamAnswers = answers[team];
    let tds = [teamNames[team]].concat(row(teamAnswers)).map(x => {return '<td>' + x + '</td>'});
    trs.push(tds);
  }

  return (`
    <table class="table table-bordered table-striped">${thead}</thead><tbody>${trs.map(tr => {return '<tr>' + tr.join('') + '</tr>'}).join('')}</tbody></table>
  `);
}

function getData (callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', '/log', true);
  xhr.onreadystatechange = function() {
    var status;
    if (xhr.readyState == 4) { // `DONE`
      status = xhr.status;
      if (status == 200) {
        callback(null, JSON.parse(xhr.responseText))
      } else {
        callback({error: 'Couldn\'t get response from server', status: status});
      }
    }
  };
  xhr.send();
}

function updateData () {
  let table = document.getElementById('table');
  let error = document.getElementById('error');
  getData(function (err, json) {
    setTimeout(updateData, 1000);
    if (err) {
      error.innerHTML = 'Error ' + JSON.stringify(err);
      return;
    }
    error.innerHTML = '';
    table.innerHTML = generateBoard(json);
  });
}

function timer () {
  let total = 600;
  let left = localStorage.timer || total;
  let interval = null;

  function render () {
    let node = document.getElementById('js-timer-html');
    node.innerHTML = left;
  }
  function setLeft (n) {
    left = n;
    localStorage.timer = n;
    if (left >= 0) {
      render();
    }
  }
  function tick() {
    setLeft(left - 1);
  }
  function start () {
    // It's more pleasant UI if we tick right away
    tick();
    interval = setInterval(tick, 1000);
  }
  function stop () {
    clearInterval(interval);
  }
  function restart () {
    setLeft(total);
  }
  render();

  document.getElementById('js-timer-start').onclick = start;
  document.getElementById('js-timer-stop').onclick = stop;
  document.getElementById('js-timer-restart').onclick = restart;
}

onload = function () {
  timer();
  updateData();
};
