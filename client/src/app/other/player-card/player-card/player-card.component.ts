import { Component, OnInit, Input } from '@angular/core';
import { Player } from 'src/models/player';

@Component({
  selector: 'player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})
export class PlayerCard implements OnInit {

  constructor() { }

  @Input() player: Player;
  
  ngOnInit() {
  }

}
