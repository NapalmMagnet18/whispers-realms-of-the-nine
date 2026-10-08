# The Lamp Reeve's tollhouse: two-storey timber frame, right half of the roof burned away, door off one hinge, gallows of snuffed lanterns.
# Blender: X right, front (door) at -Y (exports +Z), Z up, terrain level z=0, a stone skirt buried to z=-0.5.
import sys, math, random; sys.path.insert(0, "art/lamphouse")
import lib; from lib import *
random.seed(11); reset()
G = 0.2            # ground floor level
T1, T2 = 3.0, 5.6  # top of ground storey, top of upper storey
RIDGE_Y, RIDGE_Z = -0.175, 8.2
th = math.atan2(RIDGE_Z - T2, RIDGE_Y + 3.35)  # pitch
def wall(m, axis, c, a0, a1, z0, z1, t, ops=()):
    a = a0
    def b(u0, u1, w0, w1):
        if u1 - u0 < 1e-3 or w1 - w0 < 1e-3: return
        if axis == "x": bx(m, u0, u1, c - t / 2, c + t / 2, w0, w1)
        else: bx(m, c - t / 2, c + t / 2, u0, u1, w0, w1)
    for (oa, ob, oz0, oz1) in sorted(ops):
        b(a, oa, z0, z1); b(oa, ob, z0, oz0); b(oa, ob, oz1, z1); a = ob
    b(a, a1, z0, z1)
def fx(x0, z0, x1, z1, y, m="oak", w=0.2): beam(m, (x0, y, z0), (x1, y, z1), w, 0.13, (0, 1, 0))
def fy(y0, z0, y1, z1, x, m="oak", w=0.2): beam(m, (x, y0, z0), (x, y1, z1), w, 0.13, (1, 0, 0))
def scorch_x(xa, xb, za, zb, y, s=1.0):
    """flame-tongue soot around an opening on a wall facing -Y (y = outer face - 0.01)"""
    pts = [(xa - 0.22, za - 0.15), (xb + 0.22, za - 0.15), (xb + 0.3, zb)]
    n = 5
    for i in range(n + 1):
        x = xb + 0.3 - (xb - xa + 0.6) * i / n
        pts.append((x, zb + (0.15 if i % 2 else random.uniform(0.6, 1.2) * s)))
    pts.append((xa - 0.3, zb))
    # ring: left, right strips and the top tongues (window stays open)
    prism("scorch", [(xa - 0.25, za - 0.15), (xa, za - 0.15), (xa, zb), (xa - 0.3, zb)], "y", y - 0.012, y)
    prism("scorch", [(xb, za - 0.15), (xb + 0.25, za - 0.15), (xb + 0.3, zb), (xb, zb)], "y", y - 0.012, y)
    prism("scorch", [(xa - 0.3, zb)] + [(x, z) for x, z in reversed(pts[3:-1])] + [(xb + 0.3, zb)], "y", y - 0.012, y)
def scorch_y(ya, yb, za, zb, x, sign):
    d = 0.012 * sign
    prism("scorch", [(ya - 0.25, za - 0.15), (ya, za - 0.15), (ya, zb), (ya - 0.3, zb)], "x", x, x + d)
    prism("scorch", [(yb, za - 0.15), (yb + 0.25, za - 0.15), (yb + 0.3, zb), (yb, zb)], "x", x, x + d)
    top = [(yb + 0.3, zb)] + [(yb + 0.3 - (yb - ya + 0.6) * i / 5, zb + (0.15 if i % 2 else random.uniform(0.6, 1.1))) for i in range(6)] + [(ya - 0.3, zb)]
    prism("scorch", top, "x", x, x + d)

