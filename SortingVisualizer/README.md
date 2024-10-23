# A* Pathfinding Visualizer

This project provides a visual representation of the A* pathfinding algorithm using ASCII art in the terminal.

## How It Works

The program finds the shortest path in a grid from a start point to an end point using the A* algorithm. The path is visualized with ASCII characters in the terminal.

## Getting Started

### Prerequisites

- Python 3.x

### Installation

1. Clone the repository or download the script.

    ```bash
    git clone https://github.com/your-username/PathfindingVisualizer.git
    cd PathfindingVisualizer
    ```

2. Ensure you have Python 3 installed on your machine.

### Running the Visualizer

1. Open a terminal and navigate to the directory where the script is located.

    ```bash
    cd PathfindingVisualizer
    ```

2. Run the script.

    ```bash
    python a_star_visualizer.py
    ```

3. You should see the initial grid printed in the terminal, followed by each step of the pathfinding process.

## Customization

- **Change the Grid**: You can modify the `grid` variable in the `main` block to test with different grid layouts.
- **Adjust the Speed**: You can adjust the speed of the visualization by changing the value of `time.sleep(0.1)` in the `a_star` function. A lower value will speed up the visualization, while a higher value will slow it down.
