# art/relics/build.py: Ashen Close relic & gear set + display rack and relic table. One pass: build -> proof -> glb.
# blender -b --factory-startup --python-exit-code 1 --python art/relics/build.py [-- name ...]
import bpy, math, os, sys, json
from mathutils import Vector, Matrix
OUT = "/workspace/relics"; PROOF = "/tmp/relics"
os.makedirs(OUT, exist_ok=True); os.makedirs(PROOF, exist_ok=True)
only = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1,)

MATS = {
    "blade": dict(c="#c4c8cc", m=.9, r=.28), "brass": dict(c="#c08a3a", m=1, r=.35), "gold": dict(c="#e0b04a", m=1, r=.3),
    "iron": dict(c="#3c3936", m=.75, r=.55), "wood": dict(c="#3a2416", r=.8), "leather": dict(c="#4e2c1c", r=.75),
    "glow": dict(c="#f2b04a", e="#ffb347", es=6), "crystal": dict(c="#8a4cff", e="#9a5cff", es=4, r=.15),
    "glass": dict(c="#bcd8d4", r=.05, a=.35), "liquid": dict(c="#b0201c", e="#c02018", es=.8, r=.2),
    "cork": dict(c="#a77b4f", r=.9), "twine": dict(c="#b59c6c", r=.9), "paint": dict(c="#7a2e22", r=.7),
    "cloth": dict(c="#7a2e22", r=.9), "horn": dict(c="#ddd0b0", r=.5), "string": dict(c="#d8ccaa", r=.8),
    "paper": dict(c="#d9c9a0", r=.9), "wax": dict(c="#e8dcc0", r=.6),
}
OVR = {}
OBJS = []

def M(name):
    if name in bpy.data.materials: return bpy.data.materials[name]
    s = {**MATS[name], **OVR.get(name, {})}
    m = bpy.data.materials.new(name)
    try: m.use_nodes = True
    except Exception: pass
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(s["c"]); b.inputs["Metallic"].default_value = s.get("m", 0); b.inputs["Roughness"].default_value = s.get("r", .6)
    if s.get("e"):
        b.inputs["Emission Color"].default_value = lin(s["e"]); b.inputs["Emission Strength"].default_value = s["es"]
    if s.get("a", 1) < 1:
        b.inputs["Alpha"].default_value = s["a"]
        for k, v in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND")):
            try: setattr(m, k, v)
            except Exception: pass
    return m

def R(rot): return tuple(math.radians(a) for a in rot)
def fin(o, m, bevel=0):
    o.data.materials.clear(); o.data.materials.append(M(m))
    if bevel:
        bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        md = o.modifiers.new("b", "BEVEL"); md.width = bevel; md.segments = 1; md.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier="b")
    OBJS.append(o); return o
def box(m, loc, size, rot=(0, 0, 0), bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=R(rot)); o = bpy.context.active_object; o.scale = size; return fin(o, m, bevel)
def cyl(m, loc, r, h, n=12, rot=(0, 0, 0), r2=None, scale=(1, 1, 1)):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h, location=loc, rotation=R(rot))
    else: bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=r2, depth=h, location=loc, rotation=R(rot))
    o = bpy.context.active_object; o.scale = scale; return fin(o, m)
def sph(m, loc, r, seg=10, ring=6, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, radius=r, location=loc); o = bpy.context.active_object; o.scale = scale; return fin(o, m)
def ico(m, loc, r, sub=1, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=loc); o = bpy.context.active_object; o.scale = scale; return fin(o, m)
def tor(m, loc, Rr, r, rot=(0, 0, 0), maj=16, mn=6):
    bpy.ops.mesh.primitive_torus_add(major_segments=maj, minor_segments=mn, major_radius=Rr, minor_radius=r, location=loc, rotation=R(rot)); return fin(bpy.context.active_object, m)
def mk(m, verts, faces):
    me = bpy.data.meshes.new("m"); me.from_pydata([tuple(v) for v in verts], [], faces); me.update()
    o = bpy.data.objects.new("o", me); bpy.context.collection.objects.link(o); return fin(o, m)
