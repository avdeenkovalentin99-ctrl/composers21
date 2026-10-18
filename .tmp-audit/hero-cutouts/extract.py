import sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'python'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
root = Path(__file__).resolve().parents[2]
font = instantiateVariableFont(TTFont(root / 'public/fonts/roboto-flex.ttf'), {'opsz':144,'wght':700,'GRAD':-100,'wdth':25}, inplace=True)
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
print('units', font['head'].unitsPerEm, 'hhea', font['hhea'].ascent, font['hhea'].descent, 'typo', font['OS/2'].sTypoAscender, font['OS/2'].sTypoDescender)
x = 0
output = []
for i, ch in enumerate('\u041a\u041e\u041c\u041f\u041e\u0417\u0418\u0422\u041e\u0420\u042b'):
 name = cmap[ord(ch)]
 glyph = glyphs[name]
 pen = RecordingPen(); glyph.draw(pen)
 svg = SVGPathPen(glyphs); glyph.draw(svg)
 entry = {'index':i,'letter':ch,'name':name,'x':x,'advance':glyph.width,'path':svg.getCommands(),'commands':pen.value}
 output.append(entry)
 if i in [1,3,4,5]: print(json.dumps(entry))
 x += glyph.width
(Path(__file__).parent / 'glyphs.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
font.save(Path(__file__).parent / 'hero-instance.ttf')
