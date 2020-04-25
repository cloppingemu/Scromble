import {serviceAccount} from "./keys";
import {wordlist} from "./words";
const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
const db = admin.database();

const getTimeStamp = (() => {
  return Date.now();
  // return `${new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"})} AEST`;
});
export const registerUser = functions.auth.user().onCreate((user: any) => {
  db.ref(`/users/${user.uid}`).set({
    admin: false,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }).then(() => {
    return;
  }).catch((err:any) => {
    console.log(`Error creating user: ${err}`);
    return;
  });
});

export const validateUser = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve, reject) => {
    db.ref("/").once("value").then((snapshot:any) => {
      const root = snapshot.val();
      if (!Object.keys(root.users).includes(context.auth.token.user_id)){
        // user is missing profile
        const payload = {
          admin: false,
          displayName: context.auth.token.name,
          email: context.auth.token.email,
          photoURL: context.auth.photoURL,
        };
        db.ref(`/users/${context.auth.token.user_id}`).set(payload).then(() => {
          console.log(`Fixed invalid user ${context.auth.token.email}.`);
        }).catch((err:any) => {
          console.log(`Failed to fix invalid user ${context.auth.token.email} due to ${err}.`);
        });
      }
      admin.auth().getUserByEmail(serviceAccount.project_owner_email).then((userRecord:any) => {
        db.ref(`/users/${userRecord.uid}/admin`).set(true);
      });


      if (Object.keys(root.games).map((name) => {return root.games[name].creator}).includes(context.auth.token.email)){
        const games = Object.keys(root.games).filter((name) => {return root.games[name].creator === context.auth.token.email});
        resolve(games);
      } else{
        resolve([""]);
      }
    });
  });
});


//  [letter bonus, word bonus]
const w3 = [1, 3];
const w2 = [1, 2];
const l3 = [3, 1];
const l2 = [2, 1];
const x1 = [1, 1];
const bonusLayout = [
  w3,x1,x1,l2,x1,x1,x1,w3,x1,x1,x1,l2,x1,x1,w3,
  x1,w2,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,w2,x1,
  x1,x1,w2,x1,x1,x1,l2,x1,l2,x1,x1,x1,w2,x1,x1,
  l2,x1,x1,w2,x1,x1,x1,l2,x1,x1,x1,w2,x1,x1,l2,
  x1,x1,x1,x1,w2,x1,x1,x1,x1,x1,w2,x1,x1,x1,x1,
  x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,
  x1,x1,l2,x1,x1,x1,l2,x1,l2,x1,x1,x1,l2,x1,x1,
  w3,x1,x1,l2,x1,x1,x1,w2,x1,x1,x1,l2,x1,x1,w3,
  x1,x1,l2,x1,x1,x1,l2,x1,l2,x1,x1,x1,l2,x1,x1,
  x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,
  x1,x1,x1,x1,w2,x1,x1,x1,x1,x1,w2,x1,x1,x1,x1,
  l2,x1,x1,w2,x1,x1,x1,l2,x1,x1,x1,w2,x1,x1,l2,
  x1,x1,w2,x1,x1,x1,l2,x1,l2,x1,x1,x1,w2,x1,x1,
  x1,w2,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,w2,x1,
  w3,x1,x1,l2,x1,x1,x1,w3,x1,x1,x1,l2,x1,x1,w3
];


