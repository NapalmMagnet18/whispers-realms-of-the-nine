# ASHEN CATHEDRAL, Ashen Close. Blender frame: Z up, FRONT (door) faces -X, which exports as engine -X (no rotation, no forward).
# Nave x -17..17, y -7..7 (walls 1.2), wall tops 14, ridge 19.5. Tower front-left (engine north = Blender +Y). Origin = floor centre, feet z 0.
import bpy, bmesh, math, random, os, sys
from mathutils import Vector, Matrix
OUT = "/workspace/ashen"; os.makedirs(OUT, exist_ok=True)
R = random.Random(11)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; col = scene.collection
def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)
MATDEF = {"stone": (lin("8a8070"), .9, 0, None), "stone_dark": (lin("3a342e"), .95, 0, None), "floor": (lin("6e665a"), .85, 0, None),
          "roof_slate": (lin("2c3034"), .8, 0, None), "wood": (lin("4a3220"), .85, 0, None), "iron": (lin("5a3a2a"), .55, .8, None),
          "bronze": (lin("8a6a34"), .4, .9, None), "glass_glow": (lin("f2b04a"), .3, 0, (lin("f2a040"), 2.5)), "moss": (lin("3f5a3a"), 1, 0, None),
          "wax": (lin("e8d9b5"), .6, 0, None), "flame": (lin("ffc060"), .5, 0, (lin("ffb050"), 6.0)), "cloth": (lin("7a2e22"), .9, 0, None)}
M = {}
for n, (c, r, m, e) in MATDEF.items():
    mt = bpy.data.materials.new(n); mt.use_nodes = True; b = mt.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = m
    if e: b.inputs["Emission Color"].default_value = (*e[0], 1); b.inputs["Emission Strength"].default_value = e[1]
    M[n] = mt
PARTS = []
def mk(bm, mat, keep=True):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("p"); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("p", me); col.objects.link(o); me.materials.append(M[mat])
    if keep: PARTS.append(o)
    return o
XZ = lambda u, v, t: (u, t, v)
YZ = lambda u, v, t: (t, u, v)
def prism(pts, t0, t1, f, mat, keep=True):
    bm = bmesh.new(); a = [bm.verts.new(f(u, v, t0)) for u, v in pts]; b = [bm.verts.new(f(u, v, t1)) for u, v in pts]
    bm.faces.new(a); bm.faces.new(b[::-1]); n = len(pts)
    for i in range(n): j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    return mk(bm, mat, keep)
def box(x0, x1, y0, y1, z0, z1, mat, keep=True): return prism([(x0, z0), (x1, z0), (x1, z1), (x0, z1)], y0, y1, XZ, mat, keep)
def beam(p0, p1, w, h, mat, up=(0, 0, 1), keep=True):
    p0 = Vector(p0); p1 = Vector(p1); d = p1 - p0; L = d.length; d.normalize(); up = Vector(up)
    if abs(d.dot(up)) > 0.95: up = Vector((1, 0, 0)) if abs(d.x) < 0.9 else Vector((0, 1, 0))
    s = d.cross(up).normalized(); u = s.cross(d).normalized(); bm = bmesh.new(); vs = []
    for e in (0, L):
        for a, c in ((-1, -1), (1, -1), (1, 1), (-1, 1)): vs.append(bm.verts.new(p0 + d * e + s * (a * w / 2) + u * (c * h / 2)))
    for fc in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): bm.faces.new([vs[i] for i in fc])
    return mk(bm, mat, keep)
def cylp(p0, p1, r, seg, mat, r2=None, keep=True):
    p0 = Vector(p0); p1 = Vector(p1); d = p1 - p0; bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=(r if r2 is None else r2), depth=d.length)
    q = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4(), verts=bm.verts)
    return mk(bm, mat, keep)
def pyramid(cx, cy, z0, z1, hw, mat):
    bm = bmesh.new(); b = [bm.verts.new((cx + a * hw, cy + c * hw, z0)) for a, c in ((-1, -1), (1, -1), (1, 1), (-1, 1))]; t = bm.verts.new((cx, cy, z1))
    bm.faces.new(b[::-1]); [bm.faces.new((b[i], b[(i + 1) % 4], t)) for i in range(4)]; return mk(bm, mat)
def torus(c, RR, r, mat, seg=24, ms=6, axis="x"):
    bm = bmesh.new(); rings = []
    for i in range(seg):
        a = 2 * math.pi * i / seg; ring = []
        for j in range(ms):
            b = 2 * math.pi * j / ms; rr = RR + r * math.cos(b); p, q, n = rr * math.cos(a), rr * math.sin(a), r * math.sin(b)
            co = (c[0] + n, c[1] + p, c[2] + q) if axis == "x" else (c[0] + p, c[1] + q, c[2] + n)
            ring.append(bm.verts.new(co))
        rings.append(ring)
    for i in range(seg):
        for j in range(ms):
            bm.faces.new((rings[i][j], rings[(i + 1) % seg][j], rings[(i + 1) % seg][(j + 1) % ms], rings[i][(j + 1) % ms]))
    return mk(bm, mat)
