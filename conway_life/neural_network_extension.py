import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.colors as mcolors
import logging

logging.basicConfig(level=logging.DEBUG)

# Define the grid size
GRID_SIZE = 100

# Initialize a grid with a specific pattern
def initialize_grid():
    logging.info("Initializing grid with a symmetric pattern")
    grid = np.zeros((GRID_SIZE, GRID_SIZE), dtype=int)
    # Symmetric pattern (example, can be adjusted for different patterns)
    pattern = [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0]
    ]
    pattern = np.array(pattern)
    # Place the pattern in the middle of the grid
    start = (GRID_SIZE - pattern.shape[0]) // 2
    grid[start:start + pattern.shape[0], start:start + pattern.shape[1]] = pattern
    return grid

# Update the grid based on Conway's rules
def update_grid(grid):
    new_grid = grid.copy()
    for i in range(GRID_SIZE):
        for j in range(GRID_SIZE):
            total = int((grid[i, (j-1)%GRID_SIZE] + grid[i, (j+1)%GRID_SIZE] +
                         grid[(i-1)%GRID_SIZE, j] + grid[(i+1)%GRID_SIZE, j] +
                         grid[(i-1)%GRID_SIZE, (j-1)%GRID_SIZE] + grid[(i-1)%GRID_SIZE, (j+1)%GRID_SIZE] +
                         grid[(i+1)%GRID_SIZE, (j-1)%GRID_SIZE] + grid[(i+1)%GRID_SIZE, (j+1)%GRID_SIZE]))
            if grid[i, j] == 1:
                if (total < 2) or (total > 3):
                    new_grid[i, j] = 0
            else:
                if total == 3:
                    new_grid[i, j] = 1
    return new_grid

# Define a simple neural network
class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(GRID_SIZE*GRID_SIZE, 128)
        self.fc2 = nn.Linear(128, GRID_SIZE*GRID_SIZE)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.sigmoid(self.fc2(x))
        return x

# Initialize neural network, loss function, and optimizer
model = SimpleNN()
criterion = nn.MSELoss()
optimizer = optim.SGD(model.parameters(), lr=0.01)

# Initialize the grid
grid = initialize_grid()

# Training the neural network (dummy example)
for epoch in range(100):
    inputs = torch.tensor(grid.flatten(), dtype=torch.float32)
    targets = torch.tensor(update_grid(grid).flatten(), dtype=torch.float32)

    optimizer.zero_grad()
    outputs = model(inputs)
    loss = criterion(outputs, targets)
    loss.backward()
    optimizer.step()

    grid = outputs.detach().numpy().reshape(GRID_SIZE, GRID_SIZE)

# Set up the figure, axis, and plot element
fig, ax = plt.subplots()

# Create a custom colormap: black background, green cells
cmap = mcolors.ListedColormap(['black', 'green'])

img = ax.imshow(grid, interpolation='nearest', cmap=cmap, vmin=0, vmax=1)

# Animation update function
def animate(frame):
    global grid
    grid = update_grid(grid)
    img.set_data(grid)
    return img,

# Animate the simulation
ani = animation.FuncAnimation(fig, animate, frames=100, interval=100, blit=True)

# Save the animation as a high-quality video file
try:
    logging.info("Saving the animation as a high-quality video file")
    Writer = animation.writers['ffmpeg']
    writer = Writer(fps=30, metadata=dict(artist='Me'), bitrate=1800)
    ani.save('neural_network_extension_high_quality.mp4', writer=writer)
except Exception as e:
    logging.error(f"Error while saving the animation: {e}")

# If you want to save as a GIF, uncomment the line below
# try:
#     logging.info("Saving the animation as a GIF file")
#     ani.save('neural_network_extension_high_quality.gif', writer='imagemagick')
# except Exception as e:
#     logging.error(f"Error while saving the animation: {e}")

plt.show()
