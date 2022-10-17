import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: 'menu',
    component: MenuPage,
    children: [
      {
        path: 'first',
        loadChildren: () => import('../first/first.module').then( m => m.FirstPageModule)
      },
      {
        path: 'second',
        loadChildren: () => import('../second/second.module').then( m => m.SecondPageModule)
      },
      {
        path: 'movies',
        loadChildren: () =>
          import('../movies/movies.module').then((m) => m.MoviesPageModule),
      },
      {
        path: 'movies/:id',
        loadChildren: () =>
          import('../movie-details/movie-details.module').then(
            (m) => m.MovieDetailsPageModule
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('../products/products.module').then((m) => m.ProductsPageModule),
      },
      {
        path: 'movies/:id',
        loadChildren: () =>
          import('../product-details/product-details.module').then(
            (m) => m.ProductDetailsPageModule
          ),
      },
    ]
  },
  {
    path: '',
    redirectTo: '/menu/first',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule {}