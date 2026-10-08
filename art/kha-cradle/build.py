# Emberstone Cradle: forge-hall, clan home, yard props. Door side = Blender +Y (exports glTF -Z).
import bpy, bmesh, math, random, sys
from mathutils import Vector
TEX = "/workspace/kha/tex/"; OUT = "/workspace/kha/"
R = math.radians
def lin(h):
    c = [int(h[i:i+2], 16)/255 for i in (1, 3, 5)]
    return tuple(((x+0.055)/1.055)**2.4 if x > 0.04045 else x/12.92 for x in c)
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
def link(o): bpy.context.scene.collection.objects.link(o)
def mat(name, tex=None, color="#ffffff", rough=0.85, metal=0.0, emit=None, es=1.0, scale=2.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*lin(color), 1)
    b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if tex:
        n = m.node_tree.nodes.new("ShaderNodeTexImage"); n.image = bpy.data.images.load(TEX+tex)
        m.node_tree.links.new(n.outputs["Color"], b.inputs["Base Color"])
    if emit:
        b.inputs["Emission Color"].default_value = (*lin(emit), 1); b.inputs["Emission Strength"].default_value = es
    m["uvs"] = scale
    return m
def mobj(name, bm, m):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); link(o); me.materials.append(m); return o
def box(name, size, loc, m, rot=(0, 0, 0), taper=0.0, tz=None):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]; v.co.y *= size[1]; v.co.z *= size[2]
        if v.co.z > 0 and taper:
            tx, ty = (taper, taper) if tz is None else tz
            v.co.x -= math.copysign(tx, v.co.x); v.co.y -= math.copysign(ty, v.co.y)
    o = mobj(name, bm, m); o.location = loc; o.rotation_euler = [R(a) for a in rot]; return o
def cyl(name, r, d, loc, m, rot=(0, 0, 0), seg=16, r2=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d)
    o = mobj(name, bm, m); o.location = loc; o.rotation_euler = [R(a) for a in rot]; return o
def rock(name, r, sc, loc, m, seed, sub=1, flat=True):
    random.seed(seed); bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    for v in bm.verts:
        v.co *= 1 + random.uniform(-0.18, 0.18); v.co.x *= sc[0]; v.co.y *= sc[1]; v.co.z *= sc[2]
        if flat: v.co.z = max(v.co.z, 0)
    o = mobj(name, bm, m); o.location = loc; return o
def prism(name, pts, axis, t0, t1, m):
    bm = bmesh.new()
    P = lambda p, t: {'x': (t, p[0], p[1]), 'y': (p[0], t, p[1]), 'z': (p[0], p[1], t)}[axis]
    v0 = [bm.verts.new(P(p, t0)) for p in pts]; v1 = [bm.verts.new(P(p, t1)) for p in pts]
    bm.faces.new(v0); bm.faces.new(v1[::-1]); n = len(pts)
    for i in range(n):
        j = (i+1) % n; bm.faces.new((v0[i], v0[j], v1[j], v1[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mobj(name, bm, m)
def arch(w, h, z0=0, x0=0, seg=12):
    r = w/2; pts = [(x0-r, z0), (x0+r, z0)]
    for i in range(seg+1):
        a = math.pi*i/seg; pts.append((x0+r*math.cos(a), z0+h+r*math.sin(a)))
    return pts
def cut(o, c):
    md = o.modifiers.new("b", "BOOLEAN"); md.operation = "DIFFERENCE"; md.solver = "EXACT"; md.object = c
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=md.name)
def chain(name, x, y, ztop, n, m):
    out = []
    for i in range(n):
        bm = bmesh.new()
        o = None
        bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.018, major_segments=8, minor_segments=4,
                                         location=(x, y, ztop-0.1*i), rotation=(R(90), 0, R(90*(i % 2))))
        o = bpy.context.active_object; o.name = f"{name}{i}"; o.data.materials.append(m); out.append(o); bm.free()
    return out
def finish(objs):
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for o in objs:
        s = o.active_material["uvs"]; me = o.data; bm = bmesh.new(); bm.from_mesh(me)
        uv = bm.loops.layers.uv.verify()
        for f in bm.faces:
            n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
            for l in f.loops:
                c = l.vert.co
                u, v = ((c.y, c.z), (c.x, c.z), (c.x, c.y))[ax]
                l[uv].uv = (u/s, v/s)
        bm.to_mesh(me); bm.free()
def render(path, cam, tgt, lights=(), hide=()):
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 24
    sc.render.resolution_x = sc.render.resolution_y = 640
    if not sc.world:
        w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
        w.node_tree.nodes["Background"].inputs[0].default_value = (0.6, 0.5, 0.36, 1)
        w.node_tree.nodes["Background"].inputs[1].default_value = 0.7
        sl = bpy.data.lights.new("sun", "SUN"); sl.energy = 4; sl.color = (1, .85, .62)
        so = bpy.data.objects.new("sun", sl); link(so); so.rotation_euler = (R(58), 0, R(150))
        g = box("ground", (80, 80, 0.1), (0, 0, 0.25), mat("g", color="#5a6b3a")); g["noexp"] = 1
        for i, (p, e) in enumerate(lights):
            pl = bpy.data.lights.new(f"pl{i}", "POINT"); pl.energy = e; pl.color = (1, .62, .3)
            po = bpy.data.objects.new(f"pl{i}", pl); link(po); po.location = p
    cd = bpy.data.cameras.new("c"); cd.lens = 30; co = bpy.data.objects.new("c", cd); link(co)
    co.location = cam; co.rotation_euler = (Vector(tgt)-Vector(cam)).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = co
    for o in hide: o.hide_render = True
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)
    for o in hide: o.hide_render = False
