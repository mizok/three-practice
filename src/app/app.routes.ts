import { Routes } from '@angular/router';
import { CATALOGUE } from './catalogue';

export const routes: Routes = [
  {
    path: '',
    redirectTo: CATALOGUE[0].path,
    pathMatch: 'full',
  },
  ...CATALOGUE,
];
