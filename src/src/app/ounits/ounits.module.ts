import { NgModule } from '@angular/core';

import { OunitsRoutingModule } from './ounits-routing.module';
import { OverviewComponent } from './overview/overview.component';
import { OunitsComponent } from './ounits/ounits.component';


@NgModule({
    declarations: [
        OverviewComponent,
        OunitsComponent,
  ],
    imports: [
        OunitsRoutingModule,
    ]
})
export class OunitsModule { }
