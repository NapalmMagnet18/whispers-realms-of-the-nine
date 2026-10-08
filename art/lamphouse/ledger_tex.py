# paints the Lamp Rolls page texture (two facing pages, ruled, inked entries, a wax blot)
from PIL import Image, ImageDraw
import random
random.seed(3)
W, H = 1024, 512
im = Image.new("RGB", (W, H), (214, 190, 140)); d = ImageDraw.Draw(im)
for x in range(W):
    for y in range(0, H, 4):
        pass
for p in (0, 1):
    x0 = p * 512 + 40; x1 = p * 512 + 472
    d.rectangle([p * 512 + 8, 8, p * 512 + 504, 504], outline=(150, 110, 70), width=3)
    d.line([x0 + 60, 30, x0 + 60, 490], fill=(140, 40, 30), width=2)
    for i, y in enumerate(range(60, 490, 22)):
        d.line([x0, y, x1, y], fill=(170, 140, 100), width=1)
        if random.random() < 0.85:
            d.text((x0 + 4, y - 14), f"{random.randint(1, 99):02d}", fill=(60, 30, 20))
            cx = x0 + 70
            while cx < x1 - 30:
                w = random.randint(12, 46)
                d.line([cx, y - 6 + random.randint(-1, 1), cx + w, y - 6 + random.randint(-1, 1)], fill=(40, 25, 15), width=2)
                cx += w + random.randint(6, 12)
            if random.random() < 0.3:
                d.line([x0 + 64, y - 6, x1, y - 6], fill=(120, 20, 15), width=2)  # a lamp struck from the roll
    d.text((x0 + 120, 34), "THE WARD-LAMP ROLLS", fill=(90, 30, 20))
d.ellipse([600, 300, 700, 380], fill=(228, 222, 200)); d.ellipse([660, 340, 720, 420], fill=(228, 222, 200))
d.line([512, 0, 512, 512], fill=(120, 90, 60), width=6)
for _ in range(9000):
    x, y = random.randrange(W), random.randrange(H); c = random.randint(-18, 8)
    r, g, b = im.getpixel((x, y)); im.putpixel((x, y), (max(0, r + c), max(0, g + c), max(0, b + c)))
for _ in range(40):
    x, y = random.choice([random.randrange(30), W - random.randrange(30)]), random.randrange(H)
    d.ellipse([x - 20, y - 20, x + 20, y + 20], fill=(120, 90, 55))
im.save("/workspace/lamphouse/ledger.png")
