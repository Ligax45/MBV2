import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-recipe-search-bar',
  imports: [FormsModule, IconField, InputIcon, InputText, Button],
  templateUrl: './recipe-search-bar.component.html',
  styleUrl: './recipe-search-bar.component.css',
})
export class RecipeSearchBarComponent {
  readonly value = input('');
  readonly valueChange = output<string>();

  readonly placeholder = input('Rechercher une recette par titre…');

  onInput(value: string): void {
    this.valueChange.emit(value);
  }

  clear(): void {
    this.valueChange.emit('');
  }
}
