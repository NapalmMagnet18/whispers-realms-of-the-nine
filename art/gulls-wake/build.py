# art/gulls-wake/build.py: the wreck of the Gull's Wake (landmark hc-nam-wreck) + its washed-up props.
# blender -b --factory-startup --python-exit-code 1 --python art/gulls-wake/build.py
import bpy, bmesh, math, random, os, json
import numpy as np
from mathutils import Vector, Matrix
from PIL import Image, ImageFilter, ImageDraw
OUT = "/workspace/wreck"; PROOF = "/tmp/wreck"; TEX = OUT + "/tex"
for d in (OUT, PROOF, TEX): os.makedirs(d, exist_ok=True)
random.seed(11); rng = np.random.default_rng(11)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------------------------------------------------------------- textures (PIL)
def seamless_noise(w, h, rad):
    a = (rng.random((h, w)) * 255).astype(np.uint8)
    im = Image.fromarray(np.tile(a, (3, 3))).filter(ImageFilter.GaussianBlur(rad))
    b = np.asarray(im, dtype=np.float32)[h:2 * h, w:2 * w]
    return (b - b.mean()) / (b.std() + 1e-6)

def streaks(w, h, cols, rows):
    a = (rng.random((rows, cols)) * 255).astype(np.uint8)
    b = np.asarray(Image.fromarray(a).resize((w, h), Image.BICUBIC), dtype=np.float32)
    return (b - b.mean()) / (b.std() + 1e-6)

def save(arr, path):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(path); return path

def tex_hull(S=1024):
    v = np.linspace(1, 0, S)[:, None]; u = np.linspace(0, 1, S, endpoint=False)[None, :]
    col = np.ones((S, S, 3), np.float32) * np.array([40, 33, 28], np.float32)
    rough = np.full((S, S), 0.84, np.float32)
    NP = 22; strip = np.floor(v * NP).astype(int); fr = (v * NP) % 1
    jit = rng.normal(0, 1, NP + 2) * 3.5
    col += jit[strip][..., None]
    col += streaks(S, S, 24, S // 3)[..., None] * 5          # grain along the plank
    col += seamless_noise(S, S, 40)[..., None] * 7          # rot blotches
    # plank seams with moss in places
    moss = seamless_noise(S, S, 14) > 0.7
    gap = (fr < 0.07) | (fr > 0.97)
    col[np.broadcast_to(gap, (S, S))] = [16, 12, 10]
    mm = np.broadcast_to(gap, (S, S)) & moss
    col[mm] = [52, 74, 40]
    # butt joints
    for k in range(NP):
        for _ in range(2):
            x0 = int(rng.random() * S); r0 = int((1 - (k + 1) / NP) * S); r1 = int((1 - k / NP) * S)
            col[r0:r1, x0:x0 + 3] = [14, 11, 9]
    # lower hull: slime, salt waterline, barnacle speckle
    low = np.clip((0.44 - v) / 0.18, 0, 1)[..., None] * np.clip(0.75 + seamless_noise(S, S, 20)[..., None] * 0.25, 0, 1)
    col = col * (1 - low) + np.array([50, 62, 48], np.float32) * low
    salt = np.exp(-((v - 0.45) / 0.018) ** 2)[..., None] * np.clip(0.5 + seamless_noise(S, S, 6)[..., None] * 0.4, 0, 1)
    col = col * (1 - salt * 0.55) + np.array([132, 126, 108], np.float32) * salt * 0.55
    rough -= (low[..., 0] * 0.3)
    img = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)); dr = ImageDraw.Draw(img)
    for _ in range(900):
        vv = rng.random() ** 1.6 * 0.42; x = rng.random() * S; y = (1 - vv) * S; r = 2 + rng.random() * 5
        dr.ellipse([x - r, y - r, x + r, y + r], fill=(168, 160, 144)); dr.ellipse([x - r * .4, y - r * .4, x + r * .4, y + r * .4], fill=(40, 36, 30))
    col = np.asarray(img, dtype=np.float32).copy()
    # wet drips running down from the rail
    for _ in range(46):
        u0 = rng.random(); w = 3 + rng.random() * 10; v0 = 1.0 if rng.random() < 0.7 else 0.5 + rng.random() * 0.45
        v1 = max(0.12, v0 - 0.2 - rng.random() * 0.6)
        du = np.minimum(np.abs(u - u0), 1 - np.abs(u - u0)) * S
        m = np.exp(-(du / w) ** 2) * ((v <= v0) & (v >= v1)) * np.clip((v - v1) / (v0 - v1 + 1e-6), 0, 1) ** 0.5
        col *= (1 - 0.5 * m)[..., None]; rough = rough * (1 - m) + 0.22 * m
    soot = np.clip((v - 0.9) / 0.1, 0, 1)[..., None]
    col *= (1 - 0.35 * soot)
    rgb = np.zeros((S, S, 3), np.float32); rgb[..., 1] = np.clip(rough, 0.05, 1) * 255
    return save(col, TEX + "/hull_albedo.png"), save(rgb, TEX + "/hull_rough.png")

