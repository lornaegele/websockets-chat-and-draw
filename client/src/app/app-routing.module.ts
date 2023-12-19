import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/start/start.module').then((m) => m.StartModule),
  },
  {
    path: 'skribble',
    loadChildren: () =>
      import('./pages/start/start.module').then((m) => m.StartModule),
  },
  {
    path: 'chat/:roomId',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'skribble/:roomId',
    loadChildren: () =>
      import('./pages/skribble-main/skribble-main.module').then(
        (m) => m.SkribbleMainModule
      ),
  },
  { path: 'customers', loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
