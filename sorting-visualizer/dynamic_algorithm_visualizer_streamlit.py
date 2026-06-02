import streamlit as st
import time
import matplotlib.pyplot as plt
import random

def visualize_bubble_sort():
    array = [random.randint(1, 100) for _ in range(20)]
    fig, ax = plt.subplots()
    bar_rects = ax.bar(range(len(array)), array, align="edge")

    def update_fig(array, rects):
        for rect, val in zip(rects, array):
            rect.set_height(val)
        st.pyplot(fig)
        plt.pause(0.1)

    for i in range(len(array)):
        for j in range(len(array) - i - 1):
            if array[j] > array[j + 1]:
                array[j], array[j + 1] = array[j + 1], array[j]
                update_fig(array, bar_rects)

def visualize_quick_sort():
    array = [random.randint(1, 100) for _ in range(20)]
    fig, ax = plt.subplots()
    bar_rects = ax.bar(range(len(array)), array, align="edge")

    def update_fig(array, rects):
        for rect, val in zip(rects, array):
            rect.set_height(val)
        st.pyplot(fig)
        plt.pause(0.1)

    def quick_sort(array, low, high):
        if low < high:
            pi = partition(array, low, high)
            update_fig(array, bar_rects)
            quick_sort(array, low, pi - 1)
            quick_sort(array, pi + 1, high)

    def partition(array, low, high):
        pivot = array[high]
        i = low - 1
        for j in range(low, high):
            if array[j] < pivot:
                i += 1
                array[i], array[j] = array[j], array[i]
        array[i + 1], array[high] = array[high], array[i + 1]
        return i + 1

    quick_sort(array, 0, len(array) - 1)

def visualize_merge_sort():
    array = [random.randint(1, 100) for _ in range(20)]
    fig, ax = plt.subplots()
    bar_rects = ax.bar(range(len(array)), array, align="edge")

    def update_fig(array, rects):
        for rect, val in zip(rects, array):
            rect.set_height(val)
        st.pyplot(fig)
        plt.pause(0.1)

    def merge_sort(array):
        if len(array) > 1:
            mid = len(array) // 2
            L = array[:mid]
            R = array[mid:]

            merge_sort(L)
            merge_sort(R)

            i = j = k = 0

            while i < len(L) and j < len(R):
                if L[i] < R[j]:
                    array[k] = L[i]
                    i += 1
                else:
                    array[k] = R[j]
                    j += 1
                k += 1

            while i < len(L):
                array[k] = L[i]
                i += 1
                k += 1

            while j < len(R):
                array[k] = R[j]
                j += 1
                k += 1

            update_fig(array, bar_rects)

    merge_sort(array)

def visualize_insertion_sort():
    array = [random.randint(1, 100) for _ in range(20)]
    fig, ax = plt.subplots()
    bar_rects = ax.bar(range(len(array)), array, align="edge")

    def update_fig(array, rects):
        for rect, val in zip(rects, array):
            rect.set_height(val)
        st.pyplot(fig)
        plt.pause(0.1)

    for i in range(1, len(array)):
        key = array[i]
        j = i - 1
        while j >= 0 and key < array[j]:
            array[j + 1] = array[j]
            j -= 1
        array[j + 1] = key
        update_fig(array, bar_rects)

def visualize_heap_sort():
    array = [random.randint(1, 100) for _ in range(20)]
    fig, ax = plt.subplots()
    bar_rects = ax.bar(range(len(array)), array, align="edge")

    def update_fig(array, rects):
        for rect, val in zip(rects, array):
            rect.set_height(val)
        st.pyplot(fig)
        plt.pause(0.1)

    def heapify(array, n, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2

        if left < n and array[i] < array[left]:
            largest = left

        if right < n and array[largest] < array[right]:
            largest = right

        if largest != i:
            array[i], array[largest] = array[largest], array[i]
            update_fig(array, bar_rects)
            heapify(array, n, largest)

    def heap_sort(array):
        n = len(array)

        for i in range(n // 2 - 1, -1, -1):
            heapify(array, n, i)

        for i in range(n - 1, 0, -1):
            array[i], array[0] = array[0], array[i]
            update_fig(array, bar_rects)
            heapify(array, i, 0)

    heap_sort(array)

def visualize_selection_sort():
    array = [random.randint(1, 100) for _ in range(20)]
    fig, ax = plt.subplots()
    bar_rects = ax.bar(range(len(array)), array, align="edge")

    def update_fig(array, rects):
        for rect, val in zip(rects, array):
            rect.set_height(val)
        st.pyplot(fig)
        plt.pause(0.1)

    def selection_sort(array):
        for i in range(len(array)):
            min_idx = i
            for j in range(i + 1, len(array)):
                if array[min_idx] > array[j]:
                    min_idx = j
            array[i], array[min_idx] = array[min_idx], array[i]
            update_fig(array, bar_rects)

    selection_sort(array)

st.title("Dynamic Algorithm Visualizer")

algorithm = st.selectbox("Choose Algorithm:", ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort", "Heap Sort", "Selection Sort"])

if st.button("Visualize"):
    if algorithm == "Bubble Sort":
        visualize_bubble_sort()
    elif algorithm == "Quick Sort":
        visualize_quick_sort()
    elif algorithm == "Merge Sort":
        visualize_merge_sort()
    elif algorithm == "Insertion Sort":
        visualize_insertion_sort()
    elif algorithm == "Heap Sort":
        visualize_heap_sort()
    elif algorithm == "Selection Sort":
        visualize_selection_sort()
