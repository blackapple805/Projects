
# Conway's Game of Life with Neural Network Extension

This project visualizes Conway's Game of Life with a neural network extension to evolve its patterns. The animation is saved as a high-quality video file with a black background and green cells.

## Table of Contents

- [Introduction](#introduction)
- [Setup](#setup)
- [Usage](#usage)
- [Code Explanation](#code-explanation)
- [Example Output](#example-output)
- [License](#license)

## Introduction

Conway's Game of Life is a cellular automaton devised by the British mathematician John Horton Conway in 1970. This project extends the classic Game of Life by incorporating a simple neural network to evolve the initial patterns.

## Setup

### Prerequisites

Make sure you have Python 3 installed. You also need to install the following packages:

- numpy
- matplotlib
- torch
- ffmpeg

You can install these packages using pip:

```bash
pip install numpy matplotlib torch ffmpeg-python
```

Additionally, ensure ffmpeg is installed on your system. On Ubuntu, you can install it using:

```bash
sudo apt-get install ffmpeg
```

### Files

The project consists of the following files:

- `conway_life.py`: Basic implementation of Conway's Game of Life.
- `neural_network_extension.py`: Extension of the Game of Life using a neural network.
- `README.md`: Project documentation.

## Usage

### Running the Scripts

1. **Conway's Game of Life**:

    ```bash
    python3 conway_life.py
    ```

2. **Neural Network Extension**:

    ```bash
    python3 neural_network_extension.py
    ```

### Output

After running the scripts, the output will be saved as a video file (`conway_life.mp4` or `neural_network_extension_high_quality.mp4`). The video will show the evolution of the patterns over time.

## Code Explanation

### conway_life.py

This script implements the basic version of Conway's Game of Life. It initializes a random grid and updates it according to Conway's rules.

### neural_network_extension.py

This script extends the basic Game of Life by incorporating a simple neural network to evolve the initial patterns.

1. **Imports**:
    - `torch`, `torch.nn`, `torch.optim`: For defining and training the neural network.
    - `numpy`: For numerical operations.
    - `matplotlib.pyplot`, `matplotlib.animation`, `matplotlib.colors`: For creating and saving animations.
    - `logging`: For logging information and debugging.

2. **Grid Initialization**:
    - `initialize_grid`: Initializes the grid with a symmetric pattern.

3. **Grid Update**:
    - `update_grid`: Updates the grid based on Conway's rules.

4. **Neural Network Definition**:
    - `SimpleNN`: Defines a simple neural network with two fully connected layers.

5. **Training the Neural Network**:
    - Trains the neural network for 100 epochs using a mean squared error loss function and stochastic gradient descent optimizer.

6. **Animation Setup**:
    - Sets up the animation using `matplotlib.animation.FuncAnimation`.

7. **Saving the Animation**:
    - Saves the animation as a high-quality video file using `ffmpeg`.
