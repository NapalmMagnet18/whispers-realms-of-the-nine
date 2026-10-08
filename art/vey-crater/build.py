# hc-vey-crater: the Star That Answered's impact scar + its props. One pass: build -> proof -> export.
import bpy, bmesh, math, os, numpy as np
from mathutils import Vector, Matrix, noise
OUT = "/workspace/vey-crater"; PROOF = "/tmp/vey-crater"
os.makedirs(OUT, exist_ok=True); os.makedirs(PROOF, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
rng = np.random.default_rng(7)
N = 512

# ---------------- textures (painted in numpy, sRGB) ----------------
def fnoise(beta, seed, n=N):
    r = np.random.default_rng(seed); w = r.standard_normal((n, n))
    kx = np.fft.fftfreq(n)[:, None]; ky = np.fft.fftfreq(n)[None, :]
    k = np.sqrt(kx**2 + ky**2); k[0, 0] = 1
    f = np.fft.fft2(w) * k**(-beta); f[0, 0] = 0
    o = np.real(np.fft.ifft2(f)); return (o - o.mean()) / o.std()
def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) / 255 for i in (0, 2, 4)])
def mix(a, b, t): t = np.clip(t, 0, 1)[..., None]; return a * (1 - t) + b * t
def cracks(seed, w=0.07, beta=1.7): return np.exp(-(fnoise(beta, seed) / w)**2)
def img(name, rgb):
    im = bpy.data.images.new(name, N, N, alpha=False)
    a = np.ones((N, N, 4)); a[..., :3] = np.clip(rgb, 0, 1)
    im.pixels.foreach_set(a[::-1].ravel().astype(np.float32)); im.pack(); return im
yy, xx = np.mgrid[0:N, 0:N]
n1, n2, n3 = fnoise(1.4, 1), fnoise(1.0, 2), fnoise(2.2, 3)

