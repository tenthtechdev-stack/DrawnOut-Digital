"""Read-only audit: blender -b design-assets/signature-study/signature-glass-study.blend --python artifacts/owner-corrections/asset-review/inspect-blend.py"""
import bpy, json, pathlib
scene = bpy.context.scene
result = {
 'blenderVersion': bpy.app.version_string,
 'file': 'design-assets/signature-study/signature-glass-study.blend',
 'sceneProperties': {k: scene[k] for k in scene.keys() if isinstance(scene[k], (str, int, float, bool))},
 'objects': [{
   'name': obj.name, 'type': obj.type,
   'vertices': len(obj.data.vertices) if obj.type == 'MESH' else None,
   'polygons': len(obj.data.polygons) if obj.type == 'MESH' else None,
   'materials': [m.name for m in obj.data.materials] if obj.type in ['MESH','FONT'] else [],
   'modifiers': [{'name':m.name,'type':m.type} for m in obj.modifiers],
 } for obj in scene.objects],
 'images': [{'name':img.name,'size':list(img.size),'packed': bool(img.packed_file)} for img in bpy.data.images],
 'armatureCount': len(bpy.data.armatures),
 'curveTypes': [{'name':c.name,'rnaType':c.bl_rna.identifier} for c in bpy.data.curves],
}
pathlib.Path(__file__).with_name('blender-inventory.json').write_text(json.dumps(result,indent=2)+'\n')