def tex_deck(S=512):
    v = np.linspace(1, 0, S)[:, None]; u = np.linspace(0, 1, S, endpoint=False)[None, :]
    col = np.ones((S, S, 3), np.float32) * np.array([62, 52, 42], np.float32)
    NP = 16; strip = np.floor(v * NP).astype(int); fr = (v * NP) % 1
    col += (rng.normal(0, 1, NP + 2) * 5)[strip][..., None]
    col += streaks(S, S, 16, S // 2)[..., None] * 6 + seamless_noise(S, S, 22)[..., None] * 8
    gap = np.broadcast_to((fr < 0.08), (S, S)); col[gap] = [18, 14, 11]
    moss = (seamless_noise(S, S, 10) > 0.9) & gap; col[moss] = [60, 82, 44]
    pud = np.clip(seamless_noise(S, S, 28) - 0.8, 0, 1); pud = np.clip(pud * 2, 0, 1)
    col *= (1 - 0.55 * pud)[..., None]
    rough = 0.82 - 0.6 * pud
    rgb = np.zeros((S, S, 3), np.float32); rgb[..., 1] = rough * 255
    return save(col, TEX + "/deck_albedo.png"), save(rgb, TEX + "/deck_rough.png")

def tex_sail(S=512):
    col = np.ones((S, S, 3), np.float32) * np.array([112, 110, 102], np.float32)
    col += seamless_noise(S, S, 18)[..., None] * 9 + seamless_noise(S, S, 3)[..., None] * 4
    st = np.clip(seamless_noise(S, S, 30) - 0.6, 0, 1)[..., None]
    col = col * (1 - st) + np.array([70, 62, 48], np.float32) * st
    for k in range(1, 6): x = k * S // 6; col[:, x - 1:x + 2] *= 0.75
    v = np.linspace(0, 1, S)[:, None, None]; col *= (1 - 0.35 * v)   # rot creeping up from the hem
    return save(col, TEX + "/sail_albedo.png")

HA, HR = tex_hull(); DA, DR = tex_deck(); SA = tex_sail()

# ---------------------------------------------------------------- materials
def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1,)
SOLID = {
    "interior": dict(c="#0a0806", r=.95), "rim": dict(c="#5a3e28", r=.9), "rope": dict(c="#3e3226", r=.95),
    "barnacle": dict(c="#b3ab98", r=.9), "weed": dict(c="#34502e", r=.45, d=True), "iron": dict(c="#3a2c24", m=.55, r=.72),
    "glow": dict(c="#9fe6ff", e="#7fdcff", es=7), "figure": dict(c="#c9bea4", r=.7), "crack": dict(c="#140f0b", r=.9),
    "bone": dict(c="#ddd0b0", r=.6), "paint": dict(c="#7a2e22", r=.75), "cream": dict(c="#d8cba8", r=.75), "bronze": dict(c="#5f6e55", m=.7, r=.5),
}
MATS = {}
def M(name):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    def img(path, nonc=False):
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(path)
        if nonc: t.image.colorspace_settings.name = "Non-Color"
        return t
    def rough_tex(path):
        t = img(path, True); s = nt.nodes.new("ShaderNodeSeparateColor"); nt.links.new(t.outputs["Color"], s.inputs["Color"]); nt.links.new(s.outputs["Green"], b.inputs["Roughness"])
    if name == "hull":
        nt.links.new(img(HA).outputs["Color"], b.inputs["Base Color"]); rough_tex(HR)
    elif name == "deck":
        nt.links.new(img(DA).outputs["Color"], b.inputs["Base Color"]); rough_tex(DR)
    elif name == "sail":
        nt.links.new(img(SA).outputs["Color"], b.inputs["Base Color"]); b.inputs["Roughness"].default_value = .9; m.use_backface_culling = False
    else:
        s = SOLID[name]
        b.inputs["Base Color"].default_value = lin(s["c"]); b.inputs["Metallic"].default_value = s.get("m", 0); b.inputs["Roughness"].default_value = s.get("r", .7)
        if s.get("e"): b.inputs["Emission Color"].default_value = lin(s["e"]); b.inputs["Emission Strength"].default_value = s["es"]
        m.use_backface_culling = not s.get("d", False)
    if name not in ("sail", "weed"): m.use_backface_culling = True
    MATS[name] = m; return m

OBJS = []
def mk(name, verts, faces, mats, fmat=None, uv=None, keep=True):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in verts], [], faces); me.update()
    ul = me.uv_layers.new(name="UVMap")
    if uv is not None:
        for poly in me.polygons:
            for li in poly.loop_indices: ul.data[li].uv = uv[me.loops[li].vertex_index]
    for m in mats: me.materials.append(M(m))
    if fmat:
        for i, p in enumerate(me.polygons): p.material_index = fmat[i]
    o = bpy.data.objects.new(name, me); scene.collection.objects.link(o)
    if keep: OBJS.append(o)
    return o

def act(o):
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o

def prim(kind, mat, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), **kw):
    getattr(bpy.ops.mesh, "primitive_%s_add" % kind)(location=loc, rotation=tuple(math.radians(a) for a in rot), **kw)
    o = bpy.context.active_object; o.scale = scale
    o.data.materials.clear(); o.data.materials.append(M(mat)); OBJS.append(o); return o