def loft(m, rings, cap0=True, cap1=True, wrap=False):
    n = len(rings[0]); verts = [p for r in rings for p in r]; faces = []; L = len(rings)
    for i in range(L if wrap else L - 1):
        i2 = (i + 1) % L
        for j in range(n):
            faces.append((i * n + j, i * n + (j + 1) % n, i2 * n + (j + 1) % n, i2 * n + j))
    if cap0 and not wrap: faces.append(tuple(reversed(range(n))))
    if cap1 and not wrap: faces.append(tuple(range((L - 1) * n, L * n)))
    return mk(m, verts, faces)
def prism_yz(m, prof, x0, x1): return loft(m, [[(x0, y, z) for y, z in prof], [(x1, y, z) for y, z in prof]])
def prism_xz(m, prof, y0, y1): return loft(m, [[(x, y0, z) for x, z in prof], [(x, y1, z) for x, z in prof]])
def lathe(m, prof, n=8, rot=0):
    return loft(m, [[(r * math.cos(2 * math.pi * j / n + rot), r * math.sin(2 * math.pi * j / n + rot), z) for j in range(n)] for r, z in prof])

# ---------------------------------------------------------------- items
def sword():
    rings = []
    for z, w, f in [(0, .003, 0), (.04, .026, 0), (.12, .046, .2), (.2, .052, 1), (.45, .054, 1), (.7, .056, 1), (.78, .058, .4)]:
        t = .014 * min(1, w / .04 + .15); d = t * (1 - .75 * f)
        sec = [(-w, 0), (-.45 * w, t), (-.24 * w, t), (-.13 * w, d), (.13 * w, d), (.24 * w, t), (.45 * w, t), (w, 0),
               (.45 * w, -t), (.24 * w, -t), (.13 * w, -d), (-.13 * w, -d), (-.24 * w, -t), (-.45 * w, -t)]
        rings.append([(x, y, z) for x, y in sec])
    loft("blade", rings)
    box("brass", (0, 0, .79), (.13, .042, .04), bevel=.006)
    box("brass", (0, 0, .815), (.32, .06, .045), bevel=.01)
    for s in (-1, 1):
        sph("brass", (s * .165, 0, .83), .032)
        cyl("brass", (s * .165, 0, .78), .002, .06, n=8, r2=.022)
    for y in (-.031, .031): ico("glow", (0, y, .815), .018, sub=1, scale=(1, .6, 1))
    cyl("leather", (0, 0, .92), .02, .16, n=10)
    for z in (.87, .91, .95): tor("leather", (0, 0, z), .021, .0045, maj=12, mn=4)
    for z in (.842, .998): tor("brass", (0, 0, z), .023, .006, maj=12, mn=5)
    cyl("brass", (0, 0, 1.008), .046, .016, n=12)
    for k in range(6):
        a = k * math.pi / 3; cyl("brass", (math.cos(a) * .04, math.sin(a) * .04, 1.048), .005, .066, n=6)
    ico("glow", (0, 0, 1.048), .032, sub=2)
    cyl("brass", (0, 0, 1.093), .046, .026, n=12, r2=.014)
    tor("brass", (0, 0, 1.118), .015, .005, rot=(90, 0, 0), maj=12, mn=5)

def shield():
    O = [(-.3 + .06 * i, .87 + .035 * (1 - ((-.3 + .06 * i) / .3) ** 2)) for i in range(11)]
    O += [(.3, .87 - .31 * i / 4) for i in (1, 2, 3)]
    bez = lambda t: ((1 - t) ** 2 * .3 + 2 * (1 - t) * t * .3, (1 - t) ** 2 * .56 + 2 * (1 - t) * t * .16)
    O += [bez(i / 12) for i in range(13)]
    O += [(-bez(i / 12)[0], bez(i / 12)[1]) for i in range(11, -1, -1)]
    O += [(-.3, .87 - .31 * i / 4) for i in (3, 2, 1)]
    c = (0, .56)
    sc = lambda s, y: [(c[0] + (x - c[0]) * s, y, c[1] + (z - c[1]) * s) for x, z in O]
    loft("paint", [sc(.93, .012)] + [sc(s, -.018 - .04 * (1 - s * s)) for s in (.93, .8, .6, .4, .2, .04)])
    loft("iron", [sc(1.0, .022), sc(1.0, -.034), sc(.9, -.034), sc(.9, .022)], wrap=True)
    st = sc(.95, -.038)
    for i in range(0, len(O), 4): sph("iron", st[i], .015, seg=8, ring=5)
    box("gold", (0, -.062, .40), (.16, .02, .032), bevel=.005)
    box("gold", (0, -.064, .52), (.13, .018, .2), bevel=.006)
    box("glow", (0, -.069, .52), (.085, .016, .15))
    box("gold", (0, -.079, .52), (.014, .01, .15)); box("gold", (0, -.079, .52), (.085, .01, .014))
    cyl("gold", (0, -.064, .655), .1, .07, n=4, rot=(0, 0, 45), r2=.004, scale=(1, .25, 1))
    tor("gold", (0, -.062, .715), .026, .008, rot=(90, 0, 0), maj=12, mn=5)
    for s in (-1, 1):
        box("gold", (s * .115, -.06, .6), (.08, .01, .014), rot=(0, s * 35, 0))
        box("gold", (s * .12, -.06, .52), (.09, .01, .014))
        box("gold", (s * .115, -.06, .44), (.08, .01, .014), rot=(0, -s * 35, 0))
    box("leather", (0, .035, .52), (.045, .03, .32), bevel=.006)