slate = mix(hexc('#34383e'), hexc('#5d6266'), 0.5 + 0.25 * n1)
slate *= (1 - 0.25 * (np.sin(yy / N * 2 * np.pi * 14 + n3 * 2.5) > 0.85))[..., None]
slate = mix(slate, hexc('#1a1716'), cracks(4) * 0.9)
slate = mix(slate, hexc('#3f5a3a'), np.clip((fnoise(1.3, 5) - 1.0) * 1.2, 0, 1) * 0.85)
slate = mix(slate, hexc('#8a8c88'), (np.random.default_rng(6).random((N, N)) > 0.985) * 0.6)
slate *= (0.8 + 0.12 * fnoise(2.6, 7))[..., None]
earth = mix(hexc('#2e2a27'), hexc('#5a4634'), 0.45 + 0.25 * n2)
earth = mix(earth, hexc('#3f5a3a'), np.clip((fnoise(1.6, 8) - 0.6), 0, 1) * 0.8)
earth = mix(earth, hexc('#7d7468'), (np.random.default_rng(9).random((N, N)) > 0.97) * 0.5)
earth = mix(earth, hexc('#1d1714'), np.clip(fnoise(2.4, 10) * 0.4, 0, 0.6))
scorch = mix(hexc('#14100e'), hexc('#2a1e16'), 0.5 + 0.35 * n1)
scorch = mix(scorch, hexc('#5a5550'), np.clip(fnoise(1.2, 11) - 0.9, 0, 1) * 0.7)
sc_cr = cracks(12, 0.05)
scorch = mix(scorch, hexc('#3a1f55'), sc_cr)
scorch_e = hexc('#a56ef0') * (sc_cr * np.clip(0.4 + fnoise(2.5, 13) * 0.5, 0, 1))[..., None]
glass = mix(hexc('#241035'), hexc('#6d3db0'), 0.5 + 0.3 * fnoise(1.2, 14))
glass = mix(glass, hexc('#c9a8ff'), np.clip(fnoise(0.9, 15) - 1.4, 0, 1))
gcr = np.maximum(cracks(16, 0.06), cracks(17, 0.04, 1.4))
glass = mix(glass, hexc('#e4d0ff'), gcr * 0.8)
glass_e = mix(hexc('#2a1048') * 0.35, hexc('#b07cff'), gcr) * (0.75 + 0.25 * fnoise(2, 18))[..., None]
bglass = mix(hexc('#0c0a10'), hexc('#2b2238'), np.clip(0.3 + 0.3 * n2, 0, 1))
bglass = mix(bglass, hexc('#4a2a6a'), cracks(19, 0.03) * 0.6)
brass = mix(hexc('#8f6f3c'), hexc('#c9a46a'), 0.55 + 0.3 * fnoise(1.5, 20))
brass = mix(brass, hexc('#4a5a3a'), np.clip(fnoise(1.3, 21) - 0.8, 0, 1) * 0.8)
brass = mix(brass, hexc('#2a1e16'), np.clip(fnoise(2.0, 22) - 0.6, 0, 1) * 0.9)
brass = mix(brass, hexc('#f2d49a'), (np.abs(np.sin((xx + yy * 0.3) / 3.0 + n3 * 6)) > 0.995) * 0.6)
lens = mix(hexc('#9a8cd8'), hexc('#dcd6ff'), 0.5 + 0.3 * n1); lens = mix(lens, hexc('#ffffff'), cracks(23, 0.03))
wood = mix(hexc('#3b2a1c'), hexc('#6b4a2f'), 0.5 + 0.4 * np.sin(xx / N * 2 * np.pi * 22 + fnoise(1.8, 24) * 3))
wood = mix(wood, hexc('#120d0a'), np.clip(fnoise(1.4, 25) * 0.7 + 0.2, 0, 0.95))
cloth = mix(hexc('#4e1d16'), hexc('#7a2e22'), 0.5 + 0.3 * fnoise(1.6, 26))
cloth *= (1 - 0.25 * (np.sin(xx / 2.0) > 0.6))[..., None]
cloth = mix(cloth, hexc('#14100e'), np.clip(fnoise(1.5, 27) * 0.8, 0, 0.9))
cloth = mix(cloth, hexc('#c9a46a'), (np.abs(np.sin(yy / N * 2 * np.pi * 3)) > 0.97) * 0.7)
# parchment star chart
par = mix(hexc('#c9b48a'), hexc('#e8d9b5'), 0.6 + 0.3 * n2)
ink = np.zeros((N, N)); cx = cy = N / 2; d0 = np.hypot(xx - cx, yy - cy)
for R in (200, 140, 70): ink = np.maximum(ink, np.abs(d0 - R) < 1.6)
for k in range(12): a = k * np.pi / 6; ink = np.maximum(ink, (np.abs((xx - cx) * np.sin(a) - (yy - cy) * np.cos(a)) < 0.9) & (d0 < 200) & (d0 > 70))
stars = np.random.default_rng(28).uniform(60, N - 60, (26, 2))
for (sx, sy) in stars: ink = np.maximum(ink, np.hypot(xx - sx, yy - sy) < np.random.default_rng(int(sx)).uniform(2.5, 6))
for i in range(0, 24, 3):
    for t in np.linspace(0, 1, 160):
        for j in (0, 1):
            p = stars[i + j] * (1 - t) + stars[i + j + 1] * t; px, py = int(p[0]), int(p[1]); ink[py-1:py+1, px-1:px+1] = 1
par = mix(par, hexc('#2a1e16'), ink * 0.85)
edge = np.minimum(np.minimum(xx, N - xx), np.minimum(yy, N - yy)) / N
burn = np.clip(1 - (edge * 9 + fnoise(1.6, 29) * 0.25), 0, 1)
par = mix(par, hexc('#6b4a2f'), burn * 0.8); par = mix(par, hexc('#120d0a'), np.clip(burn * 2 - 1, 0, 1))

