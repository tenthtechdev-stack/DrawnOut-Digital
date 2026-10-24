"""Blender 4.3 CPU render: actual glass/light study beside the supplied reference.

This is NOT a rigged hand or approved vector emblem. The left reference is a
single emissive image plane; the right acrylic shell is independent 3D geometry.
Run: blender -b --python scripts/signature/render-study.py -- --out /tmp/study
"""
import argparse
import hashlib
import json
import math
import pathlib
import sys
import time

import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument("--out", required=True)
root = pathlib.Path(__file__).resolve().parents[2]
args.add_argument("--reference", default=str(root / "src/assets/signature/hand-emblem-reference.webp"))
args.add_argument("--samples", type=int, default=256)
options = args.parse_args(sys.argv[sys.argv.index("--") + 1 :])
output = pathlib.Path(options.out).resolve()
output.mkdir(parents=True, exist_ok=True)
reference = pathlib.Path(options.reference).resolve()

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = options.samples
scene.cycles.seed = 0
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.035
scene.cycles.sample_clamp_indirect = 3
scene.cycles.max_bounces = 8
scene.cycles.transmission_bounces = 8
# Managed Blender build has no OpenImageDenoise support.
scene.cycles.use_denoising = False
scene.render.resolution_x = 1200
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.world.color = (0.018, 0.018, 0.016)
scene.view_settings.view_transform = "AgX"

def material(name, color, roughness=0.4):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = roughness
    return result

def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()

floor = material("Charcoal studio", (0.027, 0.027, 0.024), 0.3)
bpy.ops.mesh.primitive_plane_add(size=200)
bpy.context.object.name = "Studio floor"
bpy.context.object.data.materials.append(floor)

# Source image is the whole supplied final pose, with alpha preserved. It is
# explicitly named as an image plane in the deliverable .blend scene.
bpy.ops.mesh.primitive_plane_add(size=2, location=(-1.45, 0.2, 1.65), rotation=(math.pi / 2, 0, 0))
reference_plane = bpy.context.object
reference_plane.name = "SUPPLIED COMPOSITE — image plane, not hand geometry"
reference_plane.scale = (0.84, 1.49, 1)
reference_material = bpy.data.materials.new("Supplied composite texture — no reconstructed anatomy")
reference_material.use_nodes = True
nodes = reference_material.node_tree.nodes
links = reference_material.node_tree.links
nodes.clear()
texture = nodes.new("ShaderNodeTexImage")
texture.image = bpy.data.images.load(str(reference))
texture.image.pack()
emission = nodes.new("ShaderNodeEmission")
emission.inputs["Strength"].default_value = 0.8
transparent = nodes.new("ShaderNodeBsdfTransparent")
mix = nodes.new("ShaderNodeMixShader")
out = nodes.new("ShaderNodeOutputMaterial")
links.new(texture.outputs["Color"], emission.inputs["Color"])
links.new(texture.outputs["Alpha"], mix.inputs[0])
links.new(transparent.outputs[0], mix.inputs[1])
links.new(emission.outputs[0], mix.inputs[2])
links.new(mix.outputs[0], out.inputs["Surface"])
reference_plane.data.materials.append(reference_material)

# A physically thick acrylic plate with beveled edges. No generic replacement
# emblem is added: accurate editable brand geometry has not been supplied.
glass = material("Orange acrylic — IOR 1.46 / 80mm thickness", (1.0, 0.30, 0.045), 0.12)
shader = glass.node_tree.nodes.get("Principled BSDF")
shader.inputs["Transmission Weight"].default_value = 0.94
shader.inputs["IOR"].default_value = 1.46
shader.inputs["Coat Weight"].default_value = 0.28
shader.inputs["Coat Roughness"].default_value = 0.08
bpy.ops.mesh.primitive_cube_add(size=1, location=(1.2, 0.0, 1.7), rotation=(math.radians(8), math.radians(-11), math.radians(-12)))
plate = bpy.context.object
plate.name = "3D acrylic material study — no emblem / no hand"
plate.dimensions = (1.7, 0.08, 1.7)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bevel = plate.modifiers.new("Real rounded edge geometry", "BEVEL")
bevel.width = 0.09
bevel.segments = 8
plate.modifiers.new("Weighted surface normals", "WEIGHTED_NORMAL")
plate.data.materials.append(glass)
for polygon in plate.data.polygons:
    polygon.use_smooth = True