def staff():
    rings = []; N = 12; Z = 1.48
    for i in range(33):
        z = Z * i / 32; Rr = .025 + .007 * (z / Z); tw = z * 7; ox = .006 * math.sin(z * 4); oy = .005 * math.cos(z * 3.1)
        ring = []
        for j in range(N):
            th = 2 * math.pi * j / N; r = Rr * (1 + .18 * math.cos(3 * th + tw)); ring.append((ox + r * math.cos(th), oy + r * math.sin(th), z))
        rings.append(ring)
    loft("wood", rings)
    cyl("iron", (0, 0, .035), .022, .07, n=10, r2=.031)
    cyl("leather", (0, 0, .95), .036, .18, n=12)
    for z in (.86, 1.04): tor("brass", (0, 0, z), .037, .007, maj=12, mn=5)
    cyl("iron", (0, 0, 1.46), .044, .06, n=12); tor("iron", (0, 0, 1.425), .038, .009, maj=12, mn=5)
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4; ca, sa = math.cos(a), math.sin(a); pts = []
        for i in range(13):
            t = i / 12; r = .035 + .045 * math.sin(math.pi * t * .85) - .012 * t; pts.append(Vector((r * ca, r * sa, 1.47 + .3 * t)))
        rr = []
        for i, p in enumerate(pts):
            T = (pts[min(i + 1, 12)] - pts[max(i - 1, 0)]).normalized(); n1 = Vector((-sa, ca, 0)); n2 = T.cross(n1).normalized(); s = .011 * (1 - .7 * i / 12)
            rr.append([p + n1 * s * u + n2 * s * v for u, v in ((1, 1), (-1, 1), (-1, -1), (1, -1))])
        loft("iron", rr)
    lathe("crystal", [(.006, 1.50), (.06, 1.585), (.052, 1.70), (.006, 1.80)], n=6)

def bow():
    cl = lambda u: Vector((.26 * u * u - 1.2 * max(0, abs(u) - .7) ** 2, 0, .7 + .7 * u))
    def limb(m, u0, u1, n, sc=1.0):
        rings = []
        for i in range(n + 1):
            u = u0 + (u1 - u0) * i / n; p = cl(u); T = (cl(u + .001) - cl(u - .001)).normalized(); N = Vector((T.z, 0, -T.x))
            a = (.034 - .018 * abs(u)) * sc / 2; b = (.042 - .02 * abs(u)) * sc / 2
            rings.append([p + N * a * math.cos(2 * math.pi * j / 8) + Vector((0, b * math.sin(2 * math.pi * j / 8), 0)) for j in range(8)])
        loft(m, rings)
    limb("wood", -.92, .92, 40)
    limb("horn", -1, -.86, 6, 1.25); limb("horn", .86, 1, 6, 1.25)
    limb("leather", -.15, .15, 8, 1.35)
    for u in (-.16, .16): tor("brass", tuple(cl(u)), .021, .005, maj=12, mn=5)
    for u in (-1, 1): sph("horn", tuple(cl(u)), .014, seg=8, ring=5)
    xs = cl(.97).x; z0 = cl(-.97).z; z1 = cl(.97).z
    cyl("string", (xs, 0, (z0 + z1) / 2), .0035, z1 - z0, n=6)

