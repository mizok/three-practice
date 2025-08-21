import { Route } from '@angular/router';

interface CatalogueItem extends Route {
  title: string;
  description?: string;
}

export const CATALOGUE: CatalogueItem[] = [
  {
    path: 'quaternion-revolution',
    loadComponent: () =>
      import('./quaternion-revolution/quaternion-revolution.component').then(
        (c) => c.QuaternionRevolutionComponent
      ),
    title: 'Quaternion Revolution',
    description: 'Explore the fascinating world of quaternion rotation.',
  },
];