def tube(pts, r, n, mat, r_end=None, cap=False):
    pts = [Vector(p) for p in pts]; verts = []; faces = []; N = len(pts)
    for i, p in enumerate(pts):
        tg = (pts[min(i + 1, N - 1)] - pts[max(i - 1, 0)]).normalized()
        a = Vector((0, 0, 1)) if abs(tg.z) < 0.9 else Vector((1, 0, 0))
        nx = tg.cross(a).normalized(); ny = tg.cross(nx)
        rr = r if r_end is None else r + (r_end - r) * i / (N - 1)
        for k in range(n):
            ang = 2 * math.pi * k / n; verts.append(p + (nx * math.cos(ang) + ny * math.sin(ang)) * rr)
    for i in range(N - 1):
        for k in range(n):
            a = i * n + k; b = i * n + (k + 1) % n; faces.append((a, b, b + n, a + n))
    if cap: faces.append(tuple(range(n))[::-1]); faces.append(tuple(range((N - 1) * n, N * n)))
    uv = [(i / max(1, N - 1) * 2, k / n) for i in range(N) for k in range(n)]
    return mk("tube", verts, faces, [mat], uv=uv)

def join(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    for o in objs: o.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.join(); o = bpy.context.active_object; o.name = name; return o

def tris(o):
    o.data.calc_loop_triangles(); return len(o.data.loop_triangles)

# ---------------------------------------------------------------- the hull
class Hull:
    def __init__(s, HX, B, H, th): s.HX, s.Bm, s.H, s.th = HX, B, H, th
    def B(s, x):
        q = x / s.HX
        if q >= 0: return s.Bm * max(0.0, 1 - q ** 2.2) ** 0.75
        return max(0.52 * s.Bm, s.Bm * max(0.0, 1 - (-q) ** 3.0) ** 0.6)
    def Hr(s, x):
        q = x / s.HX; return s.H * (1 + 0.19 * q * q + 0.16 * max(0, (-q - 0.55) / 0.45))
    def Zk(s, x):
        q = x / s.HX; return s.H * (0.5 * max(0, (q - 0.55) / 0.45) ** 2 + 0.1 * max(0, (-q - 0.75) / 0.25))
    def P(s, x, t, sg):
        a = t * math.pi / 2; zk = s.Zk(x)
        return Vector((x, sg * s.B(x) * math.sin(a) ** 0.55, zk + (s.Hr(x) - zk) * (1 - math.cos(a) ** 1.5)))
    def N(s, x, t, sg):
        e = 0.01; d = s.P(x, min(1, t + e), sg) - s.P(x, max(0, t - e), sg)
        n = Vector((0, sg * d.z, -sg * d.y)) * sg * sg
        n = Vector((0, d.z, -d.y)) * sg
        return n.normalized() if n.length > 1e-6 else Vector((0, 0, -1))
    def shell(s, NX, NS, hole=None, rim="rim"):
        W = 2 * NS + 1; V = []; UV = []
        xs = [-s.HX + 2 * s.HX * i / NX for i in range(NX + 1)]
        for x in xs:
            for k in range(W):
                t = abs(k - NS) / NS; sg = 1 if k < NS else -1
                V.append(s.P(x, t, sg)); UV.append((x / 5.0, t))
        F = []
        for i in range(NX):
            for k in range(W - 1):
                if hole:
                    xc = (xs[i] + xs[i + 1]) / 2; tc = (abs(k - NS) + abs(k + 1 - NS)) / 2 / NS
                    if k < NS and hole(xc, tc): continue
                F.append((i * W + k, (i + 1) * W + k, (i + 1) * W + k + 1, i * W + k + 1))
        tr = list(range(W)); F.append(tuple(tr))
        o = mk("shell", V, F, ["hull", "interior", rim], keep=False)
        me = o.data; me.polygons[-1].use_smooth = False
        # transom faces -X
        p = me.polygons[-1]
        if p.normal.x > 0: p.flip()
        bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002); bm.to_mesh(me); bm.free()
        md = o.modifiers.new("s", "SOLIDIFY"); md.thickness = s.th; md.offset = -1; md.material_offset = 1; md.material_offset_rim = 2; md.use_rim = True
        act(o); bpy.ops.object.modifier_apply(modifier="s"); OBJS.append(o); return o
    def tdeck(s, x, z):
        lo, hi = 0.0, 1.0
        for _ in range(30):
            m = (lo + hi) / 2
            if s.P(x, m, 1).z < z: lo = m
            else: hi = m
        return lo

ship = Hull(7.5, 2.05, 3.2, 0.12)
HOLE_X, HOLE_T = 0.7, 0.62
hole_noise = {}
def in_hole(x, t):
    key = (round(x, 2), round(t, 2))
    if key not in hole_noise: hole_noise[key] = random.random()
    d = ((x - HOLE_X) / 2.2) ** 2 + ((t - HOLE_T) / 0.25) ** 2
    return d < 0.75 + hole_noise[key] * 0.55
ship.shell(46, 10, hole=in_hole)

# deck + raised stern deck
def deck_strip(x0, x1, dz, n, camber=0.06, th=0.08):
    V = []; UV = []; F = []
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n; z = ship.Hr(x) - dz; t = ship.tdeck(x, z); y = ship.P(x, t, 1).y * 0.98
        for (yy, zz) in ((y, z), (0, z + camber), (-y, z)):
            V.append((x, yy, zz)); UV.append((x / 4, yy / 4))
    for i in range(n):
        for k in range(2): F.append((i * 3 + k, i * 3 + k + 1, (i + 1) * 3 + k + 1, (i + 1) * 3 + k))
    o = mk("deck", V, F, ["deck"], uv=UV, keep=False)
    if o.data.polygons[0].normal.z < 0:
        for p in o.data.polygons: p.flip()
    md = o.modifiers.new("s", "SOLIDIFY"); md.thickness = th; md.offset = -1
    act(o); bpy.ops.object.modifier_apply(modifier="s"); OBJS.append(o); return o
