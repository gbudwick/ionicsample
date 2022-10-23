import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms'
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class DetailsPage implements OnInit {
  product = null;

  constructor(private route: ActivatedRoute, private databaseService: DatabaseService,
    private router: Router, private navController: NavController) { }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.product = await this.databaseService.getProductById(id);
  }

  async saveProduct()
  {
    console.log(this.product.name);

    await this.databaseService.updateProduct(this.product.name, this.product.id)
    .then( () => {
      this.navController.navigateBack(['/menu/products'])
    });
      
  }
}