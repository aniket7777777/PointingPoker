import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {PointingDashboardComponent} from './pointing-dashboard/pointing-dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'pointingDashboard', component: PointingDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
