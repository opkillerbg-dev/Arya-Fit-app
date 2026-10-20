package com.arya.fit;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.os.Bundle;

public class ComboWidgetProvider extends AppWidgetProvider {
  @Override
  public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
    for (int id : ids) WidgetKit.push(c, m, id, WidgetKit.COMBO);
  }

  @Override
  public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int id, Bundle options) {
    WidgetKit.push(c, m, id, WidgetKit.COMBO);
  }
}