def mound(cx, cy, rx, ry, h, mat, sub=2):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1)
    for v in bm.verts:
        k = 1 + 0.22 * (R.random() - 0.5); z = max(v.co.z, -0.05)
        v.co = Vector((cx + v.co.x * rx * k, cy + v.co.y * ry * k, max(0.0, z * h * k)))
    return mk(bm, mat)
def arch(w, spring, n=8, jamb=True, base=0.0):
    pts = [(-w / 2, base)] if jamb else []
    for i in range(n + 1): th = math.radians(180 - 60 * i / n); pts.append((w / 2 + w * math.cos(th), spring + w * math.sin(th)))
    for i in range(1, n + 1): th = math.radians(60 - 60 * i / n); pts.append((-w / 2 + w * math.cos(th), spring + w * math.sin(th)))
    if jamb: pts.append((w / 2, base))
    return pts
sh = lambda pts, du=0, dv=0: [(u + du, v + dv) for u, v in pts]
def band(O, I, t0, t1, f, mat):
    bm = bmesh.new(); n = len(O)
    of = [bm.verts.new(f(u, v, t0)) for u, v in O]; ob = [bm.verts.new(f(u, v, t1)) for u, v in O]
    if_ = [bm.verts.new(f(u, v, t0)) for u, v in I]; ib = [bm.verts.new(f(u, v, t1)) for u, v in I]
    for i in range(n - 1):
        bm.faces.new((of[i], of[i + 1], if_[i + 1], if_[i])); bm.faces.new((ob[i], ib[i], ib[i + 1], ob[i + 1]))
        bm.faces.new((of[i], ob[i], ob[i + 1], of[i + 1])); bm.faces.new((if_[i], if_[i + 1], ib[i + 1], ib[i]))
    for i in (0, n - 1): bm.faces.new((of[i], if_[i], ib[i], ob[i]))
    return mk(bm, mat)
def apply(o):
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    o.modifiers.clear(); old = o.data; o.data = me; bpy.data.meshes.remove(old)
def cut(o, cutters, self_=False):
    c = bpy.data.collections.new("cut")
    for k in cutters: c.objects.link(k)
    m = o.modifiers.new("b", "BOOLEAN"); m.operation = "DIFFERENCE"; m.solver = "EXACT"; m.operand_type = "COLLECTION"; m.collection = c
    m.material_mode = "TRANSFER"; m.use_self = self_
    apply(o)
    for k in cutters: bpy.data.objects.remove(k)
    bpy.data.collections.remove(c)
def bevel(o, w=0.045):
    m = o.modifiers.new("bv", "BEVEL"); m.width = w; m.segments = 1; m.limit_method = "ANGLE"; m.angle_limit = math.radians(40); apply(o)
def join(objs):
    with bpy.context.temp_override(active_object=objs[0], object=objs[0], selected_objects=objs, selected_editable_objects=objs):
        bpy.ops.object.join()
    for o in objs[1:]:
        if o in PARTS: PARTS.remove(o)
    return objs[0]
def bake_xf(o):
    o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)
def ground(o):
    bake_xf(o); mz = min(v.co.z for v in o.data.vertices); o.data.transform(Matrix.Translation((0, 0, -mz)))