deck_strip(-7.42, 6.6, 0.58, 28)
deck_strip(-7.42, -5.0, 0.15, 6)
prim("cube", "deck", loc=(-5.0, 0, ship.Hr(-5.0) - 0.5), scale=(0.08, ship.B(-5.0) * 1.8, 0.75))  # poop deck front wall
prim("cube", "interior", loc=(1.8, 0, ship.Hr(1.8) - 0.5), scale=(1.1, 0.9, 0.06))               # open hatch
prim("cube", "deck", loc=(1.8, 0.95, ship.Hr(1.8) - 0.38), rot=(0, 0, 4), scale=(1.15, 0.08, 0.2))
prim("cube", "deck", loc=(1.8, -0.95, ship.Hr(1.8) - 0.38), rot=(0, 0, -3), scale=(1.15, 0.08, 0.2))
prim("cube", "deck", loc=(2.0, 1.6, ship.Hr(2) - 0.3), rot=(64, 8, 20), scale=(0.9, 0.7, 0.05))    # hatch cover torn off

# gunwales, keel, stem, sternpost, bowsprit
for sg in (1, -1):
    tube([ship.P(-7.5 + 15 * i / 30, 1, sg) + Vector((0, 0, 0.06)) for i in range(29)], 0.1, 4, "deck")
tube([ship.P(-7.5 + 15 * i / 30, 0, 1) - Vector((0, 0, 0.1)) for i in range(31)], 0.16, 4, "deck")
stem = [Vector((7.5 + 0.12 * math.sin(a * math.pi / 2), 0, ship.Zk(7.4) + (ship.Hr(7.5) + 0.35 - ship.Zk(7.4)) * a)) for a in [i / 8 for i in range(9)]]
tube(stem, 0.17, 4, "deck")
tube([(-7.55, 0, -0.1), (-7.55, 0, ship.Hr(-7.5) + 0.2)], 0.15, 4, "deck")
tube([(6.6, 0, ship.Hr(6.6) - 0.1), (9.7, 0, ship.Hr(7.5) + 1.25)], 0.13, 6, "deck", r_end=0.07)
prim("cube", "deck", loc=(-7.85, 0, 1.2), rot=(0, 12, 6), scale=(0.5, 0.14, 2.0))                  # rudder hanging askew
for y in (0.45, -0.45):
    prim("cube", "interior", loc=(-7.52, y, ship.Hr(-7.5) - 0.75), scale=(0.1, 0.32, 0.36))        # stern windows

# ribs exposed in the torn flank
for x in [HOLE_X - 2.5 + 0.55 * i for i in range(10)]:
    t1 = 1.0 if abs(x - HOLE_X) > 0.8 else 0.66 + random.random() * 0.12
    pts = [ship.P(x, t, 1) - ship.N(x, t, 1) * 0.17 for t in np.linspace(0.08, t1, 8)]
    tube(pts, 0.1, 4, "rim")
# broken plank stubs around the hole edge
for _ in range(11):
    a = random.random() * math.tau; x = HOLE_X + math.cos(a) * 2.0; t = HOLE_T + math.sin(a) * 0.22
    p = ship.P(x, t, 1); n = ship.N(x, t, 1)
    tip = p + Vector((-math.cos(a) * 0.5, 0, -math.sin(a) * 0.4)) + n * (0.15 + random.random() * 0.3)
    o = tube([p, tip], 0.09, 4, "hull", r_end=0.03)

# masts
zd = lambda x: ship.Hr(x) - 0.58
MX = -0.8; mtop = zd(MX) + 7.6
tube([(MX, 0, zd(MX) - 1.2), (MX, 0, mtop)], 0.21, 10, "deck", r_end=0.12, cap=True)
yard_z = zd(MX) + 6.6
ya = (MX + 0.25, 2.5, yard_z - 0.25); yb = (MX - 0.15, -2.5, yard_z + 0.15)
tube([ya, yb], 0.09, 6, "deck")
tube([(MX + 0.05, 1.5, mtop - 0.35), (MX - 0.05, -1.5, mtop - 0.3)], 0.06, 6, "deck")
FX = 3.4; ftop = zd(FX) + 3.3
fm = tube([(FX, 0, zd(FX) - 1.2), (FX, 0, ftop)], 0.19, 10, "deck", r_end=0.17)
for v in fm.data.vertices:
    if v.co.z > ftop - 0.01: v.co.z += random.uniform(-0.45, 0.25)
for k in range(5):
    a = k * math.tau / 5 + random.random(); b = Vector((FX + math.cos(a) * 0.12, math.sin(a) * 0.12, ftop - 0.2))
    tube([b, b + Vector((math.cos(a) * 0.05, math.sin(a) * 0.05, 0.4 + random.random() * 0.4))], 0.05, 3, "rim", r_end=0.005)

