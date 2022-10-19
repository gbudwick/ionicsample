import { Component } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
// costamgr  Yqw2gmb!!
@Component({
  selector: 'app-products',
  templateUrl: 'products.page.html',
  styleUrls: ['products.page.scss'],
})
export class ProductsPage {
  products = [];
  export = null;
  newProduct = 'My cool product';

  constructor(private databaseService: DatabaseService) {
    this.loadProducts();
  }

  async loadProducts() {
    const productList = (await this.databaseService.getProductList()).values();

    for (const p of productList) {
      this.products.push(p);
    }
  }

  // Mode is either "partial" or "full"
  async createExport(mode) {
    const dataExport = await this.databaseService.getDatabaseExport(mode);
    this.export = dataExport.export;
  }

  async addProduct() {
    await this.databaseService.addDummyProduct(this.newProduct);
    this.newProduct = '';
    this.loadProducts();
  }

  async deleteProduct(product) {    
    await this.databaseService.deleteProduct(product.id);
    this.products = this.products.filter(p => p != product);    
  }

  // For testing..
  deleteDatabase() {
    this.databaseService.deleteDatabase();
  }
}