# ---------- stone skirt (buried 0.5) and floor ----------
DOOR = (-1.8, -0.6)
wall("stone", "x", -2.88, -4.05, 4.05, -0.5, 0.6, 0.36, [(DOOR[0], DOOR[1], G, 0.6)])
wall("stone", "x", 2.88, -4.05, 4.05, -0.5, 0.6, 0.36)
wall("stone", "y", -3.87, -2.7, 2.7, -0.5, 0.6, 0.36)
wall("stone", "y", 3.87, -2.7, 2.7, -0.5, 0.6, 0.36)
bx("planks", -3.75, 3.75, -2.75, 2.75, -0.5, G)          # floor (solid to the buried skirt: walkable)
bx("stone", DOOR[0] - 0.1, DOOR[1] + 0.1, -3.45, -2.95, -0.5, G - 0.05)  # door step
for i in range(14):  # moss in the skirt's cracks
    side = random.choice([-1, 1]); x = random.uniform(-4, 4)
    blob("moss", (x, -3.07 if side < 0 else 3.07, random.uniform(0.0, 0.55)), (random.uniform(0.15, 0.35), 0.05, random.uniform(0.05, 0.12)))
for i in range(6):
    blob("moss", (random.choice([-4.07, 4.07]), random.uniform(-2.8, 2.8), random.uniform(0.0, 0.5)), (0.05, random.uniform(0.15, 0.3), random.uniform(0.05, 0.12)))

# ---------- ground storey ----------
WF = (1.0, 2.2, 1.3, 2.3)
wall("plaster", "x", -2.9, -4.0, 4.0, 0.6, T1, 0.2, [(DOOR[0], DOOR[1], G, 2.5), WF])
wall("plaster", "x", 2.9, -4.0, 4.0, 0.6, T1, 0.2, [(-1.0, 0.0, 1.3, 2.3)])
wall("plaster", "y", -3.9, -2.8, 2.8, 0.6, T1, 0.2, [(-0.6, 0.6, 1.3, 2.3)])
wall("plaster", "y", 3.9, -2.8, 2.8, 0.6, T1, 0.2, [(-0.6, 0.6, 1.3, 2.3)])
yf = -3.0
for x in (-3.93, -1.91, -0.49, 0.89, 2.31, 3.93): fx(x, 0.55, x, T1, yf)
fx(-4.0, 0.65, -1.81, 0.65, yf); fx(-0.39, 0.65, 4.0, 0.65, yf)
fx(-4.05, T1 - 0.05, 4.05, T1 - 0.05, yf, w=0.26)
fx(-1.85, 2.56, -0.55, 2.56, yf, w=0.14); fx(0.95, 2.36, 2.25, 2.36, yf, w=0.14); fx(0.95, 1.24, 2.25, 1.24, yf, w=0.14)
fx(-3.83, 0.75, -2.01, 2.85, yf); fx(2.41, 2.85, 3.83, 0.75, yf)
yb = 3.0
for x in (-3.93, -2.0, -1.11, 0.11, 2.0, 3.93): fx(x, 0.55, x, T1, yb)
fx(-4.0, 0.65, 4.0, 0.65, yb); fx(-4.05, T1 - 0.05, 4.05, T1 - 0.05, yb, w=0.26)
fx(-1.9, 0.75, -3.83, 2.85, yb); fx(2.1, 0.75, 3.83, 2.85, yb)
for xs, s in ((-4.0, -1), (4.0, 1)):
    for y in (-2.93, -0.71, 0.71, 2.93): fy(y, 0.55, y, T1, xs)
    fy(-3.0, 0.65, 3.0, 0.65, xs); fy(-3.05, T1 - 0.05, 3.05, T1 - 0.05, xs, w=0.26)
    fy(-2.83, 0.75, -0.81, 2.85, xs); fy(0.81, 2.85, 2.83, 0.75, xs)
    fy(-0.65, 1.24, 0.65, 1.24, xs, w=0.14); fy(-0.65, 2.36, 0.65, 2.36, xs, w=0.14)
