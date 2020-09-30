import numpy as np

def convert_coords(arr):
    input_arr = arr
    input_arr = input_arr.astype(np.float64)
    input_arr[:, 0:2] += np.random.normal(size=(input_arr.shape[0], 2), scale=0.8)

    input_arr_shifted = np.roll(input_arr[:, 0:2], shift=1, axis=0)
    input_arr_shifted[0] = input_arr[0, 0:2]
    relative_coordinates = input_arr[:, 0:2] - input_arr_shifted
    relative_coordinates = np.append(relative_coordinates, input_arr[:, 2].reshape((-1, 1)), axis=1)

    return relative_coordinates