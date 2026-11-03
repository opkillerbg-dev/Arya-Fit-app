import re,sys
p=sys.argv[1]
s=open(p).read()
m=re.search(r'<style name="AppTheme\.NoActionBarLaunch"[^>]*>',s)
if not m or "Theme.SplashScreen" not in m.group(0):
    print("::warning::splash style not found or unexpected, native splash left as is"); print(s); sys.exit(0)
add='<item name="windowSplashScreenBackground">@color/arya_splash_bg</item><item name="windowSplashScreenAnimatedIcon">@drawable/ic_fg_oldmoney</item><item name="windowSplashScreenAnimationDuration">0</item>'
s=s[:m.end()]+add+s[m.end():]
s=s.replace('@drawable/splash','@color/arya_splash_bg')
open(p,"w").write(s); print(s)
