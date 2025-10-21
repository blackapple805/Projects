import open3d as o3d
import os

# === PATHS ===
input_path = "/workspaces/Projects/Open3DFilescompressor/base.obj"
output_path = "/workspaces/Projects/Open3DFilescompressor/compressed_ball.obj"

# === LOAD MESH ===
print(f"Loading mesh from: {input_path}")
mesh = o3d.io.read_triangle_mesh(input_path)

# keep UVs if available
if not mesh.has_triangle_uvs():
    print("⚠️ Warning: No UVs found. Texture data may not appear in render.")
else:
    print("✅ UVs detected — will attempt to preserve them.")

# === TARGET COMPRESSION ===
original_faces = len(mesh.triangles)
target_faces = int(original_faces * 0.65)  # ~35% reduction to hit ~55 MB range
print(f"Original faces: {original_faces}, Target faces: {target_faces}")

# === SIMPLIFY ===
simplified = mesh.simplify_quadric_decimation(target_faces)

# re-assign vertex colors or normals if they exist
if mesh.has_vertex_colors():
    simplified.vertex_colors = mesh.vertex_colors
if mesh.has_vertex_normals():
    simplified.compute_vertex_normals()

# attempt to re-attach UVs (Open3D doesn’t preserve them automatically)
if mesh.has_triangle_uvs():
    try:
        simplified.triangle_uvs = mesh.triangle_uvs
        print("✅ Reattached UVs after simplification.")
    except Exception:
        print("⚠️ Could not reassign UVs. Proceeding with geometry only.")

# === SAVE ===
o3d.io.write_triangle_mesh(output_path, simplified)
print(f"\nSaved simplified mesh → {output_path}")

# === STATS ===
new_size = os.path.getsize(output_path) / 1024 / 1024
print(f"Original size: {os.path.getsize(input_path)/1024/1024:.2f} MB")
print(f"New size: {new_size:.2f} MB")
