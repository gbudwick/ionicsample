import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  pages = [
    {
      title: 'First Page',
      url: '/menu/first'
    },
    {
      title: 'Second Page',
      url: '/menu/second'
    },
    {
      title: 'Movies',
      url: '/menu/movies'
    }
    ,
    {
      title: 'Products',
      url: '/menu/products'
    }
  ];
 
  constructor() {

  }
 
  ngOnInit() {
 
  }
}