metal = material("Dark display pedestal", (0.05, 0.047, 0.04), 0.22)
metal.node_tree.nodes.get("Principled BSDF").inputs["Metallic"].default_value = 0.45
bpy.ops.mesh.primitive_cube_add(size=1, location=(1.2, 0.15, 0.39))
pedestal = bpy.context.object
pedestal.name = "Material study pedestal"
pedestal.dimensions = (2.2, 0.95, 0.78)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
pedestal.data.materials.append(metal)
edge = pedestal.modifiers.new("Small bevel", "BEVEL")
edge.width = 0.04
edge.segments = 3

def area(name, location, energy, color, size, target):
    light_data = bpy.data.lights.new(name, "AREA")
    light_data.energy = energy
    light_data.color = color
    light_data.shape = "DISK"
    light_data.size = size
    obj = bpy.data.objects.new(name, light_data)
    scene.collection.objects.link(obj)
    obj.location = location
    aim(obj, target)

area("Warm orange edge light", (3, 1.8, 3.6), 650, (1.0, 0.29, 0.055), 2, (1.2, 0, 1.7))
area("Softbox front reflection", (0, -4.5, 5), 450, (1.0, 0.88, 0.72), 3.3, (1.2, 0, 1.7))
area("Cool separation reflection", (4, -0.5, 4), 380, (0.60, 0.72, 1.0), 1.4, (1.2, 0, 1.7))

def label(text, location, size):
    curve = bpy.data.curves.new(text, "FONT")
    curve.body = text
    curve.align_x = "CENTER"
    curve.size = size
    obj = bpy.data.objects.new(text, curve)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (math.pi / 2, 0, 0)
    ink = material("Label " + text, (0.7, 0.64, 0.56))
    obj.data.materials.append(ink)

label("SUPPLIED COMPOSITE", (-1.45, -0.02, 0.07), 0.13)
label("3D GLASS STUDY", (1.2, -0.35, 0.04), 0.13)

bpy.ops.object.camera_add(location=(3.6, -10.5, 4.4))
camera = bpy.context.object
camera.name = "Study camera — source reference + material test"
aim(camera, (0, 0, 1.7))
camera.data.type = "ORTHO"
camera.data.ortho_scale = 6.2
scene.camera = camera
scene["quality_status"] = "INTERIM MATERIAL STUDY; no independently rigged hand or editable brand emblem"
scene["source_provenance"] = "Client-supplied identical image-backed SVGs; no third-party hand assets"
scene["production_gap"] = "Licensed hand mesh/rig/textures, approved emblem vector, grip/occlusion and final camera approval"
# A relative path makes F12 reproducible after moving the packed scene. All
# reference pixels are packed; the source SVGs are never modified or embedded.
scene.render.filepath = "//signature-glass-study.png"
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(output / "signature-glass-study.blend"))
started = time.monotonic()
bpy.ops.render.render(write_still=True)
report = {
    "status": "interim-material-study-not-production-hand-animation",
    "blenderVersion": bpy.app.version_string,
    "engine": scene.render.engine,
    "device": scene.cycles.device,
    "samples": scene.cycles.samples,
    "seed": scene.cycles.seed,
    "adaptiveThreshold": scene.cycles.adaptive_threshold,
    "denoising": scene.cycles.use_denoising,
    "resolution": [scene.render.resolution_x, scene.render.resolution_y],
    "colorManagement": scene.view_settings.view_transform,
    "elapsedRenderSeconds": round(time.monotonic() - started, 2),
    "referenceSHA256": hashlib.sha256(reference.read_bytes()).hexdigest(),
    "referencePacked": bool(texture.image.packed_file),
    "handGeometry": False,
    "handRig": False,
    "editableEmblem": False,
    "files": {},
}
for name in ("signature-glass-study.blend", "signature-glass-study.png"):
    data = (output / name).read_bytes()
    report["files"][name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
(output / "render-report.json").write_text(json.dumps(report, indent=2) + "\n")
print("DRAWNOUT_STUDY_COMPLETE", output / "signature-glass-study.png")
