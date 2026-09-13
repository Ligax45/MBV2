import { Component } from '@angular/core';

import { NavListComponent } from '@layout/components/nav-list/nav-list.component';
import { SidebarAuthFooterComponent } from '@layout/components/sidebar-auth-footer/sidebar-auth-footer.component';

@Component({
  selector: 'app-sidebar',
  imports: [NavListComponent, SidebarAuthFooterComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {}
