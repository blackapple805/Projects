import numpy as np
import cv2

def double_fft(image_path):
    # Load the image in grayscale
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Perform the first FFT and shift the zero frequency component to the center
    f_transform = np.fft.fft2(image)
    f_shift = np.fft.fftshift(f_transform)

    # Perform the second FFT on the shifted image
    inv_shift = np.fft.ifftshift(f_shift)
    inv_image = np.fft.ifft2(inv_shift)
    inv_image = np.abs(inv_image)  # Take the absolute to remove any imaginary components

    # Normalize the image to the range [0, 255]
    normalized_image = cv2.normalize(inv_image, None, 0, 255, cv2.NORM_MINMAX)
    output_image = np.uint8(normalized_image)

    return output_image

def rotate_image(image, angle):
    (h, w) = image.shape[:2]
    center = (w / 2, h / 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h))
    return rotated

def invert_image(image):
    inverted = cv2.bitwise_not(image)  # Inverts all the bits in the image
    return inverted

def add_margin(image, margin_size):
    """Adds a green margin to the right and bottom of the image."""
    h, w = image.shape[:2]
    
    # If the image is grayscale, convert it to 3-channel (RGB)
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    
    # Green background
    background = np.ones((h + margin_size, w + margin_size, 3)) * [0, 255, 0]  # [B, G, R] for OpenCV
    background[:h, :w] = image
    return background

# Load and process the image
image_path = 'photo.png'
result = double_fft(image_path)

# Generate the rotated and inverted versions
rotated_result = rotate_image(result, 180)
inverted_result = invert_image(result)

# Add margins to images
margin_size = 20
result_with_margin = add_margin(result, margin_size)
rotated_with_margin = add_margin(rotated_result, margin_size)
inverted_with_margin = add_margin(inverted_result, margin_size)  # Add margin to the inverted result as well

# Concatenate images horizontally
combined_output = np.hstack((result_with_margin, rotated_with_margin, inverted_with_margin))  # Use the updated inverted result with margin

# Save the combined result
cv2.imwrite('combined_output.png', combined_output)