def mat(name, base, rough, metal=0.0, emis=None, es=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = img(name + "_col", base)
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emis is not None:
        e = nt.nodes.new("ShaderNodeTexImage"); e.image = img(name + "_em", emis)
        nt.links.new(e.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = es
    return m
M = dict(slate=mat("slate", slate, 0.85), earth=mat("earth", earth, 0.95), scorch=mat("scorch", scorch, 0.9, 0, scorch_e, 1.6),
         skyglass=mat("skyglass", glass, 0.18, 0, glass_e, 3.0), blackglass=mat("blackglass", bglass, 0.12),
         brass=mat("brass", brass, 0.38, 1.0), lensglass=mat("lensglass", lens, 0.1, 0, lens * 0.5, 1.2),
         wood=mat("wood", wood, 0.85), cloth=mat("cloth", cloth, 0.95), parchment=mat("parchment", par, 0.9))

# ---------------- mesh helpers ----------------
FLOOR = -0.05
def coll(name): c = bpy.data.collections.new(name); scene.collection.children.link(c); return c
def box_uv(me, s):
    uv = me.uv_layers.new(name="UVMap")
    for p in me.polygons:
        n = p.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            u, v = ((co.y, co.z), (co.x, co.z), (co.x, co.y))[ax]
            uv.data[li].uv = (u * s, v * s)
def finish(ob, mat_, s, smooth=False):
    ob.data.materials.append(mat_)
    if not ob.data.uv_layers: box_uv(ob.data, s)
    for p in ob.data.polygons: p.use_smooth = smooth
    return ob
def hull(name, pts, mat_, c, s=0.5, floor=FLOOR):
    bm = bmesh.new()
    for p in pts: bm.verts.new((p[0], p[1], max(p[2], floor)))
    r = bmesh.ops.convex_hull(bm, input=bm.verts[:])
    dv = list({g for g in r["geom_interior"] + r["geom_unused"] if isinstance(g, bmesh.types.BMVert)})
    if dv: bmesh.ops.delete(bm, geom=dv, context="VERTS")
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); c.objects.link(ob); return finish(ob, mat_, s)
def mesh(name, verts, faces, mat_, c, s=0.5, smooth=False):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in verts], [], faces); me.update()
    ob = bpy.data.objects.new(name, me); c.objects.link(ob); return finish(ob, mat_, s, smooth)
def U(a, b): return float(rng.uniform(a, b))
def rock_pts(sx, sy, sz, chip=0.25):
    pts = []
    for x in (-1, 1):
        for y in (-1, 1):
            for z in (-1, 1):
                k = 1 - U(0, chip); pts.append(Vector((x * sx * k, y * sy * k, z * sz * k)))
    for i in range(8):
        d = Vector(rng.normal(0, 1, 3)).normalized(); pts.append(Vector((d.x * sx, d.y * sy, d.z * sz)) * U(0.85, 1.12))
    return pts
def xf(pts, m): return [m @ p for p in pts]
def crystal_pts(L, r, sides=6):
    pts = []; r0 = U(0, 6.28)
    for z, s in ((0, 1.0), (0.15, 1.08), (0.55, 0.95), (0.8, 0.6), (0.93, 0.28)):
        o = Vector((rng.normal(0, .05 * r), rng.normal(0, .05 * r), 0))
        for i in range(sides):
            a = r0 + 6.283 * i / sides + U(-.25, .25); rr = r * s * U(.85, 1.15)
            pts.append(o + Vector((rr * math.cos(a), rr * math.sin(a), z * L)))
    pts.append(Vector((rng.normal(0, .06 * r), rng.normal(0, .06 * r), L))); return pts
def lean(base, dirx, diry, tilt_deg):
    yaw = math.atan2(diry, dirx) - math.pi / 2
    return Matrix.Translation(base) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Rotation(-math.radians(tilt_deg), 4, 'X')
def torus(name, R, r, mat_, c, m, a0=0, a1=360, seg=28, ring=6, wob=0.0, ell=1.0):
    vs, fs = [], []; segs = seg + 1
    for i in range(segs):
        a = math.radians(a0 + (a1 - a0) * i / seg); Rw = R * (1 + wob * math.sin(a * 3 + 1))
        cen = Vector((Rw * math.cos(a), Rw * ell * math.sin(a), wob * R * 0.6 * math.sin(a * 2)))
        for j in range(ring):
            b = 6.283 * j / ring; d = Vector((math.cos(a) * math.cos(b), math.sin(a) * math.cos(b), math.sin(b)))
            p = m @ (cen + d * r); p.z = max(p.z, FLOOR); vs.append(p)
    for i in range(seg):
        for j in range(ring):
            fs.append((i * ring + j, (i + 1) * ring + j, (i + 1) * ring + (j + 1) % ring, i * ring + (j + 1) % ring))
    return mesh(name, vs, fs, mat_, c, 2.0, True)

