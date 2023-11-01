import numpy as np
import imageio

def normalize_image(img):
    """
    Normalize image values to be between 0 and 255
    """
    img_min = np.min(img)
    img_max = np.max(img)
    return ((img - img_min) / (img_max - img_min) * 255).astype(np.uint8)

# Load the image
image = imageio.imread('gy_and_gx_divided.png')

# Assuming the image is grayscale. If it's RGB, convert to grayscale
if len(image.shape) == 3 and image.shape[2] == 3:
    image = np.dot(image[..., :3], [0.2989, 0.5870, 0.1140])

# Compute the arctan of the image values
# The output of np.arctan is ensured to be between -π/2 and π/2
arctan_image = np.arctan(image)

# Normalize the arctan image
normalized_arctan_image = normalize_image(arctan_image)

# Save the result
imageio.imsave('normalized_arctan_output.png', normalized_arctan_image)

