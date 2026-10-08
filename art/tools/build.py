# KayKit-style tool bits (creator upload): OBJ + palette texture -> one .glb each, Y-up, -Z facing as built.
import bpy, glob, os, math
SRC = "/workspace/tools/src"; OUT = "/workspace/tools/out"; os.makedirs(OUT, exist_ok=True)
pal = bpy.data.images.load(SRC + "/palette.png")
def mat():
    m = bpy.data.materials.new("tool"); m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]; t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = pal
    t.interpolation = "Closest"
    m.node_tree.links.new(t.outputs["Color"], bsdf.inputs["Base Color"]); bsdf.inputs["Roughness"].default_value = 0.7
    return m
M = mat()
names = []
for f in sorted(glob.glob(SRC + "/*.obj")):
    bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete()
    bpy.ops.wm.obj_import(filepath=f)
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    for o in objs:
        o.data.materials.clear(); o.data.materials.append(M)
    name = os.path.basename(f).replace("source-", "").rsplit("-", 1)[0]
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=f"{OUT}/{name}.glb", export_apply=True)
    names.append(name)
# proof: all in a row
bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete()
for i, n in enumerate(names):
    bpy.ops.import_scene.gltf(filepath=f"{OUT}/{n}.glb")
    for o in bpy.context.selected_objects: o.location.x += i * 0.6
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 16
sc.render.resolution_x, sc.render.resolution_y = 1400, 400
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (len(names) * 0.3 - 0.3, -4.2, 0.6); cam.rotation_euler = (math.radians(85), 0, 0); cam.data.lens = 30
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sun.data.energy = 4; sun.rotation_euler = (0.7, 0.2, 0.5); sc.collection.objects.link(sun)
sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[1].default_value = 0.6
sc.render.filepath = OUT + "/proof.png"; bpy.ops.render.render(write_still=True)
print("NAMES", names)