# shredded sail hanging from the main yard
NU, NV = 16, 12; V = []; UV = []; F = []
yA = Vector(ya); yB = Vector(yb)
for j in range(NV + 1):
    for i in range(NU + 1):
        u = i / NU; v = j / NV
        top = yA.lerp(yB, u); droop = 0.9 * max(0, u - 0.75) / 0.25 * v
        p = top + Vector((0.35 * math.sin(u * math.pi) * math.sin(v * math.pi * 0.9) + random.uniform(-0.05, 0.05), 0, -3.4 * v - droop))
        V.append(p); UV.append((u, 1 - v))
cut = [NV * (0.45 + 0.55 * random.random()) for _ in range(NU)]
for j in range(NV):
    for i in range(NU):
        if j >= cut[i]: continue
        if random.random() < 0.03 + 0.5 * (j / NV) ** 3: continue
        if (i - 5) ** 2 + (j - 5) ** 2 < 4 + random.random() * 3: continue
        F.append((j * (NU + 1) + i, j * (NU + 1) + i + 1, (j + 1) * (NU + 1) + i + 1, (j + 1) * (NU + 1) + i))
mk("sail", V, F, ["sail"], uv=UV)

def sag(a, b, s, n=7):
    a, b = Vector(a), Vector(b); return [a.lerp(b, i / n) - Vector((0, 0, s * math.sin(math.pi * i / n))) for i in range(n + 1)]
def hang(a, L, dx=0.0, dy=0.0, n=6):
    a = Vector(a); return [a + Vector((dx * (i / n) ** 2, dy * (i / n) ** 2, -L * i / n)) for i in range(n + 1)]
for sg in (1, -1):
    for x in (MX - 0.9, MX, MX + 0.9):
        if sg == 1 and x == MX: tube(hang((MX, 0.05, mtop - 0.4), 0.0 + 4.6, dy=0.6), 0.025, 3, "rope"); continue
        tube(sag((MX, 0, mtop - 0.4), ship.P(x, 1, sg) + Vector((0, 0, 0.1)), 0.15), 0.025, 3, "rope")
tube(sag((MX, 0, mtop - 0.3), (9.6, 0, ship.Hr(7.5) + 1.2), 0.5, 10), 0.03, 3, "rope")
for (p, L) in ((ya, 2.6), (yb, 1.8), ((MX - 0.05, -1.4, mtop - 0.3), 3.2), ((MX + 0.2, 1.8, yard_z - 0.2), 1.4)):
    tube(hang(p, L, dx=0.2, dy=0.15), 0.025, 3, "rope")
tube(hang((FX, 0.1, ftop - 0.3), 2.2, dy=0.5), 0.03, 3, "rope")
tube(sag((FX, 0, ftop - 0.4), ship.P(FX + 0.8, 1, -1) + Vector((0, 0, 0.1)), 0.1), 0.025, 3, "rope")

# figurehead: a gull with a cracked face, under the bowsprit
gz = ship.Hr(7.5) - 0.65
body = prim("uv_sphere", "figure", loc=(7.95, 0, gz), rot=(0, -28, 0), scale=(0.72, 0.3, 0.34), segments=12, ring_count=8)
head = prim("uv_sphere", "figure", loc=(8.6, 0, gz + 0.42), scale=(1.1, 0.95, 1.0), segments=12, ring_count=8, radius=0.26)
cutter = bpy.ops.mesh.primitive_cube_add(size=0.3, location=(8.76, 0.2, gz + 0.5), rotation=(0.5, 0.4, 0.3)); cutter = bpy.context.active_object
bm_ = head.modifiers.new("b", "BOOLEAN"); bm_.object = cutter; bm_.operation = "DIFFERENCE"; act(head); bpy.ops.object.modifier_apply(modifier="b")
bpy.data.objects.remove(cutter)
prim("cone", "iron", loc=(8.98, 0, gz + 0.36), rot=(0, 100, 0), vertices=6, radius1=0.09, radius2=0.01, depth=0.42)
for y in (0.2, -0.2): prim("uv_sphere", "crack", loc=(8.74, y, gz + 0.5), segments=6, ring_count=4, radius=0.045)
tube([(8.82, -0.12, gz + 0.68), (8.86, -0.04, gz + 0.5), (8.84, 0.04, gz + 0.42), (8.86, 0.1, gz + 0.28)], 0.018, 3, "crack")
tube([(8.86, -0.04, gz + 0.5), (8.78, -0.2, gz + 0.44)], 0.014, 3, "crack")
for sg in (1, -1):
    prim("uv_sphere", "figure", loc=(7.7, sg * 0.36, gz + 0.12), rot=(sg * 8, -12, sg * -14), scale=(1.0, 0.07, 0.3), segments=10, ring_count=6)
    for k in range(4):
        prim("cube", "figure", loc=(6.95 - k * 0.22, sg * (0.42 + k * 0.05), gz + 0.1 + k * 0.02), rot=(0, -10 - k * 6, sg * -14), scale=(0.18, 0.03, 0.1))