def daggers():
    def one(Mx):
        k = len(OBJS)
        sph("iron", (0, 0, .02), .019, seg=8, ring=6)
        cyl("cloth", (.065, 0, .02), .0135, .1, n=8, rot=(0, 90, 0))
        for x in (.03, .065, .1): tor("cloth", (x, 0, .02), .0148, .004, rot=(0, 90, 0), maj=10, mn=4)
        box("iron", (.118, 0, .02), (.018, .09, .024), bevel=.005)
        for s in (-1, 1): sph("iron", (.118, s * .048, .02), .014, seg=8, ring=5)
        rings = []; Zv = Vector((0, 0, 1))
        for i in range(17):
            s = i / 16; p = Vector((.125 + .275 * s, .05 * s * s, .02)); T = Vector((.275, .1 * s, 0)).normalized(); N = Vector((T.y, -T.x, 0))
            w = .026 * (1 - s) ** .6 + .0015; t = .0065 * (1 - .7 * s)
            rings.append([p + N * w, p + N * .2 * w + Zv * t, p - N * .4 * w + Zv * t * .8, p - N * .4 * w - Zv * t * .8, p + N * .2 * w - Zv * t])
        loft("blade", rings)
        for o in OBJS[k:]: o.matrix_world = Mx @ o.matrix_world
    one(Matrix.Translation((0, -.055, 0)) @ Matrix.Rotation(math.radians(6), 4, "Z") @ Matrix.Translation((-.2, 0, 0)))
    one(Matrix.Translation((0, .055, 0)) @ Matrix.Rotation(math.radians(186), 4, "Z") @ Matrix.Translation((-.2, 0, 0)))

def flask():
    lathe("glass", [(.05, 0), (.072, .015), (.085, .05), (.085, .09), (.068, .13), (.032, .16), (.028, .165), (.028, .195), (.036, .2), (.036, .212), (.026, .215)], n=8)
    lathe("liquid", [(.042, .006), (.062, .02), (.072, .05), (.072, .09), (.064, .115)], n=8)
    cyl("cork", (0, 0, .23), .024, .05, n=8, r2=.03)
    tor("twine", (0, 0, .175), .033, .005, maj=12, mn=4)
    cyl("twine", (.03, -.02, .145), .003, .06, n=4, rot=(10, 0, 0))
    box("paper", (.032, -.024, .11), (.03, .004, .04))

def tome():
    box("leather", (0, 0, .007), (.35, .26, .014), bevel=.004); box("leather", (0, 0, .073), (.35, .26, .014), bevel=.004)
    box("paper", (.006, 0, .04), (.335, .245, .052))
    cyl("leather", (-.172, 0, .04), .042, .26, n=10, rot=(90, 0, 0), scale=(.5, 1, 1))
    for y in (-.07, 0, .07): box("brass", (-.19, y, .04), (.012, .016, .07))
    for (x, y) in ((.155, .11), (.155, -.11), (-.145, .11), (-.145, -.11)):
        for z in (.007, .073): box("iron", (x, y, z), (.05, .05, .02), bevel=.004)
    box("leather", (.14, 0, .082), (.09, .045, .006)); box("leather", (.178, 0, .045), (.006, .045, .075))
    box("brass", (.183, 0, .062), (.02, .055, .032), bevel=.004)
    tor("brass", (-.005, 0, .082), .055, .008, maj=16, mn=5)
    cyl("brass", (-.005, 0, .087), .03, .016, n=4, r2=.003, rot=(0, 0, 45))
    ico("glow", (-.005, 0, .095), .009, sub=1)