H, RIDGE, L2, W2 = 14.0, 19.5, 17.0, 7.0
WX = [-17 + (k + 0.5) * 34 / 6 for k in range(6)]
WW, SILL, JAMB = 1.2, 3.2, 4.4
# ---------- floor + threshold
box(-17, 17, -7, 7, 0, 0.12, "floor"); box(-18.7, -16.9, -2.3, 2.3, 0, 0.07, "stone_dark")
# ---------- side walls with broken front halves
N_TOP = [(17, 14), (0.5, 14), (-0.6, 13.1), (-1.8, 13.5), (-3.0, 11.6), (-4.6, 12.2), (-5.9, 10.4), (-7.4, 10.9), (-9.6, 9.8), (-10.8, 10.3), (-12.6, 11.5), (-13.6, 11.1), (-15.0, 12.8), (-17, 13.4)]
S_TOP = [(17, 14), (1.2, 14), (0.2, 12.9), (-1.4, 13.3), (-2.6, 11.0), (-4.2, 11.8), (-6.3, 9.9), (-7.2, 10.5), (-9.0, 9.8), (-11.0, 10.6), (-12.2, 9.9), (-13.9, 11.9), (-15.4, 11.4), (-17, 13.0)]
GLASS = {1: [1, 0, 1, 1, 0, 1], -1: [0, 1, 1, 0, 1, 1]}
walls = []
for sgn, top in ((1, N_TOP), (-1, S_TOP)):
    y0, y1 = (5.8, 7.0) if sgn > 0 else (-7.0, -5.8)
    w = prism([(-17, 0), (17, 0)] + top, y0, y1, XZ, "stone"); walls.append(w)
    cutters = [prism(sh(arch(WW, JAMB), x, SILL), y0 - 0.3, y1 + 0.3, XZ, "stone_dark", keep=False) for x in WX]
    cut(w, cutters)
    ext = 7.0 if sgn > 0 else -7.0; yc = 6.4 * sgn
    for i, x in enumerate(WX):
        if GLASS[sgn][i]: prism(sh(arch(WW, JAMB), x, SILL), yc - 0.02, yc + 0.02, XZ, "glass_glow")
        else: prism([(x - .6, SILL), (x + .6, SILL), (x + .6, 4.9), (x + .25, 5.7), (x, 4.6), (x - .3, 5.3), (x - .6, 4.3)], yc - .02, yc + .02, XZ, "glass_glow")
        box(x - .05, x + .05, yc - .14, yc + .14, SILL, SILL + JAMB + 0.4, "stone")
        band(sh(arch(WW + .44, JAMB), x, SILL), sh(arch(WW, JAMB), x, SILL), ext - 0.02 * sgn, ext + 0.13 * sgn, XZ, "stone")
        box(x - .8, x + .8, min(ext, ext + .25 * sgn), max(ext, ext + .25 * sgn), SILL - .2, SILL, "stone")
    # moss on broken tops
    for a, b in zip(top[1:], top[2:]):
        if R.random() < 0.75: beam((a[0], yc, a[1] + .04), (b[0], yc, b[1] + .04), 1.32, .12, "moss")
    # plinth + cornice on the standing half
    box(-17, 17, min(ext, ext + .16 * sgn), max(ext, ext + .16 * sgn) + 0, 0, .7, "stone")
    box(0.6, 17.2, min(ext - .05 * sgn, ext + .2 * sgn), max(ext - .05 * sgn, ext + .2 * sgn), 13.7, 14.0, "stone")
    # wall shafts inside (vault responds)
    for x in (0, 17 / 3, 34 / 3):
        cylp((x, 5.72 * sgn, 0.12), (x, 5.72 * sgn, 9.0), .2, 8, "stone")
# ---------- facade (front, -X)
FAC = [(-7, 0), (7, 0), (7, 14), (0.6, 19.0), (-0.4, 18.2), (-1.2, 18.4), (-2.2, 16.6), (-3.4, 16.9), (-4.6, 15.2), (-5.6, 15.6), (-7, 14)]
fac = prism(FAC, -17, -15.8, YZ, "stone")
ROSE_Z, ROSE_R = 10.5, 2.6
courses = []
for z, hgt, pr in [(0, .7, .2)] + [(z, .14, .1) for z in (1.4, 2.8, 4.2, 5.6, 7.0, 8.4, 9.8, 11.2, 12.6)] + [(13.75, .28, .24)]:
    segs = [(-7.0, 7.0)]; zm = z + hgt / 2
    ex = 2.75 if zm < 7.4 else 0
    if abs(zm - ROSE_Z) < 3.1: ex = max(ex, math.sqrt(3.1 ** 2 - (zm - ROSE_Z) ** 2))
    if ex: segs = [(-7.0, -ex), (ex, 7.0)]
    for a, b in segs: prism([(a, z), (b, z), (b, z + hgt), (a, z + hgt)], -17 - pr, -16.95, YZ, "stone")
cut(fac, [prism(arch(3.0, 2.9, base=-0.3), -17.6, -15.2, YZ, "stone_dark", keep=False),
          cylp((-17.6, 0, ROSE_Z), (-15.2, 0, ROSE_Z), ROSE_R, 32, "stone_dark", keep=False)])
walls.append(fac)
for k, (wi, wo, pr) in enumerate(((3.0, 3.45, .12), (3.45, 3.95, .24), (3.95, 4.6, .36))):
    band(arch(wo, 2.9), arch(wi, 2.9), -17 - pr, -16.98, YZ, "stone" if k != 1 else "stone_dark")
for s in (1, -1):
    for yy, xx in ((1.72, -17.1), (2.2, -17.22)):
        cylp((xx, s * yy, 0.07), (xx, s * yy, 2.75), .1, 8, "stone"); box(xx - .13, xx + .13, s * yy - .13, s * yy + .13, 2.75, 2.92, "stone")
    box(-17.45, -17.1, s * 2.92 - .17, s * 2.92 + .17, 0, 7.0, "stone"); pyramid(-17.27, s * 2.92, 7.0, 8.3, .2, "stone")
    for z in (1.0, 4.0): box(-17.12, -16.9, s * 1.5 - .06, s * 1.5 + .06, z, z + .14, "iron")
    beam((-17.05, s * 1.62, 4.05), (-17.6, s * 1.75, 3.6), .07, .05, "iron")