def export(objs, path):
    bpy.ops.object.select_all(action="DESELECT")
    bym = {}
    for o in objs: bym.setdefault(o.active_material.name, []).append(o)
    joined = []
    for k, g in bym.items():
        bpy.ops.object.select_all(action="DESELECT")
        for o in g: o.select_set(True)
        bpy.context.view_layer.objects.active = g[0]
        if len(g) > 1: bpy.ops.object.join()
        g[0].name = k; joined.append(g[0])
    bpy.ops.object.select_all(action="DESELECT")
    for o in joined: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path, use_selection=True, export_apply=True, export_lights=False, export_cameras=False)
    dg = bpy.context.evaluated_depsgraph_get()
    t = sum(len(o.evaluated_get(dg).data.loop_triangles) for o in joined)
    zs = [(o.matrix_world @ v.co) for o in joined for v in o.data.vertices]
    print("TRIS", path, t, "min", [round(min(p[i] for p in zs), 2) for i in range(3)], "max", [round(max(p[i] for p in zs), 2) for i in range(3)])
def mats():
    return dict(
        sandstone=mat("sandstone", "texture-red-sandstone-block-masonry-weathered.png", scale=2.2),
        flagstone=mat("flagstone", "texture-red-sandstone-block-masonry-weathered.png", color="#b9a48c", scale=1.3),
        oak=mat("oak", "texture-old-dark-oak-planks.png", scale=1.5),
        slate=mat("slate", "texture-dark-slate-roof-tiles-mossy.png", scale=2.5, rough=0.7),
        turf=mat("turf", "texture-mossy-turf-grass-thatch.png", scale=3.0),
        iron=mat("iron", color="#2e2b2a", metal=0.85, rough=0.5),
        brass=mat("brass", color="#c9a46a", metal=1.0, rough=0.35),
        glow=mat("glow", color="#f2b04a", emit="#f2b04a", es=8.0),
        cloth=mat("cloth", color="#7a2e22", rough=0.95),
        linen=mat("linen", color="#e8d9b5", rough=0.95),
        coal=mat("coal", color="#1c1916", rough=0.55, metal=0.2),
        ore=mat("ore", color="#8a4a30", rough=0.9),
        water=mat("water", color="#1e2a2c", rough=0.08),
        grind=mat("grind", color="#8c8478", rough=0.95))