# stern lantern on its iron bracket
SX = -7.55; sz = ship.Hr(-7.5)
tube([(SX, 0, sz), (SX, 0, sz + 0.7), (SX - 0.75, 0, sz + 0.75)], 0.04, 5, "iron")
tube([(SX - 0.75, 0, sz + 0.75), (SX - 0.75, 0, sz + 0.5)], 0.015, 3, "iron")
LZ = sz + 0.25; LX = SX - 0.75
prim("cone", "iron", loc=(LX, 0, LZ + 0.2), vertices=6, radius1=0.17, radius2=0.03, depth=0.16)
prim("cylinder", "glow", loc=(LX, 0, LZ), vertices=6, radius=0.12, depth=0.28)
prim("cylinder", "iron", loc=(LX, 0, LZ - 0.17), vertices=6, radius=0.15, depth=0.05)
for k in range(6):
    a = k * math.tau / 6; prim("cube", "iron", loc=(LX + math.cos(a) * 0.13, math.sin(a) * 0.13, LZ), scale=(0.025, 0.025, 0.32))
LANTERN = Vector((LX, 0, LZ))

# barnacle crusts + clusters
V = []; F = []
def barn(p, n, r, h):
    a = Vector((0, 0, 1)) if abs(n.z) < 0.9 else Vector((1, 0, 0)); e1 = n.cross(a).normalized(); e2 = n.cross(e1)
    b = len(V)
    for k in range(6):
        ang = k * math.tau / 6; V.append(p + (e1 * math.cos(ang) + e2 * math.sin(ang)) * r)
    V.append(p + n * h)
    for k in range(6): F.append((b + k, b + (k + 1) % 6, b + 6))
for _ in range(110):
    sg = 1 if random.random() < 0.7 else -1; x = random.uniform(-7.2, 7.2); t = random.uniform(0.2, 0.62)
    if sg == 1 and in_hole(x, t): continue
    c = ship.P(x, t, sg); n = ship.N(x, t, sg)
    for _k in range(random.randint(1, 5)):
        off = Vector((random.uniform(-0.18, 0.18), 0, random.uniform(-0.15, 0.15)))
        barn(c + off + n * 0.0, n, random.uniform(0.04, 0.1), random.uniform(0.05, 0.11))
mk("barnacles", V, F, ["barnacle"])

# weed hanging off the rails (port hangs free of the listing hull, starboard lies on it)
WD = Vector((0, math.sin(math.radians(20)), -math.cos(math.radians(20))))
V = []; F = []
def strand(pts, w, side):
    b = len(V); n = len(pts)
    for i, p in enumerate(pts):
        ww = w * (1 - 0.7 * i / (n - 1)); V.append(p + side * ww / 2); V.append(p - side * ww / 2)
    for i in range(n - 1): F.append((b + 2 * i, b + 2 * i + 1, b + 2 * i + 3, b + 2 * i + 2))
for _ in range(56):
    sg = 1 if random.random() < 0.6 else -1; x = random.uniform(-7.0, 6.8); L = random.uniform(0.4, 1.7); w = random.uniform(0.1, 0.24)
    top = ship.P(x, 1, sg) + Vector((0, sg * 0.1, 0.1))
    if sg == 1:
        pts = [top + WD * (L * i / 4) + Vector((random.uniform(-0.05, 0.05), 0, 0)) for i in range(5)]
    else:
        pts = [ship.P(x, 1 - (L / 3.2) * i / 4, -1) + ship.N(x, 1 - (L / 3.2) * i / 4, -1) * 0.05 + Vector((0, 0, 0.1 if i == 0 else 0)) for i in range(5)]
    strand(pts, w, Vector((1, 0, 0)))
for (p, L) in ((ya, 1.2), (yb, 0.9), ((7.8, 0, ship.Hr(7.5) + 0.4), 1.0), ((MX + 0.1, -0.9, yard_z - 0.15), 0.8)):
    strand([Vector(p) + WD * (L * i / 4) for i in range(5)], 0.16, Vector((1, 0, 0)))
mk("weed", V, F, ["weed"])

# ---------------------------------------------------------------- list, sink, cut the turf line
wreck = join(OBJS, "GullsWake"); OBJS.clear()
T = Matrix.Translation((0, 0, -0.75)) @ Matrix.Rotation(math.radians(-4), 4, "Y") @ Matrix.Rotation(math.radians(-20), 4, "X")
wreck.data.transform(T)
# the snapped foremast top, fallen from the deck to the ground on the port side
dp = T @ Vector((FX + 0.6, 0.4, zd(FX) + 0.25))
ft = tube([dp, Vector((FX + 1.6, 5.2, -0.25))], 0.15, 8, "deck", r_end=0.13, cap=True)
gp = T @ Vector((FX + 0.4, 0, zd(FX) + 0.1))
wreck = join([wreck, ft], "GullsWake"); OBJS.clear()
bm = bmesh.new(); bm.from_mesh(wreck.data)
bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, -0.35), plane_no=(0, 0, 1), clear_inner=True)
bm.to_mesh(wreck.data); bm.free()
act(wreck); bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
LW = T @ LANTERN
co = [v.co for v in wreck.data.vertices]
mn = Vector((min(c.x for c in co), min(c.y for c in co), min(c.z for c in co))); mx = Vector((max(c.x for c in co), max(c.y for c in co), max(c.z for c in co)))
INFO = {"wreck_tris": tris(wreck), "lantern_blender": list(LW), "min": list(mn), "max": list(mx)}
act(wreck); bpy.ops.export_scene.gltf(filepath=OUT + "/gulls-wake.glb", use_selection=True, export_apply=True)