fx(-1.05, 1.24, 0.05, 1.24, yb, w=0.14); fx(-1.05, 2.36, 0.05, 2.36, yb, w=0.14)
scorch_x(*WF, -3.0); scorch_x(DOOR[0], DOOR[1], 0.6, 2.5, -3.0, 0.7)
scorch_y(-0.6, 0.6, 1.3, 2.3, 4.0, 1); scorch_y(-0.6, 0.6, 1.3, 2.3, -4.0, -1)

# ---------- jetty and upper floor ----------
bx("oak", -4.1, 4.1, -3.42, -2.8, T1, T1 + 0.2)   # front jetty plate
bx("oak", -4.1, 4.1, 2.8, 3.1, T1, T1 + 0.2); bx("oak", -4.1, -3.75, -2.8, 2.8, T1, T1 + 0.2); bx("oak", 3.75, 4.1, -2.8, 2.8, T1, T1 + 0.2)
for x in (-3.6, -2.8, -2.0, -1.2, -0.4, 0.4, 1.2, 2.0, 2.8, 3.6):
    beam("charred" if x > 1 else "oak", (x, -2.8, T1 - 0.08), (x, -3.5, T1 - 0.08), 0.16, 0.16, (1, 0, 0))
bx("soot", -4.0, 4.0, -3.43, -3.0, T1 - 0.005, T1 + 0.001)
bx("planks", -3.75, 0.3, -2.8, 2.8, T1 + 0.02, T1 + 0.18)              # surviving upper floor (left half)
for y in (-2.2, -1.2, -0.2, 0.8, 1.8):                                  # burned joists on the right, broken off
    L = random.uniform(0.7, 2.2); beam("charred", (3.8, y, T1 + 0.05), (3.8 - L, y, T1 + 0.05 - random.uniform(0.05, 0.6)), 0.14, 0.18, (0, 1, 0))
    blob("ember", (3.8 - L, y, T1 - 0.1), (0.06, 0.06, 0.05))
beam("planks", (0.3, -1.6, T1 + 0.1), (1.7, -1.3, G + 0.05), 0.9, 0.06, (0, 1, 0))   # a floor section fallen through
beam("planks", (0.3, 1.0, T1 + 0.1), (1.4, 0.4, G + 0.6), 0.7, 0.06, (0, 1, 0))