# ---------------- HALL ----------------
def hall():
    reset(); M = mats(); O = []; A = O.append; roof = []
    A(box("floor", (12.4, 9.4, 0.35), (0, 0, 0.175), M["flagstone"]))
    walls = box("walls", (13, 10, 4.4), (0, 0, 2.2), M["sandstone"], taper=0.08)
    plinth = box("plinth", (13.8, 10.8, 1.2), (0, 0, 0.6), M["sandstone"], taper=0.4)
    porch = box("porch", (4.6, 1.8, 5.2), (0, 5.6, 2.6), M["sandstone"], taper=0.18)
    for o in (walls, plinth):
        c = box("in", (11.2, 8.2, 6), (0, 0, 3.35), M["sandstone"]); cut(o, c); bpy.data.objects.remove(c)
    for o in (walls, plinth, porch):
        c = prism("door", arch(1.7, 2.0, 0.35), 'y', 3.5, 7.5, M["sandstone"]); cut(o, c); bpy.data.objects.remove(c)
    c = prism("rev", arch(2.5, 2.1, 0.0), 'y', 6.0, 7.5, M["sandstone"]); cut(porch, c); bpy.data.objects.remove(c)
    O += [walls, plinth, porch]
    # carved lintel with hammer reliefs
    A(box("lintel", (3.4, 0.45, 0.75), (0, 6.42, 4.1), M["sandstone"]))
    for sx in (-1, 1):
        A(box("hh", (0.07, 0.06, 0.6), (sx*0.85, 6.66, 4.1), M["sandstone"], rot=(0, sx*35, 0)))
        A(box("hd", (0.32, 0.07, 0.16), (sx*0.85+sx*0.16, 6.67, 4.33), M["sandstone"], rot=(0, sx*35, 0)))
    A(box("anvr", (0.5, 0.07, 0.14), (0, 6.67, 4.2), M["sandstone"])); A(box("anvf", (0.22, 0.07, 0.18), (0, 6.67, 4.02), M["sandstone"]))
    A(box("keystone", (0.5, 0.5, 0.6), (0, 6.3, 3.5), M["sandstone"], taper=-0.08))
    p = box("porchcap", (5.0, 2.1, 0.25), (0, 5.65, 5.3), M["slate"]); A(p)
    # gables + roof
    th = math.atan(2.2/5.0); rr = []
    for x0, x1 in ((-6.5, -5.6), (5.6, 6.5)):
        rr.append(prism("gable", [(-5, 4.35), (5, 4.35), (0, 6.55)], 'x', x0, x1, M["sandstone"]))
    run = 5.7; L = run/math.cos(th)
    for s in (1, -1):
        cy = s*run/2; cz = 6.55-0.44*run/2
        rr.append(box("slate", (14.6, L, 0.3), (0, cy+s*0.15*math.sin(th), cz+0.15*math.cos(th)), M["slate"], rot=(-s*math.degrees(th), 0, 0)))
        tr = 3.0; cy = s*tr/2; cz = 6.55-0.44*tr/2
        rr.append(box("turf", (14.0, tr/math.cos(th), 0.24), (0, cy+s*0.38*math.sin(th), cz+0.38*math.cos(th)), M["turf"], rot=(-s*math.degrees(th), 0, 0)))
    rr.append(box("ridge", (14.4, 1.1, 0.5), (0, 0, 6.95), M["turf"], taper=0.2))
    # chimney + forge
    rr.append(box("chim", (2.0, 1.8, 7.9), (4.3, -3.6, 4.3), M["sandstone"], taper=0.12))
    rr.append(box("chimcap", (2.3, 2.1, 0.35), (4.3, -3.6, 8.3), M["slate"]))
    rr.append(box("chimglow", (1.2, 1.0, 0.12), (4.3, -3.6, 8.45), M["glow"]))
    O += rr; roof = rr
    A(box("forge", (2.9, 1.5, 1.3), (4.3, -2.45, 1.0), M["sandstone"]))
    A(box("hood", (2.6, 1.3, 1.6), (4.3, -2.6, 2.45), M["sandstone"], taper=0.45))
    A(box("mouth", (1.5, 0.08, 0.6), (4.3, -1.69, 1.0), M["glow"])); A(box("coals", (1.8, 0.9, 0.08), (4.3, -2.4, 1.67), M["glow"]))
    A(box("mouthlip", (1.9, 0.2, 0.12), (4.3, -1.65, 1.36), M["iron"]))
    # beams & chains
    for y in (-1.8, 1.8): A(box("beam", (11.4, 0.32, 0.36), (0, y, 4.2), M["oak"]))
    for x, y, n in ((1.4, 1.8, 14), (-1.2, -1.8, 10), (2.9, 1.8, 18), (-0.2, 1.8, 8)):
        O += chain("ch", x, y, 4.0, n, M["iron"])
        A(box("hook", (0.04, 0.04, 0.25), (x, y, 4.0-0.1*n-0.05), M["iron"]))
    # anvils
    for ax, ay, yaw in ((2.3, -0.4, 20), (0.6, -2.4, -15)):
        A(cyl("stump", 0.36, 0.55, (ax, ay, 0.62), M["oak"], seg=10))
        for nm, sz, z in (("af", (0.5, 0.32, 0.16), 0.98), ("aw", (0.26, 0.2, 0.26), 1.19), ("at", (0.75, 0.3, 0.18), 1.41)):
            A(box(nm, sz, (ax, ay, z), M["iron"], rot=(0, 0, yaw)))
        h = cyl("horn", 0.13, 0.4, (ax+0.55*math.cos(R(yaw)), ay+0.55*math.sin(R(yaw)), 1.43), M["iron"], rot=(0, 90, yaw), seg=8, r2=0.01)
        A(h)
    # long table + benches
    A(box("table", (1.2, 4.4, 0.14), (-3.6, -0.6, 1.18), M["oak"]))
    for lx in (-4.0, -3.2):
        for ly in (-2.5, 1.3): A(box("leg", (0.14, 0.14, 0.8), (lx, ly, 0.75), M["oak"]))
    for bx in (-4.6, -2.6):
        A(box("bench", (0.42, 4.0, 0.1), (-0.0+bx, -0.6, 0.82), M["oak"]))
        for ly in (-2.3, 1.1): A(box("bl", (0.32, 0.12, 0.45), (bx, ly, 0.57), M["oak"]))
    A(box("tank", (0.8, 0.5, 0.3), (-3.6, -1.8, 1.4), M["brass"]))
    # weapon racks at front wall interior
    for rx in (-3.4, 3.4):
        for px in (-0.95, 0.95): A(box("post", (0.12, 0.12, 1.9), (rx+px, 3.75, 1.3), M["oak"]))
        for z in (1.0, 2.1): A(box("bar", (2.0, 0.1, 0.09), (rx, 3.75, z), M["oak"]))
        for i in range(4):
            wx = rx-0.6+0.4*i
            if i % 2 == 0:
                A(box("blade", (0.07, 0.025, 1.1), (wx, 3.62, 1.35), M["iron"]))
                A(box("guard", (0.28, 0.05, 0.05), (wx, 3.62, 1.92), M["brass"])); A(box("grip", (0.05, 0.05, 0.25), (wx, 3.62, 2.07), M["oak"]))
            else:
                A(box("haft", (0.05, 0.05, 1.5), (wx, 3.62, 1.35), M["oak"])); A(box("axe", (0.3, 0.04, 0.24), (wx+0.1, 3.62, 1.95), M["iron"], taper=0.0))
    # open door leaf, brass banded
    leaf = prism("leaf", arch(1.7, 2.0, 0.37, x0=0.85), 'y', -0.05, 0.05, M["oak"]); leaf.location = (-0.85, 4.0, 0); A(leaf)
    for z in (0.8, 1.7, 2.6):
        b = box("band", (1.62 if z < 2.5 else 1.3, 0.13, 0.12), (0.85, 0, z), M["brass"]); b.parent = leaf; A(b)
    leaf.rotation_euler = (0, 0, R(-100))
    # glowing slit windows
    for sx in (-1, 1):
        for y in (-2.2, 2.0): A(box("slit", (0.1, 0.35, 1.0), (sx*6.46, y, 2.7), M["glow"]))
    finish(O)
    render(OUT+"hall_a.png", (15, 21, 10), (0, 0, 3), lights=[((1, 0, 3), 1500)])
    render(OUT+"hall_b.png", (-9, 8, 14), (0, 0, 0.5), hide=roof)
    export(O, OUT+"kha-hall.glb")

