import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Player } from 'src/models/player';
import { PlayerCard } from './other/player-card/player-card/player-card.component';
import { PickName } from './other/pick-name/pick-name/pick-name.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  player: Player = new Player(null, null);
  playerList: Array<Player>;
  curentPlayer: Boolean;

  constructor(private webSocketService: WebSocketService, public dialog: MatDialog, private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    // Here we will listen to everything comming from the socket.io server
    // List of player
    this.webSocketService.listen('listPlayer').subscribe((data: any) => {
      console.log(data);
      this.playerList = [];
      data.listePlayer.map((player) => {
        console.log(player[0], player[1]);
        this.playerList.push(new Player(player[0], player[1]));
        this.setCutrentPlayer();
      })
      console.log(this.playerList);
    })

    // New Dice roll to display
    this.webSocketService.listen('roll').subscribe((data: any) => {
      console.log(data);
      this.openSnackBar(data.rule, "Okey");
      this.rollDice(data.number);
    })

    this.openNameSelection();
  }

  ngOnDestroy() {
    this.webSocketService.disconect();
  }


  setCutrentPlayer() {
    if (this.player.playerName === this.playerList[0].playerName) {
      this.player.id = this.playerList[0].id;
      this.curentPlayer = true;
    } else this.curentPlayer = false;
  }

  startRolling() {
    // send Dice Roll to the server.
    this.webSocketService.emit('roll', [this.getRandomNumber(1, 6), this.getRandomNumber(1, 6)]);
  }

  rollDice(dataset) {
    // Visual for dice.
    const dice = document.querySelectorAll(".die-list");
    dice.forEach(die => {
      this.toggleClasses(die);
      // @ts-ignore
      die.dataset.roll = dataset.pop();
    });
  }

  toggleClasses(die) {
    // Visual for dice.
    die.classList.toggle("odd-roll");
    die.classList.toggle("even-roll");
  }

  //Dialog Box
  openProfile(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;

    this.dialog.open(PlayerCard, dialogConfig);
  }

  openNameSelection(): void {
    let playerName: string = "";
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = playerName;
    const dialogRef = this.dialog.open(PickName, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed and Player Name is :', result);
      this.player.playerName = result;
      this.webSocketService.emit('addPlayer', this.player.playerName);
    });
  }


  // Other Functions
  getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  canPlay() {
    if (this.playerList != undefined && this.playerList.length > 1 && this.curentPlayer) return true;
    return false;
  }

  openSnackBar(message: string, action: string) {
    if (message != "0") {
      this._snackBar.open(message, action, {
        duration: 2000,
      });
    }
  }
}
