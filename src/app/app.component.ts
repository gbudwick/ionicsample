import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { DatabaseService } from './services/database.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private databaseService: DatabaseService,
    private loadingCtrl: LoadingController
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    const DB_SETUP_KEY = 'first_db_setup';
    this.platform.ready().then(async () => {
      const loading = await this.loadingCtrl.create();
      //await loading.present();
      await Preferences.remove({ key: DB_SETUP_KEY });
      await this.databaseService.init();
      this.databaseService.dbReady.subscribe(isReady => {
        if (isReady) {
          loading.dismiss();
          StatusBar.setStyle({ style: Style.Light });
          SplashScreen.hide();
        }
      });
    });
  }
} 