# ---------------------------------------------------------------- props (each its own .glb, origin at base centre)
PROPS = {}
def finish_prop(name, objs, at):
    o = join(objs, name); OBJS.clear()
    co = [v.co for v in o.data.vertices]; z0 = min(c.z for c in co)
    o.data.transform(Matrix.Translation((0, 0, -z0)))
    act(o); bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    bpy.ops.export_scene.gltf(filepath=f"{OUT}/{name}.glb", use_selection=True, export_apply=True)
    PROPS[name] = tris(o); o.location = at

def crate():
    b = prim("cube", "deck", size=0.8, loc=(0, 0, 0.4))
    act(b); bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.uv.cube_project(cube_size=2.0); bpy.ops.object.mode_set(mode="OBJECT")
    md = b.modifiers.new("bv", "BEVEL"); md.width = 0.03; md.segments = 1; bpy.ops.object.modifier_apply(modifier="bv")
    for z in (0.08, 0.72):
        for (sx, sy) in ((0.84, 0.05), (0.05, 0.84)):
            for s in (1, -1):
                prim("cube", "iron", loc=(s * 0.41 if sy > 0.5 else 0, s * 0.41 if sx > 0.5 else 0, z), scale=(sx if sx > .5 else .03, sy if sy > .5 else .03, 0.06))
    lid = prim("cube", "deck", size=1, loc=(0.1, 0.15, 0.86), rot=(0, 9, 14), scale=(0.82, 0.82, 0.06))
    global V, F
    V = []; F = []
    for _ in range(26):
        n = random.choice([Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((-1, 0, 0)), Vector((0, -1, 0))])
        p = n * 0.405 + Vector((0, 0, random.uniform(0.03, 0.35))) + n.cross(Vector((0, 0, 1))) * random.uniform(-0.35, 0.35)
        barn(p, n, random.uniform(0.03, 0.06), random.uniform(0.03, 0.06))
    mk("bc", V, F, ["barnacle"])
    V = []; F = []
    for k in range(3):
        x = random.uniform(-0.3, 0.3); strand([Vector((x, 0.43, 0.8 - i * 0.12)) for i in range(5)], 0.12, Vector((1, 0, 0)))
    mk("bw", V, F, ["weed"])
    finish_prop("wreck-crate", list(OBJS), (-6, 0, 0))

def rope():
    pts = []
    for i in range(70):
        a = i * 0.42; r = 0.14 + 0.32 * min(1, i / 45); z = 0.05 + (0.1 if i > 45 else 0)
        if i > 45: r = 0.46 - 0.3 * (i - 45) / 25
        pts.append((math.cos(a) * r, math.sin(a) * r, z))
    pts += [(0.5 + 0.25 * k, -0.2 - 0.2 * k, 0.04) for k in range(1, 5)]
    tube(pts, 0.05, 6, "rope")
    finish_prop("wreck-rope", list(OBJS), (-4, 0, 0))

def anchor():
    tube([(0, 0, 0.05), (0, 0, 1.7)], 0.075, 8, "iron", cap=True)
    arc = [(math.sin(a) * 0.72, 0, 0.62 - math.cos(a) * 0.62 + 0.05) for a in np.linspace(-1.2, 1.2, 9)]
    tube(arc, 0.07, 8, "iron")
    for s in (1, -1):
        p = arc[0] if s < 0 else arc[-1]
        prim("cone", "iron", loc=(p[0] + s * 0.05, 0, p[2] + 0.1), rot=(0, s * -30, 0), vertices=4, radius1=0.2, radius2=0.02, depth=0.4, scale=(1, 0.35, 1))
    prim("torus", "iron", loc=(0, 0, 1.85), rot=(90, 0, 0), major_radius=0.17, minor_radius=0.035, major_segments=10, minor_segments=4)
    prim("cube", "deck", loc=(0, 0, 1.5), scale=(0.14, 1.3, 0.14))
    global V, F
    V = []; F = []
    for _ in range(18):
        a = random.random() * math.tau; z = random.uniform(0.2, 1.4); n = Vector((math.cos(a), math.sin(a), 0))
        barn(Vector((0, 0, z)) + n * 0.07, n, 0.035, 0.04)
    mk("ab", V, F, ["barnacle"])
    o = join(list(OBJS), "anc"); OBJS.clear(); OBJS.append(o)
    o.data.transform(Matrix.Rotation(math.radians(38), 4, "Y") @ Matrix.Rotation(math.radians(15), 4, "Z"))
    finish_prop("wreck-anchor", list(OBJS), (-2, 0, 0))

def bones():
    prim("uv_sphere", "bone", loc=(0, 0, 0.12), scale=(1.15, 0.95, 1.0), radius=0.12, segments=10, ring_count=7)
    prim("cube", "bone", loc=(0.1, 0, 0.04), scale=(0.1, 0.16, 0.06))
    for y in (0.045, -0.045): prim("uv_sphere", "crack", loc=(0.11, y, 0.14), radius=0.035, segments=6, ring_count=4)
    for (a, b) in (((0.3, 0.1, 0.03), (0.75, 0.3, 0.03)), ((-0.2, -0.3, 0.03), (-0.1, -0.75, 0.04)), ((0.4, -0.25, 0.03), (0.8, -0.1, 0.03))):
        tube([a, b], 0.03, 5, "bone")
        for p in (a, b): prim("uv_sphere", "bone", loc=p, radius=0.045, segments=6, ring_count=4)
    for k in range(5):
        tube([(-0.35 + k * 0.1, 0.2, 0.02), (-0.4 + k * 0.1, 0.38, 0.12), (-0.48 + k * 0.1, 0.56, 0.03)], 0.016, 4, "bone")
    finish_prop("wreck-bones", list(OBJS), (0, 0, 0))

