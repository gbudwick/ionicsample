import { Component, OnDestroy, OnInit } from '@angular/core';
import { subscribeOn } from 'rxjs/operators';
import { DatabaseService } from '../../services/database.service';
import { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';
// costamgr  Yqw2gmb!!
@Component({
  selector: 'app-products',
  templateUrl: 'products.page.html',
  styleUrls: ['products.page.scss'],
})
export class ProductsPage implements OnInit, OnDestroy  {
  products = [];
  export = null;
  newProduct = 'My cool product';
  networkStatus: any;
  networkListener: PluginListenerHandle;

  constructor(private databaseService: DatabaseService) {
    this.loadProducts();
  }

  ngOnInit() {
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
      console.log('Network status changed', status);
    });
    this.loadProducts();
  }

  IonViewDidEnter () {
    this.loadProducts();
  }

  async getNetWorkStatus() {
    this.networkStatus = await Network.getStatus();
    console.log("*** network: " + this.networkStatus);
  }

  endNetworkListener() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }

  

  async loadProducts() {
    const productList = (await this.databaseService.getProductList()).values();
    this.products =  [];
    for (const p of productList) {
      this.products.push(p);
    }
  }

  // Mode is either "partial" or "full"
  async createExport(mode) {
    await this.databaseService.ExportDb();
  }

  async exportProducts() {
    const productList = (await this.databaseService.getProductList()).values();
    var exportedProducts =  [];
    for (const p of productList) {
      const newProduct = 
      { name: p.name,
      currencty: p.currency,
      value: p.value,
      vendorId: p.vendorId};
      this.products.push(p);
        exportedProducts.push(newProduct)
    }
    
    await this.databaseService.ExportProducts({products: exportedProducts});
  }



  async importProducts()
  {
    this.databaseService.deleteProducts();
    this.databaseService.importProducts().then( () => {
      this.loadProducts();
      console.log("** imported products")
    }); 
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