# ---------- upper storey ----------
WU = [(-2.6, -1.6, 4.0, 5.0), (1.6, 2.6, 4.0, 5.0)]
wall("plaster", "x", -3.25, -4.0, 4.0, T1 + 0.2, T2, 0.2, WU)
wall("plaster", "x", 2.9, -4.0, 1.0, T1 + 0.2, T2, 0.2)
prism("plaster", [(1.0, T1 + 0.2), (4.0, T1 + 0.2), (4.0, 4.4), (3.5, 4.9), (2.9, 4.5), (2.3, 5.3), (1.6, 4.8), (1.0, T2)], "y", 2.8, 3.0)
wall("plaster", "y", -3.9, -3.35, 3.0, T1 + 0.2, T2, 0.2, [(-0.5, 0.5, 4.0, 5.0)])
prism("scorch", [(-3.35, T1 + 0.2), (3.0, T1 + 0.2), (3.0, 4.2), (2.2, 4.9), (1.4, 4.1), (0.6, 5.2), (-0.4, 4.6), (-1.2, 5.4), (-2.2, 4.7), (-3.35, 5.1)], "x", 3.8, 4.0)
yu = -3.35
for x in (-3.93, -2.71, -1.49, 0.0, 1.49, 2.71, 3.93): fx(x, T1 + 0.2, x, T2, yu, "charred" if x > 1.2 else "oak")
fx(-4.05, T1 + 0.3, 4.05, T1 + 0.3, yu, w=0.2); fx(-4.05, 3.92, 4.05, 3.92, yu, w=0.14); fx(-4.05, T2 - 0.05, 4.05, T2 - 0.05, yu, w=0.22)
fx(-1.39, 3.95, -0.1, T2 - 0.1, yu); fx(1.39, 3.95, 0.1, T2 - 0.1, yu, "charred")
fx(-2.65, 5.06, -1.55, 5.06, yu, w=0.14); fx(1.55, 5.06, 2.65, 5.06, yu, "charred", 0.14)
for y in (-3.3, -0.61, 0.61, 2.95): fy(y, T1 + 0.2, y, T2, -4.0)
fy(-3.4, 3.92, 3.05, 3.92, -4.0, w=0.14); fy(-3.4, T2 - 0.05, 3.05, T2 - 0.05, -4.0, w=0.22); fy(-3.4, T1 + 0.3, 3.05, T1 + 0.3, -4.0)
fy(-3.2, 3.95, -0.71, T2 - 0.1, -4.0); fy(0.71, T2 - 0.1, 2.85, 3.95, -4.0)
for y, top in ((-3.3, 5.0), (-0.61, 4.4), (0.61, 5.1), (2.95, 4.1)): fy(y, T1 + 0.2, y, top, 4.0, "charred")
fy(-3.4, T1 + 0.3, 3.05, T1 + 0.3, 4.0, "charred")
for x in (-3.93, -2.0, 0.0): fx(x, T1 + 0.2, x, T2, 3.0)
fx(-4.05, T2 - 0.05, 1.0, T2 - 0.05, 3.0, w=0.22); fx(-4.05, 3.92, 1.0, 3.92, 3.0, w=0.14)
fx(-3.83, 3.95, -2.1, T2 - 0.1, 3.0); fx(-0.1, 3.95, -1.9, T2 - 0.1, 3.0)
for x, top in ((2.0, 5.1), (3.93, 4.4)): fx(x, T1 + 0.2, x, top, 3.0, "charred")
for (xa, xb, za, zb) in WU: scorch_x(xa, xb, za, zb, -3.35, 1.0 if xa > 0 else 0.6)
scorch_y(-0.5, 0.5, 4.0, 5.0, -4.0, -1)
# soot washes over the burned half (ragged edges), grime band along the base
prism("scorch", [(1.0, T1 + 0.25), (4.02, T1 + 0.25), (4.02, T2), (2.9, T2), (2.75, 5.2), (2.95, 4.95), (2.62, 4.0), (1.55, 4.0), (1.4, 5.1), (1.1, 4.6), (0.75, 4.2), (0.9, 3.7)], "y", -3.376, -3.366)
prism("scorch", [(-2.9, T1 - 0.2), (2.9, T1 - 0.2), (2.9, T1), (-2.9, T1), (-2.5, 2.5), (-1.6, 2.75), (-0.8, 2.35), (0.3, 2.7), (1.2, 2.4), (2.3, 2.65)][:4] + [(2.2, 2.4), (1.2, 2.65), (0.3, 2.3), (-0.8, 2.6), (-1.6, 2.3), (-2.5, 2.6)], "x", 4.006, 4.016)
for xs, s in ((4.0, 1), (-4.0, -1)):
    prism("soot", [(-2.9, 0.6), (2.9, 0.6), (2.9, 0.85), (1.5, 1.0), (0.4, 0.8), (-0.9, 1.05), (-2.2, 0.8), (-2.9, 0.95)], "x", xs + 0.006 * s, xs + 0.016 * s)
prism("soot", [(-3.9, 0.6), (DOOR[0], 0.6), (DOOR[0], 0.9), (-2.8, 1.05), (-3.9, 0.85)], "y", -3.016, -3.006)
prism("soot", [(DOOR[1], 0.6), (3.9, 0.6), (3.9, 0.95), (2.6, 0.8), (1.2, 1.05), (DOOR[1], 0.85)], "y", -3.016, -3.006)
# broken shutter hanging on the upper-left window
beam("oak", (-2.6, -3.42, 5.0), (-2.95, -3.55, 4.05), 0.45, 0.05, (0, 1, 0))

