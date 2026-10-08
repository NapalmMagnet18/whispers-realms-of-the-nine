# Lantern's Reach townhouse, assembled from the creator's modular wall kit (OBJ, Y-up, wall exterior at +Z, 2 m bays, 3.12 m storeys).
# Final GLB space = the kit's own: Y up, front door faces +Z. Roof, floors, door leaf, posts and chimney are built here.
import bpy, bmesh, math, os
SRC = "/workspace/kit/src"; OUT = "/workspace/kit/out"; os.makedirs(OUT, exist_ok=True)
bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete()
COL = {"MI_Plaster": (0.86, 0.80, 0.66), "MI_WoodTrim": (0.19, 0.12, 0.07), "MI_WoodTrim_Wear": (0.33, 0.22, 0.13),
       "MI_Brick": (0.50, 0.32, 0.22), "MI_UnevenBrick": (0.52, 0.48, 0.42), "MI_RockTrim": (0.45, 0.42, 0.38),
       "MI_WindowGlass": (1.0, 0.62, 0.25), "MI_Shingle": (0.50, 0.20, 0.13), "MI_Floor": (0.36, 0.24, 0.14)}
MATS = {}
TEX = "/workspace/kit/tex/t-"
SET = {"MI_Plaster": ("plaster", "orm"), "MI_WoodTrim": ("woodtrim", "orm"), "MI_WoodTrim_Wear": ("woodtrim", "orm"), "MI_Floor": ("woodtrim", "orm"),
       "MI_UnevenBrick": ("unevenbrick", "roughness"), "MI_RockTrim": ("rocktrim", "orm"), "MI_Brick": ("brick", "roughness"), "MI_Shingle": ("roundtiles", "roughness")}
TINT = {"MI_WoodTrim": (0.62, 0.55, 0.5), "MI_Floor": (0.8, 0.72, 0.65)}
def img(path, data=False):
    im = bpy.data.images.load(path, check_existing=True)
    if data: im.colorspace_settings.name = "Non-Color"
    return im
def mat(n):
    if n in MATS: return MATS[n]
    m = bpy.data.materials.get(n) or bpy.data.materials.new(n); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]; c = COL.get(n, (0.6, 0.6, 0.6))
    b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Roughness"].default_value = 0.85
    if n in SET:
        k, rk = SET[n]
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = img(f"{TEX}{k}-basecolor.png")
        if n in TINT:
            mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs[0].default_value = 1
            nt.links.new(t.outputs["Color"], mix.inputs[6]); mix.inputs[7].default_value = (*TINT[n], 1); nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        else: nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
        nm = nt.nodes.new("ShaderNodeTexImage"); nm.image = img(f"{TEX}{k}-normal.png", True)
        nn = nt.nodes.new("ShaderNodeNormalMap"); nt.links.new(nm.outputs["Color"], nn.inputs["Color"]); nt.links.new(nn.outputs["Normal"], b.inputs["Normal"])
        r = nt.nodes.new("ShaderNodeTexImage"); r.image = img(f"{TEX}{k}-{rk}.png", True)
        if rk == "orm":
            sp = nt.nodes.new("ShaderNodeSeparateColor"); nt.links.new(r.outputs["Color"], sp.inputs["Color"]); nt.links.new(sp.outputs["Green"], b.inputs["Roughness"])
        else: nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    if n == "MI_WindowGlass":
        b.inputs["Emission Color"].default_value = (1.0, 0.55, 0.2, 1); b.inputs["Emission Strength"].default_value = 2.5
    MATS[n] = m; return m
for n in COL: mat(n)
parts = []
def piece(name, X, Y, Z, rot=0):
    """place kit piece at kit-space (X,Y,Z), rot degrees about up"""
    before = set(bpy.data.objects)
    bpy.ops.wm.obj_import(filepath=f"{SRC}/{name}.obj")
    for o in set(bpy.data.objects) - before:
        for i, s in enumerate(o.material_slots):
            nm = s.material.name.split(".")[0] if s.material else "MI_Plaster"
            o.material_slots[i].material = mat(nm)
        o.location = (X, -Z, Y); o.rotation_euler = (math.radians(90), 0, math.radians(rot)); parts.append(o)
def box(mname, x0, x1, y0, y1, z0, z1):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    me = bpy.data.meshes.new("b"); bm.to_mesh(me); o = bpy.data.objects.new("b", me); bpy.context.collection.objects.link(o)
    o.scale = (x1 - x0, z1 - z0, y1 - y0); o.location = ((x0 + x1) / 2, -(z0 + z1) / 2, (y0 + y1) / 2)
    me.materials.append(mat(mname)); parts.append(o); return o
def poly(mname, verts, faces):
    me = bpy.data.meshes.new("p"); me.from_pydata([(x, -z, y) for x, y, z in verts], [], faces)
    o = bpy.data.objects.new("p", me); bpy.context.collection.objects.link(o); me.materials.append(mat(mname)); parts.append(o); return o

