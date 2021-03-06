import numpy as np
import os

def convert_coords(input_arr):
    input_arr = input_arr.astype(np.float64)

    input_arr_shifted = np.roll(input_arr[:, 0:2], shift=1, axis=0)
    input_arr_shifted[0] = input_arr[0, 0:2]
    relative_coordinates = input_arr[:, 0:2] - input_arr_shifted
    relative_coordinates = np.append(relative_coordinates, input_arr[:, 2].reshape((-1, 1)), axis=1)

    relative_coordinates[:,1] *= -1

    relative_coordinates[:, 0:2] += np.random.normal(0, 0.08, size=(relative_coordinates.shape[0], 2))

    relative_coordinates[:, 0] /= np.std(relative_coordinates[:, 0])
    relative_coordinates[:, 0] *= 1.6

    relative_coordinates[:, 1] /= np.std(relative_coordinates[:, 1])
    relative_coordinates[:, 1] *= 1.8

    return relative_coordinates


def get_last_id(req_dir):

    files = os.listdir(req_dir)
    nums = []
    for file in files:
        num = int(file.split('-')[1])
        nums.append(num)

    return max(nums) if len(nums) > 0 else -1