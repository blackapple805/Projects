import numpy as np
import matplotlib.pyplot as plt
import os
import random  # Newly added

# Define the dimensions of the image
width, height = 800, 800
max_iter = random.randint(100, 300)  # Randomize iterations for variety

# Generate a random complex constant 'c' for the Julia set
c_real = random.uniform(-1.5, 1.5)
c_imag = random.uniform(-1.5, 1.5)
c = complex(c_real, c_imag)

# Randomize zoom level
zoom = random.uniform(0.5, 2.0)

# Create a linear space for the real and imaginary axes
real = np.linspace(-zoom, zoom, width)
imag = np.linspace(-zoom, zoom, height)
real, imag = np.meshgrid(real, imag)
z = real + 1j * imag  # 'z' varies over the complex plane

# Initialize an array to hold the iteration counts
divergence_times = np.zeros(z.shape, dtype=int)

# Perform the iteration
for i in range(max_iter):
    mask = np.abs(z) <= 2
    z[mask] = z[mask] ** 2 + c  # 'c' is fixed; 'z' changes
    divergence_times[mask & (np.abs(z) > 2)] = i

# Randomize the color map
cmap_choice = random.choice(['inferno', 'plasma', 'viridis', 'magma', 'cividis', 'hot', 'cool'])

# Plot the Julia set
plt.figure(figsize=(10, 10))
plt.imshow(divergence_times, cmap=cmap_choice, extent=(-zoom, zoom, -zoom, zoom))
plt.axis('off')
plt.tight_layout()

# Generate a unique filename using the random 'c' values
filename = f'julia_set_{c_real:.2f}_{c_imag:.2f}.png'

# Save the figure instead of showing it
plt.savefig(filename, dpi=300)
print(f"Image saved to: {os.path.abspath(filename)}")

# Optionally close the figure to free memory
plt.close()
