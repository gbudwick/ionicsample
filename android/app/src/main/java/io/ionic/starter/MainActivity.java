package io.ionic.starter;
import com.getcapacitor.community.database.sqlite.CapacitorSQLitePlugin;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    registerPlugin(CapacitorSQLitePlugin.class);

  }
}
