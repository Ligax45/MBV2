import { Component } from '@angular/core';

import { NavListComponent } from '@layout/components/nav-list/nav-list.component';

@Component({
  selector: 'app-sidebar',
  imports: [NavListComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {}
