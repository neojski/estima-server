let fs = require('fs');

module.exports = function (data) {
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
    <!doctype html>
      <head>
        <style> thead { font-weight: bold } </style>
        <meta http-equiv="refresh" content="5"/>
        <link rel="stylesheet" href="bootstrap.min.css">
      </head>
      <body>
        <table class="table table-bordered table-striped">${thead}</thead><tbody>${trs.map(tr => {return '<tr>' + tr.join('') + '</tr>'}).join('')}</tbody></table>
      </body>
      `);

};
