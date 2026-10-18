package com.arya.fit;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
  private volatile int siT=0,siR=0,siB=0,siL=0;
  public class AxBridge {
    @JavascriptInterface public String get(){ return siT+","+siR+","+siB+","+siL; }
    @JavascriptInterface public void style(final boolean dark){
      runOnUiThread(() -> { try {
        WindowInsetsControllerCompat c=WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if(c!=null){ c.setAppearanceLightStatusBars(!dark); c.setAppearanceLightNavigationBars(!dark); }
      } catch(Throwable t){} });
    }
  }
  private void pushInsets(){
    try {
      final WebView wv=getBridge().getWebView();
      if(wv==null) return;
      wv.evaluateJavascript("window.axSI&&axSI("+siT+","+siR+","+siB+","+siL+")", null);
    } catch(Throwable t){}
  }
  @Override public void onCreate(Bundle b){
    registerPlugin(RunEnginePlugin.class); registerPlugin(StepsPlugin.class); registerPlugin(AppIconPlugin.class); super.onCreate(b);
    WindowManager.LayoutParams p=getWindow().getAttributes(); p.preferredRefreshRate=120f; getWindow().setAttributes(p);
    try {
      final Window w=getWindow();
      WindowCompat.setDecorFitsSystemWindows(w,false);
      w.setStatusBarColor(Color.TRANSPARENT);
      w.setNavigationBarColor(Color.TRANSPARENT);
      if(Build.VERSION.SDK_INT>=29){ w.setNavigationBarContrastEnforced(false); }
      final WebView wv=getBridge().getWebView();
      wv.addJavascriptInterface(new AxBridge(),"AxInsets");
      final View content=findViewById(android.R.id.content);
      ViewCompat.setOnApplyWindowInsetsListener(w.getDecorView(), (v, ins) -> {
        Insets sb=ins.getInsets(WindowInsetsCompat.Type.systemBars()|WindowInsetsCompat.Type.displayCutout());
        Insets ime=ins.getInsets(WindowInsetsCompat.Type.ime());
        float d=getResources().getDisplayMetrics().density;
        siT=Math.round(sb.top/d); siL=Math.round(sb.left/d); siR=Math.round(sb.right/d);
        siB=ime.bottom>0 ? 0 : Math.round(sb.bottom/d);
        if(content!=null) content.setPadding(0,0,0,ime.bottom);
        pushInsets();
        wv.postDelayed(() -> pushInsets(), 400);
        wv.postDelayed(() -> pushInsets(), 1800);
        return ins;
      });
      ViewCompat.requestApplyInsets(w.getDecorView());
    } catch(Throwable t){}
  }
  @Override public void onResume(){ super.onResume(); pushInsets(); }
}