H = 3.12; W2, D2 = 4.0, 3.0  # half width (x), half depth (z)
def side(y, specs, face):
    for i, (wall, win, shut) in enumerate(specs):
        if face == "front": X, Z, r = -3 + 2 * i, D2 - 0.09, 0
        if face == "back":  X, Z, r = 3 - 2 * i, -D2 + 0.09, 180
        if face == "left":  X, Z, r = -W2 + 0.09, 2 - 2 * i, -90
        if face == "right": X, Z, r = W2 - 0.09, -2 + 2 * i, 90
        piece(wall, X, y, Z, r)
        if win: piece(win, X, y, Z, r)
        if shut: piece(shut, X, y, Z, r)
B = "wall-unevenbrick-"; P = "wall-plaster-"
# ground storey: fieldstone
side(0, [(B+"window-wide-round", "window-wide-round1", "windowshutters-wide-round-open"), (B+"door-round", None, None),
         (B+"window-thin-round", "window-thin-round1", "windowshutters-thin-round-open"), (B+"window-wide-flat", "window-wide-flat1", "windowshutters-wide-flat-open")], "front")
side(0, [(B+"straight", None, None), (B+"window-thin-round", "window-thin-round1", "windowshutters-thin-round-closed"), (B+"door-flat", None, None), (B+"straight", None, None)], "back")
side(0, [(B+"straight", None, None), (B+"window-wide-flat", "window-wide-flat1", "windowshutters-wide-flat-closed"), (B+"straight", None, None)], "left")
side(0, [(B+"straight", None, None), (B+"window-wide-round", "window-wide-round1", "windowshutters-wide-round-open"), (B+"straight", None, None)], "right")
# upper storey: limewash and timber
side(H, [(P+"window-wide-flat", "window-wide-flat1", "windowshutters-wide-flat-open"), (P+"woodgrid", None, None),
         (P+"door-flat", None, None), (P+"window-wide-round", "window-wide-round1", "windowshutters-wide-round-open")], "front")
side(H, [(P+"woodgrid", None, None), (P+"window-wide-flat", "window-wide-flat1", "windowshutters-wide-flat-closed"), (P+"woodgrid", None, None), (P+"straight", None, None)], "back")
side(H, [(P+"woodgrid", None, None), (P+"window-wide-round", "window-wide-round1", None), (P+"woodgrid", None, None)], "left")
side(H, [(P+"straight", None, None), (P+"window-wide-flat", "window-wide-flat1", "windowshutters-wide-flat-open"), (P+"woodgrid", None, None)], "right")
# awnings over the ground-floor front windows
for X in (-3, 3): piece("window-roof-wide", X, 0, D2 - 0.09, 0)
piece("window-roof-thin", 1, 0, D2 - 0.09, 0)
# timber jetty band between storeys
for i in range(4): piece("wall-bottomcover", -3 + 2 * i, H, D2 - 0.09, 0); piece("wall-bottomcover", 3 - 2 * i, H, -D2 + 0.09, 180)
for i in range(3): piece("wall-bottomcover", -W2 + 0.09, H, 2 - 2 * i, -90); piece("wall-bottomcover", W2 - 0.09, H, -2 + 2 * i, 90)
# corners: fieldstone quoins below, oak posts above
for (cx, cz, r) in ((-W2, D2, 0), (W2, D2, 90), (W2, -D2, 180), (-W2, -D2, -90)):
    piece("corner-exteriorwide-brick", cx, 0, cz, r)
    piece("corner-exteriorwide-wood", cx, H, cz, r)
# door frames
piece("doorframe-round-brick", -1, 0, D2 - 0.09, 0)
piece("doorframe-flat-brick", -1, 0, -D2 + 0.09, 180)
piece("doorframe-flat-wooddark", 1, H, D2 - 0.09, 0)
# plinth and floors: kit boards over solid slabs; the stair hole is the back-left bay pair
box("MI_RockTrim", -W2 - 0.25, W2 + 0.25, -0.8, 0.06, -D2 - 0.25, D2 + 0.25)
box("MI_Floor", -W2 + 0.3, W2 - 0.3, 0.06, 0.12, -D2 + 0.3, D2 - 0.3)
U0, U1 = H - 0.12, H - 0.01
box("MI_Floor", -2.0, W2 - 0.3, U0, U1, -D2 + 0.3, D2 - 0.3)
box("MI_Floor", -W2 + 0.3, -2.0, U0, U1, 1.0, D2 - 0.3)
for X in (-3, -1, 1, 3):
    for Z in (-2, 0, 2):
        piece("floor-woodlight", X, 0.125, Z, 0)
        if not (X == -3 and Z in (-2, 0)): piece("floor-wooddark-half3", X, H, Z + 1, 0); piece("floor-wooddark-half3", X, H, Z, 180)
