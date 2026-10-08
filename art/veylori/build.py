# Starfall Eyrie: Hall of Watchers, star-house, yard props. One pass: textures -> build -> export -> proof.
# Door side is Blender +Y (exports as glTF -Z = engine forward). Origin base centre, metres.
import bpy, bmesh, math, os, numpy as np
from mathutils import Vector, Matrix
OUT = "/workspace/veylori"; PROOF = "/tmp/veylori"
os.makedirs(OUT, exist_ok=True); os.makedirs(PROOF, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
N = 512
# ---------------- textures ----------------
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
R0 = np.random.default_rng(3)
def ashlar(a, b, seed, rows=8, cols=4, grime=0.3, moss=0.0):
    c = mix(hexc(a), hexc(b), 0.5 + 0.25 * fnoise(1.3, seed))
    veins = np.exp(-(np.abs(fnoise(1.1, seed + 1)) / 0.035)**2)
    c = mix(c, hexc('#8a8296'), veins * 0.45)
    rh = N // rows; cw = N // cols; row = yy // rh; off = (row % 2) * (cw // 2)
    bid = row * cols + ((xx + off) // cw) % cols
    tint = np.random.default_rng(seed + 2).uniform(-0.07, 0.07, rows * cols + cols)[bid]
    c = c * (1 + tint)[..., None]
    c *= (0.92 + 0.08 * np.clip((yy % rh) / rh * 2, 0, 1))[..., None]
    joint = ((yy % rh) < 3) | (((xx + off) % cw) < 3)
    c = mix(c, hexc('#3e362f'), joint * 0.8)
    c = mix(c, hexc('#2a1e16'), cracks(seed + 3, 0.045) * 0.7)
    c = mix(c, hexc('#5e5848'), np.clip(fnoise(1.5, seed + 4) - 0.6, 0, 1) * grime)
    c = mix(c, hexc('#3f5a3a'), np.clip(fnoise(1.4, seed + 5) - 0.9, 0, 1) * moss)
    return c
marble = ashlar('#d8d0c2', '#efe9dd', 31)
marble_dark = ashlar('#8f887e', '#b4ab9c', 41, grime=0.9, moss=1.0)
t = 128; chk = ((xx // t + yy // t) % 2)
floor = mix(hexc('#d6cfc0'), hexc('#7d7690'), chk * 0.55 + 0.1 * fnoise(1.3, 70))
floor = mix(floor, hexc('#2a1e16'), (((xx % t) < 3) | ((yy % t) < 3)) * 0.7)
floor = mix(floor, hexc('#4a4038'), np.clip(fnoise(1.2, 71) - 0.4, 0, 1) * 0.5)
floor = mix(floor, hexc('#2a1e16'), cracks(72, 0.04) * 0.6)
rh, cw = 32, 40; row = yy // rh; off = (row % 2) * (cw // 2); col = (xx + off) // cw
sid = (row * 20 + col) % 1000; stint = np.random.default_rng(50).uniform(-.12, .12, 1000)[sid]
slate = mix(hexc('#34405a'), hexc('#566683'), 0.5 + 0.3 * fnoise(1.4, 51)) * (1 + stint)[..., None]
slate *= (0.78 + 0.3 * ((yy % rh) / rh))[..., None]
slate = mix(slate, hexc('#161a22'), ((yy % rh) > rh - 4) * 0.85 + (((xx + off) % cw) < 2) * 0.6)
slate = mix(slate, hexc('#3f5a3a'), np.clip(fnoise(1.3, 52) - 0.9, 0, 1) * 0.9)
slate = mix(slate, hexc('#c9a46a'), (R0.random((N, N)) > 0.993) * 0.5)
si = mix(hexc('#232833'), hexc('#3e4859'), 0.5 + 0.3 * fnoise(1.2, 61)) * (0.9 + 0.08 * fnoise(2.8, 62))[..., None]
si = mix(si, hexc('#4c6a9a'), np.clip(fnoise(1.0, 63) - 0.8, 0, 1) * 0.5)
si = mix(si, hexc('#6c7688'), (((xx % 64) - 32)**2 + ((yy % 128) - 10)**2 < 12) * 0.9)
si = mix(si, hexc('#4a5262'), ((yy % 128) < 4) * 0.6)
si = mix(si, hexc('#5a3a2a'), cracks(64, 0.06) * 0.4)
brass = mix(hexc('#8f6f3c'), hexc('#c9a46a'), 0.55 + 0.3 * fnoise(1.5, 20))
brass = mix(brass, hexc('#4a5a3a'), np.clip(fnoise(1.3, 21) - 0.8, 0, 1) * 0.8)
brass = mix(brass, hexc('#2a1e16'), np.clip(fnoise(2.0, 22) - 0.6, 0, 1) * 0.9)
pl = 48; board = xx // pl; bt = np.random.default_rng(80).uniform(-.15, .15, 64)[board % 64]
timber = mix(hexc('#2a1c12'), hexc('#5a3e28'), 0.5 + 0.4 * np.sin(yy / N * 2 * np.pi * 30 + fnoise(1.8, 81) * 3 + board))
timber = timber * (1 + bt)[..., None]
timber = mix(timber, hexc('#0e0a07'), ((xx % pl) < 3) * 0.9)
timber = mix(timber, hexc('#120d0a'), np.clip(fnoise(1.4, 82) * 0.6, 0, 0.8))
lead = (((xx + yy) % 64) < 3) | (((xx - yy) % 64) < 3)
vg = mix(hexc('#2c1450'), hexc('#7a4ac0'), 0.5 + 0.35 * fnoise(1.2, 90))
vg = mix(vg, hexc('#d8c0ff'), np.clip(fnoise(0.9, 91) - 1.3, 0, 1))
vg_e = vg * 0.8 * (1 - lead)[..., None]
vg = mix(vg, hexc('#14101a'), lead * 1.0)
lg = mix(hexc('#cfc2f5'), hexc('#f4efff'), 0.5 + 0.3 * fnoise(1.3, 92)); lg_e = lg
cloth = mix(hexc('#221c44'), hexc('#41367a'), 0.5 + 0.3 * fnoise(1.6, 26))
cloth *= (1 - 0.2 * (np.sin(xx / 2.0) > 0.6))[..., None]
cloth = mix(cloth, hexc('#f2b04a'), (R0.random((N, N)) > 0.9975) * 1.0)
cloth = mix(cloth, hexc('#c9a46a'), (np.abs(np.sin(yy / N * 2 * np.pi * 2)) > 0.985) * 0.9)
cloth = mix(cloth, hexc('#14100e'), np.clip(fnoise(1.5, 27) * 0.6, 0, 0.7))
lens = mix(hexc('#9a8cd8'), hexc('#dcd6ff'), 0.5 + 0.3 * fnoise(1.4, 1)); lens = mix(lens, hexc('#ffffff'), cracks(23, 0.03))
par = mix(hexc('#c9b48a'), hexc('#e8d9b5'), 0.6 + 0.3 * fnoise(1.0, 2))
ink = np.zeros((N, N)); cx = cy = N / 2; d0 = np.hypot(xx - cx, yy - cy)
for Rr in (200, 140, 70): ink = np.maximum(ink, np.abs(d0 - Rr) < 1.6)
for k in range(12):
    a = k * np.pi / 6; ink = np.maximum(ink, (np.abs((xx - cx) * np.sin(a) - (yy - cy) * np.cos(a)) < 0.9) & (d0 < 200) & (d0 > 70))
for (sx, sy) in np.random.default_rng(28).uniform(60, N - 60, (30, 2)):
    ink = np.maximum(ink, np.hypot(xx - sx, yy - sy) < np.random.default_rng(int(sx)).uniform(2.5, 6))
par = mix(par, hexc('#2a1e16'), ink * 0.85)
edge = np.minimum(np.minimum(xx, N - xx), np.minimum(yy, N - yy)) / N
burn = np.clip(1 - (edge * 9 + fnoise(1.6, 29) * 0.25), 0, 1); par = mix(par, hexc('#6b4a2f'), burn * 0.8)

def mat(name, base, rough, metal=0.0, emis=None, es=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    tx = nt.nodes.new("ShaderNodeTexImage"); tx.image = img(name + "_col", base)
    nt.links.new(tx.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emis is not None:
        e = nt.nodes.new("ShaderNodeTexImage"); e.image = img(name + "_em", emis)
        nt.links.new(e.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = es
    return m
M = dict(marble=mat("marble", marble, .7), marble_dark=mat("marble_dark", marble_dark, .85), floor=mat("floor", floor, .55),
         slate=mat("slate", slate, .8), skyiron=mat("skyiron", si, .45, .85), brass=mat("brass", brass, .38, 1.0),
         timber=mat("timber", timber, .85), violetglass=mat("violetglass", vg, .15, 0, vg_e, 1.6),
         lampglass=mat("lampglass", lg, .2, 0, lg_e, 4.0), cloth=mat("cloth", cloth, .95), parchment=mat("parchment", par, .9),
         lensglass=mat("lensglass", lens, .1, 0, lens * .5, .8))
# ---------------- mesh helpers ----------------
def obj(name, bm):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); scene.collection.objects.link(o); return o
def box_uv(me, s):
    for l in list(me.uv_layers): me.uv_layers.remove(l)
    uv = me.uv_layers.new(name="UVMap")
    for p in me.polygons:
        n = p.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            u, v = ((co.y, co.z), (co.x, co.z), (co.x, co.y))[ax]
            uv.data[li].uv = (u * s, v * s)
def fin(o, m, s=0.25, smooth=False, M4=None):
    if M4 is not None: o.data.transform(M4)
    o.data.materials.clear(); o.data.materials.append(M[m])
    for p in o.data.polygons: p.material_index = 0; p.use_smooth = smooth
    box_uv(o.data, s); CUR.append(o); return o
def box(x0, x1, y0, y1, z0, z1, n="b"):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=(x1 - x0, y1 - y0, z1 - z0), verts=bm.verts)
    bmesh.ops.translate(bm, vec=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), verts=bm.verts); return obj(n, bm)
def prism(poly, axis, a0, a1, off=(0, 0, 0), n="p"):
    bm = bmesh.new()
    def P(u, v, a):
        if axis == 'y': return (u + off[0], a, v + off[2])
        if axis == 'x': return (a, u + off[1], v + off[2])
        return (u + off[0], v + off[1], a)
    A = [bm.verts.new(P(u, v, a0)) for u, v in poly]; B = [bm.verts.new(P(u, v, a1)) for u, v in poly]
    bm.faces.new(A); bm.faces.new(B[::-1])
    for i in range(len(poly)):
        j = (i + 1) % len(poly); bm.faces.new((A[i], A[j], B[j], B[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return obj(n, bm)
def cyl(r0, z0, z1, seg=16, r1=None, cx=0, cy=0, n="c"):
    r1 = r0 if r1 is None else r1; bm = bmesh.new()
    ring = lambda r, z: [bm.verts.new((cx + r * math.cos(2 * math.pi * i / seg), cy + r * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)]
    A = ring(r0, z0); bm.faces.new(A[::-1])
    if r1 < 1e-4:
        tp = bm.verts.new((cx, cy, z1))
        for i in range(seg): bm.faces.new((A[i], A[(i + 1) % seg], tp))
    else:
        B = ring(r1, z1); bm.faces.new(B)
        for i in range(seg): j = (i + 1) % seg; bm.faces.new((A[i], A[j], B[j], B[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return obj(n, bm)
def tube(ri, ro, z0, z1, seg=28, ro1=None, n="t"):
    ro1 = ro if ro1 is None else ro1; bm = bmesh.new()
    ring = lambda r, z: [bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)]
    Ob, Ot, Ib, It = ring(ro, z0), ring(ro1, z1), ring(ri, z0), ring(ri, z1)
    for i in range(seg):
        j = (i + 1) % seg
        bm.faces.new((Ob[i], Ob[j], Ot[j], Ot[i])); bm.faces.new((Ib[j], Ib[i], It[i], It[j]))
        bm.faces.new((Ot[i], Ot[j], It[j], It[i])); bm.faces.new((Ob[j], Ob[i], Ib[i], Ib[j]))
    return obj(n, bm)
def sphere(r, c, u=12, v=8, zmin=None, zmax=None, n="s"):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r)
    dv = [x for x in bm.verts if (zmin is not None and x.co.z < zmin - 1e-4) or (zmax is not None and x.co.z > zmax + 1e-4)]
    if dv: bmesh.ops.delete(bm, geom=dv, context="VERTS")
    bmesh.ops.translate(bm, vec=c, verts=bm.verts); return obj(n, bm)
def torus(R, r, M4, seg=24, ring=6, n="tor"):
    bm = bmesh.new(); V = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        V.append([bm.verts.new(M4 @ Vector(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
                  for b in [2 * math.pi * j / ring for j in range(ring)]])
    for i in range(seg):
        for j in range(ring):
            i2, j2 = (i + 1) % seg, (j + 1) % ring; bm.faces.new((V[i][j], V[i2][j], V[i2][j2], V[i][j2]))
    return obj(n, bm)
def rod(p, q, r, seg=6, r1=None, n="r"):
    p, q = Vector(p), Vector(q); d = q - p
    o = cyl(r, 0, d.length, seg, r1, n=n); o.data.transform(Matrix.Translation(p) @ d.to_track_quat('Z', 'Y').to_matrix().to_4x4()); return o
def cut(o, c):
    m = o.modifiers.new("b", "BOOLEAN"); m.operation = 'DIFFERENCE'; m.object = c; m.solver = 'EXACT'
    bpy.context.view_layer.update()
    with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o]): bpy.ops.object.modifier_apply(modifier=m.name)
def drop(*cs):
    for c in cs: bpy.data.objects.remove(c, do_unlink=True)
def arch(w, z0, zs, rf=0.75, n=8):
    r = rf * w; c = r - w / 2
    pts = [(-w / 2, z0), (w / 2, z0)]
    pts += [(-c + r * math.cos(t), zs + r * math.sin(t)) for t in np.linspace(0, math.acos(c / r), n)]
    pts += [(c + r * math.cos(t), zs + r * math.sin(t)) for t in np.linspace(math.acos(-c / r), math.pi, n)][1:]
    return pts
def star(ro, ri, cz=0.0):
    return [((ro if k % 2 == 0 else ri) * math.cos(math.pi / 2 + k * math.pi / 5), cz + (ro if k % 2 == 0 else ri) * math.sin(math.pi / 2 + k * math.pi / 5)) for k in range(10)]
Rx = lambda d: Matrix.Rotation(math.radians(d), 4, 'X'); Ry = lambda d: Matrix.Rotation(math.radians(d), 4, 'Y'); Rz = lambda d: Matrix.Rotation(math.radians(d), 4, 'Z'); T = Matrix.Translation
def join(parts, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts: o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join(); o = bpy.context.view_layer.objects.active; o.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    me = o.data; bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005); bm.to_mesh(me); bm.free(); return o
def tris(o): o.data.calc_loop_triangles(); return len(o.data.loop_triangles)

# ================= HALL OF WATCHERS (9 wide x 11 deep, door +Y) =================
CUR = []
F, E = 0.3, 5.6; TP = math.tan(math.radians(50)); RG = E + 4.5 * TP
pent = [(-4.5, 0), (4.5, 0), (4.5, E), (0, RG), (-4.5, E)]
fg = prism(pent, 'y', 5.0, 5.5); bg = prism(pent, 'y', -5.5, -5.0)
sr = prism([(4.0, 0), (4.5, 0), (4.5, E), (4.0, E + .5 * TP)], 'y', -5.0, 5.0)
sl = prism([(-4.5, 0), (-4.0, 0), (-4.0, E + .5 * TP), (-4.5, E)], 'y', -5.0, 5.0)
av = prism(arch(2.5, 0.0, 2.6), 'y', 5.45, 5.68)
cd = prism(arch(1.6, 0.25, 2.6), 'y', 4.6, 6.2); cut(fg, cd); cut(av, cd); drop(cd)
WY = (-3.4, 0.0, 3.4)
for y in WY:
    for s in (1, -1):
        c = prism(arch(1.0, 1.5, 4.0), 'x', 3.7 * s, 4.8 * s, off=(0, y, 0)); cut(sr if s > 0 else sl, c); drop(c)
        fin(prism(arch(1.0, 1.5, 4.0), 'x', 4.22 * s, 4.28 * s, off=(0, y, 0)), "violetglass", .5)
        fin(box(4.18 * s - .04, 4.18 * s + .04 + .08 * (s > 0), y - .04, y + .04, 1.5, 4.75), "skyiron")
        fin(box(4.2 * s - .05, 4.2 * s + .05, y - .5, y + .5, 2.9, 2.98), "skyiron")
        fin(box(min(4.4 * s, 4.75 * s), max(4.4 * s, 4.75 * s), y - .66, y + .66, 1.36, 1.5), "marble_dark")
for ys, wall in ((1, fg), (-1, bg)):
    c = rod((0, 4.4 * ys, 7.5), (0, 6.2 * ys, 7.5), .75, 20); cut(wall, c); drop(c)
    fin(rod((0, 5.22 * ys, 7.5), (0, 5.28 * ys, 7.5), .76, 20), "violetglass", .5)
    fin(torus(.8, .08, T((0, 5.52 * ys, 7.5)) @ Rx(90), 24, 6), "brass", .5, True)
    for k in range(4):
        a = k * math.pi / 4; d = Vector((math.cos(a), 0, math.sin(a))) * .75
        fin(rod(Vector((0, 5.25 * ys, 7.5)) - d, Vector((0, 5.25 * ys, 7.5)) + d, .03, 4), "skyiron")
c = prism(arch(1.2, 1.6, 4.6), 'y', -6.2, -4.6); cut(bg, c); drop(c)
fin(prism(arch(1.2, 1.6, 4.6), 'y', -5.28, -5.22), "violetglass", .5)
fin(box(-.04, .04, -5.32, -5.18, 1.6, 5.45), "skyiron")
fin(fg, "marble"); fin(bg, "marble"); fin(sr, "marble"); fin(sl, "marble"); fin(av, "marble_dark")
# lower course band
for s in (1, -1):
    fin(box(min(4.5 * s, 4.6 * s), max(4.5 * s, 4.6 * s), -5.6, 5.6, 0, 1.0), "marble_dark")
    fin(box(min(1.25 * s, 4.6 * s), max(1.25 * s, 4.6 * s), 5.5, 5.6, 0, 1.0), "marble_dark")
fin(box(-4.6, 4.6, -5.6, -5.5, 0, 1.0), "marble_dark")
# slender buttresses
bp = [(4.45, 0), (5.3, 0), (5.3, 2.8), (4.95, 3.3), (4.95, 4.7), (4.45, 5.3)]
for y in (-5.25, -1.7, 1.7, 5.25):
    fin(prism(bp, 'y', y - .25, y + .25), "marble")
    fin(prism([(-x, z) for x, z in bp][::-1], 'y', y - .25, y + .25), "marble")
gp = [(x + 1.0, z) for x, z in bp]
for s in (1, -1):
    for ys in (1, -1):
        poly = gp if ys > 0 else [(-u, z) for u, z in gp][::-1]
        fin(prism(poly, 'x', 4.0 * s if s > 0 else -4.5, 4.5 if s > 0 else -4.0), "marble")
# roof
def slab(s):
    P = math.radians(50); nx, nz = math.sin(P) * s, math.cos(P); th = .28
    bm = bmesh.new()
    for y in (-5.95, 5.95):
        for (x, z) in ((5.1 * s, E - .6 * TP - .02), (0.0, RG - .02)):
            bm.verts.new((x, y, z)); bm.verts.new((x + nx * th, y, z + nz * th))
    bmesh.ops.convex_hull(bm, input=bm.verts[:]); return obj("slab", bm)
rs = [slab(1), slab(-1)]
oc = cyl(1.18, RG - 3, RG + 1.5, 24, cy=-2.0)
for o in rs: cut(o, oc); fin(o, "slate", .5)
drop(oc)
fin(prism([(-.38, RG - .12), (.38, RG - .12), (0, RG + .42)], 'y', -6.0, 6.0), "skyiron")
fin(tube(1.18, 1.42, RG - 2.0, RG + .7, 24), "marble", .5, M4=T((0, -2, 0)))
fin(tube(1.05, 1.58, RG + .62, RG + .8, 24), "marble_dark", .5, M4=T((0, -2, 0)))
fin(sphere(1.45, (0, -2, RG + .78), 20, 12, zmin=0, zmax=1.45 * .9), "skyiron", .5, True)
fin(cyl(1.45 * math.sqrt(1 - .81) + .02, RG + .78 + 1.45 * .9 - .02, RG + .78 + 1.45 * .9 + .04, 16, cy=-2), "violetglass", .5)
fin(torus(.66, .06, T((0, -2, RG + .78 + 1.45 * .9 + .03)), 20, 5), "brass", .5, True)
# armillary on ridge
ac = Vector((0, 4.2, RG + 1.6))
fin(cyl(.28, RG + .1, RG + .35, 8, r1=.14, cy=4.2), "skyiron"); fin(rod((0, 4.2, RG + .3), (0, 4.2, RG + .78), .07, 8), "skyiron")
fin(torus(.82, .05, T(ac) @ Rx(90), 32, 6), "brass", .5, True)
fin(torus(.82, .05, T(ac), 32, 6), "brass", .5, True)
fin(torus(.74, .045, T(ac) @ Rx(40), 32, 6), "brass", .5, True)
fin(torus(.66, .07, T(ac) @ Rx(40) @ Ry(24), 32, 4), "brass", .5, True)
ax = (Rx(40).to_3x3() @ Vector((0, 0, 1)))
fin(rod(ac - ax * 1.05, ac + ax * 1.05, .03, 6), "skyiron")
fin(sphere(.17, ac, 12, 8), "lampglass", .5, True)
fin(prism(star(.2, .08), 'y', -.03, .03, off=(0, 0, 0)), "brass", M4=T(ac + ax * 1.15))
# floor + door leaves
fin(box(-4.5, 4.5, -5.5, 5.5, 0, F), "floor")
fin(box(0, .8, -.04, .04, F, F + 2.9), "skyiron", M4=T((.8, 5.75, 0)) @ Rz(70))
fin(box(0, .8, -.04, .04, F, F + 2.9), "skyiron", M4=T((-.8, 5.75, 0)) @ Rz(110))
# interior: tie beams, hanging lamps, orrery, chart tables, benches
for y in (-3.9, 0.4, 4.2):
    fin(box(-4.05, 4.05, y - .12, y + .12, 5.25, 5.5), "skyiron")
    fin(rod((0, y, 5.26), (0, y, 3.85), .02, 4), "skyiron")
    fin(cyl(.22, 3.72, 3.9, 10, r1=.05, cy=y), "skyiron")
    fin(sphere(.2, (0, y, 3.55), 12, 8), "lampglass", .5, True)
    fin(cyl(.01, 3.24, 3.38, 8, r1=.08, cy=y), "brass")
oy = -2.0
fin(cyl(.7, 0, F + .15, 8, cy=oy), "marble_dark"); fin(cyl(.52, F + .15, F + .95, 8, cy=oy), "marble_dark"); fin(cyl(.62, F + .95, F + 1.05, 8, cy=oy), "marble")
fin(rod((0, oy, F + 1.05), (0, oy, F + 1.4), .045, 6), "brass")
oc_ = Vector((0, oy, F + 1.55)); fin(sphere(.16, oc_, 12, 8), "lampglass", .5, True)
for k, (Rr, tl, pr) in enumerate(((.42, 6, .05), (.66, -9, .07), (.9, 14, .09))):
    fin(torus(Rr, .016, T(oc_) @ Rx(tl), 28, 4), "brass", .5, True)
    a = 1.3 + k * 2.1; p = oc_ + (Rx(tl).to_3x3() @ Vector((math.cos(a) * Rr, math.sin(a) * Rr, 0)))
    fin(sphere(pr, p, 10, 6), "brass" if k != 1 else "violetglass", .5, True)
for s in (1, -1):
    x = 2.2 * s
    fin(box(x - .45, x + .45, .9, 2.9, F + .76, F + .84), "timber")
    for lx in (x - .38, x + .38):
        for ly in (.98, 2.82): fin(box(lx - .04, lx + .04, ly - .04, ly + .04, F, F + .76), "timber")
    fin(box(x - .4, x + .4, .95, 2.85, F + .84, F + .85), "parchment", .5)
    fin(rod((x - .3, 2.5, F + .89), (x + .3, 2.5, F + .89), .04, 8), "parchment")
    bx = 3.3 * s
    fin(box(bx - .22, bx + .22, -4.4, -.8, F + .42, F + .5), "timber")
    for ly in (-4.2, -1.0): fin(box(bx - .18, bx + .18, ly - .06, ly + .06, F, F + .42), "timber")
hall = join(CUR, "vey_hall")

# ================= STAR-HOUSE (round tower, door +Y) =================
CUR = []
low = tube(2.1, 2.5, 0, 3.4, 28); base = tube(2.3, 2.7, 0, .75, 28, ro1=2.56)
ceil = cyl(2.15, 3.2, 3.4, 28)
c = prism(arch(1.3, .25, 2.3), 'y', 1.5, 3.3)
for o in (low, base, ceil): cut(o, c)
drop(c)
c = rod((1.6, 0, 1.9), (3.0, 0, 1.9), .48, 16); cut(low, c); drop(c)
fin(low, "marble"); fin(base, "marble_dark"); fin(ceil, "timber")
fin(rod((2.28, 0, 1.9), (2.34, 0, 1.9), .49, 16), "violetglass", .5)
fin(torus(.53, .07, T((2.5, 0, 1.9)) @ Ry(90), 20, 6), "brass", .5, True)
for k in range(2):
    a = math.pi / 4 + k * math.pi / 2; d = Vector((0, math.cos(a), math.sin(a))) * .48
    fin(rod(Vector((2.32, 0, 1.9)) - d, Vector((2.32, 0, 1.9)) + d, .025, 4), "skyiron")
fin(cyl(2.15, 0, F, 28), "floor")
fin(tube(2.3, 2.8, 3.3, 3.48, 28), "skyiron")
fin(tube(2.3, 2.68, 3.4, 6.05, 28), "timber")
for k in range(12):
    a = k * 30
    if abs(a - 90) < 30: continue
    fin(box(2.45, 2.75, -.09, .09, 2.95, 3.32), "timber", M4=Rz(a))
for k in range(8): fin(box(2.66, 2.78, -.08, .08, 3.48, 5.98), "timber", M4=Rz(k * 45 + 22.5))
for a in (40, 220): fin(box(2.66, 2.76, -.2, .2, 4.2, 5.2), "skyiron", M4=Rz(a))
fin(tube(2.9, 3.32, 5.82, 5.96, 28), "skyiron")
fin(cyl(3.3, 5.9, 9.7, 28, r1=0), "slate", .5)
fin(rod((0, 0, 9.5), (0, 0, 10.25), .04, 6), "skyiron"); fin(sphere(.11, (0, 0, 9.7), 10, 6), "brass", .5, True)
fin(prism(star(.34, .14, 10.45), 'y', -.04, .04), "brass")
fin(box(0, 1.3, -.04, .04, F, F + 2.25), "timber", M4=T((.65, 2.55, 0)) @ Rz(80))
for z in (.8, 2.0): fin(box(0, 1.3, -.055, .055, F + z - .05, F + z + .05), "skyiron", M4=T((.65, 2.55, 0)) @ Rz(80))
fin(box(-.8, .8, 2.4, 3.05, 0, .38), "marble_dark")
# interior: bed, desk + scrolls, stool, telescope at the window
fin(box(-.95, .95, -1.8, -.9, F, F + .35), "timber"); fin(box(-.9, .9, -1.75, -.95, F + .35, F + .55), "cloth", .5)
fin(box(-.85, -.45, -1.7, -1.0, F + .55, F + .68), "parchment", .5); fin(box(-1.0, -.92, -1.8, -.9, F, F + .95), "timber")
fin(box(-1.75, -1.15, -.25, .85, F + .72, F + .78), "timber")
for lx in (-1.7, -1.2):
    for ly in (-.2, .8): fin(box(lx - .035, lx + .035, ly - .035, ly + .035, F, F + .72), "timber")
for k, x in enumerate((-1.6, -1.45, -1.3)): fin(rod((x, -.2, F + .82), (x, .25, F + .82), .035 + .008 * k, 8), "parchment")
fin(box(-1.65, -1.3, .32, .76, F + .78, F + .79), "parchment", .5); fin(sphere(.05, (-1.25, .7, F + .83), 8, 6), "skyiron", .5, True)
fin(cyl(.2, F, F + .45, 10, cx=-.8, cy=.3), "timber")
ap = Vector((1.15, .45, F + 1.05))
for k in range(3):
    a = k * 2.094 + .3; fin(rod(ap, (1.15 + .42 * math.cos(a), .45 + .42 * math.sin(a), F), .025, 5), "timber")
d = Vector((1, -.45, .4)).normalized()
fin(rod(ap - d * .45, ap + d * .7, .06, 10, r1=.085), "brass", .5)
fin(rod(ap + d * .7, ap + d * .72, .08, 10), "lensglass", .5)
fin(rod(ap - d * .45, ap - d * .58, .025, 6), "brass")
home = join(CUR, "vey_home")

# ================= YARD PROPS =================
props = {}
CUR = []  # prayer-flag pole
fin(cyl(.32, 0, .45, 8), "marble_dark"); fin(rod((0, 0, .4), (0, 0, 4.7), .06, 8), "skyiron")
fin(rod((-.8, 0, 3.95), (.8, 0, 3.95), .035, 6), "skyiron")
sw = [(.15, 3.92), (.15, 2.3), (.39, 2.6), (.63, 2.3), (.63, 3.92)]
fin(prism(sw, 'y', -.012, .012), "cloth", .5); fin(prism([(-u, v) for u, v in sw][::-1], 'y', -.012, .012), "cloth", .5)
fin(prism(star(.24, .1, 4.95), 'y', -.03, .03), "brass")
pts = [Vector((0, 0, 4.4)).lerp(Vector((3.0, 0, .15)), t) + Vector((0, 0, -.7 * 4 * t * (1 - t))) for t in np.linspace(0, 1, 9)]
for i in range(8): fin(rod(pts[i], pts[i + 1], .012, 4), "skyiron")
for i in range(1, 8): fin(prism([(-.12, 0), (.12, 0), (0, -.32)], 'y', -.01, .01, off=(pts[i].x, 0, pts[i].z)), "cloth", .5)
fin(rod((3.0, 0, -.1), (3.0, 0, .4), .03, 4), "skyiron")
props["flagpole"] = join(CUR, "vey_flagpole")
CUR = []  # telescope on tripod
ap = Vector((0, 0, 1.25))
for k in range(3):
    a = k * 2.094 + 1.57; fin(rod(ap, (.55 * math.cos(a), .55 * math.sin(a), 0), .03, 5), "timber")
fin(sphere(.07, ap, 8, 6), "brass", .5, True)
d = Vector((0, -1, .55)).normalized()
fin(rod(ap - d * .55, ap + d * .85, .07, 12, r1=.11), "brass", .5, True)
fin(rod(ap + d * .85, ap + d * .87, .1, 12), "lensglass", .5)
for f in (-.2, .3, .7): fin(torus(.1 + .02 * f, .018, T(ap + d * f) @ d.to_track_quat('Z', 'Y').to_matrix().to_4x4(), 14, 4), "skyiron", .5, True)
fin(rod(ap - d * .55, ap - d * .72, .028, 6), "brass")
props["telescope"] = join(CUR, "vey_telescope")
CUR = []  # crate of lenses
fin(box(-.4, .4, -.28, .28, 0, .06), "timber")
for (x0, x1, y0, y1) in ((-.4, .4, -.28, -.24), (-.4, .4, .24, .28), (-.4, -.36, -.28, .28), (.36, .4, -.28, .28)):
    fin(box(x0, x1, y0, y1, 0, .45), "timber")
for x in (-.36, .36):
    for z in (.12, .34): fin(box(x - .045, x + .045, -.29, .29, z - .04, z + .04), "skyiron")
for k, x in enumerate((-.24, -.08, .08, .24)):
    zc = .38 + .04 * (k % 2); fin(rod((x - .015, 0, zc), (x + .015, 0, zc), .14, 14), "lensglass", .5)
    fin(torus(.145, .015, T((x, 0, zc)) @ Ry(90), 14, 4), "brass", .5, True)
fin(box(.45, .95, -.2, .2, 0, .32), "timber", M4=Rz(-15))
fin(rod((-.6, -.05, .2), (-.66, .0, .19), .17, 14), "lensglass", .5, M4=None)
props["lenscrate"] = join(CUR, "vey_lenscrate")
CUR = []  # marble bench
for x in (-.65, .65): fin(box(x - .2, x + .2, -.2, .2, 0, .42), "marble_dark", .5)
fin(box(-.95, .95, -.26, .26, .42, .54), "marble", .5)
fin(box(-.95, .95, -.27, .27, .5, .54), "marble", .5)
props["bench"] = join(CUR, "vey_bench")
CUR = []  # star-lantern on post
fin(cyl(.26, 0, .32, 8), "marble_dark"); fin(box(-.06, .06, -.06, .06, .3, 2.75), "skyiron")
fin(box(-.04, .62, -.035, .035, 2.52, 2.6), "skyiron"); fin(rod((.5, 0, 2.52), (.5, 0, 2.4), .015, 4), "skyiron")
fin(cyl(.19, 2.2, 2.42, 4, r1=0, cx=.5), "skyiron"); fin(cyl(.17, 1.74, 1.8, 4, cx=.5), "skyiron")
for k in range(4):
    a = math.pi / 4 + k * math.pi / 2; px, py = .5 + .15 * math.cos(a), .15 * math.sin(a)
    fin(rod((px, py, 1.78), (px, py, 2.22), .012, 4), "skyiron")
fin(cyl(.12, 1.8, 2.2, 8, cx=.5), "lampglass", .5)
fin(prism(star(.16, .07, 2.95), 'y', -.025, .025), "brass")
props["lantern"] = join(CUR, "vey_lantern")

# ---------------- export ----------------
def export(o, path):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.export_scene.gltf(filepath=path, use_selection=True, export_apply=True, export_yup=True, export_image_format='JPEG')
allobs = {"vey-hall": hall, "vey-home": home, **{"vey-" + k: o for k, o in props.items()}}
for k, o in allobs.items():
    export(o, f"{OUT}/{k}.glb"); b = [o.matrix_world @ Vector(c) for c in o.bound_box]
    print("ASSET", k, "tris", tris(o), "size", round(max(v.x for v in b) - min(v.x for v in b), 2), round(max(v.y for v in b) - min(v.y for v in b), 2), round(max(v.z for v in b) - min(v.z for v in b), 2))

# ---------------- proof ----------------
scene.render.engine = "CYCLES"; scene.cycles.device = "CPU"; scene.cycles.samples = 24
scene.render.resolution_x, scene.render.resolution_y = 720, 500
w = bpy.data.worlds.new("w"); w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (.5, .42, .32, 1); w.node_tree.nodes["Background"].inputs[1].default_value = .7; scene.world = w
gpm = bpy.data.meshes.new("gp"); gpm.from_pydata([(-60, -60, .3), (60, -60, .3), (60, 60, .3), (-60, 60, .3)], [], [(0, 1, 2, 3)])
gpo = bpy.data.objects.new("gp", gpm); scene.collection.objects.link(gpo); gm = bpy.data.materials.new("g"); gm.use_nodes = True
gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.28, .3, .17, 1); gpm.materials.append(gm)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sun.data.energy = 4; sun.data.color = (1, .8, .55)
sun.rotation_euler = (math.radians(62), 0, math.radians(150)); scene.collection.objects.link(sun)
pl = bpy.data.objects.new("pl", bpy.data.lights.new("pl", "POINT")); pl.data.color = (.82, .8, 1); scene.collection.objects.link(pl)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); scene.collection.objects.link(cam); scene.camera = cam
def shoot(show, loc, tgt, fn, lens=28, light=None):
    for o in allobs.values(): o.hide_render = o not in show
    if light: pl.location, pl.data.energy = light[0], light[1]
    cam.location = loc; cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = lens
    scene.render.filepath = f"{PROOF}/{fn}.png"; bpy.ops.render.render(write_still=True)
shoot([hall], (13, 19, 5), (0, 0, 5), "a_hall", 26, ((0, 0, 4), 600))
shoot([hall], (0, 4.8, 1.8), (0, -4, 2.2), "b_hall_in", 14, ((0, 0, 4), 600))
shoot([home], (8, 10, 4.5), (0, 0, 4.2), "c_home", 30, ((0, 0, 2.5), 200))
shoot([home], (.2, 1.85, 1.7), (0, -1.2, .9), "d_home_in", 12, ((0, 0, 2.5), 200))
for i, o in enumerate(props.values()): o.location = (-5 + i * 2.5, 0, .3)
shoot(list(props.values()), (0, 9, 2.6), (0, 0, 1.2), "e_props", 30, ((0, 2, 3), 50))