interface LetterInfo {
  [index:string]: {
    points: number,
    count: number
  }
}
const letter_info : LetterInfo = {
  "a": {points: 1, count: 9}, "b": {points: 3, count: 2}, "c": {points: 3, count: 2},
  "d": {points: 2, count: 4}, "e": {points: 1, count: 12}, "f": {points: 4, count: 2},
  "g": {points: 2, count: 3}, "h": {points: 4, count: 2}, "i": {points: 1, count: 9},
  "j": {points: 8, count: 1}, "k": {points: 5, count: 1}, "l": {points: 1, count: 4},
  "m": {points: 3, count: 2}, "n": {points: 1, count: 6}, "o": {points: 1, count: 8},
  "p": {points: 3, count: 2}, "q": {points: 10, count: 1}, "r": {points: 1, count: 6},
  "s": {points: 1, count: 4}, "t": {points: 1, count: 6}, "u": {points: 1, count: 4},
  "v": {points: 4, count: 2}, "w": {points: 4, count: 2}, "x": {points: 8, count: 1},
  "y": {points: 4, count: 2}, "z": {points: 10, count: 1}, "_": {points: 0, count: 2}
};
interface PlayerDesc {
  [index: string] : {
    joined: number,
    key: string,
    letters: string
  }
};
interface ScoreDesc {
  [index: string] : number
};
export const makeNewGame = functions.https.onCall((data:string[], context:any) => {
  return new Promise((resolve, reject) => {
    db.ref("/").once("value").then((snapshot:any) => {
      const root = snapshot.val();
      if (root.config.instances <= Object.keys(root.games).length){
        root.games[Object.keys(root.games).sort((a,b) => {return root.games[a].state.lastMod - root.games[b].state.lastMod})[0]] = null;
      }
      let bag = Array.from(Object.keys(letter_info).map((val:string) => {
        const arr : string[] = Array(letter_info[val].count);
        return arr.fill(val).join("");
      }).join("")).sort((a,b) => {
        return (Math.random()>0.5 ? 1 : -1);
      }).join("");
      const letters = bag.substring(0, 7);
      bag = bag.substring(7);
      let player : PlayerDesc = {}
      player[data[1]] = {
        joined: 0,
        key: data[2],
        letters: letters
      };
      let score : ScoreDesc = {}
      score[data[1]] = 0;
      let game = {
        creator: (context.auth ? context.auth.token.email : ""),
        bag: bag,
        players: player,
        state: {
          board: Array(225).fill(" ").join(""),
          points: Array(225).fill(" ").join(""),
          lastMod: getTimeStamp(),
          over: false,
          player: data[1],
          started: false,
          turn: 0,
          score: score
        }
      };
      root.games[data[0]] = game;
      db.ref(`/`).set(root).then(() => {
        resolve(["success", letters, game.state]);
      }).catch(() => {
        resolve(["reject", "Internal write error"])
      });
    }).catch((err:any) => {
      resolve(["failure", `Internal read error. ${err}, ${context}`]);
    });
  });
});

export const getGame = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve, reject) => {
    db.ref("/").once("value").then((snapshot:any) => {
      let letters = Array(8).join(" ");
      let score = 0;
      if (Object.keys(snapshot.val().games).includes(data[0])){  // check game validity
        const game = snapshot.val().games[data[0]];
        if (Object.keys(game.players).includes(data[1])){  // check player name
          if (game.players[data[1]].key === data[2]){  // check player key
            letters = game.players[data[1]].letters;
            score = game.state.score[data[1]];
            resolve(["success", letters, game.state]);
          } else{  // invalid name->key pair
            resolve(["failure", "Invalid user-key pair"]);
          }
        } else if(!game.state.started){  // new player
          // console.log("new user")
          letters = game.bag.substring(0, 7);
          game.bag = game.bag.substring(7);
          game.players[data[1]] = {
            key: data[2],
            letters: letters,
            joined: Object.keys(game.players).length
          };
          game.state.score[data[1]] = score;
          game.state.lastMod = getTimeStamp();
          db.ref(`/games/${data[0]}/`).set(game).then(() => {
            resolve(["success", letters, game.state]);
          });
        } else if(game.state.started){
          resolve(["failure", "Game has already started"]);
        } else{
          resolve(["failure", "Uncaught error"]);
        }
      } else{
        resolve(["failure", "Game does not exist"]);
      }
    });
  });
});


export const deregisterUser = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve, reject) => {
    db.ref("/users").once("value").then((snapshot: any) => {
      if (snapshot.val()[data.targetUid].email === serviceAccount.project_owner_email){
        resolve("!! Cannot delete project owner")
      } else{
        if ((snapshot.val()[context.auth.uid].admin === true) || (context.auth.uid === data.targetUid)){
          const p_delUser = admin.auth().deleteUser(data.targetUid);
          const p_delUserInfo = db.ref(`/users/${data.targetUid}`).set(null);
          Promise.all([p_delUser, p_delUserInfo]).then(() => {
            resolve("success");
          }).catch((err: any) => {
            console.log(`Error in deleting user ${snapshot.val()[data.targetUid].email} by ${context.auth.email}: ${err}`);
            resolve("!! Failed to delete user");
          });
        } else{
          console.log(`Failed attempt to delete ${snapshot.val()[data.targetUid].email} by ${context.auth.email}.`);
          resolve("!! Inadequate permissions");
        }
      }
    }).catch(() => {
      resolve("!! Internal error");
    });
  });
});