# ---------- gables ----------
GAB = [(-3.35, T2), (3.0, T2), (RIDGE_Y, RIDGE_Z - 0.1)]
prism("plaster", GAB, "x", -4.0, -3.8)
fy(-3.35, T2 + 0.05, RIDGE_Y, RIDGE_Z - 0.15, -4.03); fy(3.0, T2 + 0.05, RIDGE_Y, RIDGE_Z - 0.15, -4.03)
fy(RIDGE_Y, T2, RIDGE_Y, RIDGE_Z - 0.2, -4.03); fy(-2.0, T2 + 1.0, 1.6, T2 + 1.0, -4.03, w=0.14)
prism("scorch", [(-3.35, T2), (-2.5, 5.9), (-1.8, 5.7), (-1.0, 6.6), (-0.5, 6.1), (0.4, 6.9), (1.2, 6.0), (2.2, 6.25), (3.0, T2)], "x", 3.8, 4.0)

# ---------- roof: left half shingled, right half charred bones ----------
def slope_pt(y_eave_side, d, off, x):
    """point on a slope: sgn -1 front, +1 back; d = distance down-slope from ridge; off = along the roof normal"""
    s = y_eave_side
    return (x, RIDGE_Y + s * math.cos(th) * d - s * math.sin(th) * off * 0 + s * (-math.sin(th)) * 0, RIDGE_Z - math.sin(th) * d)
Ls = (3.175 + 0.45) / math.cos(th)
for s in (-1, 1):
    dirv = (0, s * math.cos(th), -math.sin(th)); nrm = (0, s * math.sin(th), math.cos(th))
    def P(x, d, off): return (x, RIDGE_Y + dirv[1] * d + nrm[1] * off, RIDGE_Z + dirv[2] * d + nrm[2] * off)
    # rafters
    for x in [-4.2 + 0.6 * i for i in range(15)]:
        if x < 0.4:
            beam("oak", P(x, 0, -0.1), P(x, Ls, -0.1), 0.12, 0.18, (1, 0, 0))
        else:
            r = random.random()
            if r < 0.35: d0, d1 = 0, Ls
            elif r < 0.75: d0, d1 = random.uniform(1.2, 2.6), Ls
            else: d0, d1 = 0, random.uniform(0.6, 1.6)
            beam("charred", P(x, d0, -0.1), P(x, d1, -0.1), 0.12, 0.18, (1, 0, 0))
            ep = P(x, d0 if d0 > 0 else d1, -0.08); blob("ember", ep, (0.07, 0.07, 0.06))
    # sarking + shingle rows on the left
    beam("planks", P(-1.95, 0.05, 0.0), P(-1.95, Ls, 0.0), 4.8, 0.05, nrm)
    rows = 10
    for i in range(rows):
        d = 0.25 + i * (Ls - 0.25) / (rows - 1)
        xe = random.uniform(-0.6, 1.4)
        x = -4.45
        while x < xe - 0.1:
            L = min(random.uniform(1.0, 2.0), xe - x); cx = x + L / 2
            o = beam("shingle", P(x, d, 0.09 + 0.02 * random.random()), P(x + L, d, 0.09 + 0.02 * random.random()), 0.6, 0.08, nrm)
            x += L
        # a slipped tile or two at the burned edge
        if random.random() < 0.6:
            box("shingle", xe + 0.3, P(0, d, 0.1)[1], P(0, d, 0.1)[2] - 0.1, 0.5, 0.45, 0.06, (math.degrees(th) * -s + random.uniform(-25, 25), 0, random.uniform(-30, 30)))
