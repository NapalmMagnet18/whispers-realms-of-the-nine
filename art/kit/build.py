# art/kit/build.py: CC0 kit importer. manifest.json -> slimmed, bottom-centred .glb + 256px proof each + stats.json
import bpy, json, os, sys, math, mathutils
HERE = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(HERE, "manifest.json")))
OUT = "/workspace/assets/out"; PROOF = "/tmp/kitproof"; os.makedirs(OUT, exist_ok=True); os.makedirs(PROOF, exist_ok=True)
only = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
stats = {}
for aid, pk, fn, budget, height in M["assets"]:
    if only and aid not in only: continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=M[pk] + fn)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    for o in bpy.context.scene.objects:
        if o.type != "MESH": o.select_set(False)
    # free parents keeping world transform, then apply
    for o in meshes:
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    for o in list(bpy.context.scene.objects):
        if o != ob: bpy.data.objects.remove(o)
    # merge duplicate materials by base name
    seen = {}
    for i, s in enumerate(ob.material_slots):
        if s.material: s.material.name = s.material.name.split(".")[0]
    # weld
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0005); bpy.ops.object.mode_set(mode="OBJECT")
    ob.data.calc_loop_triangles(); tris0 = len(ob.data.loop_triangles)
    if tris0 > budget:
        d = ob.modifiers.new("dec", "DECIMATE"); d.ratio = budget / tris0
        bpy.ops.object.modifier_apply(modifier="dec")
    ob.data.calc_loop_triangles(); tris = len(ob.data.loop_triangles)
    # origin bottom centre
    vs = [v.co for v in ob.data.vertices]
    mn = mathutils.Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
    mx = mathutils.Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    off = mathutils.Vector(((mn.x+mx.x)/2, (mn.y+mx.y)/2, mn.z))
    ob.data.transform(mathutils.Matrix.Translation(-off))
    size = mx - mn
    # textures <= 512
    for img in bpy.data.images:
        if img.size[0] > 512 or img.size[1] > 512:
            f = 512 / max(img.size[0], img.size[1]); img.scale(max(1,int(img.size[0]*f)), max(1,int(img.size[1]*f)))
    ob.name = aid
    bpy.ops.export_scene.gltf(filepath=f"{OUT}/{aid}.glb", export_apply=True, export_yup=True)
    stats[aid] = {"tris_src": tris0, "tris": tris, "size_src": [round(size.x,3), round(size.z,3), round(size.y,3)], "mats": [s.material.name for s in ob.material_slots if s.material], "imgs": [i.name + f"{tuple(i.size)}" for i in bpy.data.images]}
    # proof: scale to target height, 3/4 view
    s = height / max(size.z, 1e-4); ob.scale = (s, s, s)
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 12
    sc.render.resolution_x = sc.render.resolution_y = 256; sc.render.film_transparent = False
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.75, 0.68, 0.55, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.8
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sun.data.energy = 3.5; sun.rotation_euler = (math.radians(50), 0, math.radians(30)); sc.collection.objects.link(sun)
    r = max(size.x, size.y, size.z) * s
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = "ORTHO"; cam.data.ortho_scale = r * 1.6
    # front of engine (-Z glTF) = Blender +Y; look from front-right so the face shows: camera at +Y side
    tgt = mathutils.Vector((0, 0, height * 0.45)); cam.location = tgt + mathutils.Vector((r*1.4, r*2.2, r*1.4))
    cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = f"{PROOF}/{aid}.png"; bpy.ops.render.render(write_still=True)
    print("DONE", aid, stats[aid])
json.dump(stats, open(f"{OUT}/stats{'-'+'_'.join(only) if only else ''}.json", "w"), indent=1)
