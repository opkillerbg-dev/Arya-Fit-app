package com.arya.fit;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(name = "RunEngine", permissions = {
  @Permission(strings = {Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, alias = "location"),
  @Permission(strings = {Manifest.permission.POST_NOTIFICATIONS}, alias = "notifications")
})
public class RunEnginePlugin extends Plugin {
  @PluginMethod
  public void start(PluginCall call) {
    RunService.configure(call.getData());
    Intent i = new Intent(getContext(), RunService.class);
    i.setAction("START");
    if (Build.VERSION.SDK_INT >= 26) {
      getContext().startForegroundService(i);
    } else {
      getContext().startService(i);
    }
    call.resolve();
  }

  @PluginMethod
  public void setState(PluginCall call) {
    RunService.apply(call.getData());
    call.resolve();
  }

  @PluginMethod
  public void state(PluginCall call) {
    call.resolve(RunService.stateJson());
  }

  @PluginMethod
  public void route(PluginCall call) {
    Integer from = call.getInt("from", 0);
    JSObject o = new JSObject();
    o.put("pts", RunService.routeFrom(from == null ? 0 : from.intValue()));
    call.resolve(o);
  }

  @PluginMethod
  public void stop(PluginCall call) {
    JSObject o = RunService.stateJson();
    RunService.active = false;
    getContext().stopService(new Intent(getContext(), RunService.class));
    call.resolve(o);
  }
}
