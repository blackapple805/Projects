import time
import os

def clear_console():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_array(array):
    for value in array:
        print('|' + '█' * value)
    print('\n')

def bubble_sort(array):
    n = len(array)
    for i in range(n):
        for j in range(0, n-i-1):
            if array[j] > array[j+1]:
                array[j], array[j+1] = array[j+1], array[j]
            clear_console()
            print_array(array)
            time.sleep(0.1)  # Adjust the speed of the visualization

if __name__ == "__main__":
    # Example array to sort
    array = [5, 3, 8, 4, 2, 7, 1, 6]
    print("Initial Array:")
    print_array(array)
    time.sleep(2)
    bubble_sort(array)
    print("Sorted Array:")
    print_array(array)
