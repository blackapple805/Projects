import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Define the grid size
GRID_SIZE = 100

# Initialize a random grid
def initialize_grid():
    return np.random.choice([0, 1], GRID_SIZE*GRID_SIZE, p=[0.9, 0.1]).reshape(GRID_SIZE, GRID_SIZE)

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

# Set up the figure, axis, and plot element
fig, ax = plt.subplots()
grid = initialize_grid()
img = ax.imshow(grid, interpolation='nearest', cmap='Greens')

# Animation update function
def animate(frame):
    global grid
    grid = update_grid(grid)
    img.set_data(grid)
    return img,

# Animate the simulation
ani = animation.FuncAnimation(fig, animate, frames=100, interval=100, blit=True)

# Save the animation as a video file
ani.save('conway_life.mp4', writer='ffmpeg')

# If you want to save as a GIF, uncomment the line below
# ani.save('conway_life.gif', writer='imagemagick')

plt.show()
