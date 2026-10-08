# shared helpers for the Lamp Reeve's tollhouse and its props: materials on the kit's 1024 PBR sets, boxes, beams, prisms, uv projection, export
import bpy, bmesh, math, random
from mathutils import Vector, Matrix
TEX = "/workspace/kit/tex/t-"
PARTS = []
MATS = {}
SPEC = {  # name: (color linear, texture set, rough-kind, tint, rough, metal, emission, scale m/tile)
    "plaster": ((0.8, 0.76, 0.66), "plaster", "orm", (0.8, 0.73, 0.62), 0.9, 0, None, 2.0),
    "scorch": ((0.05, 0.04, 0.035), "plaster", "orm", (0.13, 0.105, 0.09), 0.95, 0, None, 2.0),
    "oak": ((0.2, 0.12, 0.07), "woodtrim", "orm", (0.45, 0.36, 0.3), 0.8, 0, None, 1.5),
    "planks": ((0.3, 0.2, 0.12), "woodtrim", "orm", (0.62, 0.5, 0.4), 0.85, 0, None, 1.5),
    "charred": ((0.03, 0.025, 0.02), "woodtrim", "orm", (0.085, 0.07, 0.06), 0.95, 0, None, 1.5),
    "stone": ((0.4, 0.37, 0.33), "unevenbrick", "roughness", (0.8, 0.78, 0.74), 0.9, 0, None, 2.0),
    "shingle": ((0.45, 0.16, 0.1), "roundtiles", "roughness", (0.9, 0.7, 0.62), 0.8, 0, None, 1.6),
    "iron": ((0.045, 0.04, 0.036), None, None, None, 0.55, 0.75, None, 1),
    "glass": ((0.03, 0.03, 0.035), None, None, None, 0.2, 0.1, None, 1),
    "wax": ((0.82, 0.79, 0.68), None, None, None, 0.35, 0, None, 1),
    "ledger": ((1, 1, 1), "LEDGER", None, None, 0.85, 0, None, 1),
    "parchment": ((0.66, 0.55, 0.36), None, None, None, 0.9, 0, None, 1),
    "ember": ((0.25, 0.06, 0.01), None, None, None, 0.9, 0, ((1.0, 0.38, 0.06), 7.0), 1),
    "moss": ((0.055, 0.1, 0.04), None, None, None, 1.0, 0, None, 1),
    "soot": ((0.012, 0.01, 0.009), None, None, None, 1.0, 0, None, 1),
    "oil": ((0.012, 0.009, 0.006), None, None, None, 0.08, 0, None, 1),
}
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True); PARTS.clear(); MATS.clear()
def img(path, data=False):
    im = bpy.data.images.load(path, check_existing=True)
    if data: im.colorspace_settings.name = "Non-Color"
    return im
def mat(n):
    if n in MATS: return MATS[n]
    col, tex, rk, tint, rough, metal, em, _ = SPEC[n]
    m = bpy.data.materials.new(n); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if tex == "LEDGER":
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = img("/workspace/lamphouse/ledger.png"); nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    elif tex:
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = img(f"{TEX}{tex}-basecolor.png")
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs[0].default_value = 1
        nt.links.new(t.outputs["Color"], mix.inputs[6]); mix.inputs[7].default_value = (*tint, 1); nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        nm = nt.nodes.new("ShaderNodeTexImage"); nm.image = img(f"{TEX}{tex}-normal.png", True)
        nn = nt.nodes.new("ShaderNodeNormalMap"); nt.links.new(nm.outputs["Color"], nn.inputs["Color"]); nt.links.new(nn.outputs["Normal"], b.inputs["Normal"])
        r = nt.nodes.new("ShaderNodeTexImage"); r.image = img(f"{TEX}{tex}-{rk}.png", True)
        if rk == "orm":
            sp = nt.nodes.new("ShaderNodeSeparateColor"); nt.links.new(r.outputs["Color"], sp.inputs["Color"]); nt.links.new(sp.outputs["Green"], b.inputs["Roughness"])
        else: nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    if em:
        b.inputs["Emission Color"].default_value = (*em[0], 1); b.inputs["Emission Strength"].default_value = em[1]
    MATS[n] = m; return m