# rose window: glass, tracery, mouldings
cylp((-16.45, 0, ROSE_Z), (-16.35, 0, ROSE_Z), ROSE_R + .05, 32, "glass_glow")
torus((-17.03, 0, ROSE_Z), ROSE_R + .2, .2, "stone", seg=32, ms=6)
torus((-16.75, 0, ROSE_Z), 1.25, .09, "stone", seg=24, ms=5)
cylp((-16.95, 0, ROSE_Z), (-16.5, 0, ROSE_Z), .42, 12, "stone")
for i in range(12):
    a = 2 * math.pi * i / 12; ca, sa = math.cos(a), math.sin(a)
    beam((-16.75, .38 * ca, ROSE_Z + .38 * sa), (-16.75, (ROSE_R + .05) * ca, ROSE_Z + (ROSE_R + .05) * sa), .13, .36, "stone", up=(1, 0, 0))
    b = a + math.pi / 12; torus((-16.75, 1.9 * math.cos(b), ROSE_Z + 1.9 * math.sin(b)), .4, .06, "stone", seg=14, ms=4)
# ---------- back wall (+X) with the great lancet behind the altar
back = prism([(-7, 0), (7, 0), (7, 14), (0, RIDGE), (-7, 14)], 15.8, 17, YZ, "stone")
cut(back, [prism(arch(2.2, 5.5, base=4.0 - 0.0)[0:1] and sh(arch(2.2, 5.5), 0, 4.0), 15.5, 17.3, YZ, "stone_dark", keep=False)])
walls.append(back)
prism(sh(arch(2.2, 5.5), 0, 4.0), 16.38, 16.42, YZ, "glass_glow")
for yy in (-.37, .37): box(16.25, 16.55, yy - .05, yy + .05, 4.0, 10.0, "stone")
band(sh(arch(2.7, 5.5), 0, 4.0), sh(arch(2.2, 5.5), 0, 4.0), 16.98, 17.14, YZ, "stone")
box(16.95, 17.16, -7.1, 7.1, 0, .7, "stone")
# ---------- buttresses + pinnacles
BUT = [(0, 0), (1.6, 0), (1.6, 5), (1.2, 6), (1.2, 10), (0.85, 11), (0.85, 13.6), (0, 15.0)]
def pinnacle(cx, cy, broken=False):
    top = 16.0 if not broken else 13.9 + R.random() * 0.8
    box(cx - .31, cx + .31, cy - .31, cy + .31, 13.2, top, "stone")
    if not broken: box(cx - .37, cx + .37, cy - .37, cy + .37, 15.9, 16.08, "stone"); pyramid(cx, cy, 16.08, 17.9, .33, "stone")
for x in [-17 + k * 34 / 6 for k in range(7)]:
    for sgn in (1, -1):
        if sgn > 0 and x < -16: continue  # the tower stands there
        prism(BUT, -.45, .45, (lambda xx, s: lambda u, v, t: (xx + t, s * (6.9 + u), v))(x, sgn), "stone")
        pinnacle(x, sgn * 7.35, broken=(x < -1 and R.random() < 0.5))
for s in (1, -1):
    prism(BUT, -.45, .45, (lambda yy: lambda u, v, t: (-16.9 - u, yy + t, v))(s * 4.5), "stone"); pinnacle(-17.35, s * 4.5)
    prism(BUT, -.45, .45, (lambda yy: lambda u, v, t: (16.9 + u, yy + t, v))(s * 4.5), "stone"); pinnacle(17.35, s * 4.5)
# ---------- bell tower (front-left = +Y), 6 x 6, to 26
TX0, TX1, TY0, TY1 = -20.9, -14.9, 5.85, 11.85; TX, TY = (TX0 + TX1) / 2, (TY0 + TY1) / 2
tw = box(TX0, TX1, TY0, TY1, 0, 24, "stone")
tc = [box(TX0 + .6, TX1 - .6, TY0 + .6, TY1 - .6, 19.0, 23.5, "stone_dark", keep=False),
      prism(sh(arch(2.4, 1.6), TY, 19.3), TX0 - .6, TX1 + .6, YZ, "stone_dark", keep=False),
      prism(sh(arch(2.4, 1.6), TX, 19.3), TY0 - .6, TY1 + .6, XZ, "stone_dark", keep=False)]
for z in (8.0, 13.8): tc.append(prism(sh(arch(.5, 1.3), TY, z), TX0 - .5, TX0 + .35, YZ, "stone_dark", keep=False)); tc.append(prism(sh(arch(.5, 1.3), TX, z), TY1 - .35, TY1 + .5, XZ, "stone_dark", keep=False))
cut(tw, tc); walls.append(tw)
for z in (TX0, ):
    pass
for z, hgt, pr in [(0, .9, .25), (7.0, .3, .18), (13.0, .3, .18), (18.7, .3, .2), (23.6, .4, .22)] + [(z, .12, .06) for z in (1.6, 2.8, 4.0, 5.2, 6.4, 8.2, 9.4, 10.6, 11.8, 14.2, 15.4, 16.6, 17.8)]:
    box(TX0 - pr, TX1 + pr, TY0 - pr, TY1 + pr, z, z + hgt, "stone")