# ---------------- HOME ----------------
def home():
    reset(); M = mats(); O = []; A = O.append; top = []
    A(box("floor", (5.2, 4.2, 0.3), (0, 0, 0.15), M["flagstone"]))
    w = box("walls", (6, 5, 3.0), (0, 0, 1.5), M["sandstone"], taper=0.12)
    c = box("in", (5, 4, 4), (0, 0, 2.3), M["sandstone"]); cut(w, c); bpy.data.objects.remove(c)
    sur = prism("surround", arch(1.9, 1.7, 0.0), 'y', 2.4, 2.75, M["sandstone"])
    for o in (w, sur):
        c = prism("door", arch(1.3, 1.7, 0.3), 'y', 1.5, 3.5, M["sandstone"]); cut(o, c); bpy.data.objects.remove(c)
    O += [w, sur]
    for i in range(6):
        t = box(f"course{i}", (6.3-0.7*i, 5.3-0.7*i, 0.36), (0, 0, 3.18+0.34*i), M["sandstone"], taper=0.06); A(t); top.append(t)
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=8, radius=1.0)
    random.seed(3)
    for v in bm.verts:
        v.co *= 1+random.uniform(-0.06, 0.06); v.co.x *= 2.3; v.co.y *= 1.8; v.co.z *= 0.85
    cap = mobj("moss", bm, M["turf"]); cap.location = (0, 0, 4.55); A(cap); top.append(cap)
    # berm half-burying it
    A(prism("bermR", [(2.9, 0), (4.9, 0), (2.9, 1.5)], 'y', -4.4, 1.7, M["turf"]))
    A(prism("bermL", [(-4.9, 0), (-2.9, 0), (-2.9, 1.5)], 'y', -4.4, 1.7, M["turf"]))
    A(prism("bermB", [(-4.6, 0), (-2.4, 0), (-2.4, 1.5)], 'x', -4.9, 4.9, M["turf"]))
    # shuttered glowing window on +x wall
    A(box("win", (0.12, 0.75, 0.62), (2.93, 0.3, 2.2), M["glow"]))
    A(box("sill", (0.35, 1.0, 0.1), (3.02, 0.3, 1.84), M["sandstone"]))
    A(box("wbar", (0.05, 0.05, 0.62), (3.0, 0.3, 2.2), M["iron"])); A(box("wbar2", (0.05, 0.75, 0.05), (3.0, 0.3, 2.2), M["iron"]))
    for s in (1, -1):
        A(box("shutter", (0.06, 0.4, 0.66), (3.12+0.12, 0.3+s*0.56, 2.2), M["oak"], rot=(0, 0, s*-35)))
    # round oak door ajar
    leaf = prism("leaf", arch(1.3, 1.7, 0.31, x0=-0.65), 'y', -0.05, 0.05, M["oak"]); leaf.location = (0.65, 2.02, 0); A(leaf)
    for z in (0.8, 1.6):
        b = box("band", (1.2, 0.13, 0.1), (-0.65, 0, z), M["iron"]); b.parent = leaf; A(b)
    rg = cyl("ring", 0.08, 0.03, (-1.1, 0.08, 1.3), M["brass"], rot=(90, 0, 0), seg=8); rg.parent = leaf; A(rg)
    leaf.rotation_euler = (0, 0, R(100))
    # hearth + flue
    A(box("hearth", (1.4, 0.8, 0.95), (1.7, -1.6, 0.77), M["sandstone"]))
    A(box("hglow", (0.8, 0.06, 0.42), (1.7, -1.18, 0.72), M["glow"])); A(box("hcoal", (0.9, 0.5, 0.05), (1.7, -1.6, 1.26), M["glow"]))
    A(box("hood", (1.3, 0.8, 1.0), (1.7, -1.6, 1.75), M["sandstone"], taper=0.3))
    f = box("flue", (0.7, 0.7, 2.6), (1.7, -1.75, 4.6), M["sandstone"], taper=0.06); A(f); top.append(f)
    g = box("flueglow", (0.4, 0.4, 0.06), (1.7, -1.75, 5.91), M["glow"]); A(g); top.append(g)
    # bed, chest, stool
    A(box("bed", (1.05, 2.0, 0.35), (-1.85, -0.9, 0.48), M["oak"]))
    A(box("blanket", (1.0, 1.45, 0.12), (-1.85, -0.6, 0.71), M["cloth"]))
    A(box("pillow", (0.7, 0.35, 0.14), (-1.85, -1.65, 0.72), M["linen"]))
    A(box("headb", (1.05, 0.1, 0.7), (-1.85, -1.93, 0.65), M["oak"]))
    A(box("chest", (0.9, 0.5, 0.45), (-1.85, 0.55, 0.53), M["oak"])); A(box("lid", (0.92, 0.52, 0.14), (-1.85, 0.55, 0.82), M["oak"], taper=0.06))
    for x in (-2.15, -1.55): A(box("cb", (0.07, 0.54, 0.6), (x, 0.55, 0.58), M["brass"]))
    A(cyl("stool", 0.22, 0.45, (0.8, -0.6, 0.53), M["oak"], seg=10))
    finish(O)
    render(OUT+"home_a.png", (9, 11, 6), (0, 0, 1.8), lights=[((0, -0.5, 2.0), 300)])
    render(OUT+"home_b.png", (-4, 5, 9), (0, 0, 0.5), hide=top)
    export(O, OUT+"kha-home.glb")

