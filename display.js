let fs = require('fs');
let data = require('./log.json');

let correctAnswers =
  [0.2, 2, 20, 200, 2000,
   0.2, 2, 20, 200, 2000,
   0.2, 2, 20
  ];
let teamNames = [
  "pierogi",
  "korale koloru korolowego",
  "empty",
];

// team -> question -> answers
let answers = {};

for (let team = 0; team < teamNames.length; team++) {
  answers[team] = {};
  for (let question = 0; question < correctAnswers.length; question++) {
    answers[team][question] = [];
  }
}

for (let row of data) {
  answers[row.team][row.question].push({from: row.from, to: row.to});
}

// >= 1 for positive or negative for wrong answers (I wish js had variants)
function calculateScore (question, answers) {
  function isRight (answer) {
    let correctAnswer = correctAnswers[question];
    return (answer.from <= correctAnswer && correctAnswer <= answer.to);
  }

  let result = 0;
  for (let answer of answers) {
    if (isRight (answer)) {
      result = Math.floor (answer.to / answer.from);
    } else {
      if (result < 0) {
        result--;
      } else {
        result = -1;
      }
    }
  }
  return result;
}

function teamScore (teamAnswers) {
  let sum = 10;
  let numberOfGoodOnes = 0;
  for (let question = 0; question < correctAnswers.length; question++) {
    let questionScore = calculateScore (question, teamAnswers[question]);
    if (questionScore > 0) { // correct
      numberOfGoodOnes++;
      sum += questionScore;
    }
  }
  return sum * Math.pow(2, correctAnswers.length - numberOfGoodOnes);
}

function row (teamAnswers) {
  let tds = [];
  for (let question = 0; question < correctAnswers.length; question++) {
    let score = calculateScore(question, teamAnswers[question]);
    if (score > 0) {
      tds.push(score);
    } else {
      let xs = '';
      for (let i = 0; i < -score; i++) {
        xs += 'x';
      }
      tds.push('<span style="color:red">' + xs + '</span>');
    }
  }
  tds.push(teamScore(teamAnswers));
  return tds
}


let header = ['team'];
for (let question = 0; question < correctAnswers.length; question++) {
  header.push(question + 1);
}
header.push('score');

let trs = [header.map(x => {return '<td>' + x + '</td>'})];
for (let team = 0; team < teamNames.length; team++) {
  let teamAnswers = answers[team];
  let tds = [teamNames[team]].concat(row(teamAnswers)).map(x => {return '<td>' + x + '</td>'});
  trs.push(tds);
}

console.log('<meta http-equiv="refresh" content="5"/><table border=1>' + trs.map(tr => {return '<tr>' + tr.join('') + '</tr>'}).join('') + '</table>');

