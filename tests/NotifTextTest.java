package com.arya.fit;

/** Run: javac -d /tmp/nt native/java/NotifText.java tests/NotifTextTest.java && java -cp /tmp/nt com.arya.fit.NotifTextTest */
public class NotifTextTest {
  static int fails = 0;
  static void eq(String name, Object got, Object want) {
    if (!String.valueOf(got).equals(String.valueOf(want))) { fails++; System.out.println("FAIL " + name + "\n  got:  " + got + "\n  want: " + want); }
    else System.out.println("ok   " + name);
  }
  public static void main(String[] a) {
    eq("title many", NotifText.title(6284), "6,284 steps");
    eq("title one", NotifText.title(1), "1 step");
    eq("title zero", NotifText.title(0), "0 steps");
    eq("summary mid", NotifText.summary(6284, 8000), "79% of 8,000 \u00b7 1,716 to go");
    eq("summary start", NotifText.summary(0, 8000), "0% of 8,000 \u00b7 8,000 to go");
    eq("summary exact", NotifText.summary(8000, 8000), "Goal reached \u00b7 8,000");
    eq("summary over", NotifText.summary(9412, 8000), "Goal reached \u00b7 8,000 (+1,412)");
    eq("pct bad goal", NotifText.pct(100, 0), 0);
    eq("km default stride", String.format("%.2f", NotifText.km(8000, 0.75)), "6.00");
    eq("km bad stride falls back", String.format("%.2f", NotifText.km(8000, 9)), "6.00");
    eq("km nan stride falls back", String.format("%.2f", NotifText.km(1000, Double.NaN)), "0.75");
    eq("plan stale", NotifText.plan(false, false, "Lower body", 1, 5), "");
    eq("plan rest", NotifText.plan(true, true, "Rest day", 0, 0), "Rest day today");
    eq("plan normal", NotifText.plan(true, false, "Lower body", 2, 5), "Today: Lower body \u00b7 2 of 5 done");
    eq("plan no title", NotifText.plan(true, false, "", 0, 0), "");
    eq("big full", NotifText.big(6284, 8000, 0.75, "Today: Lower body \u00b7 2 of 5 done", 5080, 7214),
        "79% of 8,000 \u00b7 1,716 to go\n4.7 km walked\nToday: Lower body \u00b7 2 of 5 done\nYesterday 5,080 \u00b7 7-day avg 7,214");
    eq("big no history no plan", NotifText.big(100, 8000, 0.75, "", 0, 0), "1% of 8,000 \u00b7 7,900 to go\n0.1 km walked");
    eq("pace ok", NotifText.pace(1500, 4000), "6:15");
    eq("pace pads seconds", NotifText.pace(1205, 4000), "5:01");
    eq("pace too short", NotifText.pace(60, 20), "--");
    eq("pace too slow", NotifText.pace(100000, 100), "--");
    eq("goal body", NotifText.goalBody(8412, 8000), "You walked 8,412 steps today. Goal was 8,000. Nice work.");
    System.out.println(fails == 0 ? "\nall passed" : "\n" + fails + " FAILED");
    if (fails > 0) System.exit(1);
  }
}
