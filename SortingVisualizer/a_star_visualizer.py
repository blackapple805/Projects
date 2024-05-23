import heapq
import os
import time

class Node:
    def __init__(self, position, parent=None):
        self.position = position
        self.parent = parent
        self.g = 0  # Distance from start node
        self.h = 0  # Heuristic distance to end node
        self.f = 0  # Total cost

    def __eq__(self, other):
        return self.position == other.position

    def __lt__(self, other):
        return self.f < other.f

def clear_console():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_grid(grid, path=None):
    if path:
        for position in path:
            grid[position[0]][position[1]] = '*'
    for row in grid:
        print("".join(row))
    print('\n')

def a_star(start, end, grid):
    start_node = Node(start)
    end_node = Node(end)
    
    open_list = []
    closed_list = []
    
    heapq.heappush(open_list, start_node)

    while open_list:
        current_node = heapq.heappop(open_list)
        closed_list.append(current_node)

        if current_node == end_node:
            path = []
            while current_node:
                path.append(current_node.position)
                current_node = current_node.parent
            return path[::-1]  # Return reversed path

        children = []
        for new_position in [(0, -1), (0, 1), (-1, 0), (1, 0)]:  # Adjacent squares
            node_position = (current_node.position[0] + new_position[0], 
                             current_node.position[1] + new_position[1])

            if (node_position[0] > (len(grid) - 1) or 
                node_position[0] < 0 or 
                node_position[1] > (len(grid[len(grid)-1]) - 1) or 
                node_position[1] < 0):
                continue

            if grid[node_position[0]][node_position[1]] != ' ':
                continue

            new_node = Node(node_position, current_node)
            children.append(new_node)

        for child in children:
            if child in closed_list:
                continue

            child.g = current_node.g + 1
            child.h = ((child.position[0] - end_node.position[0]) ** 2) + ((child.position[1] - end_node.position[1]) ** 2)
            child.f = child.g + child.h

            if len([open_node for open_node in open_list if child == open_node and child.g > open_node.g]) > 0:
                continue

            heapq.heappush(open_list, child)

    return None

if __name__ == "__main__":
    grid = [['█', '█', '█', '█', '█', '█', '█', '█', '█', '█'],
            ['█', ' ', ' ', ' ', '█', ' ', ' ', ' ', ' ', '█'],
            ['█', ' ', '█', ' ', '█', ' ', '█', '█', ' ', '█'],
            ['█', ' ', '█', ' ', ' ', ' ', ' ', '█', ' ', '█'],
            ['█', ' ', '█', '█', '█', '█', ' ', '█', ' ', '█'],
            ['█', ' ', ' ', ' ', ' ', '█', ' ', '█', ' ', '█'],
            ['█', '█', '█', '█', ' ', '█', ' ', '█', ' ', '█'],
            ['█', ' ', ' ', '█', ' ', '█', ' ', '█', ' ', '█'],
            ['█', ' ', ' ', '█', ' ', ' ', ' ', ' ', ' ', '█'],
            ['█', '█', '█', '█', '█', '█', '█', '█', '█', '█']]

    start = (1, 1)
    end = (8, 8)
    
    print("Initial Grid:")
    print_grid(grid)
    time.sleep(2)

    path = a_star(start, end, grid)
    if path:
        print("Path found:")
        print_grid(grid, path)
    else:
        print("No path found.")