beam("shingle", (-4.45, RIDGE_Y, RIDGE_Z + 0.12), (0.2, RIDGE_Y, RIDGE_Z + 0.12), 0.32, 0.32, (0, 1, 1))
beam("oak", (-4.3, RIDGE_Y, RIDGE_Z - 0.15), (0.6, RIDGE_Y, RIDGE_Z - 0.15), 0.22, 0.24, (0, 1, 0))
beam("charred", (0.6, RIDGE_Y, RIDGE_Z - 0.15), (2.1, RIDGE_Y + 0.1, RIDGE_Z - 0.55), 0.2, 0.22, (0, 1, 0))
beam("charred", (2.3, RIDGE_Y + 0.4, 6.9), (3.9, RIDGE_Y + 0.6, T2 + 0.1), 0.2, 0.22, (0, 1, 0))     # ridge broken, its end fallen onto the wall
blob("ember", (2.1, RIDGE_Y + 0.1, RIDGE_Z - 0.6), (0.1, 0.1, 0.08)); blob("ember", (2.3, RIDGE_Y + 0.4, 6.9), (0.09, 0.09, 0.08))
# fallen rafters inside, leaning from the wall heads to the floor
for (a, b) in [((3.4, -2.6, T2), (1.8, -0.8, G + 0.1)), ((2.7, 2.6, T2 - 0.2), (2.2, 0.6, G + 0.1)), ((3.7, 0.5, 4.6), (2.6, -1.9, G + 0.1)), ((1.2, -2.0, T1 + 0.1), (2.9, -0.2, G + 0.15))]:
    beam("charred", a, b, 0.14, 0.18, (0, 0, 1)); blob("ember", b, (0.08, 0.08, 0.05))
for i in range(10):  # ash, plaster lumps and tiles on the ground floor
    x, y = random.uniform(0.6, 3.6), random.uniform(-2.5, 2.5)
    blob(random.choice(["scorch", "plaster", "shingle", "soot"]), (x, y, G + 0.04), (random.uniform(0.12, 0.3), random.uniform(0.1, 0.25), random.uniform(0.05, 0.12)))

# ---------- collapsed stair along the back wall ----------
SY0, SY1 = 1.85, 2.75
for i in range(5):
    x = 3.3 - 0.25 * i; z = G + 0.2 * (i + 1)
    bx("planks", x - 0.15, x + 0.15, SY0, SY1, z - 0.05, z)
for y in (SY0, SY1): beam("oak", (3.55, y, G), (2.1, y, G + 1.2), 0.24, 0.07, (0, 1, 0))
for y in (SY0, SY1): beam("charred", (2.0, y + 0.05, G + 0.85), (0.4, y - 0.1, G + 0.1), 0.24, 0.07, (0, 1, 0))
for i in range(3): beam("planks", (1.7 - 0.45 * i, SY0, G + 0.62 - 0.17 * i), (1.7 - 0.45 * i, SY1 - 0.05, G + 0.66 - 0.17 * i), 0.3, 0.05, (0, 0, 1))
for y in (SY0, SY1): beam("charred", (0.3, y, T1 + 0.05), (0.75, y + 0.1, 1.9), 0.24, 0.07, (0, 1, 0))
for i in range(4):
    box("planks", random.uniform(0.6, 2.4), random.uniform(0.6, 1.6), G + 0.03, 0.9, 0.28, 0.05, (0, 0, random.uniform(0, 180)))

# ---------- the Reeve's desk, the lamp rolls, wax over everything ----------
DX, DY, DZ = -1.4, 1.35, G + 0.82
bx("oak", DX - 0.9, DX + 0.9, DY - 0.45, DY + 0.45, DZ - 0.07, DZ)
for sx in (-1, 1):
    for sy in (-1, 1): bx("oak", DX + sx * 0.8 - 0.06, DX + sx * 0.8 + 0.06, DY + sy * 0.36 - 0.06, DY + sy * 0.36 + 0.06, G, DZ - 0.07)
