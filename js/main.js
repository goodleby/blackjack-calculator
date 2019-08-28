var Game = function(decks) {
  this.decks = decks;
  this.score = 0;
  this.tableCards = 0;
  this.regular = {output: '#regularOut', action: 'hit'};
  this.double = {output: '#doubleOut', action: 'double'};
  this.split = {output: '#splitOut', action: 'split'};
};
Game.prototype.calculate = function() {
  var outputs = document.querySelectorAll('.output');
  for(let i = 0; i < outputs.length; i++) outputs[i].innerHTML = '';
  if(this.score === 0) return;
  //REGULAR
  if(this.score < 12) {
    this.regular.result = 100;
    showScenario('worst', this.regular);
  } else {
    this.regular.range = 21 - this.score;
    this.regular.rangePattern = '[A; ' + this.regular.range + ']';
    logicalCalc(this.regular);
  }
  //DOUBLE
  if(this.score >= 8 && this.score <= 11) {
    switch(this.score) {
      case 8:
        this.double.range = 6;
        this.double.rangePattern = '[9; A]';
        break;
      case 9:
        this.double.range = 7;
        this.double.rangePattern = '[8; A]';
        break;
      case 10:
        this.double.range = 8;
        this.double.rangePattern = '[7; A]';
        break;
      case 11:
        this.double.range = 8;
        this.double.rangePattern = '[6; K]';
        break;
    }
    logicalCalc(this.double);
  }
  //DOUBLE SPECIAL CASES
  if(this.score === 17 || this.score === 18) {
    var message;
    switch(this.score) {
      case 17:
        this.double.range = 8;
        this.double.rangePattern = '[A; 4] U [10; K]';
        message = 'A/6';
        break;
      case 18:
        this.double.range = 7;
        this.double.rangePattern = '[A; 3] U [10; K]';
        message = 'A/7';
        break;
    }
    if(!this.split.check) showQuestion(message, this.double);
    if(this.double.check) {
      logicalCalc(this.double);
    }
  }
  //SPLIT
  if(this.score === 13 || (this.score % 2 === 0 && this.score >= 14 && this.score <= 18)) {
    this.split.card = this.score / 2;
    switch(this.score / 2) {
      case 7:
        this.split.range = 9;
        this.split.rangePattern = '[2; 4] U {7} U [10; A]';
        break;
      case 8:
        this.split.range = 9;
        this.split.rangePattern = '[2; 3] U [8; A]';
        break;
      case 9:
        this.split.range = 7;
        this.split.rangePattern = '{2} U [9; A]';
        break;
      case 6.5:
        this.split.range = 8;
        this.split.rangePattern = '[6; K]';
        this.split.card = 'A';
        break;
    }
    if(!this.double.check) showQuestion(('two ' + this.split.card), this.split);
    if(this.split.check) {
      logicalCalc(this.split);
    }
  }
};

//calculate functions
function worstCaseScenario(range) {
  return (4 * game.decks * range - game.tableCards) / (52 * game.decks - game.tableCards) * 100;
}
function customCaseScenario(range, rangeCards) {
  return (4 * game.decks * range - rangeCards) / (52 * game.decks - game.tableCards) * 100;
}
function bestCaseScenario(range) {
  return (4 * game.decks * range) / (52 * game.decks - game.tableCards) * 100;
}

function logicalCalc(obj) {
  obj.result = worstCaseScenario(obj.range);
  if(obj.result >= 50) {
    showScenario('worst', obj);
  } else {
    obj.result = bestCaseScenario(obj.range);
    if(obj.result >= 50) {
      obj.rangeCards = getRangeCards(obj.rangePattern);
      if(obj.rangeCards <= 0) return;
      obj.result = customCaseScenario(obj.range, obj.rangeCards);
      showScenario('custom', obj);
    } else {
      showScenario('best', obj);
    }
  }
}

