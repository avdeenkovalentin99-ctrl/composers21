from PIL import Image
import shutil, os
path = r"C:\Users\user\.codex\memories\composers21-main-merge\logofestnew.png"
img = Image.open(path).convert('RGBA')
px = img.load()
W,H = img.size
# detect background as color at (0,0)
bg = px[0,0][:3]
# find bbox of non-bg pixels
minx, miny = W, H
maxx = maxy = 0
for y in range(H):
    for x in range(W):
        r,g,b,a = px[x,y]
        if a==0: continue
        if (r,g,b) != bg:
            if x<minx: minx=x
            if y<miny: miny=y
            if x>maxx: maxx=x
            if y>maxy: maxy=y
if minx>maxx:
    print('No non-background pixels found; aborting')
    raise SystemExit(1)
print('bbox', (minx,miny,maxx,maxy))
# determine dot color by sampling bbox
from collections import Counter
cnt = Counter()
for y in range(miny,maxy+1):
    for x in range(minx,maxx+1):
        r,g,b,a = px[x,y]
        if a==0: continue
        if (r,g,b) != bg:
            cnt[(r,g,b)] += 1
if not cnt:
    print('No dot color found; abort')
    raise SystemExit(1)

dot_color = cnt.most_common(1)[0][0]
print('dot_color', dot_color)
# shrink by 4 pixels on each side
shrink = 4
nl = minx + shrink
nt = miny + shrink
nr = maxx - shrink
nb = maxy - shrink
if nl>nr: nl = (minx+maxx)//2; nr = nl
if nt>nb: nt = (miny+maxy)//2; nb = nt
# erase original bbox to bg
for y in range(miny,maxy+1):
    for x in range(minx,maxx+1):
        px[x,y] = (*bg, 255)
# draw smaller rect
for y in range(nt, nb+1):
    for x in range(nl, nr+1):
        px[x,y] = (*dot_color, 255)
# save backup and overwrite
bak = path + '.bak'
if not os.path.exists(bak):
    shutil.copy2(path, bak)
img.save(path)
print('Saved', path, 'backup at', bak)