interface setGameStarted_desc {
  0: Boolean,
  1: string,
  2: string,
  3: string
};
export const setGameStarted = functions.https.onCall((data:setGameStarted_desc) => {
  /*
  //  Set if game has started
  //  0: value: true/false
  //  1: gameName: name of game being affected
  //  2: playerName: name of player setting the value
  //  3: playerKey: key of the player setting the value
  */
  return new Promise((resolve, reject) => {
    if (Object.keys(data).length === 4){
      db.ref(`/games/${data[1]}`).once("value").then((snapshot:any) => {
        if (Object.keys(snapshot.val().players).includes(data[2]) &&
            snapshot.val().players[data[2]].key === data[3]){
          if (Object.keys(snapshot.val().players).length >= snapshot.val().state.turn) {
            db.ref(`/games/${data[1]}/state/started`).set(data[0]).then(() => {
              resolve(["success"]);
            }).catch(() => {
              resolve(["failure", "Internal error"]);
            });
          } else{
            db.ref(`/games/${data[1]}/state/started`).set(true);
            resolve(["failure", "Every player has already played"]);
          }
        } else{
          resolve(["failure", "Invalid user-key pair"]);
        }
      }).catch(() => {
        resolve(["failure", "Invalid game"]);
      });
    } else{
      resolve(["failure", "Invalid request"]);
    }
  });
});


