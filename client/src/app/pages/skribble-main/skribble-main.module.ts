import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkribbleMainComponent } from './skribble-main.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DrawingAreaComponent } from 'src/app/components/drawing-area/drawing-area.component';
import { SidebarComponent } from 'src/app/components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';

const routes: Routes = [{ path: '', component: SkribbleMainComponent }];

@NgModule({
  declarations: [SkribbleMainComponent, DrawingAreaComponent, SidebarComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    SharedModule,
    MatIconModule,
    ClipboardModule,
  ],
  exports: [RouterModule],
})
export class SkribbleMainModule {}
