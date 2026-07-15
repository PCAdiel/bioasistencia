import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-dashboard-layout', standalone: true, imports: [CommonModule, RouterLink, RouterOutlet],
  template: `<header><b>BioAsistencia</b><nav><a routerLink="/dashboard">Inicio</a><a routerLink="/alumnos">Alumnos</a><a routerLink="/asistencia">Asistencia</a><a routerLink="/cursos">Cursos</a><a *ngIf="auth.isAdmin()" routerLink="/usuarios">Usuarios</a><a *ngIf="auth.isAdmin()" routerLink="/auditoria">Auditoría</a><a routerLink="/reportes">Reportes</a></nav><button (click)="logout()">Salir</button></header><router-outlet />`,
})
export class DashboardLayoutComponent {
  constructor(public auth: AuthService, private router: Router) {}
  async logout() { await this.auth.logout(); await this.router.navigateByUrl('/login'); }
}