def _obj(me, m):
    o = bpy.data.objects.new("p", me); bpy.context.collection.objects.link(o); me.materials.append(mat(m)); PARTS.append(o); return o
def box(m, cx, cy, cz, sx, sy, sz, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    me = bpy.data.meshes.new("b"); bm.to_mesh(me); bm.free(); o = _obj(me, m)
    o.location = (cx, cy, cz); o.rotation_euler = tuple(math.radians(a) for a in rot); return o
def bx(m, x0, x1, y0, y1, z0, z1):
    return box(m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0)
def frame(p0, p1, n):
    p0, p1 = Vector(p0), Vector(p1); d = (p1 - p0); L = d.length; d.normalize()
    n = Vector(n); n = n - d * n.dot(d)
    if n.length < 1e-4: n = Vector((1, 0, 0)) - d * d.x
    n.normalize(); x = n.cross(d)
    R = Matrix((x, n, d)).transposed()
    return Matrix.Translation((p0 + p1) / 2) @ R.to_4x4(), L
def beam(m, p0, p1, w=0.2, dep=0.14, n=(0, 1, 0)):
    M, L = frame(p0, p1, n)
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=(w, dep, L), verts=bm.verts)
    me = bpy.data.meshes.new("bm"); bm.to_mesh(me); bm.free(); o = _obj(me, m); o.matrix_world = M; return o
def cyl(m, p0, p1, r, seg=8, r2=None):
    M, L = frame(p0, p1, (0, 1, 0))
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=L)
    me = bpy.data.meshes.new("c"); bm.to_mesh(me); bm.free(); o = _obj(me, m); o.matrix_world = M; return o
def blob(m, c, s, sub=1, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1)
    for v in bm.verts: v.co *= 1 + random.uniform(-0.18, 0.18)
    bmesh.ops.scale(bm, vec=s, verts=bm.verts)
    me = bpy.data.meshes.new("bl"); bm.to_mesh(me); bm.free(); o = _obj(me, m)
    o.location = c; o.rotation_euler = tuple(math.radians(a) for a in rot); return o
