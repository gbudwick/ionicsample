import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite, CapacitorSQLite } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';


const DB_SETUP_KEY = 'first_db_setup';
const DB_NAME_KEY = 'db_name';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  dbReady = new BehaviorSubject(false);
  dbName = '';

  constructor(private http: HttpClient, private alertCtrl: AlertController) { }

  async init(): Promise<void> {
    const info = await Device.getInfo();
    //if (info.platform === 'android') {
     

      try {
        
        var db = (await Preferences.get({ key: DB_NAME_KEY })).value;
        const sqlite = CapacitorSQLite as any;
        await sqlite.requestPermissions();
        await this.setupDatabase();
      } catch (e) {
        const alert = await this.alertCtrl.create({
          header: 'No DB access',
         message: 'This app can\'t work without Database access. ' + e.message,
         buttons: ['OK']
        });
        await alert.present();
      }
   // } else {
     // this.setupDatabase();
  //  }
  }

  private async setupDatabase() {
    try{
      const dbSetupDone = await Preferences.get({ key: DB_SETUP_KEY });
      
     if (!dbSetupDone.value) {
        this.downloadDatabase();
      } else {
        this.dbName = (await Preferences.get({ key: DB_NAME_KEY })).value;
        await CapacitorSQLite.open({ database: 'product-db' });
        this.dbReady.next(true);
     }
    }
    catch(e){
      const alert = await this.alertCtrl.create({
        header: 'setdb',
       message: e.message,
       buttons: ['OK']
      });
      await alert.present();
    }
    
  }

  // Potentially build this out to an update logic:
  // Sync your data on every app start and update the device DB
  private async downloadDatabase(update = false) {
    this.http.get('https://devdactic.fra1.digitaloceanspaces.com/tutorial/db.json').subscribe(async (jsonExport: JsonSQLite) => {
      const jsonstring = JSON.stringify(jsonExport);
      const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });
      
      if (true) {
        this.dbName = jsonExport.database;
        await Preferences.set({ key: DB_NAME_KEY, value: this.dbName });
        await CapacitorSQLite.importFromJson({ jsonstring });
        await Preferences.set({ key: DB_SETUP_KEY, value: '1' });

        // Your potential logic to detect offline changes later
        if (!update) {
          const alert = await this.alertCtrl.create({
            header: 'update',
           message: 'This app can\'t work without Database access. ',
           buttons: ['OK']
          });
          await alert.present();
          await CapacitorSQLite.createSyncTable({ database: this.dbName});
        } else {
          await CapacitorSQLite.setSyncDate({ syncdate: '' + new Date().getTime() })
        }
        this.dbReady.next(true);
      }
      else{
        const alert = await this.alertCtrl.create({
          header: 'not valid json',
         message: 'This app can\'t work without Database access. ',
         buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  getProductList() {
    return this.dbReady.pipe(
      switchMap(isReady => {
        if (!isReady) {
          return of({ values: [] });
        } else {
          const statement = 'SELECT * FROM products;';
          return from(CapacitorSQLite.query({ statement, values: [] }));
        }
      })
    )
  }
  
  async getProductById(id) {
    const statement = `SELECT * FROM products LEFT JOIN vendors ON vendors.id=products.vendorid WHERE products.id=${id} ;`;
    return (await CapacitorSQLite.query({ statement, values: [] })).values[0];
  }
  
  getDatabaseExport(mode) {
    return CapacitorSQLite.exportToJson({ jsonexportmode: mode });
  }
  
  addDummyProduct(name) {
    const randomValue = Math.floor(Math.random() * 100) + 1;
    const randomVendor = Math.floor(Math.random() * 3) + 1
    const statement = `INSERT INTO products (name, currency, value, vendorid) VALUES ('${name}','EUR', ${randomValue}, ${randomVendor});`;
    return CapacitorSQLite.execute({ statements: statement });
  }
  
  deleteProduct(productId) {
    const statement = `DELETE FROM products WHERE id = ${productId};`;
    return CapacitorSQLite.execute({ statements: statement });
  }
  
  // For testing only..
  async deleteDatabase() {
    const dbName = await Preferences.get({ key: DB_NAME_KEY });
    await Preferences.set({ key: DB_SETUP_KEY, value: null });
    return CapacitorSQLite.deleteDatabase({ database: dbName.value });
  }
}