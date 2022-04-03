import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { FallbackComponent } from './home/fallback.component';
import { LoggedOutComponent } from './home/logged-out.component';
import { LostUserComponent } from './home/lost-user.component';
import { AuthComponent } from './authorization/auth.component';

import { AppGlobals } from '@app/app-globals';

const routes: Routes = AppGlobals.disabledMultitenancy
    ? [
        {
            path: 'ounits',
            loadChildren: () => import('./ounits/ounits.module').then(m => m.OunitsModule)
        },
        {
            path: 'authorization',
            children: [
                { path: 'logout', component: AuthComponent }
            ]
        },
        { path: 'home', component: HomeComponent },
        { path: 'logged-out', component: LoggedOutComponent},
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        { path: '**', component: FallbackComponent }
    ]
    : [
        { path: 'lost-user', component: LostUserComponent },
        {
            path: ':tenant_name',
            children: [
                {
                    path: 'ounits',
                    loadChildren: () => import('./ounits/ounits.module').then(m => m.OunitsModule)
                },
                {
                    path: 'authorization',
                    children: [
                        { path: 'logout', component: AuthComponent }
                    ]
                },
                { path: 'home', component: HomeComponent },
                { path: 'logged-out', component: LoggedOutComponent},
                { path: '', redirectTo: 'home', pathMatch: 'full' },
                { path: '**', component: FallbackComponent }
            ]
        },
        { path: '**', component: LostUserComponent, pathMatch: 'full' }
    ];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
