from PIL import Image, ImageChops
from pathlib import Path
a=Image.open('.tmp-audit/hero/rail-final.png').convert('RGB')
b=Image.open('.tmp-audit/hero/rail-original.png').convert('RGB')
d=ImageChops.difference(a,b)
print('Rail pixel difference bounds:', d.getbbox())
print('Different pixels:', sum(p != (0,0,0) for p in d.getdata()))
