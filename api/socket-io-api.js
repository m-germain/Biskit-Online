var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

let players = new Map(); // Map of Id and Player name in playing order. [0] turn to play [1] next ...
let jailList = new Map(); // Map of player in jail
const currBiskitAnswers = []; // List of players whiches have said Biskit

io.on('connection', function (socket) {

  console.log('a user connected', socket.client.id);

  socket.on("addPlayer", playerName => {
    addPlayer(socket.id, playerName);
  });

  // Log whenever a client disconnects from our websocket server
  socket.on("disconnect", () => {
    disconectPlayer(socket.id)
  });

  socket.on("roll", number => {
    sendDiceToPlayers(socket.id, number);
  });

  socket.on("biskit", () => {
    handleBiskit(socket.id);
  })

  socket.on("resetGame", () => {
    resetGame(socket.id);
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

function addPlayer(id, playerName) {
  console.log("New player id :", id, "Name :", playerName);
  players.set(id, playerName);
  sendListPlayer();
}

function disconectPlayer(id) {
  console.log("user disconnected", id, players.get(id), players.delete(id));
  sendListPlayer();
}

function sendListPlayer() {
  io.emit("listPlayer", { type: "listPlayer", listePlayer: [...players] });
}

function sendDiceToPlayers(id, number) {
  console.log("Player : ", players.get(id), "Started rolling dice : ", number);
  io.emit("roll", { type: "roll", number: number, rule: calculateDice(id, number) });
}

function calculateDice(id, number) {
  if (basicRules(id, number[0], number[1]) === 0) {
    nextPlayer(id);
  }
  return basicRules(id, number[0], number[1]);
}

function basicRules(id, dice1, dice2) {
  if (dice1 == dice2) return ("You can give a player : " + dice1 + " sips.");
  if ((dice1 + dice2) == 7) return ("Biskit !");
  if ((dice1 + dice2) == 3) {
    return jail(id);
  };
  if ((dice1 + dice2) == 11) return ("Player " + getPlayerFromIndex(1) + " take 1 sip !");
  if ((dice1 + dice2) == 10) {
    nextPlayer(id);
    return ("Player " + players.get(id) + " take 1 sip !");
  }
  if ((dice1 + dice2) == 9) return ("Player " + getPlayerFromIndex(players.size) + " take 1 sip !");
  return 0;
}

function getPlayerFromIndex(number) {
  let i = 0;
  // If there is only 2 player the next and last player are the same. (The next one so index 1)
  if (players.size < 3) {
    number = 1;
  }
  for (let [key, playerName] of players.entries()) {
    if (i == number) return (playerName);
    i++;
  }
}

function jail(id) {
  let message = "Prison !\n";
  if (jailList.size > 0 && jailList.has(id)) {
    jailList.delete(id);
    message += (players.get(id) + " got Out of jail !\n");
  } else {
    jailList.set(id, players.get(id));
    message += (players.get(id) + " was sentenced to jail !\n");
  }
  if (jailList.size > 0) {
    message += "Players : ";
    for (let [key, playerName] of players.entries()) {
      message += playerName + " ";
    }
    message += "drink 1 sip !\n";
  }
  nextPlayer(id);
  return message;
}

function nextPlayer(id) {
  let playerName = players.get(id);
  players.delete(id);
  players.set(id, playerName);
  sendListPlayer();
}

function handleBiskit(id) {
  if (currBiskitAnswers.length === players.size - 1) {
    // Calculate looser
    const looserId = [...players.keys()].filter((id) => !currBiskitAnswers.include(id))[0];

    if (looserId !== id) {
      io.emit("bizkitEnd", { type: "biskitAnswers", looserId: looserId, biskitAnswers: currBiskitAnswers });
    } else {
      io.emit("bizkitEnd", { type: "biskitAnswers", looserId: looserId, biskitAnswers: currBiskitAnswers });
      nextPlayer(id);
    }
  } else {
    currBiskitAnswers.push(id);
    io.emit("event", { message: `${getPlayerFromIndex(id)} a répondu Bizkit` });
  }
}

function resetGame(id) {
  io.emit("resetGame", { message: ("Game was restarted by :" + players.get(id)) });
  console.log(("Game was restarted by :" + players.get(id)));
  //clean tout
  players = new Map();
  jailList = new Map(); 
  currBiskitAnswers = [];
}
