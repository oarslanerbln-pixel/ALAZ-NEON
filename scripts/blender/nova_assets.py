"""HENGAME NOVA varlıkları: zar yüzleri ve dört takım piyonu (şeffaf webp).

Çalıştırma (eklenti gerekmez, arka planda):
  blender -b -P scripts/blender/nova_assets.py -- <çıktı klasörü> [yalnız: die|pawn] [boyut]

Çıktı: die-1…die-6.webp, pawn-fire|earth|air|water.webp. Hepsi aynı kamera ve
ışıkla, nötr fildişi malzemeyle: vurgu rengi mekâna göre değiştiği için renk
varlığa gömülmez, arayüzde halka ile verilir.
"""

import math
import sys

import bpy
from mathutils import Euler, Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = argv[0] if argv else "//nova-assets"
ONLY = argv[1] if len(argv) > 1 else "all"
SIZE = int(argv[2]) if len(argv) > 2 else 192

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# --- Render ayarları -------------------------------------------------------
engines = [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
scene.render.engine = "CYCLES" if "CYCLES" in engines else engines[0]
if scene.render.engine == "CYCLES":
    scene.cycles.device = "CPU"
    scene.cycles.samples = 96
    try:
        scene.cycles.use_denoising = True
    except Exception as err:  # denoiser derlenmemiş olabilir
        print("denoise yok:", err)
scene.render.film_transparent = True
scene.render.resolution_x = SIZE
scene.render.resolution_y = SIZE
scene.render.resolution_percentage = 100
settings = scene.render.image_settings
if hasattr(settings, "media_type"):
    try:
        settings.media_type = "IMAGE"
    except Exception as err:
        print("media_type:", err)
formats = [i.identifier for i in settings.bl_rna.properties["file_format"].enum_items]
settings.file_format = "WEBP" if "WEBP" in formats else "PNG"
settings.color_mode = "RGBA"
settings.quality = 88
EXT = ".webp" if settings.file_format == "WEBP" else ".png"
try:
    scene.view_settings.view_transform = "Standard"
except Exception as err:
    print("view_transform:", err)

# --- Dünya, kamera, ışık ---------------------------------------------------
world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
bg.inputs[0].default_value = (0.55, 0.58, 0.65, 1.0)
bg.inputs[1].default_value = 0.1

cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 2.9
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
# Yukarıdan, hafif öne eğik: üstten bakınca biçim okunur, yan yüzler hacim verir.
elev = math.radians(64)
dist = 10
cam.location = (0, -dist * math.cos(elev), dist * math.sin(elev))
cam.rotation_euler = (math.pi / 2 - elev, 0, 0)


def add_light(name, location, energy, size):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.size = size
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    direction = Vector((0, 0, 0)) - Vector(location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(obj)


add_light("Key", (-4.5, -2.5, 4.5), 330, 2.5)
add_light("Fill", (4.5, -2.0, 2.5), 45, 5.0)
add_light("Rim", (1.5, 4.5, 3.0), 210, 2.5)


def material(name, color, roughness, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


IVORY = material("Ivory", (0.86, 0.85, 0.82), 0.36)
INK = material("Ink", (0.02, 0.02, 0.03), 0.45)


def finish(obj, mat, bevel=0.0, subdiv=0):
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 6
        mod.limit_method = "ANGLE"
    if subdiv:
        mod = obj.modifiers.new("Subdiv", "SUBSURF")
        mod.levels = subdiv
        mod.render_levels = subdiv
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def clear_objects():
    for obj in list(scene.collection.objects):
        if obj.type in {"MESH", "EMPTY"}:
            bpy.data.objects.remove(obj, do_unlink=True)


def render(name):
    scene.render.filepath = f"{OUT}/{name}{EXT}"
    bpy.ops.render.render(write_still=True)
    print("yazıldı:", scene.render.filepath)


# --- Zar ---------------------------------------------------------------------
# Yüz normali → değer (karşılıklı yüzlerin toplamı 7).
FACES = {
    1: Vector((0, 0, 1)),
    6: Vector((0, 0, -1)),
    2: Vector((0, -1, 0)),
    5: Vector((0, 1, 0)),
    3: Vector((1, 0, 0)),
    4: Vector((-1, 0, 0)),
}
PIPS = {
    1: [(0, 0)],
    2: [(-1, -1), (1, 1)],
    3: [(-1, -1), (0, 0), (1, 1)],
    4: [(-1, -1), (-1, 1), (1, -1), (1, 1)],
    5: [(-1, -1), (-1, 1), (0, 0), (1, -1), (1, 1)],
    6: [(-1, -1), (-1, 0), (-1, 1), (1, -1), (1, 0), (1, 1)],
}


def build_die():
    root = bpy.data.objects.new("Die", None)
    scene.collection.objects.link(root)
    bpy.ops.mesh.primitive_cube_add(size=1.7)
    cube = finish(bpy.context.active_object, IVORY, bevel=0.2)
    cube.parent = root
    half = 0.85
    for value, normal in FACES.items():
        # Yüz düzleminde iki dik eksen.
        helper = Vector((0, 0, 1)) if abs(normal.z) < 0.9 else Vector((1, 0, 0))
        u = normal.cross(helper).normalized()
        v = normal.cross(u).normalized()
        for a, b in PIPS[value]:
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, segments=24, ring_count=12)
            pip = finish(bpy.context.active_object, INK)
            pip.location = normal * (half - 0.02) + u * (a * 0.45) + v * (b * 0.45)
            pip.rotation_euler = normal.to_track_quat("Z", "Y").to_euler()
            pip.scale = (1, 1, 0.3)
            pip.parent = root
    return root


if ONLY in {"all", "die"}:
    for value, normal in FACES.items():
        clear_objects()
        die = build_die()
        # İstenen yüz yukarı; sonra dikey eksende hafif çevir (iki yan yüz görünsün).
        die.rotation_mode = "QUATERNION"
        up = normal.rotation_difference(Vector((0, 0, 1)))
        die.rotation_quaternion = Euler((0, 0, math.radians(28))).to_quaternion() @ up
        render(f"die-{value}")

# --- Piyonlar ----------------------------------------------------------------
def pawn_fire():
    # Üç yüzlü piramit: üstten üçgen (▲).
    bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=1.15, radius2=0.0, depth=1.7)
    obj = finish(bpy.context.active_object, IVORY, bevel=0.12)
    obj.rotation_euler = (0, 0, math.radians(0))
    obj.location = (0, -0.1, 0)
    return obj


def pawn_earth():
    bpy.ops.mesh.primitive_cube_add(size=1.5)
    return finish(bpy.context.active_object, IVORY, bevel=0.2)


def pawn_air():
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.98, segments=64, ring_count=32)
    return finish(bpy.context.active_object, IVORY)


def pawn_water():
    # Sekizyüzlü: üstten eşkenar dörtgen (◆).
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.08, radius2=0.0, depth=1.1)
    top = bpy.context.active_object
    top.location = (0, 0, 0.55)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.08, radius2=0.0, depth=1.1)
    bottom = bpy.context.active_object
    bottom.rotation_euler = (math.pi, 0, 0)
    bottom.location = (0, 0, -0.55)
    for obj in (top, bottom):
        finish(obj, IVORY, bevel=0.1)
    return top


if ONLY in {"all", "pawn"}:
    for name, build in (("fire", pawn_fire), ("earth", pawn_earth), ("air", pawn_air), ("water", pawn_water)):
        clear_objects()
        build()
        render(f"pawn-{name}")