bx("oak", DX - 0.85, DX + 0.85, DY + 0.36, DY + 0.42, G + 0.2, DZ - 0.1)
# the ledger: two huge open pages, a V at the spine
lib.LEDGER = [DX, DY - 0.05, 1.1, 0.72]
bx("oak", DX - 0.58, DX + 0.58, DY - 0.42, DY + 0.32, DZ, DZ + 0.04)
prism("ledger", [(DX - 0.55, DZ + 0.1), (DX, DZ + 0.05), (DX + 0.55, DZ + 0.1), (DX + 0.55, DZ + 0.06), (DX, DZ + 0.04), (DX - 0.55, DZ + 0.06)], "y", DY - 0.41, DY + 0.31)
for i in range(4):  # rolled lamp rolls stacked at the desk's end
    cyl("parchment", (DX + 0.65, DY - 0.35 + 0.18 * i, DZ + 0.05), (DX + 0.65 + random.uniform(-0.1, 0.1), DY - 0.3 + 0.18 * i + 0.1, DZ + 0.05 + 0.02), 0.05, 6)
    cyl("parchment", (DX + 0.6, DY - 0.35 + 0.18 * i, DZ + 0.05), (DX + 0.9, DY - 0.35 + 0.18 * i, DZ + 0.05), 0.05, 6)
for c in [(DX + 0.4, DY + 0.25), (DX - 0.7, DY + 0.25), (DX + 0.75, DY - 0.2)]:  # burned-down candles in pools of wax
    cyl("wax", (c[0], c[1], DZ), (c[0], c[1], DZ + random.uniform(0.08, 0.2)), 0.04, 6); blob("wax", (c[0], c[1], DZ + 0.01), (0.14, 0.12, 0.03))
for x in (DX - 0.75, DX - 0.3, DX + 0.15, DX + 0.5, DX + 0.8):   # wax sheeting over the desk edge
    blob("wax", (x, DY - 0.46, DZ - 0.02), (0.09, 0.04, 0.05)); cyl("wax", (x, DY - 0.47, DZ - 0.05), (x, DY - 0.47, DZ - random.uniform(0.15, 0.45)), 0.025, 5, 0.006)
blob("wax", (DX + 0.25, DY - 0.15, DZ + 0.09), (0.18, 0.12, 0.03))  # wax pooled on the open page
for i in range(9):  # pools on the floor, like shed skin
    blob("wax", (random.uniform(-3.4, 2.0), random.uniform(-2.3, 2.4), G + 0.01), (random.uniform(0.15, 0.45), random.uniform(0.12, 0.35), 0.03), 2)
for (x, y, z) in [(1.6, -2.98, 1.3), (-0.1, -2.98, 0.6), (-2.1, -3.45, 4.0), (2.1, -3.45, 4.0), (-3.98, 0, 1.3)]:  # drips from sills and lintels down the walls
    for k in range(3):
        dx = random.uniform(-0.4, 0.4); L = random.uniform(0.25, 0.7)
        if abs(x) > 3.9: cyl("wax", (x - 0.02, y + dx, z), (x - 0.02, y + dx, z - L), 0.03, 5, 0.008)
        else: cyl("wax", (x + dx, y - 0.02, z), (x + dx, y - 0.02, z - L), 0.03, 5, 0.008)
for i in range(3): blob("wax", (3.3 - 0.25 * i, 2.3, G + 0.2 * (i + 1) + 0.01), (0.12, 0.2, 0.025))
# toppled chair
beam("oak", (DX + 0.2, DY + 0.9, G + 0.25), (DX + 0.7, DY + 1.1, G + 0.25), 0.45, 0.05, (0, 0, 1))
beam("oak", (DX + 0.2, DY + 0.75, G + 0.02), (DX + 0.2, DY + 1.25, G + 0.5), 0.05, 0.05, (1, 0, 0))

# ---------- the door, hanging off its top hinge ----------
leaf = []
import bmesh as _b
dw, dh = 1.12, 2.22
for k in range(4):
    leaf.append(box("oak", 0.14 + k * 0.28, 0.0, -dh / 2, 0.27, 0.07, dh))