for (cx, sx), (cy, sy) in [((TX0, -1), (TY0, -1)), ((TX0, -1), (TY1, 1)), ((TX1, 1), (TY1, 1)), ((TX1, 1), (TY0, -1))]:
    for i in range(40):
        z = i * .6
        if cx == TX1 and cy == TY0 and z < 14: continue
        lx, ly = (.7, .38) if i % 2 else (.38, .7)
        x0, x1 = sorted((cx - sx * lx, cx + sx * .05)); y0, y1 = sorted((cy - sy * ly, cy + sy * .05)); box(x0, x1, y0, y1, z + .03, z + .55, "stone")
par = box(TX0 - .1, TX1 + .1, TY0 - .1, TY1 + .1, 24, 25.4, "stone")
cut(par, [box(TX0 + .5, TX1 - .5, TY0 + .5, TY1 - .5, 23.9, 25.6, "stone_dark", keep=False)]); walls.append(par)
for (a0, a1, b0, b1) in [(TX0 - .1, TX0 + .5, None, None), (TX1 - .5, TX1 + .1, None, None)]:
    for yy in (TY - 1.6, TY, TY + 1.6): box(a0, a1, yy - .45, yy + .45, 25.4, 26.0, "stone")
for yy0, yy1 in [(TY0 - .1, TY0 + .5), (TY1 - .5, TY1 + .1)]:
    for xx in (TX - 1.6, TX, TX + 1.6): box(xx - .45, xx + .45, yy0, yy1, 25.4, 26.0, "stone")
for cx in (TX0 + .2, TX1 - .2):
    for cy in (TY0 + .2, TY1 - .2):
        box(cx - .38, cx + .38, cy - .38, cy + .38, 24, 26.6, "stone"); pyramid(cx, cy, 26.6, 28.2, .38, "stone")
# bell frame + cracked bronze bell
beam((TX, TY0 + .55, 22.7), (TX, TY1 - .55, 22.7), .32, .36, "wood")
for yy in (TY0 + .75, TY1 - .75): beam((TX, yy, 19.0), (TX, yy, 22.6), .26, .26, "wood")
PROF = [(.05, 1.62), (.42, 1.6), (.5, 1.42), (.53, 1.1), (.59, .72), (.72, .36), (.86, .12), (.9, 0.0), (.82, 0.0), (.67, .3), (.53, .68), (.46, 1.06), (.42, 1.42), (.05, 1.46)]
bm = bmesh.new(); SEG = 24; rings = []
for i in range(SEG):
    a = 2 * math.pi * i / SEG; rings.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, z in PROF])
for i in range(SEG):
    for j in range(len(PROF) - 1): bm.faces.new((rings[i][j], rings[(i + 1) % SEG][j], rings[(i + 1) % SEG][j + 1], rings[i][j + 1]))
ct = bm.verts.new((0, 0, 1.62)); cb = bm.verts.new((0, 0, 1.46))
for i in range(SEG): bm.faces.new((rings[(i + 1) % SEG][0], rings[i][0], ct)); bm.faces.new((rings[i][-1], rings[(i + 1) % SEG][-1], cb))
bell = mk(bm, "bronze")
cut(bell, [beam((-.95, .05, -.05), (-.62, .12, .85), .035, .5, "stone_dark", up=(1, 0, 0), keep=False),
           box(-.98, -.7, -.32, -.12, -.1, .16, "stone_dark", keep=False)])
cyl_c = cylp((0, 0, 1.6), (0, 0, 1.95), .14, 8, "iron"); clap = cylp((0, 0, .25), (0, 0, 1.5), .05, 6, "iron"); bob = cylp((0, 0, .22), (0, 0, .45), .13, 8, "iron", r2=.08)
bellj = join([bell, cyl_c, clap, bob])
bellj.matrix_world = Matrix.Translation((TX, TY, 20.75)) @ Matrix.Rotation(math.radians(8), 4, "Y"); bake_xf(bellj)
# ---------- columns, arcades, vault ribs
CX = [-34 / 3, -17 / 3, 0, 17 / 3, 34 / 3]; CY = 3.6
BROKEN = {(-34 / 3, 1): 3.6, (-34 / 3, -1): 5.8, (-17 / 3, 1): 7.4, (-17 / 3, -1): 4.6}
for x in CX:
    for s in (1, -1):
        y = s * CY; hb = BROKEN.get((x, s)); top = 8.2 if hb is None else hb + .9
        ps = [cylp((x, y, 0.1), (x, y, .4), .78, 8, "stone"), cylp((x, y, .4), (x, y, .62), .6, 12, "stone", r2=.5), cylp((x, y, .6), (x, y, top), .42, 12, "stone")]
        for dx, dy in ((.44, 0), (-.44, 0), (0, .44), (0, -.44)): ps.append(cylp((x + dx, y + dy, .6), (x + dx, y + dy, top - R.random() * (0 if hb is None else .8)), .15, 8, "stone"))
        if hb is None: ps += [cylp((x, y, 8.2), (x, y, 8.72), .5, 12, "stone", r2=.74), cylp((x, y, 8.7), (x, y, 9.0), .84, 8, "stone")]
        c = join(ps)
        if hb is not None:
            a = R.random() * 6.28; dx, dy = math.cos(a), math.sin(a)
            cut(c, [beam((x - 1.6 * dx, y - 1.6 * dy, hb + 2.0 - .45), (x + 1.6 * dx, y + 1.6 * dy, hb + 2.0 + .45), 3.2, 4.0, "stone_dark", keep=False)], self_=True)
            fx = x + .9 * (1 if R.random() < .5 else -1); fy = s * (CY + 1.1)
            cylp((fx - .7, fy, .55), (fx + .7, fy + .2 * s, .5), .45, 12, "stone")
