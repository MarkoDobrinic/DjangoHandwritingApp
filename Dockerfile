FROM tensorflow/tensorflow:1.6.0-gpu-py3

# OpenCV error: https://github.com/NVIDIA/nvidia-docker/issues/864
RUN apt-get update && apt-get install -y \
    libsm6 \
    libxext6 \
    libxrender-dev \
    git \
    nano \
    python3-tk

COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

WORKDIR /home/src