def rowboat():
    rb = Hull(1.7, 0.66, 0.55, 0.05)
    o = rb.shell(16, 6); OBJS.remove(o)
    tube([rb.P(-1.7 + 3.4 * i / 16, 1, 1) for i in range(17)], 0.04, 4, "deck"); tube([rb.P(-1.7 + 3.4 * i / 16, 1, -1) for i in range(17)], 0.04, 4, "deck")
    for x in (-0.6, 0.4): prim("cube", "deck", loc=(x, 0, rb.Hr(x) - 0.15), scale=(0.22, rb.B(x) * 1.9, 0.04))
    global V, F
    V = []; F = []
    for _ in range(40):
        sg = random.choice((1, -1)); x = random.uniform(-1.5, 1.5); t = random.uniform(0.0, 0.5)
        barn(rb.P(x, t, sg), rb.N(x, t, sg), random.uniform(0.025, 0.05), 0.04)
    mk("rb", V, F, ["barnacle"])
    OBJS.append(o); j = join(list(OBJS), "rbj"); OBJS.clear(); OBJS.append(j)
    j.data.transform(Matrix.Rotation(math.radians(7), 4, "Y") @ Matrix.Rotation(math.radians(180), 4, "X"))
    finish_prop("wreck-rowboat", list(OBJS), (3, 0, 0))

def buoy():
    prim("cylinder", "paint", loc=(0, 0, 0.25), vertices=10, radius=0.45, depth=0.5)
    prim("cone", "cream", loc=(0, 0, 0.62), vertices=10, radius1=0.46, radius2=0.2, depth=0.25)
    prim("cone", "paint", loc=(0, 0, 0.82), vertices=10, radius1=0.2, radius2=0.12, depth=0.15)
    for k in range(3):
        a = k * math.tau / 3; tube([(math.cos(a) * 0.17, math.sin(a) * 0.17, 0.85), (math.cos(a) * 0.1, math.sin(a) * 0.1, 1.65)], 0.025, 4, "iron")
    prim("torus", "iron", loc=(0, 0, 1.65), major_radius=0.12, minor_radius=0.025, major_segments=10, minor_segments=4)
    prim("cone", "bronze", loc=(0, 0, 1.35), vertices=10, radius1=0.16, radius2=0.07, depth=0.26)
    prim("uv_sphere", "bronze", loc=(0, 0, 1.48), radius=0.075, segments=8, ring_count=4)
    global V, F
    V = []; F = []
    for k in range(5):
        a = random.random() * math.tau; strand([Vector((math.cos(a) * 0.44, math.sin(a) * 0.44, 0.6 - i * 0.12)) for i in range(5)], 0.12, Vector((-math.sin(a), math.cos(a), 0)))
    mk("bw", V, F, ["weed"])
    for _ in range(24):
        a = random.random() * math.tau; z = random.uniform(0.04, 0.4); n = Vector((math.cos(a), math.sin(a), 0)); barn(n * 0.45 + Vector((0, 0, z)), n, 0.04, 0.05)
    mk("bb", V, F, ["barnacle"])
    j = join(list(OBJS), "bj"); OBJS.clear(); OBJS.append(j)
    j.data.transform(Matrix.Rotation(math.radians(24), 4, "X"))
    finish_prop("wreck-buoy", list(OBJS), (6, 0, 0))

for f in (crate, rope, anchor, bones, rowboat, buoy): f()
INFO["props"] = PROPS
json.dump(INFO, open(OUT + "/info.json", "w"), indent=1); print("INFO", json.dumps(INFO))

# ---------------------------------------------------------------- proof renders
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0)); g = bpy.context.active_object
gm = bpy.data.materials.new("ground"); gm.use_nodes = True; gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.11, 0.14, 0.06, 1); g.data.materials.append(gm)
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(62), 0, math.radians(-125))); sun = bpy.context.active_object; sun.data.energy = 4.5; sun.data.color = (1, 0.82, 0.6)
w = bpy.data.worlds.new("w"); scene.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.45, 0.42, 0.38, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.8
scene.render.engine = "CYCLES"; scene.cycles.device = "CPU"; scene.cycles.samples = 16
scene.render.resolution_x, scene.render.resolution_y = 900, 640
cam = bpy.data.cameras.new("c"); co_ = bpy.data.objects.new("cam", cam); scene.collection.objects.link(co_); scene.camera = co_
def shoot(pos, tgt, path, lens=30):
    co_.location = pos; d = Vector(tgt) - Vector(pos); co_.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); cam.lens = lens
    scene.render.filepath = path; bpy.ops.render.render(write_still=True)
for o in bpy.data.objects:
    if o.name.startswith("wreck-"): o.location.y += 14; o.location.x *= 0.9
shoot((13, 17, 3.2), (0, 1.5, 3.0), PROOF + "/a.png")
shoot((-14, 14, 2.4), (-2, 1, 3.2), PROOF + "/b.png")
shoot((2.5, 6.5, 2.0), (0.7, 0, 1.6), PROOF + "/c.png", lens=22)
shoot((0, 26, 3), (0, 14, 0.4), PROOF + "/d.png", lens=35)