def chest():
    box("wood", (0, 0, .25), (.76, .46, .42), bevel=.01)
    lid = [(.23 * math.cos(math.pi * i / 14), .46 + .17 * math.sin(math.pi * i / 14)) for i in range(15)]
    prism_yz("wood", lid, -.38, .38)
    band = [(.245 * math.cos(math.pi * i / 14), .455 + .182 * math.sin(math.pi * i / 14)) for i in range(15)]
    for x0 in (-.23, .17): prism_yz("iron", band, x0, x0 + .06)
    for x in (-.2, .2): box("iron", (x, 0, .25), (.06, .475, .43))
    for x0 in (-.395, .375): prism_yz("gold", band, x0, x0 + .02)
    for y in (-.235, .235): box("gold", (0, y, .45), (.78, .03, .035)); box("iron", (0, y, .06), (.78, .03, .04))
    for x in (-.385, .385): box("gold", (x, 0, .45), (.03, .48, .035))
    for x in (-.375, .375):
        for y in (-.225, .225): box("gold", (x, y, .25), (.05, .05, .42), bevel=.006); box("iron", (x, y, .02), (.08, .08, .04), bevel=.006)
    box("gold", (0, -.245, .41), (.11, .02, .13), bevel=.008)
    box("iron", (0, -.256, .4), (.016, .01, .045))
    box("gold", (0, -.244, .5), (.05, .022, .08), bevel=.006)
    for x in (-.4, .4): tor("iron", (x, 0, .32), .045, .009, rot=(0, 90, 0), maj=12, mn=5)
    for x in (-.2, .2):
        for z in (.12, .25, .38): sph("gold", (x, -.24, z), .011, seg=6, ring=4)

# ---------------------------------------------------------------- displays
HOOKS = [(-.85, 1.85), (-.85, 1.1), (-.4, 1.1), (.7, 1.1)]
def rack():
    for s in (-1, 1):
        x = s * 1.15
        box("wood", (x, 0, 1.0), (.11, .11, 2.0), bevel=.012)
        box("wood", (x, 0, .06), (.15, .7, .12), bevel=.015)
        for y in (-.2, .2): box("wood", (x, y * 1.2, .2), (.06, .06, .22), rot=(s * 0 + (45 if y < 0 else -45), 0, 0))
        cyl("iron", (x, 0, 2.065), .095, .13, n=4, rot=(0, 0, 45), r2=.006)
        cyl("iron", (x, 0, 2.17), .018, .12, n=6, r2=.001)
        for z in (1.85, 1.1, .2):
            box("iron", (x - s * .07, -.058, z), (.26, .012, .14), bevel=.003)
            for dx in (-.08, .08): cyl("iron", (x - s * .07 + dx, -.066, z), .013, .014, n=8, rot=(90, 0, 0))
    box("wood", (0, 0, 1.85), (2.4, .1, .1), bevel=.012)
    box("wood", (0, 0, 1.1), (2.3, .08, .08), bevel=.01)
    box("wood", (0, 0, .2), (2.3, .3, .06), bevel=.01)
    for s in (-1, 1):
        box("wood", (s * .98, .0, 1.72), (.32, .06, .06), rot=(0, s * 40, 0))
    t = [i / 10 for i in range(11)]
    arch = [(.35 * (1 - u ** 1.5), 1.9 + .42 * u) for u in t] + [(-.35 * (1 - u ** 1.5), 1.9 + .42 * u) for u in reversed(t[:-1])]
    prism_xz("wood", list(reversed(arch)), -.03, .03)
    tor("iron", (0, -.04, 2.06), .1, .014, rot=(90, 0, 0), maj=20, mn=6)
    box("iron", (0, -.04, 2.06), (.2, .014, .02)); box("iron", (0, -.04, 2.06), (.02, .014, .2))
    sph("gold", (0, -.05, 2.06), .025, seg=8, ring=5)
    for x, z in HOOKS:
        for dx in (-.045, .045):
            cyl("iron", (x + dx, -.1, z), .01, .12, n=6, rot=(90, 0, 0)); sph("iron", (x + dx, -.16, z + .01), .015, seg=6, ring=4)
    for x in (-.85, .85): tor("iron", (x, -.08, .235), .045, .01, maj=12, mn=4)

