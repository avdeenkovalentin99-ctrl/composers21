from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

folder = Path(__file__).parent
panels = []
for weight, grade in [(900, 0), (1000, -150), (900, -100)]:
    font = ImageFont.truetype(str(folder / 'roboto-flex.ttf'), 300)
    axes = [axis['default'] for axis in font.get_variation_axes()]
    axes[:4] = [144, weight, grade, 25]
    font.set_variation_by_axes(axes)
    raw = Image.new('L', (2500, 500), 255)
    ImageDraw.Draw(raw).text((20, 0), 'КОМПОЗИТОРЫ', font=font, fill=0)
    title = raw.crop(ImageOps.invert(raw).getbbox())
    scale_x, scale_y = 1610 / title.width, 236 / title.height
    title = title.resize((1610, 236), Image.Resampling.LANCZOS)
    panel = Image.new('RGB', (1672, 310), 'white')
    panel.paste(title, (31, 45))
    ImageDraw.Draw(panel).text((31, 10), f'Roboto Flex wght {weight} GRAD {grade} opsz 144 wdth 25', fill='black')
    name = f'roboto-{weight}-{str(grade).replace("-", "minus")}.png'
    panel.save(folder / name)
    panels.append(panel)
    letter = Image.new('L', (500, 500), 255)
    ImageDraw.Draw(letter).text((20, 0), 'О', font=font, fill=0)
    letter = letter.crop(ImageOps.invert(letter).getbbox())
    letter = letter.resize((round(letter.width * scale_x), round(letter.height * scale_y)), Image.Resampling.LANCZOS)
    row = [letter.getpixel((x, letter.height // 2)) for x in range(letter.width)]
    print(name, 'O external', letter.width, 'O counter', sum(value > 127 for value in row))
grid = Image.new('RGB', (1672, 930), 'white')
for index, panel in enumerate(panels):
    grid.paste(panel, (0, index * 310))
grid.save(folder / 'roboto-three-variants.png')