# ---------------- YARD ----------------
def yard(kind):
    reset(); M = mats(); O = []; A = O.append
    if kind == "a":   # coal heap + quench barrel
        A(rock("coal", 1.0, (1.1, 0.9, 0.55), (0, 0, 0), M["coal"], 5, sub=2))
        for i in range(5): A(rock("lump", 0.18, (1, 1, 0.8), (math.cos(i*1.3)*1.2, math.sin(i*1.3)*1.0, 0), M["coal"], 10+i))
        A(rock("ember", 0.12, (1, 1, 1), (0.35, 0.4, 0.42), M["glow"], 2, sub=0, flat=False))
        A(cyl("barrel", 0.45, 1.0, (1.5, 0.2, 0.5), M["oak"], seg=14, r2=0.42))
        for z in (0.15, 0.85): A(cyl("hoop", 0.47, 0.07, (1.5, 0.2, z), M["iron"], seg=14))
        A(cyl("water", 0.41, 0.03, (1.5, 0.2, 0.95), M["water"], seg=14))
        A(cyl("barrel2", 0.38, 0.8, (1.4, -0.75, 0.4), M["oak"], seg=12, r2=0.36))
        for z in (0.12, 0.68): A(cyl("hoop2", 0.4, 0.06, (1.4, -0.75, z), M["iron"], seg=12))
        A(box("tongs", (0.04, 0.04, 0.9), (1.55, 0.25, 1.15), M["iron"], rot=(15, 0, 0)))
    elif kind == "b":  # ore cart on short rails
        for x in (-0.45, 0.45): A(box("rail", (0.07, 3.2, 0.09), (x, 0, 0.145), M["iron"]))
        for i in range(6): A(box("sleeper", (1.3, 0.2, 0.1), (0, -1.4+0.56*i, 0.05), M["oak"]))
        A(box("stop", (1.2, 0.25, 0.35), (0, -1.65, 0.27), M["oak"]))
        A(box("body", (0.95, 1.3, 0.6), (0, 0.2, 0.78), M["oak"], taper=-0.1))
        for y in (-0.35, 0.75): A(box("band", (1.18, 0.07, 0.62), (0, y, 0.8), M["iron"], taper=-0.1))
        for x in (-0.45, 0.45):
            for y in (-0.25, 0.65): A(cyl("wheel", 0.22, 0.08, (x, y, 0.42), M["iron"], rot=(0, 90, 0), seg=12))
        for i in range(6): A(rock("ore", 0.24, (1, 1, 0.8), (-0.25+0.25*(i % 3), -0.1+0.5*(i//3), 1.0), M["ore"], 30+i, flat=False))
        A(rock("ore2", 0.3, (1.2, 1, 0.6), (0.9, 1.2, 0), M["ore"], 44))
        A(box("handle", (0.8, 0.05, 0.05), (0, -0.62, 1.0), M["iron"]))
    else:  # ingot stack + whetstone wheel
        A(box("pallet", (1.2, 0.8, 0.12), (0, 0, 0.06), M["oak"]))
        for L in range(4):
            for i in range(3):
                m = M["brass"] if (L+i) % 3 else M["iron"]
                if L % 2 == 0: A(box("ing", (0.34, 0.15, 0.1), (-0.37+0.37*i, 0, 0.17+0.11*L), m, taper=0.03))
                else: A(box("ing", (0.15, 0.34, 0.1), (-0.25+0.25*i, 0, 0.17+0.11*L), m, taper=0.03))
        wx = 1.7
        for y in (-0.3, 0.3): A(box("post", (0.14, 0.14, 1.0), (wx, y, 0.5), M["oak"]))
        A(box("base", (1.0, 0.8, 0.12), (wx, 0, 0.06), M["oak"]))
        A(cyl("axle", 0.04, 0.8, (wx, 0, 0.82), M["iron"], rot=(90, 0, 0), seg=8))
        A(cyl("wheel", 0.42, 0.16, (wx, 0, 0.82), M["grind"], rot=(90, 0, 0), seg=20))
        A(box("trough", (0.7, 0.3, 0.25), (wx, 0, 0.25), M["oak"]))
        A(box("crank", (0.05, 0.05, 0.3), (wx, 0.42, 0.95), M["iron"]))
    finish(O)
    render(OUT+f"yard_{kind}.png", (4.5, 5, 3.2), (0.6, 0, 0.5))
    export(O, OUT+f"kha-yard-{kind}.glb")

which = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else ["hall", "home", "a", "b", "c"]
for w in which:
    {"hall": hall, "home": home}.get(w, lambda: yard(w))()