TOP = .86
def table():
    box("wood", (0, 0, .815), (1.8, .8, .07), bevel=.015)
    for x in (-.78, .78):
        for y in (-.32, .32): box("wood", (x, y, .39), (.11, .11, .78), bevel=.012)
        box("wood", (x, 0, .18), (.06, .6, .08), bevel=.008)
    box("wood", (0, 0, .18), (1.5, .06, .08), bevel=.008)
    for y in (-.36, .36): box("wood", (0, y, .73), (1.6, .04, .1), bevel=.006)
    box("cloth", (0, 0, .855), (1.84, .5, .012))
    for s in (-1, 1):
        box("cloth", (s * .914, 0, .71), (.012, .5, .3)); box("gold", (s * .916, 0, .555), (.018, .5, .03))
        for y in (-.2, -.1, 0, .1, .2): cyl("gold", (s * .916, y, .52), .002, .045, n=4, r2=.012)
        cyl("brass", (s * .78, .3, .858), .045, .016, n=12)
        cyl("wax", (s * .78, .3, .925), .028, .12 if s < 0 else .09, n=10) if True else None
        ico("glow", (s * .78, .3, (.995 if s < 0 else .98)), .011, sub=1, scale=(1, 1, 2))
    box("iron", (0, -.405, .7), (.24, .01, .06), bevel=.003)

ASSETS = {"sword": (sword, (.6, -1, .4)), "shield": (shield, (.5, -1, .35)), "staff": (staff, (.6, -1, .4)), "bow": (bow, (.6, -1, .3)),
          "daggers": (daggers, (.4, -.6, 1)), "flask": (flask, (.6, -1, .5)), "tome": (tome, (.5, -.7, 1)), "chest": (chest, (.7, -1, .6)),
          "rack": (rack, (.5, -1, .35)), "table": (table, (.5, -1, .6))}
stats = {}
for name, (fn, view) in ASSETS.items():
    if only and name not in only: continue
    bpy.ops.wm.read_factory_settings(use_empty=True); OBJS.clear()
    OVR = {"blade": dict(c="#26282c", m=.85, r=.35)} if name == "daggers" else ({"wood": dict(c="#2e1d14", r=.75)} if name == "staff" else {})
    fn()
    bpy.ops.object.select_all(action="DESELECT")
    for o in OBJS: o.select_set(True)
    bpy.context.view_layer.objects.active = OBJS[0]
    bpy.ops.object.join(); ob = bpy.context.active_object; ob.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.remove_doubles(threshold=.0002); bpy.ops.mesh.normals_make_consistent(inside=False)
    try: bpy.ops.uv.cube_project(cube_size=1.0)
    except Exception as e:
        print("cube_project failed", e); bpy.ops.uv.smart_project()
    bpy.ops.object.mode_set(mode="OBJECT")
    try: bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
    except Exception as e: print("smooth fail", e); bpy.ops.object.shade_flat()
    zmin = min(v.co.z for v in ob.data.vertices); ob.data.transform(Matrix.Translation((0, 0, -zmin)))
    vs = [v.co for v in ob.data.vertices]
    mn = Vector([min(v[i] for v in vs) for i in range(3)]); mx = Vector([max(v[i] for v in vs) for i in range(3)]); dims = mx - mn
    ob.data.calc_loop_triangles()
    stats[name] = dict(tris=len(ob.data.loop_triangles), w=round(dims.x, 3), d=round(dims.y, 3), h=round(dims.z, 3), mats=[s.material.name for s in ob.material_slots])
    bpy.ops.export_scene.gltf(filepath=f"{OUT}/{name}.glb", use_selection=True, export_apply=True, export_yup=True)
    # proof
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 12
    sc.render.resolution_x = sc.render.resolution_y = 360; sc.render.filepath = f"{PROOF}/{name}.png"
    w = bpy.data.worlds.new("w"); sc.world = w
    try:
        w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (.05, .045, .04, 1)
    except Exception: w.color = (.05, .045, .04)
    for rot, en in (((50, 0, 30), 3.5), ((60, 0, 200), 1.2)):
        L = bpy.data.objects.new("l", bpy.data.lights.new("l", "SUN")); L.data.energy = en; L.rotation_euler = R(rot); sc.collection.objects.link(L)
    cd = bpy.data.cameras.new("c"); cd.type = "ORTHO"; cd.ortho_scale = max(dims) * 1.25; cd.clip_end = 100
    cam = bpy.data.objects.new("cam", cd); sc.collection.objects.link(cam); sc.camera = cam
    ctr = (mn + mx) / 2; d = Vector(view).normalized(); cam.location = ctr + d * 20
    cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.render.render(write_still=True)
print("STATS", json.dumps(stats))
json.dump(stats, open(f"{PROOF}/stats.json", "w"), indent=1)
