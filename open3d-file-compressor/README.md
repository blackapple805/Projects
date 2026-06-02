# 🧊 Open3D OBJ Compressor

A lightweight Python tool for simplifying and compressing **3D `.obj`** models while preserving UVs and visual quality — ideal for web-based 3D viewers like **Spline**, **Three.js**, or **Blender WebGL exports**.

---

## 🚀 Features

- ✅ Simplifies high-poly 3D meshes to reduce file size (target MB or percentage)  
- 🎨 Preserves **UVs and textures** for clean visual output  
- ⚙️ Runs directly inside **VS Code / GitHub Codespaces**  
- 💾 Outputs optimized `.obj` files ready for hosting or real-time rendering  

---

## 🧠 Requirements

Install dependencies:
```bash
pip install open3d
```

Optional (for texture-safe compression):
```bash
pip install pymeshlab
```

---

## 🧩 Usage

1. **Place your `.obj` file** in the same folder as the script.  
2. **Update paths** inside the script (if needed):

```python
input_path = "base.obj"
output_path = "compressed_ball.obj"
```

3. **Run the script:**
```bash
python compress_obj.py
```

### Output example:
```
Original faces: 699962  
Simplified faces: 350000  
File saved as: compressed_ball.obj  
New size: 55.0 MB
```

---

## 🌐 Example Workflow

1. **Compress OBJ →**  
   Use this tool to reduce your model size for faster web loading.

2. **Upload to Spline / Hostinger →**  
   Embed your `.splinecode` in your website using:

```html
<script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.82/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/YourModelID/scene.splinecode"></spline-viewer>
```

---

## 🧰 Project Structure
```
Open3DFilescompressor/
│
├── base.obj                  # Original 3D model
├── compress_obj.py           # Simplification script
├── compressed_ball.obj       # Optimized output
└── README.md                 # Project documentation
```

---

## 👤 Author

**Eric Del Angel**  
🛠️ *QuestOne Cloud*  
💡 Passionate about DevOps, 3D design, and automation.

---

## 🪶 License

**MIT License** — free to use, modify, and distribute.