# ---------------- the crater ----------------
AX, AY, RIM = 6.0, 5.0, 0.72
MB = Vector((0.2, -3.2, 0))               # monolith base: the near (arena, -Y = engine +Z) rim
def sm(t): t = min(max(t, 0), 1); return t * t * (3 - 2 * t)
def H(x, y):
    rn = math.hypot(x / AX, y / AY)
    if rn < 0.5: h = 0.06 + 0.2 * (rn / 0.5)**2
    elif rn < RIM: h = 0.26 + 0.92 * sm((rn - 0.5) / (RIM - 0.5))
    else: h = 1.18 * (1 - sm((rn - RIM) / (1 - RIM)))
    band = max(0.0, 1 - abs(rn - RIM) * 3.5)
    h += noise.noise(Vector((x * .55, y * .55, 1.3))) * 0.22 * band + noise.noise(Vector((x * 2.1, y * 2.1, 4.1))) * 0.05
    h += 0.35 * math.exp(-((x - MB.x)**2 + (y - MB.y)**2) / 2.5) * band
    if rn > 0.97: h = FLOOR
    return max(h, FLOOR if rn > 0.9 else 0.02)
MB.z = H(MB.x, MB.y)
C = coll("crater")
rings = [0, .1, .2, .3, .38, .45, .51, .56, .61, .65, .69, .72, .75, .79, .84, .89, .94, 1.0]; S = 72
vs = [Vector((0, 0, H(0, 0)))]
for rn in rings[1:]:
    for i in range(S):
        a = 6.283 * i / S; x, y = AX * rn * math.cos(a), AY * rn * math.sin(a)
        if rn < 1: x += U(-.06, .06); y += U(-.06, .06)
        vs.append(Vector((x, y, H(x, y))))
fs = [(0, 1 + i, 1 + (i + 1) % S) for i in range(S)]
for k in range(len(rings) - 2):
    o0, o1 = 1 + k * S, 1 + (k + 1) * S
    for i in range(S): fs.append((o0 + i, o1 + i, o1 + (i + 1) % S, o0 + (i + 1) % S))
g = mesh("ground", vs, fs, M["earth"], C, 0.35, True)
g.data.materials.append(M["scorch"])
for p in g.data.polygons:
    cc = p.center
    if math.hypot(cc.x / AX, cc.y / AY) < 0.6 + 0.04 * noise.noise(Vector((cc.x, cc.y, 7))): p.material_index = 1

# upturned slate plates around the rim
for k in range(40):
    a = 6.283 * k / 40 + U(-.08, .08)
    if abs(math.atan2(math.sin(a + math.pi / 2), math.cos(a + math.pi / 2))) < 0.3: continue
    rn = U(.64, .86 if math.sin(a) > -0.3 else .74); x, y = AX * rn * math.cos(a), AY * rn * math.sin(a)
    L, W, T = U(1.0, 2.0), U(.6, 1.2), U(.16, .3)
    tilt = -U(30, 70) if rng.random() < .7 else U(20, 45)
    m = Matrix.Translation((x, y, H(x, y) - .12)) @ Matrix.Rotation(a - math.pi / 2, 4, 'Z') @ Matrix.Rotation(math.radians(tilt), 4, 'X') @ Matrix.Rotation(U(-.25, .25), 4, 'Y')
    hull(f"plate{k}", xf(rock_pts(L / 2, W / 2, T / 2, .35), m), M["slate"], C, .7)
for k in range(16):  # loose rubble on floor and rim
    a = U(0, 6.283); rn = U(.2, .95); x, y = AX * rn * math.cos(a), AY * rn * math.sin(a); s = U(.15, .45)
    hull(f"rub{k}", xf(rock_pts(s, s * U(.6, 1), s * U(.4, .8), .4), Matrix.Translation((x, y, H(x, y))) @ Matrix.Rotation(U(0, 6), 4, 'Z')), M["slate"], C, .7)

# the monolith: main spike + broken sub-spike, leaning north over the bowl
ax_dir = (Vector((0, 0, 1)) @ Matrix.Rotation(0, 3, 'Z'))
mm = lean(MB + Vector((0, 0, -.5)), .15, 1, 24)
hull("mono", xf(crystal_pts(5.1, .78, 6), mm), M["skyglass"], C, .45)
hull("mono2", xf(crystal_pts(2.6, .45, 5), mm @ Matrix.Translation((.35, -.1, 2.2)) @ Matrix.Rotation(math.radians(-28), 4, 'Y')), M["skyglass"], C, .45)
for k, (dx, dy, t, L, r) in enumerate([(-1, .4, 52, 2.6, .38), (1, .5, 48, 2.9, .42), (-.4, 1, 40, 2.2, .32), (.6, 1, 58, 1.8, .3),
                                        (-1, -.25, 62, 1.6, .28), (1, -.2, 60, 1.4, .26), (.1, -1, 55, 1.0, .22), (-1, .9, 70, 1.4, .24)]):
    off = Vector((dx, dy, 0)).normalized() * U(.3, .6)
    hull(f"sec{k}", xf(crystal_pts(L, r, 5), lean(MB + off + Vector((0, 0, -.3)), dx, dy, t)), M["skyglass"], C, .45)
