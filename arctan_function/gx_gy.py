import cv2
import numpy as np

# Load the image
image = cv2.imread('gy_and_gx_divided.png', cv2.IMREAD_GRAYSCALE)

# Sobel Edge Detection
sobelx = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
sobely = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
sobel_mag = np.hypot(sobelx, sobely)
sobel_mag = (sobel_mag / sobel_mag.max() * 255).astype(np.uint8)  # Normalize to 8-bit

# Canny Edge Detection
canny_edges = cv2.Canny(image, 100, 200)  # You can adjust the threshold values

# Save results
cv2.imwrite('sobel_edge_detection.png', sobel_mag)
cv2.imwrite('canny_edge_detection.png', canny_edges)