//show functions
function showScenario(type, obj) {
  switch(type) {
    case 'worst':
      type = 'In worst case scenario';
      break;
    case 'custom':
      type = 'In your case';
      break;
    case 'best':
      type = 'In best case scenario';
      break
  }
  var hitMessage = '';
  if(obj.output === '#regularOut' && !(obj.result >= 50) && game.score < 17) hitMessage = '<br>If you have an A, <span class="green">hit anyway</span>.';
  var answer = obj.result >= 50 ? '<span class="green">Yes!</span>' : '<span class="red">No!</span>';
  document.querySelector(obj.output).innerHTML = obj.action.slice(0, 1).toUpperCase() + obj.action.slice(1, obj.action.length) + '? ' + answer + ' ' + type + ' chance is: ' + obj.result.toFixed(1) + '%' + hitMessage;
}

function showQuestion(message, obj) {
  var button = document.createElement('button');
  button.innerHTML = 'Calculate this case';
  button.classList.add('btn', 'calc-btn');
  button.onclick = function() {
    obj.check = true;
    game.calculate();
  };
  document.querySelector(obj.output).innerHTML = 'Do you have ' + message + '? ';
  document.querySelector(obj.output).appendChild(button);
}

//get function
function getRangeCards(rangePattern) {
  return prompt('How many cards are there on the table from the range: ' + rangePattern + ' ?', game.tableCards)
}

//change functions
function scoreChange(value) {
  game.score = value;
  for(let i = 0; i < specialCasesBtns.length; i++) {
    specialCasesBtns[i].classList.remove('active');
  }
  game.double.check = false;
  game.split.check = false;
  game.calculate();
}

//INITIALIZE
var game = new Game(6);

//add event lisnter to buttons that choose decks amount
var decksBtns = document.querySelectorAll('.decks-btn');
for(let i = 0; i < decksBtns.length; i++) {
  (function(i) {
    decksBtns[i].onclick = function() {
      game.decks = Number(decksBtns[i].innerHTML);
      for(let j = 0; j < decksBtns.length; j++) {
        decksBtns[j].classList.remove('active');
      }
      decksBtns[i].classList.toggle('active');
      game.calculate();
    };
  })(i);
}

//add event listener to inputs to update value on change and button to calculate
var scoreInput = document.querySelector('#scoreInput');
var tableCardsInput = document.querySelector('#tableCardsInput');
scoreInput.onkeyup = function() {
  scoreChange(Number(scoreInput.value));
};
tableCardsInput.onkeyup = function() {
  game.tableCards = Number(tableCardsInput.value);
  game.calculate();
};

//add event listener to +/- buttons around inputs
var oneBtns = document.querySelectorAll('.one');
for(let i = 0; i < oneBtns.length; i++) {
  (function(i) {
    oneBtns[i].onclick = function() {
      var input = oneBtns[i].parentNode.querySelector('input');
      var value = Number(input.value);
      switch(oneBtns[i].innerHTML) {
        case '-':
          if(value > 0) value--;
          break;
        case '+':
          value++;
          break;
      }
      input.value = value;
      switch(input) {
        case scoreInput:
          scoreChange(value);
          break;
        case tableCardsInput:
          game.tableCards = value;
          game.calculate();
          break;
      }
    };
  })(i);
}

//add event listener to special cases buttons
var specialCasesBtns = document.querySelectorAll('.special-cases-btn');
for(let i = 0; i < specialCasesBtns.length; i++) {
  (function(i) {
    specialCasesBtns[i].onclick = function() {
      game.double.check = false;
      game.split.check = false;
      switch(i) {
        case 0:
          game.score = 18;
          game.split.check = true;
          break;
        case 1:
          game.score = 13;
          game.split.check = true;
          break;
        case 2:
          game.score = 17;
          game.double.check = true;
          break;
        case 3:
          game.score = 18;
          game.double.check = true;
          break;
      }
      scoreInput.value = game.score;
      for(let j = 0; j < specialCasesBtns.length; j++) {
        if(j === i) continue;
        specialCasesBtns[j].classList.remove('active');
      }
      specialCasesBtns[i].classList.toggle('active');
      game.calculate();
    };
  })(i);
}