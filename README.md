# DjangoHandwritingApp

## Google Colab notebook link

https://colab.research.google.com/drive/1yQQQNfEISsQD1DX3tTwe09nafyMRaaSN?usp=sharing

## Virtual environment
```
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py runserver
```
___
## In docker container
### Building docker image
```
docker build . -t handwritingapp
```
### Running docker container
```
docker run \
	--rm \
	--gpus all \
	-it \
	-v /path/to/toplevel/DjangoHandwritingApp:/home/src \ 
	-p 8000:8000 \
	--name handwritingapp \
	handwritingapp \
	bash
```
### Inside docker container run
```
python manage.py runserver 0.0.0.0:8000
```