const floodFillColUp = function(cell:any, board:any):any{
  if (board[cell] === " " || cell < 0){
    return [];
  } else if (Math.floor(cell/15) === 0){
    return [cell];
  } else{
    return [cell, ...floodFillColUp(cell-15, board)];
  }
}
const floodFillColDown = function(cell:any, board:any):any{
  if (board[cell] === " " || cell > 224){
    return [];
  } else if (Math.floor(cell/15) === 14){
    return [cell];
  } else{
    return [cell, ...floodFillColDown(cell+15, board)];
  }
}
const floodFillCol = ((cell:any, board:any):any => {
  if (board[cell] === " "){
    return []
  } else{
    return [...floodFillColUp(cell-15, board), ...floodFillColDown(cell, board)].sort((a,b) => {return a-b})
  }
});
const floodFillRowLeft = function(cell:any, board:any):any{
  if (board[cell] === " " || cell < 0){
    return [];
  } else if (cell%15 === 0){
    return [cell];
  } else{
    return [cell, ...floodFillRowLeft(cell-1, board)];
  }
}
const floodFillRowRight = function(cell:any, board:any):any{
  if (board[cell] === " " || cell > 224){
    return [];
  } else if(cell%15 === 14){
    return [cell];
  } else{
    return [cell, ...floodFillRowRight(cell+1, board)];
  }
}
const floodFillRow = ((cell:any, board:any):any => {
  if (board[cell] === " "){
    return []
  } else{
    return [...floodFillRowLeft(cell-1, board), ...floodFillRowRight(cell, board)].sort((a,b) => {return a-b})
  }
});
interface tiles_desc {
  [index:number]: string
};
const validateWords = ((tiles:tiles_desc, board:string) => {
  const location = Object.keys(tiles).map(v => {return parseInt(v);});
  for (let index in location){
    let row_word = floodFillRow(location[index], board).map((v:any) => {return board[v];}).join("");
    let col_word = floodFillCol(location[index], board).map((v:any) => {return board[v];}).join("");
    if ((!wordlist.includes(row_word) && row_word.length > 1) || (!wordlist.includes(col_word)) && col_word.length > 1){
      return false;
    }
  }
  return true;
});
const validateSurrounding = ((tiles:tiles_desc, board:string) => {
  const location = Object.keys(tiles).map(v => {return parseInt(v);});
  const col_word = floodFillCol(location[0], board);
  const row_word = floodFillRow(location[0], board);
  const base_row = location.filter((v:any) => {return row_word.includes(v);}).length === location.length;
  const base_col = location.filter((v:any) => {return col_word.includes(v);}).length === location.length;
  return base_row || base_col;
});
const allEqual = ((arr:number[]) => {
  return arr.every((v:any) => {return v === arr[0];});
});
const validateTiles = ((tiles:tiles_desc) => {
  const location = Object.keys(tiles);
  if (allEqual(location.map((v:any) => {return Math.floor(v/15);})) || allEqual(location.map((v:any) => {return v%15;}))){  // check alignment
    return true;
  } else{
    return false;
  }
});
const getUniqueIndex = ((baseStr:string, luStr:string[]) => {
  const bArr = Array.from(baseStr);
  let out = [];
  for (let el in luStr){
    const elIndex = bArr.indexOf(luStr[el][0]);
	  if (elIndex === -1 || luStr[el][0] === "*"){
			return -1;
		} else{
      delete bArr[elIndex]
      out.push(elIndex);
    }
  }
  return out;
});
function replaceLetters(baseStr:any, indices:any, values:any){
  let bArr = Array.from(baseStr);
	for (let elIndex in indices){
		bArr[indices[elIndex]] = values[elIndex];
	}
	return bArr.join("");
}
const getNewScore = ((tiles:tiles_desc, board:string) => {
  /*
  // tiles : {[index:location] : "letter"}
  // board : new board as string
  */
  const location = Object.keys(tiles).map(v => {return parseInt(v);});
  const rows = location.map(v => {return Math.floor(v/15);});
  const cols = location.map(v => {return v%15;});
  let new_score = (location.length === 7 ? 50 : 0);
  if (allEqual(rows)){  // horizontal tiles
    const base_word = floodFillRow(location[0], board);
    new_score = new_score + (base_word.length > 1 ? base_word.map((v:any) => {return letter_info[board[v]].points * (location.includes(v) ? bonusLayout[v][0] : 1);}).reduce((a:any, b:any) => {return a+b;}) * location.map((v:any) => {return bonusLayout[v][1];}).reduce((a:any, b:any) => {return a*b}) : 0);
    for (let index in location){
      const col_word = floodFillCol(location[index], board);
      if (col_word.length > 1){
        new_score = new_score + col_word.map((v:any) => {return letter_info[board[v]].points * (location.includes(v) ? bonusLayout[v][0] : 1);}).reduce((a:any, b:any) => {return a+b;}) * bonusLayout[location[index]][1];
      }
    }
    return new_score;
  } else if (allEqual(cols)){  // vertical tiles
    const base_word = floodFillCol(location[0], board);
    new_score = new_score + (base_word.length > 1 ? base_word.map((v:any) => {return letter_info[board[v]].points * (location.includes(v) ? bonusLayout[v][0] : 1);}).reduce((a:any, b:any) => {return a+b;}) * location.map((v:any) => {return bonusLayout[v][1];}).reduce((a:any, b:any) => {return a*b}) : 0);
    for (let index in location){
      const row_word = floodFillRow(location[index], board);
      if (row_word.length > 1){
        new_score = new_score + row_word.map((v:any) => {return letter_info[board[v]].points * (location.includes(v) ? bonusLayout[v][0] : 1);}).reduce((a:any, b:any) => {return a+b;}) * bonusLayout[location[index]][1];
      }
    }
    return new_score;
  } else{  // failed to get score
    return -1;
  }
});
interface submitTiles_desc {
  0: {0: string, 1: string, 2: string},
  1: {
    [index:number] : string
  }
};
export const submitTiles = functions.https.onCall((data:submitTiles_desc) => {
  /*
  // data[0]: [game name, player name, player key]
  // data[1]: {[index:location] : "letter"}
  */
  return new Promise((resolve, reject) => {
    if (Object.keys(data).length === 2 && Object.keys(data[0]).length === 3 && data[0][0].length !== 0 &&
        data[0][1].length !== 0 && data[0][2].length !== 0 && Object.keys(data[1]).length !== 0){
      const tiles = data[1];
      const tileWords = validateTiles(tiles);
      if (tileWords){
        db.ref(`/games/${data[0][0]}`).once("value").then((snapshot:any) => {
          // console.log("recieved snapshot");
          let game = snapshot.val();
          if (Object.keys(game.players).includes(data[0][1])){  // check player exists in game
            if (data[0][1] === game.state.player){  // check player turn
              if (game.players[data[0][1]].key === data[0][2]){  // check player key
                const changed_letter_index = getUniqueIndex(game.players[data[0][1]].letters, Object.values(tiles));
                if (changed_letter_index !== -1){  // check if valid letters were played
                  game.state.board = Array.from(game.state.board);
                  for (let board_index in tiles){
                    game.state.board[board_index] = tiles[board_index][1 % tiles[board_index].length];
                  }
                  const new_board = game.state.board.join("")
                  if (validateSurrounding(tiles, new_board) || game.state.board.join("").trim().length === 0){
                    if (validateWords(tiles, new_board)){
                      game.state.board = new_board;
                      game.state.points = Array.from(game.state.points);
                      for (let board_index in tiles){
                        game.state.points[board_index] = tiles[board_index][0 % tiles[board_index].length];
                      }
                      game.state.points = game.state.points.join("");
                      game.state.turn = game.state.turn + 1;
                      game.state.started = (game.state.turn >= Object.keys(game.players).length);
                      game.state.lastMod = getTimeStamp();
                      for (let player in game.players){
                        if ((game.state.turn % Object.keys(game.players).length) === game.players[player].joined){
                          game.state.player = player;
                        }
                      }
                      let new_letters = "";
                      if (Object.keys(tiles).length > game.bag.length){
                        new_letters = `${game.bag}${Array(Object.keys(tiles).length-game.bag.length).fill("*").join("")}`;
                        game.bag = "";
                      } else{
                        new_letters = game.bag.substring(0, Object.keys(tiles).length);
                        game.bag = game.bag.substring(Object.keys(tiles).length);
                      }
                      game.players[data[0][1]].letters = replaceLetters(game.players[data[0][1]].letters, changed_letter_index, new_letters);
                      game.state.score[data[0][1]] = game.state.score[data[0][1]] + getNewScore(tiles, game.state.points);
                      db.ref(`/games/${data[0][0]}`).set(game).then(() => {
                        resolve(["success", game.players[data[0][1]].letters]);
                      }).catch(() => {
                        resolve(["failure", "Internal write error"]);
                      });
                    } else{
                      resolve(["failure", "Invalid word"]);
                    }
                  } else{
                    resolve(["failure", "Tiles not connected"]);
                  }
                } else{
                  resolve(["failure", "Invalid letters"]);
                }
              } else{
                resolve(["failure", "Invalid player key"]);
              }
            } else{
              resolve(["failure", "Out of turn move"]);
            }
          } else{
            resolve(["failure", "Invalid player"]);
          }
        }).catch(() => {
          resolve(["failure", "Internal read error"]);
        });
      } else{
        resolve(["failure", "Tiles not horizontal or vertical"]);
      }
    } else{
      resolve(["failure", "Malformed request"]);
    }
  });

});


