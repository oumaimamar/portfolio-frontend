import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {ProfileComponent} from './features/profile/profile.component';
import {CertificationsComponent} from './features/certifications/certifications.component';
import {DashboardComponent} from './features/dashboard/dashboard.component';
import {ProfileWizardComponent} from './features/profile-wizard/profile-wizard.component';
import {ProjectsComponent} from './features/projects/projects.component';
import {ProjectMediaComponent} from './features/project-media/project-media.component';

const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'certifications', component: CertificationsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },


  { path: 'profile-wizard', component: ProfileWizardComponent },
  { path: 'projects/:projectId/media', component: ProjectMediaComponent },
  { path: 'projects/media', component: ProjectMediaComponent },




  // {
  //   path: 'profile-wizard',
  //   component: ProfileWizardComponent,
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'portfolio',
  //   component: PortfolioComponent,
  //   canActivate: [AuthGuard, ProfileCompletionGuard]
  // },

  { path: '', redirectTo: 'portfolio', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
