package com.arya.fit;

/**
 * Live GPS filter for runs. Pure Java (no Android classes) so it can be tested on a PC.
 * Same algorithm as Track in web/js/features/runcalc.js: keep the two in step.
 *
 * Constant-velocity Kalman filter in local metres (x east, y north); both axes share one covariance.
 * Measurement noise is the reported accuracy squared. On top: distance gate (anchor point), stop detection from
 * the Doppler speed, wild-fix rejection, a straight-line bridge over short signal gaps, and a scale that pulls the
 * chord length of the smoothed track down to the integrated Doppler speed when the two roughly agree.
 */
final class RunTrack {
  static final double MAX_ACC = 30, LOCK_ACC = 22, MAX_SPEED = 8, GAP_S = 25, GAP_MAX = 4.5;
  static final double MIN_STEP = 4, STEP_ACC = 0.5, SA = 0.2, STILL = 0.4, M = 111320.0, D2R = Math.PI / 180.0;

  double dist = 0, outLa = 0, outLo = 0, lastInc = 0, lastAcc = -1, accSum = 0, sumS = 0, sumC = 0;
  int fixes = 0, used = 0, dropped = 0, accN = 0, bad = 0, gaps = 0;
  boolean locked = false, has = false;

  private double oLa, oLo, kx, x, y, vx, vy, pp, pv, vv, ax, ay, pSpd = -1;
  private long lt = 0, aT = 0, fastT = 0;

  /** Forget the filter state (pause, resume). Totals stay. */
  void restart() {
    has = false;
    bad = 0;
    pSpd = -1;
  }

  double avgAcc() {
    return accN > 0 ? accSum / accN : 0;
  }

  double scale() {
    if (sumC < 150) return 1;
    double q = sumS / sumC;
    if (q < 0.7 || q > 1.15) return 1;
    return Math.max(0.85, Math.min(1.0, q));
  }

  private void init(double la, double lo, double acc, long t) {
    oLa = la;
    oLo = lo;
    kx = Math.cos(la * D2R) * M;
    if (fastT == 0) fastT = t;
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    pp = acc * acc;
    pv = 0;
    vv = 9;
    lt = t;
    has = true;
    bad = 0;
    ax = 0;
    ay = 0;
    aT = t;
  }

  private void pos() {
    outLa = oLa + y / M;
    outLo = oLo + x / kx;
  }

  /**
   * la/lo degrees, acc metres (0 or less = unknown), spd m/s (negative = unknown), t milliseconds on any monotonic clock.
   * Returns true when the fix adds a route point (outLa/outLo hold the smoothed point).
   */
  boolean add(double la, double lo, double acc, double spd, long t) {
    fixes++;
    lastAcc = acc;
    if (!(acc > 0)) acc = 15;
    if (acc > MAX_ACC) {
      dropped++;
      return false;
    }
    if (!locked) {
      if (acc > LOCK_ACC) {
        dropped++;
        return false;
      }
      locked = true;
    }
    accSum += acc;
    accN++;
    if (!has) {
      init(la, lo, acc, t);
      pos();
      lastInc = 0;
      return true;
    }
    double dt = (t - lt) / 1000.0;
    if (dt <= 0.05) {
      dropped++;
      return false;
    }
    if (dt > GAP_S) {
      gaps++;
      double zx = (lo - oLo) * kx, zy = (la - oLa) * M;
      double dg = Math.sqrt((zx - ax) * (zx - ax) + (zy - ay) * (zy - ay));
      boolean ok = dg >= 3 && dg / ((t - aT) / 1000.0) <= GAP_MAX;
      if (ok) {
        dist += dg;
        lastInc = dg;
        used++;
      } else {
        lastInc = 0;
      }
      init(la, lo, acc, t);
      pos();
      pSpd = -1;
      return true;
    }
    double zx2 = (lo - oLo) * kx, zy2 = (la - oLa) * M;
    double qa = SA * SA, d2 = dt * dt, d3 = d2 * dt, d4 = d3 * dt;
    double ppP = pp + 2 * dt * pv + d2 * vv + qa * d4 / 4;
    double pvP = pv + dt * vv + qa * d3 / 2;
    double vvP = vv + qa * d2;
    double px = x + vx * dt, py = y + vy * dt;
    double rx = zx2 - px, ry = zy2 - py;
    double dev = Math.sqrt(rx * rx + ry * ry), s = ppP + acc * acc;
    if (dev > 4 * Math.sqrt(s) && dev / dt > MAX_SPEED * 1.5 && bad < 3) {
      bad++;
      dropped++;
      return false;
    }
    bad = 0;
    double sp = spd >= 0 ? (spd < STILL ? 0 : spd) : -1;
    if (sp >= 0 && pSpd >= 0) sumS += 0.5 * (sp + pSpd) * dt;
    pSpd = sp;
    double k1 = ppP / s, k2 = pvP / s;
    x = px + k1 * rx;
    y = py + k1 * ry;
    vx += k2 * rx;
    vy += k2 * ry;
    pp = (1 - k1) * ppP;
    pv = (1 - k1) * pvP;
    vv = vvP - k2 * pvP;
    if (spd >= 1) fastT = t;
    boolean still = spd >= 0 && spd < STILL && t - fastT <= 120000L;
    if (still) {
      vx *= 0.5;
      vy *= 0.5;
    }
    lt = t;
    double ex = x - ax, ey = y - ay, d = Math.sqrt(ex * ex + ey * ey);
    double need = Math.max(MIN_STEP, STEP_ACC * acc);
    if (d < need || (still && d < acc)) return false;
    double v = d / ((t - aT) / 1000.0);
    if (v > MAX_SPEED || (spd >= 0 && v > 2.5 * spd + 3)) {
      dropped++;
      return false;
    }
    sumC += d;
    double inc = d * scale();
    dist += inc;
    lastInc = inc;
    used++;
    ax = x;
    ay = y;
    aT = t;
    pos();
    return true;
  }
}
