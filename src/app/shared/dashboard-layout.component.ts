import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({ selector: 'app-dashboard-layout', standalone: true, imports: [RouterLink, RouterOutlet], template: `<header class="main-header"><a class="brand" routerLink="/dashboard">🎓 BioAsistencia</a><nav><a routerLink="/dashboard">Inicio</a><a routerLink="/alumnos/nuevo">Registrar alumno</a><a routerLink="/asistencia">Marcar asistencia</a><a routerLink="/reportes">Reportes</a><a routerLink="/alumnos">Lista de alumnos</a></nav><button class="logout" (click)="logout()">Salir</button></header><router-outlet />` })
export class DashboardLayoutComponent { constructor(private auth: AuthService, private router: Router) {} async logout() { await this.auth.logout(); await this.router.navigateByUrl('/login'); } }
