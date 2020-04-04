import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder } from '@angular/forms';
import { PlayerCard } from '../../player-card/player-card/player-card.component';
import { Player } from 'src/models/player';

@Component({
  selector: 'pick-name',
  templateUrl: './pick-name.component.html',
  styleUrls: ['./pick-name.component.scss']
})
export class PickName {

  description: string;

  constructor(
    private dialogRef: MatDialogRef<PickName>,
    @Inject(MAT_DIALOG_DATA) data) { }

  close() {
    this.dialogRef.close();
  }

}