# cooled black-glass crust collar
for k in range(4):
    o = Vector((U(-.6, .6), U(-.2, .5), 0)); s = U(.7, 1.1)
    hull(f"crust{k}", xf(rock_pts(s, s * U(.7, 1), U(.35, .6), .5), Matrix.Translation(MB + o) @ Matrix.Rotation(U(0, 6), 4, 'Z')), M["blackglass"], C, .6)
# shard fan spraying into the bowl
for k in range(18):
    a = math.radians(U(25, 155)); d = U(1.6, 6.5)
    p = MB + Vector((math.cos(a) * d * 1.1, math.sin(a) * d, 0)); p.z = H(p.x, p.y) - .1
    dirv = Vector((math.cos(a), math.sin(a)))
    hull(f"fan{k}", xf(crystal_pts(U(.35, 1.1) * (1.2 - d / 9), U(.07, .16), 5), lean(p, dirv.x, dirv.y, U(35, 70))), M["skyglass"], C, .45)
# brass of the great lens: a bent broken ring swallowed by the spike, a cracked lens disc on its arena face
axis = (mm.to_3x3() @ Vector((0, 0, 1))).normalized()
c1 = mm @ Vector((0, 0, 2.3))
q = (axis + Vector((.3, -.2, 0))).normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4()
torus("ring1", .78, .06, M["brass"], C, Matrix.Translation(c1) @ q, 0, 290, wob=.08, ell=.9)
torus("ring2", .55, .045, M["brass"], C, Matrix.Translation(MB + Vector((2.2, 3.4, .1))) @ Matrix.Rotation(math.radians(62), 4, 'X') @ Matrix.Rotation(.7, 4, 'Z'), 20, 250, wob=.12)
torus("ring3", .4, .04, M["brass"], C, Matrix.Translation(Vector((-2.6, 1.5, H(-2.6, 1.5) + .05))) @ Matrix.Rotation(math.radians(75), 4, 'Y'), 0, 200, wob=.1)
c2 = mm @ Vector((0, -.62, 3.25))
nq = (Vector((0, -1, .35)) + Vector((.15, 0, 0))).normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4()
for h_, (a0, a1, tw) in enumerate([(4, 176, 5), (184, 356, -7)]):
    mh = Matrix.Translation(c2) @ nq @ Matrix.Rotation(math.radians(tw), 4, 'Y')
    pts = []
    for i in range(13):
        a = math.radians(a0 + (a1 - a0) * i / 12)
        for z in (-.035, .035): pts.append(mh @ Vector((.5 * math.cos(a), .5 * math.sin(a), z)))
    hull(f"lens{h_}", pts, M["lensglass"], C, 1.5)
    torus(f"lensrim{h_}", .52, .05, M["brass"], C, mh, a0, a1, seg=14)

# ---------------- props (each its own .glb, built at origin, feet at z 0) ----------------
P = {}
def leg(name, p, q, w, mat_, c):
    d = (q - p).normalized(); s1 = d.cross(Vector((0, 0, 1)))
    if s1.length < 1e-3: s1 = Vector((1, 0, 0))
    s1.normalize(); s2 = d.cross(s1).normalized(); pts = []
    for e in (p, q):
        for a in (-1, 1):
            for b in (-1, 1): pts.append(e + s1 * a * w + s2 * b * w * U(.8, 1.1))
    return hull(name, pts, mat_, c, 2.0, 0.0)
# toppled telescope stand
c = coll("telescope"); P["telescope"] = c
vs, fs = [], []; sides = 12; xs = [-.85, -.55, -.5, .3, .35, .8, .85]; rs = [.09, .09, .11, .12, .14, .14, .12]
m = Matrix.Translation((0, 0, .15)) @ Matrix.Rotation(.35, 4, 'Z') @ Matrix.Rotation(math.radians(4), 4, 'Y')
for x, r in zip(xs, rs):
    for j in range(sides):
        b = 6.283 * j / sides; vs.append(m @ Vector((x, r * math.cos(b), r * math.sin(b))))