for z in (-0.35, -1.85): leaf.append(box("iron", dw / 2, -0.045, z, dw, 0.02, 0.07))
leaf.append(box("scorch", dw / 2, 0.045, -0.4, dw * 0.9, 0.01, 0.7))
from mathutils import Matrix as _M
Rw = _M.Translation((DOOR[0] - 0.02, -3.04, G + 2.28)) @ _M.Rotation(math.radians(-108), 4, "Z") @ _M.Rotation(math.radians(9), 4, "Y")
for o in leaf: o.matrix_world = Rw @ o.matrix_world
box("iron", DOOR[0] - 0.02, -3.03, G + 2.2, 0.1, 0.06, 0.06)   # the hinge that held
box("iron", DOOR[0] - 0.02, -3.03, G + 0.35, 0.08, 0.05, 0.04, (0, 25, 0))  # the one that tore

# ---------- the gallows-bracket and its dozen snuffed lanterns ----------
GX, GZ, YW = -1.2, 4.75, -3.37
cyl("iron", (GX, YW - 0.04, 3.35), (GX, YW - 0.04, 5.3), 0.05, 6)
cyl("iron", (GX, YW - 0.04, GZ), (GX, -5.75, GZ), 0.055, 6)
cyl("iron", (GX, YW - 0.04, 3.6), (GX, -4.9, GZ), 0.04, 6)
cyl("iron", (GX - 1.5, -5.5, GZ), (GX + 1.5, -5.5, GZ), 0.045, 6)
cyl("iron", (GX, -5.75, GZ), (GX, -5.95, GZ + 0.12), 0.05, 6, 0.0)
for xe in (GX - 1.5, GX + 1.5): cyl("iron", (xe, -5.5, GZ), (xe, -5.5, GZ + 0.22), 0.04, 6, 0.0)
for k in range(3): box("iron", GX, YW - 0.02, 3.5 + 0.8 * k, 0.16, 0.04, 0.06)  # wall straps
hooks = [(GX, -3.95), (GX, -4.45), (GX, -4.95)] + [(GX - 1.4 + 0.4 * i, -5.5) for i in range(8)]
for i, (hx, hy) in enumerate(hooks):
    L = random.uniform(0.35, 1.25)
    zb = chain(hx, hy, GZ - 0.03, L)
    lantern(hx, hy, zb, glass=(i % 3 != 1))
# the twelfth, torn down, on the doorstep
lantern(-0.2, -3.7, 0.47, glass=False)
for i in range(6): torus("iron", (-0.2 + 0.09 * i, -3.85 - 0.02 * i, 0.02), (0, 0, (i % 2) * 1.57), sc=(1.5, 1, 1))

o = finish("/workspace/lamphouse/lamphouse.glb")
export("/workspace/lamphouse/lamphouse.glb")
c = render_setup((0, 0, 3), None, None)
from mathutils import Vector
lp = bpy.data.lights.new("cold", "POINT"); lp.energy = 300; lp.color = (0.75, 0.85, 1.0); lo = bpy.data.objects.new("cold", lp); bpy.context.scene.collection.objects.link(lo); lo.location = (-1.4, 0.3, 2.2)
lp2 = bpy.data.lights.new("emb", "POINT"); lp2.energy = 250; lp2.color = (1, 0.5, 0.15); lo2 = bpy.data.objects.new("emb", lp2); bpy.context.scene.collection.objects.link(lo2); lo2.location = (2.4, 0, 6.0)
shot(c, (13, -16, 6.5), (0, 0, 3.6), "/tmp/lh_a.png")
shot(c, (-9, -12, 15), (0.5, 0, 3.5), "/tmp/lh_b.png")
shot(c, (-1.0, -7.5, 1.8), (-1.2, 0, 1.6), "/tmp/lh_c.png")