box("MI_WoodTrim", -2.02, -1.9, H, H + 1.0, -D2 + 0.3, 1.0)  # landing rail
piece("stair-interior-rails", -3.0, 0.12, 1.55, 0)
d = box("MI_WoodTrim_Wear", -0.55, 0.55, 0.12, 2.35, -0.04, 0.04)  # door leaf, swung in on its left hinge
d.rotation_euler = (0, 0, math.radians(-75)); d.location.x = -1.62 + 0.55 * math.cos(math.radians(75)); d.location.y = -(D2 - 0.35 - 0.55 * math.sin(math.radians(75)))
# balcony over the street: two kit board tiles on a beam deck, cross rails
for X in (-1, 1):
    piece("floor-woodlight", X, H + 0.0, D2 + 1, 0)
    piece("balcony-cross-straight", X, H, D2 + 1, 0)
box("MI_WoodTrim", -2.0, 2.0, H - 0.22, H - 0.01, D2, D2 + 2.0)
piece("balcony-cross-straight", 1, H, D2 + 1, 90)
piece("balcony-cross-straight", -1, H, D2 + 1, -90)
for X in (-1.9, 1.9): box("MI_WoodTrim", X - 0.08, X + 0.08, H - 1.1, H - 0.2, D2, D2 + 1.6).rotation_euler = (math.radians(-40), 0, 0)
# gable roof, ridge along X
R0, RY, OV = 2 * H, 2 * H + 3.0, 0.55
xa, xb = -W2 - OV, W2 + OV; ze = D2 + OV; ye = R0 - OV * (3.0 / D2)
T = 0.18
for s in (1, -1):
    v = [(xa, ye, s * ze), (xb, ye, s * ze), (xb, RY, 0), (xa, RY, 0), (xa, ye + T, s * ze), (xb, ye + T, s * ze), (xb, RY + T, 0), (xa, RY + T, 0)]
    poly("MI_Shingle", v, [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)])
for sx in (-1, 1):  # plaster gables + barge boards
    x = sx * (W2 - 0.05)
    poly("MI_Plaster", [(x, R0, D2), (x, R0, -D2), (x, RY, 0)], [(0, 1, 2), (2, 1, 0)])
box("MI_WoodTrim", xa, xb, RY + T - 0.05, RY + T + 0.12, -0.12, 0.12)  # ridge beam
box("MI_Brick", 1.8, 2.7, R0 - 0.5, RY + 1.3, -1.9, -1.0)  # chimney
box("MI_RockTrim", 1.7, 2.8, RY + 1.3, RY + 1.45, -2.0, -0.9)
# UVs for the hand-built pieces (boxes, roof, gables): box projection, 1 tile per 2 m (roof 1 per 1.6 m)
own = [o for o in parts if o.name.startswith(("b", "p")) and not o.name.startswith("ba")]
for o in own:
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    me = o.data
    if not me.uv_layers: me.uv_layers.new()
    uv = me.uv_layers.active.data; roof = me.materials[0].name == "MI_Shingle"; S = 1.6 if roof else 2.0
    for poly in me.polygons:
        nx, ny, nz = (abs(v) for v in poly.normal)
        for li in poly.loop_indices:
            co = o.matrix_world @ me.vertices[me.loops[li].vertex_index].co
            if roof: u, v = co.x / S, (co.z - co.y * 0.0) / S if nz > 0.5 else co.z / S
            if roof and nz > 0.3: u, v = co.x / S, (co.y if abs(poly.normal.y) > abs(poly.normal.z) else co.z) / S
            if roof and nz > 0.3: v = (co.y ** 2 + (co.z) ** 2) ** 0.5 / S
            elif nz >= nx and nz >= ny: u, v = co.x / S, co.y / S
            elif nx >= ny: u, v = co.y / S, co.z / S
            else: u, v = co.x / S, co.z / S
            uv[li].uv = (u, v)
# join, export
bpy.ops.object.select_all(action="DESELECT")
for o in parts: o.select_set(True)
bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join()
house = bpy.context.active_object; house.name = "townhouse"
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
bpy.ops.export_scene.gltf(filepath=f"{OUT}/townhouse.glb", export_apply=True, export_image_format="JPEG", export_jpeg_quality=82)
# proof
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 24
sc.render.resolution_x, sc.render.resolution_y = 1200, 800
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
import mathutils
def shoot(loc, tgt, path):
    cam.location = loc; d = mathutils.Vector(tgt) - mathutils.Vector(loc); cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sun.data.energy = 3.5; sun.rotation_euler = (0.9, 0.2, -0.6); sc.collection.objects.link(sun)
sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[1].default_value = 0.5
cam.data.lens = 28
shoot((9, -14, 5), (0, 0, 4), OUT + "/proof-front.png")
shoot((-10, 12, 7), (0, 0, 4), OUT + "/proof-back.png")
print("TRIS", sum(len(p.vertices) - 2 for p in house.data.polygons), "DIMS", tuple(round(v, 2) for v in house.dimensions))