def prism(m, pts, axis, a0, a1):
    """pts 2D: axis 'y' -> (x,z) extruded along y a0..a1; axis 'x' -> (y,z) extruded along x"""
    bm = bmesh.new()
    def P(u, w, a): return (u, a, w) if axis == "y" else (a, u, w)
    A = [bm.verts.new(P(u, w, a0)) for u, w in pts]; B = [bm.verts.new(P(u, w, a1)) for u, w in pts]
    bm.faces.new(A); bm.faces.new(list(reversed(B))); n = len(pts)
    for i in range(n): bm.faces.new([A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("pr"); bm.to_mesh(me); bm.free(); return _obj(me, m)
def torus(m, loc, rot, R=0.03, r=0.008, sc=(1, 1.5, 1)):
    bm = bmesh.new()
    me = bpy.data.meshes.new("t")
    verts, faces = [], []
    MS, NS = 6, 3
    for i in range(MS):
        a = 2 * math.pi * i / MS
        for j in range(NS):
            b = 2 * math.pi * j / NS
            verts.append(((R + r * math.cos(b)) * math.cos(a) * sc[0], (R + r * math.cos(b)) * math.sin(a) * sc[1], r * math.sin(b) * sc[2]))
    for i in range(MS):
        for j in range(NS):
            faces.append((i * NS + j, ((i + 1) % MS) * NS + j, ((i + 1) % MS) * NS + (j + 1) % NS, i * NS + (j + 1) % NS))
    me.from_pydata(verts, [], faces); o = _obj(me, m); o.location = loc; o.rotation_euler = rot; return o
def chain(x, y, ztop, L):
    n = max(2, int(L / 0.085))
    for i in range(n):
        torus("iron", (x, y, ztop - 0.04 - i * 0.085), (math.pi / 2, 0, (i % 2) * math.pi / 2))
    return ztop - 0.04 - n * 0.085
def lantern(x, y, ztop, glass=True, tilt=(0, 0, 0)):
    """snuffed lantern hanging from ztop (its ring); wick pinched black"""
    z = ztop
    cyl("iron", (x, y, z - 0.06), (x, y, z), 0.025, 6)
    cyl("iron", (x, y, z - 0.18), (x, y, z - 0.06), 0.14, 6, 0.03)
    cyl("iron", (x, y, z - 0.21), (x, y, z - 0.18), 0.12, 6)
    if glass: cyl("glass", (x, y, z - 0.43), (x, y, z - 0.21), 0.1, 6)
    else:
        for k in range(4):
            a = k * math.pi / 2 + 0.4; cyl("iron", (x + 0.1 * math.cos(a), y + 0.1 * math.sin(a), z - 0.43), (x + 0.1 * math.cos(a), y + 0.1 * math.sin(a), z - 0.21), 0.01, 4)
        cyl("wax", (x, y, z - 0.42), (x, y, z - 0.33), 0.035, 6)
        box("soot", x, y, z - 0.315, 0.012, 0.012, 0.035)
        blob("wax", (x + 0.03, y, z - 0.44), (0.05, 0.04, 0.02))
    cyl("iron", (x, y, z - 0.47), (x, y, z - 0.43), 0.13, 6)
def finish(path, tris_cap=25000):
    for o in PARTS:
        bpy.context.view_layer.objects.active = o
    bpy.ops.object.select_all(action="DESELECT")
    for o in PARTS: o.select_set(True)
    bpy.context.view_layer.objects.active = PARTS[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.join(); o = bpy.context.view_layer.objects.active; o.name = path.split("/")[-1].split(".")[0]
    me = o.data; uvl = me.uv_layers.new(name="UVMap")
    for p in me.polygons:
        n = p.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        nm = me.materials[p.material_index].name.split(".")[0]; S = SPEC[nm][7]
        for li in p.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co
            u, w = ((v.y, v.z), (v.x, v.z), (v.x, v.y))[ax]
            if nm == "ledger": u, w = (v.x - LEDGER[0]) / LEDGER[2] + 0.5, (v.y - LEDGER[1]) / LEDGER[3] + 0.5; uvl.data[li].uv = (u, w); continue
            uvl.data[li].uv = (u / S, w / S)
    me.update(); bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get(); me2 = o.evaluated_get(dg).data; me2.calc_loop_triangles(); tris = len(me2.loop_triangles)
    zs = [v.co.z for v in me.vertices]; xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]
    print("EXPORT", path, "tris", tris, "x", round(min(xs), 2), round(max(xs), 2), "y", round(min(ys), 2), round(max(ys), 2), "z", round(min(zs), 2), round(max(zs), 2))
    return o
def export(path):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=path, export_apply=True, export_image_format="JPEG", export_jpeg_quality=82, use_selection=False)
LEDGER = [0, 0, 1, 1]
def render_setup(target, eye, out, sun=(-0.5, -0.6, 0.45), res=640, samples=24, fov=40):
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = samples
    sc.render.resolution_x = res; sc.render.resolution_y = int(res * 0.75)
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.45, 0.5, 0.6, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.7
    ld = bpy.data.lights.new("sun", "SUN"); ld.energy = 3.5; ld.color = (1, 0.85, 0.65); ld.angle = 0.05
    s = bpy.data.objects.new("sun", ld); sc.collection.objects.link(s); s.rotation_euler = (-Vector(sun)).to_track_quat("-Z", "Y").to_euler()
    cd = bpy.data.cameras.new("cam"); cd.angle = math.radians(fov); c = bpy.data.objects.new("cam", cd); sc.collection.objects.link(c); sc.camera = c
    gm = bpy.data.meshes.new("g"); gm.from_pydata([(-40, -40, 0), (40, -40, 0), (40, 40, 0), (-40, 40, 0)], [], [(0, 1, 2, 3)])
    g = bpy.data.objects.new("ground", gm); sc.collection.objects.link(g); gmat = bpy.data.materials.new("gr"); gmat.use_nodes = True
    gmat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.2, 0.22, 0.1, 1); gm.materials.append(gmat)
    return c
def shot(c, eye, target, out):
    c.location = eye; c.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.render.filepath = out; bpy.ops.render.render(write_still=True)