interface replaceTiles_desc {
  0: {0: string, 1: string, 2: string},
  1: string
};
export const replaceTiles = functions.https.onCall((data:replaceTiles_desc) => {
  /*
  // data[0]: [game name, player name, player key]
  // data[1]: "letter"
  */
  return new Promise((resolve, reject) => {
    if (Object.keys(data).length === 2 && Object.keys(data[0]).length === 3 && data[0][0].length !== 0 &&
      data[0][1].length !== 0 && data[0][2].length !== 0 && data[1].length !== 0){
      const tiles = data[1];
      db.ref(`/games/${data[0][0]}`).once("value").then((snapshot:any) => {
        let game = snapshot.val();
        if (game.bag.length >= data[1].length){  // ensure enough tiles are remaining
          if (Object.keys(game.players).includes(data[0][1])){  // check if player exists
            if (data[0][1] === game.state.player){  // ensure player's turn
              if (game.players[data[0][1]].key === data[0][2]){  // check player key
                const changed_letter_index = getUniqueIndex(game.players[data[0][1]].letters, Object.values(tiles));
                if (changed_letter_index !== -1){
                  game.state.turn = game.state.turn + 1;
                  // game.state.over = false;
                  game.state.started = (game.state.turn >= Object.keys(game.players).length);
                  game.state.lastMod = getTimeStamp();
                  for (let player in game.players){
                    if ((game.state.turn % Object.keys(game.players).length) === game.players[player].joined){
                      game.state.player = player;
                    }
                  }
                  const send_letters = game.bag.substring(0, Object.keys(tiles).length);
                  game.bag = game.bag.substring(Object.keys(tiles).length);
                  game.players[data[0][1]].letters = replaceLetters(game.players[data[0][1]].letters, changed_letter_index, send_letters);
                  game.bag = game.bag + tiles;
                  game.bag = Array.from(game.bag).sort((a,b) => {
                    return Math.random();
                  }).join("");
                  db.ref(`/games/${data[0][0]}`).set(game).then(() => {
                    resolve(["success", game.players[data[0][1]].letters]);
                  }).catch(() => {
                    resolve(["failure", "Internal write error"]);
                  });
                } else{
                 resolve(["failure", "Invalid letters"]);
                }
              } else{
                resolve(["failure", "Invalid player key"]);
              }
            } else{
              resolve(["failure", "Out of turn move"]);
            }
          } else{
            resolve(["failure", "Invalid player"]);
          }
        } else{
          resolve(["failure", `Bag only contains ${game.dag.length} tiles`]);
        }
      }).catch(() => {
        resolve(["failure", `Internal read error`]);
      });
    } else{
      resolve(["failure", "Malformed request"]);
    }
  });
});