SPR = 9.0
for s in (1, -1):
    y = s * CY
    for a, b in ((0, 17 / 3), (17 / 3, 34 / 3), (34 / 3, 15.8)):
        a2 = a + .6; b2 = b - (0 if b == 15.8 else .6); m = (a2 + b2) / 2; wi = b2 - a2
        band(sh(arch(wi + .7, SPR, jamb=False), m), sh(arch(wi, SPR, jamb=False), m), y - .28, y + .28, XZ, "stone")
    wi = 17 / 3 - 1.2; m = -17 / 6; O = sh(arch(wi + .7, SPR, jamb=False), m); I = sh(arch(wi, SPR, jamb=False), m)
    k = int(len(O) * 0.62); band(O[k:], I[k:], y - .28, y + .28, XZ, "stone")
for x in (0, 17 / 3, 34 / 3):
    band(arch(6.0 + .7, SPR, jamb=False), arch(6.0, SPR, jamb=False), x - .22, x + .22, YZ, "stone")
    for s in (1, -1): band(sh(arch(1.9, SPR, jamb=False), s * 5.0), sh(arch(1.5, SPR, jamb=False), s * 5.0), x - .2, x + .2, YZ, "stone")
beam((0, 0, 14.6), (15.8, 0, 14.6), .3, .3, "stone")
# ---------- roof: slate over the back third, rafters and purlins over the broken middle
LS = math.hypot(7.5, 5.7)
def slope(sgn):
    E = Vector((0, 7.5 * sgn, 13.85)); d = Vector((0, -7.5 * sgn, 5.7)) / LS; n = Vector((0, 5.7 * sgn, 7.5)) / LS
    return lambda u, v, t: tuple(E + Vector((u, 0, 0)) + d * v + n * t), (lambda u, v, t: tuple(E + Vector((u, 0, 0)) + d * v + n * t))
for sgn, jag in ((1, [(6.3, 1), (5.6, .82), (6.9, .66), (5.2, .48), (6.1, .3), (4.9, .12), (5.5, -0.06)]), (-1, [(5.9, 1), (6.6, .78), (5.4, .6), (6.4, .41), (5.0, .22), (5.8, -0.06)])):
    f = slope(sgn)[0]
    prism([(17.3, -.6), (17.3, LS)] + [(x, k * LS) for x, k in jag], 0, .28, f, "roof_slate")
    for x in [-2.4 + i * .9 for i in range(10)]:
        fr = 1.0 if x > 4.5 else R.choice([1, .9, .62, .4, .25, 0])
        if fr: beam(f(x, -.3, -.14), f(x, fr * LS - .2, -.14), .16, .24, "wood", up=(0, 5.7 * sgn, 7.5))
    for k, x0 in ((.35, -1.2 if sgn > 0 else .4), (.7, 1.6 if sgn > 0 else -.3)):
        beam(f(x0, k * LS, -.36), f(17, k * LS, -.36), .22, .22, "wood", up=(0, 5.7 * sgn, 7.5))
beam((-1.6, 0, 19.2), (16.2, 0, 19.2), .3, .34, "wood")
beam((5.6, 0, 19.75), (17.3, 0, 19.75), .42, .3, "stone_dark")
# ---------- rubble heaps (front half), kept off the central aisle
HEAPS = [(-13.0, 3.9, 2.4, 1.6, 1.4), (-11.8, -4.1, 2.2, 1.5, 1.1), (-7.4, -3.9, 2.6, 1.6, 1.5), (-3.6, 4.2, 2.2, 1.4, 1.0), (-15.2, -4.6, 1.2, 1.0, .7),
         (-8.5, 9.6, 2.0, 1.2, .9), (-4.0, -9.4, 1.8, 1.0, .8), (-13.8, -8.9, 1.3, .9, .6)]
