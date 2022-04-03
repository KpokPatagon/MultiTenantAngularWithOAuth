import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/authorization/auth-guard';
import { OunitsComponent } from './ounits/ounits.component';
import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', component: OunitsComponent, canActivate: [AuthGuard] },
            { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard] },
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OunitsRoutingModule { }
