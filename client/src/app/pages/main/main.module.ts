import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChatComponent } from 'src/app/components/chat/chat.component';
import { ClipboardModule } from '@angular/cdk/clipboard';

const routes: Routes = [{ path: '', component: MainComponent }];

@NgModule({
  declarations: [MainComponent, ChatComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatIconModule,
    SharedModule,
    ClipboardModule,
  ],
  exports: [RouterModule],
})
export class MainModule {}