for cx, cy, rx, ry, h in HEAPS:
    mound(cx, cy, rx, ry, h, "stone_dark")
    for i in range(11):
        a = R.random() * 6.28; rr = R.random() ** .7; px = cx + math.cos(a) * rx * rr; py = cy + math.sin(a) * ry * rr
        if abs(py) < 1.9: py = 1.9 * (1 if py >= 0 else -1)
        pz = h * max(0, 1 - rr * rr) * .8; L_ = .4 + R.random() * .7; b = R.random() * 6.28; tl = (R.random() - .5) * .9
        dvec = Vector((math.cos(b), math.sin(b), tl)).normalized() * L_
        beam((px - dvec.x / 2, py - dvec.y / 2, pz + .15 - dvec.z / 2), (px + dvec.x / 2, py + dvec.y / 2, pz + .15 + dvec.z / 2), .3 + R.random() * .35, .25 + R.random() * .3, "stone")
    for i in range(2):
        a = R.random() * 6.28; mound(cx + math.cos(a) * rx * .45, cy + math.sin(a) * ry * .45, rx * .35, ry * .35, h * .45 + .25, "moss", sub=1)
for p0, p1 in (((-12.4, 2.2, .3), (-9.2, 5.3, 1.5)), ((-8.6, -2.1, 1.3), (-5.2, -5.3, .2)), ((-4.8, 2.4, .9), (-1.5, 5.4, .25))):
    beam(p0, p1, .18, .26, "wood")
# a fallen rib arc lying across the south heap
O = sh(arch(5.2, 0, jamb=False), 0); I = sh(arch(4.6, 0, jamb=False), 0)
rib = band(O[3:12], I[3:12], -.2, .2, XZ, "stone"); rib.matrix_world = Matrix.Translation((-10.0, -4.2, -1.9)) @ Matrix.Rotation(math.radians(70), 4, "X") @ Matrix.Rotation(math.radians(15), 4, "Z"); ground(rib)
# ---------- pews
def pew(x, y, state):
    Lp = 1.45 if state != "broken" else 1.0
    ps = [box(-.22, .22, -Lp / 2, Lp / 2, .42, .48, "wood"), box(-.27, -.21, -Lp / 2, Lp / 2, .48, 1.0 if state != "broken" else .7, "wood"),
          box(-.05, .05, -Lp / 2, Lp / 2, .12, .2, "wood"), box(-.3, .3, Lp / 2 - .04, Lp / 2 + .02, 0, .98, "wood")]
    if state != "broken": ps.append(box(-.3, .3, -Lp / 2 - .02, -Lp / 2 + .04, 0, .98, "wood"))
    o = join(ps); yaw = math.radians((R.random() - .5) * 8)
    if state == "toppled": o.matrix_world = Matrix.Translation((x, y, 0)) @ Matrix.Rotation(yaw * 4, 4, "Z") @ Matrix.Rotation(math.radians(-82), 4, "Y"); ground(o)
    else: o.matrix_world = Matrix.Translation((x, y + (.2 if state == "broken" else 0) * (1 if y > 0 else -1), 0.12)) @ Matrix.Rotation(yaw, 4, "Z"); bake_xf(o)
for i in range(14):
    x = -9.5 + i * 1.5
    for s in (1, -1):
        r = R.random()
        if x < -3: st = None if r < .5 else ("toppled" if r < .8 else "broken")
        else: st = "ok" if r < .62 else ("broken" if r < .85 else "toppled")
        if st: pew(x, s * 2.05, st)
# ---------- altar dais, altar, cloth, candles, iron stands
for x0, hw, z in ((11.76, 4.5, .3), (12.04, 4.2, .48), (12.32, 3.9, .66)): box(x0, 15.8, -hw, hw, 0, z, "stone")
box(13.9, 15.0, -1.4, 1.4, .66, 1.6, "stone_dark"); box(13.75, 15.15, -1.6, 1.6, 1.6, 1.78, "stone")
box(13.72, 15.18, -.45, .45, 1.78, 1.8, "cloth"); prism([(-.45, 1.8), (.45, 1.8), (.45, 1.0), (.2, 1.12), (0, .95), (-.25, 1.1), (-.45, .98)], 13.7, 13.74, YZ, "cloth")
def candle(x, y, z, h, r=.05):
    cylp((x, y, z), (x, y, z + h), r, 8, "wax"); cylp((x, y, z + h + .015), (x, y, z + h + .13), .03, 6, "flame", r2=0)
for y, h in ((-1.4, .22), (-1.15, .38), (-.82, .18), (.75, .3), (1.02, .42), (1.3, .2), (1.48, .28)): candle(14.75 + R.random() * .2, y, 1.78, h)
for s in (1, -1):
    sy = s * 2.6; cylp((13.1, sy, .66), (13.1, sy, .74), .26, 8, "iron"); cylp((13.1, sy, .74), (13.1, sy, 1.92), .035, 6, "iron"); cylp((13.1, sy, 1.92), (13.1, sy, 1.97), .22, 8, "iron")
    for a in (0, 2.1, 4.2): candle(13.1 + .13 * math.cos(a), sy + .13 * math.sin(a), 1.97, .2 + R.random() * .12, .04)
    for i in range(4): candle(11.95 + R.random() * .35, s * (2.6 + R.random() * 1.0), .3 if R.random() < .5 else .48, .08 + R.random() * .2, .04)
