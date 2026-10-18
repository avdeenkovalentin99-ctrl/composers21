from PIL import Image
im=Image.open('.tmp-audit/hero/hero-1672.png').convert('RGB')
points=[]
for y in range(280,545):
    count=sum(max(im.getpixel((x,y))) < 25 for x in range(1240,1634))
    if count>50: points.append(y)
print('Title ink top/bottom:', min(points),max(points))
