from PIL import Image
import shutil, os
files = [r"C:\Users\user\.codex\memories\composers21-main-merge\logofestnew.png", r"C:\Users\user\.codex\memories\composers21-main-merge\logofestnew.jpg"]
shrink = 8
for path in files:
    if not os.path.exists(path):
        print('Missing', path)
        continue
    img = Image.open(path).convert('RGBA')
    px = img.load()
    W,H = img.size
    bg = px[0,0][:3]
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
        print('No non-bg pixels for', path)
        continue
    nl = minx + shrink
    nt = miny + shrink
    nr = maxx - shrink
    nb = maxy - shrink
    if nl>nr: nl = (minx+maxx)//2; nr = nl
    if nt>nb: nt = (miny+maxy)//2; nb = nt
    # find dot color
    from collections import Counter
    cnt = Counter()
    for y in range(miny,maxy+1):
        for x in range(minx,maxx+1):
            r,g,b,a = px[x,y]
            if a==0: continue
            if (r,g,b) != bg:
                cnt[(r,g,b)] += 1
    dot_color = cnt.most_common(1)[0][0] if cnt else (149,39,51)
    # backup
    bak = path + '.bak2'
    if not os.path.exists(bak):
        shutil.copy2(path, bak)
    # clear old bbox to bg
    for y in range(miny,maxy+1):
        for x in range(minx,maxx+1):
            px[x,y] = (*bg, 255)
    # draw smaller rectangle
    for y in range(nt, nb+1):
        for x in range(nl, nr+1):
            px[x,y] = (*dot_color, 255)
    img.save(path)
    print('Updated', path, 'backup at', bak)