# ---------- the broken iron gate leaf, lying beside the door
gp = [beam((0, 0, 0), (0, 0, 3.4), .09, .09, "iron"), beam((1.5, 0, 0), (1.5, 0, 2.5), .09, .09, "iron"), beam((0, 0, .15), (1.5, 0, .15), .08, .08, "iron"),
      beam((0, 0, 1.7), (1.5, 0, 1.7), .08, .08, "iron"), beam((0, 0, 3.3), (1.0, 0, 3.3), .08, .08, "iron")]
for i, bx in enumerate((.25, .5, .75, 1.0, 1.25)):
    top = 3.6 if bx < 1.1 else 2.4
    if i == 3: gp += [beam((bx, 0, 0), (bx, 0, 1.9), .045, .045, "iron"), beam((bx, 0, 1.9), (bx + .35, .1, 3.2), .045, .045, "iron")]
    else: gp.append(beam((bx, 0, 0), (bx, 0, top), .045, .045, "iron"))
    if top > 3: gp.append(cylp((bx, 0, top), (bx, 0, top + .22), .06, 4, "iron", r2=0))
gate = join(gp); gate.matrix_world = Matrix.Translation((-21.2, -5.8, 0)) @ Matrix.Rotation(math.radians(28), 4, "Z") @ Matrix.Rotation(math.radians(-84), 4, "X"); ground(gate)
# moss at the wall feet
for i in range(10):
    s = R.choice((1, -1)); x = R.uniform(-15, 15); mound(x, s * 7.25, R.uniform(.6, 1.4), .45, R.uniform(.25, .5), "moss", sub=1)
# ---------- finish: bevel the stone shells, join, UV in metres, shade, export
for w in walls: bevel(w)
for o in PARTS: bake_xf(o)
cat = join(list(PARTS)); cat.name = "AshenCathedral"; me = cat.data
bm = bmesh.new(); bm.from_mesh(me); uv = bm.loops.layers.uv.verify()
for f in bm.faces:
    n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
    for l in f.loops:
        c = l.vert.co; l[uv].uv = (c.y, c.z) if ax == 0 else ((c.x, c.z) if ax == 1 else (c.x, c.y))
bm.to_mesh(me); bm.free()
me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(38))
tris = sum(len(p.vertices) - 2 for p in me.polygons)
print("TRIS", tris, "MATS", [m.name for m in me.materials])
if tris > 70000:
    d = cat.modifiers.new("dec", "DECIMATE"); d.ratio = 62000 / tris; apply(cat); tris = sum(len(p.vertices) - 2 for p in cat.data.polygons); print("DECIMATED", tris)
zs = [v.co.z for v in cat.data.vertices]; xs = [v.co.x for v in cat.data.vertices]; ys = [v.co.y for v in cat.data.vertices]
print("BOUNDS", min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))
for o in list(scene.objects):
    o.select_set(o == cat)
bpy.ops.export_scene.gltf(filepath=f"{OUT}/ashen-cathedral.glb", export_format="GLB", use_selection=True, export_apply=True)
# ---------- proof
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.01)); g = bpy.context.active_object
gm = bpy.data.materials.new("dirt"); gm.use_nodes = True; gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*lin("4a3e2c"), 1); g.data.materials.append(gm)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); col.objects.link(sun); sun.data.energy = 3.5; sun.rotation_euler = (math.radians(55), 0, math.radians(-120))
sun.data.color = (1, .85, .65)
for loc, e in (((13, 0, 2.6), 900), ((0, 0, 5.5), 1600), ((TX, TY, 21.5), 150)):
    L_ = bpy.data.objects.new("pl", bpy.data.lights.new("pl", "POINT")); col.objects.link(L_); L_.location = loc; L_.data.energy = e; L_.data.color = (1, .7, .4)
wd = bpy.data.worlds.new("w"); scene.world = wd; wd.use_nodes = True; wd.node_tree.nodes["Background"].inputs[0].default_value = (.32, .28, .26, 1); wd.node_tree.nodes["Background"].inputs[1].default_value = .7
scene.render.engine = "CYCLES"; scene.cycles.device = "CPU"; scene.cycles.samples = 24; scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 640, 440
def cam(name, loc, tgt, lens=26):
    c = bpy.data.cameras.new(name); c.lens = lens; o = bpy.data.objects.new(name, c); col.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); return o
views = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["a", "b", "c"]
CAMS = {"a": ((-48, -26, 9), (-4, 0, 10), 24), "b": ((36, 38, 42), (0, 0, 6), 22), "c": ((-15, -0.5, 1.7), (14, 0, 4.5), 20), "d": ((-60, 0, 5), (0, 0, 9), 30)}
for v in views:
    p, t, lens = CAMS[v]; scene.camera = cam(v, p, t, lens); scene.render.filepath = f"/tmp/ashen/{v}.png"; bpy.ops.render.render(write_still=True)
