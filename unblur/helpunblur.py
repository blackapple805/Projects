import numpy as np
import cv2

def sharpen_image_heavily(img):
    # Define a heavy sharpening kernel
    sharpening_kernel = np.array([
        [-1, -1, -1],
        [-1, 9, -1],
        [-1, -1, -1]
    ])
    return cv2.filter2D(img, -1, sharpening_kernel)

def enhance_contrast(img):
    # Convert to float for operations, then clip and convert back to uint8
    img_float = np.clip(img.astype(np.float32) * 1.5 - 50.0, 0, 255).astype(np.uint8)  # Adjusted the scaling and offset

    # Apply adaptive histogram equalization
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast_enhanced = clahe.apply(img_float)

    return contrast_enhanced

def reduce_contrast(img, alpha=0.5, beta=40):
    return cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

def threshold_image(img, threshold_value=160): # Added a thresholding function
    _, threshed = cv2.threshold(img, threshold_value, 255, cv2.THRESH_BINARY)
    return threshed

def main():
    # Load the image
    img = cv2.imread('blurred_image.jpg', 0)  # replace 'your_input_image_path' with your image path

    # Heavily sharpen the image
    sharpened = sharpen_image_heavily(img)

    # Enhance the contrast of the sharpened image
    contrasted = enhance_contrast(sharpened)

    # Reduce the contrast
    contrast_reduced = reduce_contrast(contrasted)

    # Apply thresholding
    thresholded = threshold_image(contrast_reduced)

    # Combine thresholded and contrasted images to maintain sharpness without over-brightening
    combined = cv2.addWeighted(contrasted, 0.7, thresholded, 0.3, 0)  # 70% of the contrasted image and 30% of the thresholded image

    # Save the result
    cv2.imwrite('adjusted_image.jpg', combined)

if __name__ == '__main__':
    main()
