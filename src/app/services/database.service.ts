import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite, CapacitorSQLite } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { SqliteOfficialService } from './sqlite-official.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const DB_SETUP_KEY = 'first_db_setup';
const DB_NAME_KEY = 'db_name';
const DB_VERSION = 1;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  dbReady = new BehaviorSubject(false);
  dbName = '';

  constructor(private http: HttpClient, private alertCtrl: AlertController,
    private sqlite: SqliteOfficialService) { }

  async init(): Promise<void> {
    const info = await Device.getInfo();
    //if (info.platform === 'android') {
      console.log("**** init");
      this.setupDatabase();
      // try {
        
      //   var db = (await Preferences.get({ key: DB_NAME_KEY })).value;
      //   const sqlite = CapacitorSQLite as any;
      //   await sqlite.requestPermissions();
      //   await this.setupDatabase();
      // } catch (e) {
      //   const alert = await this.alertCtrl.create({
      //     header: 'No DB access',
      //    message: 'This app can\'t work without Database access. ' + e.message,
      //    buttons: ['OK']
      //   });
      //   await alert.present();
      // }
   // } else {
     // this.setupDatabase();
  //  }
  }

  private async setupDatabase() {
    try{
      const dbSetupDone = await Preferences.get({ key: DB_SETUP_KEY });
      
     if (true) {
        this.downloadDatabase();
      } else {
        this.dbName = (await Preferences.get({ key: DB_NAME_KEY })).value;
        await await this.sqlite.openDB('product-db', DB_VERSION);
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

  async ExportDb() {
    const dbConnection = await this.sqlite.openDB('product-db', DB_VERSION);

    const json = await dbConnection.exportToJson('partial');

    var j = {"body": JSON.stringify(json)};
    var headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json' );
    //const requestOptions = new RequestOptions({ headers: headers });
    this.http.post<any>('https://costaapiwebdemo.azurewebsites.net/datasource/', json).subscribe({
      next: data => {
      },
      error: error => {
          console.error('There was an error!', error);
      }
  })
    
    console.log('JSON', JSON.stringify(j));
    
  }

  // Potentially build this out to an update logic:
  // Sync your data on every app start and update the device DB
  private async downloadDatabase(update = false) {
    this.http.get('https://costaapiwebdemo.azurewebsites.net/datasource').subscribe(async (jsonExport: JsonSQLite) => {
    //https://devdactic.fra1.digitaloceanspaces.com/tutorial/db.json'  
    const jsonstring = JSON.stringify(jsonExport);
    this.sqlite.dropDatabase("/data/data/io.ionic.starter/databases/product-dbSQLite.db");
    console.log("**** json", jsonstring);
      const isValid = await this.sqlite.isJsonValid( jsonstring );
      console.log("**** download db");
      if (isValid) {
        try {
          this.dbName = jsonExport.database;
         // await this.sqlite.deleteOldDatabases();
          await Preferences.set({ key: DB_NAME_KEY, value: this.dbName });
          await this.sqlite.importFromJson( jsonstring );
          console.log("**** import");
          await Preferences.set({ key: DB_SETUP_KEY, value: '1' });

          console.log('DB LIST', (await this.sqlite.getDatabaseList()).values);
        }
        catch(e)
        {
          const alert = await this.alertCtrl.create({
            header: 'is valid',
          message: e.message,
          buttons: ['OK']
          });
          await alert.present();
        }
        this.dbReady.next(true);
      }
      else{
        console.log("json", jsonstring);
        const alert = await this.alertCtrl.create({
          header: 'not valid json',
         message: 'This app can\'t work without Database access. ',
         buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async getProductList() {
    console.log("**** get products");
          const dbConnection = await this.sqlite.openDB('product-db', DB_VERSION);
          const statement = 'SELECT * FROM products;';
          const values = []
          var result = await dbConnection.query( statement, values );
          dbConnection.close();
          console.log("product list: ", result.values);
          return result.values;
  }
  
  async getProductById(id) {
    const statement = "SELECT * FROM products  WHERE products.id=" + id;
    const dbConnection = await this.sqlite.openDB('product-db', DB_VERSION);
    const values = []
    var result = await dbConnection.query( statement, values );
    dbConnection.close();
    return result.values[0];
  }

  async updateProduct(name, id){
    const dbConnection = await this.sqlite.openDB('product-db', DB_VERSION);
    const statement = "UPDATE products set name = '" + name + "' where id = " + id;
    await dbConnection.execute( statement );
    dbConnection.close();
  }
  
  // getDatabaseExport(mode) {
  //   return this.sqlite.ex({ jsonexportmode: mode });
  // }
  
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
    const dbConnection = await this.sqlite.openDB('product-db', DB_VERSION);
    const dbName = await Preferences.get({ key: DB_NAME_KEY });
    await Preferences.set({ key: DB_SETUP_KEY, value: null });
    return this.sqlite.deleteOldDatabases();
  }
}