for i in range(len(xs) - 1):
    for j in range(sides): fs.append((i * sides + j, i * sides + (j + 1) % sides, (i + 1) * sides + (j + 1) % sides, (i + 1) * sides + j))
fs.append(tuple(range(sides))[::-1]); fs.append(tuple(range((len(xs) - 1) * sides, len(xs) * sides)))
mesh("tube", vs, fs, M["brass"], c, 3, True)
hub = Vector((.15, .55, .3)); hull("hub", [hub + Vector(rng.normal(0, .1, 3)) for _ in range(12)], M["brass"], c, 2, 0)
for k, q in enumerate([Vector((-.9, 1.4, .04)), Vector((1.2, 1.3, .04)), Vector((.4, .2, 1.2))]): leg(f"leg{k}", hub, q, .035, M["wood"], c)
leg("legbroken", Vector((1.0, -.4, .03)), Vector((1.5, .2, .05)), .03, M["wood"], c)
# burned prayer-flag pole
c = coll("flagpole"); P["flagpole"] = c
top = Vector((.22, .08, 3.3)); leg("pole", Vector((0, 0, -.02)), top, .06, M["wood"], c)
bar0, bar1 = top + Vector((-.5, -.05, -.35)), top + Vector((.45, .05, -.28)); leg("bar", bar0, bar1, .035, M["wood"], c)
for k, t in enumerate((.15, .45, .75)):
    a = bar0.lerp(bar1, t); L = (1.1, .55, .8)[k]; vs, fs = [], []; rows = 6
    for i in range(rows + 1):
        f = i / rows; jag = (.18 * math.sin(k * 3 + 7)) if i == rows else 0
        for side in (-.11, .11):
            vs.append(a + Vector((side + .04 * math.sin(f * 3), .12 * math.sin(f * 2.5 + k) * f, -f * (L + (jag if side > 0 else -jag)))))
    for i in range(rows): fs.append((i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2))
    mesh(f"flag{k}", vs, fs, M["cloth"], c, 1.5)
for k in range(5):
    a = 6.283 * k / 5; s = U(.14, .24)
    hull(f"cairn{k}", xf(rock_pts(s, s, s * .7), Matrix.Translation((.25 * math.cos(a), .25 * math.sin(a), 0))), M["slate"], c, .7, 0)
# star-chart scroll (half unrolled)
c = coll("scroll"); P["scroll"] = c
vs, fs, uvs = [], [], []; cols = 14; W2, D2 = .5, .34
for i in range(cols + 1):
    f = i / cols; x = -W2 / 2 + f * W2; z = .012 + .03 * math.sin(f * 9) * .3 + (max(0, f - .8) * 5)**2 * .06
    for j, y in enumerate((-D2 / 2, D2 / 2)): vs.append(Vector((x, y + .02 * math.sin(f * 4), z)))
