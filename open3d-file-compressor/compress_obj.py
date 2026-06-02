import open3d as o3d
import os

# === File Paths ===
input_path = "/workspaces/Projects/Open3DFilescompressor/base.obj"
output_path = "/workspaces/Projects/Open3DFilescompressor/compressed_ball.obj"

# === Load Mesh ===
print(f"Loading mesh from: {input_path}")
mesh = o3d.io.read_triangle_mesh(input_path)

if not mesh.has_triangles():
    raise ValueError("Mesh failed to load or contains no faces. Check file integrity.")

original_faces = len(mesh.triangles)
original_size = os.path.getsize(input_path) / 1024 / 1024
print(f"Original file size: {original_size:.2f} MB")

# === Target Size (in MB) ===
target_size = 55.0
ratio = target_size / original_size
target_faces = int(original_faces * ratio)

print(f"Target faces: {target_faces} ({ratio*100:.1f}% of original)")

# === Simplify Mesh ===
simplified = mesh.simplify_quadric_decimation(target_faces)

# === Save File ===
o3d.io.write_triangle_mesh(output_path, simplified)

# === Result Info ===
new_size = os.path.getsize(output_path) / 1024 / 1024
print(f"Simplified faces: {len(simplified.triangles)}")
print(f"New file size: {new_size:.2f} MB")
print(f"Saved as: {output_path}")