for i in range(cols): fs.append((i * 2, i * 2 + 2, i * 2 + 3, i * 2 + 1))
ob = mesh("sheet", vs, fs, M["parchment"], c)
uv = ob.data.uv_layers.active
for p in ob.data.polygons:
    for li in p.loop_indices:
        vi = ob.data.loops[li].vertex_index; uv.data[li].uv = ((vi // 2) / cols, vi % 2)
vs, fs = [], []
for x in (-W2 / 2 - .015, -W2 / 2 + .02):
    for j in range(10):
        b = 6.283 * j / 10; vs.append(Vector((x, (D2 / 2 + .02) * 0 + .2 * 0, 0)) + Vector((0, 0, .04)) + Vector((0, 0, 0)))
vs = []
for yv in (-D2 / 2 - .02, D2 / 2 + .02):
    for j in range(10):
        b = 6.283 * j / 10; vs.append(Vector((-W2 / 2 - .01 + .04 * math.cos(b), yv, .04 + .04 * math.sin(b))))
fs = [(j, (j + 1) % 10, 10 + (j + 1) % 10, 10 + j) for j in range(10)] + [tuple(range(10)), tuple(range(10, 20))[::-1]]
mesh("roll", vs, fs, M["parchment"], c, 3, True)
# glowing shard cluster
c = coll("shard"); P["shard"] = c
for k, (dx, dy, t, L, r) in enumerate([(0, 1, 15, .75, .11), (1, -.3, 45, .5, .08), (-1, -.4, 50, .42, .07), (-.2, -1, 40, .3, .06)]):
    hull(f"sh{k}", xf(crystal_pts(L, r, 5), lean(Vector((dx * .05, dy * .05, -.04)), dx, dy, t)), M["skyglass"], c, 1.2, 0)
hull("shbase", xf(rock_pts(.18, .15, .06, .4), Matrix.Translation((0, 0, 0))), M["blackglass"], c, 1, 0)
# slate rubble cluster
c = coll("rubble"); P["rubble"] = c
for k in range(5):
    s = U(.15, .38); o = Vector((U(-.45, .45), U(-.45, .45), 0))
    hull(f"rb{k}", xf(rock_pts(s, s * U(.5, .9), s * U(.3, .6), .4), Matrix.Translation(o) @ Matrix.Rotation(U(0, 6), 4, 'Z') @ Matrix.Rotation(U(-.4, .4), 4, 'X')), M["slate"], c, .7, 0)

# ---------------- join each collection into one node ----------------
def join(cl, name):
    obs = list(cl.objects); bpy.ops.object.select_all(action='DESELECT')
    for o in obs: o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]; bpy.ops.object.join(); o = bpy.context.view_layer.objects.active; o.name = name; return o
for cl in [C] + list(P.values()): bpy.context.view_layer.update()
main = join(C, "hc_vey_crater"); props = {k: join(v, k) for k, v in P.items()}
dg = bpy.context.evaluated_depsgraph_get()
def tris(o): return sum(len(p.vertices) - 2 for p in o.data.polygons)
print("TRIS main", tris(main), {k: tris(o) for k, o in props.items()})
zs = [v.co.z for v in main.data.vertices]; print("Z range", min(zs), max(zs), "X", min(v.co.x for v in main.data.vertices), max(v.co.x for v in main.data.vertices), "Y", min(v.co.y for v in main.data.vertices), max(v.co.y for v in main.data.vertices))

# ---------------- export ----------------
def export(o, path):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.export_scene.gltf(filepath=path, use_selection=True, export_apply=True, export_yup=True, export_image_format='AUTO')
export(main, f"{OUT}/hc-vey-crater.glb")
for k, o in props.items(): export(o, f"{OUT}/{k}.glb")

# ---------------- proof ----------------
scene.render.engine = "CYCLES"; scene.cycles.device = "CPU"; scene.cycles.samples = 16
scene.render.resolution_x, scene.render.resolution_y = 800, 560
w = bpy.data.worlds.new("w"); w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (.35, .3, .28, 1); w.node_tree.nodes["Background"].inputs[1].default_value = .6; scene.world = w
gp = bpy.data.meshes.new("gp"); gp.from_pydata([(-40, -40, 0), (40, -40, 0), (40, 40, 0), (-40, 40, 0)], [], [(0, 1, 2, 3)])
gpo = bpy.data.objects.new("gp", gp); scene.collection.objects.link(gpo); gm = bpy.data.materials.new("g"); gm.use_nodes = True
gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.25, .28, .14, 1); gp.materials.append(gm)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sun.data.energy = 3.5; sun.data.color = (1, .82, .6)
sun.rotation_euler = (math.radians(68), 0, math.radians(-120)); scene.collection.objects.link(sun)
pl = bpy.data.objects.new("pl", bpy.data.lights.new("pl", "POINT")); pl.data.energy = 600; pl.data.color = (.65, .45, 1); pl.location = (0.2, -2.5, 3); scene.collection.objects.link(pl)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); scene.collection.objects.link(cam); scene.camera = cam
def shoot(loc, tgt, fn, lens=30):
    cam.location = loc; cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = lens
    scene.render.filepath = f"{PROOF}/{fn}.png"; bpy.ops.render.render(write_still=True)
for k, o in props.items(): o.hide_render = True
shoot((8, -15, 4.5), (0, -1, 1.8), "a")
shoot((-11, 9, 8), (0, -1, 1.2), "b")
for i, (k, o) in enumerate(props.items()): o.hide_render = False; o.location = (-4 + i * 2.2, -8, 0)
main.hide_render = True; shoot((0.5, -14.5, 3.2), (0.5, -8, .3), "c", 28)
