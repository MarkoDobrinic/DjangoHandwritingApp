import os
import json

import numpy as np
from datetime import datetime 
from pprint import pprint
from zipfile import ZipFile

from django.conf import settings
from django.shortcuts import render
from django.views.static import serve
from django.views.decorators.csrf import csrf_exempt
from django.http import Http404, HttpResponse, HttpRequest, JsonResponse, HttpResponseBadRequest
from handwritingapp.utils.utils import convert_coords, get_last_id
from wsgiref.util import FileWrapper

def get_index(request):
    return render(request, 'index.html')
    
@csrf_exempt
def fetch_data(request):

    os.makedirs(os.path.join(os.getcwd(), 'handwritingapp', 'models', 'styles'), exist_ok=True)
    styles_dir = os.path.join(os.getcwd(), 'handwritingapp', 'models', 'styles')
 
    os.makedirs(os.path.join(os.getcwd(), 'handwritingapp', 'models', 'downloads'), exist_ok=True)
    downloads_dir = os.path.join(os.getcwd(), 'handwritingapp', 'models', 'downloads')

    content = json.loads(request.body.decode('utf-8'))

    if request.is_ajax():

        input_text = content.get('input_text')
        
        result =  content.get('moves')

        result = np.array(result)
        result = convert_coords(result)
        print("len: ", len(result))
        
        file_id = get_last_id(styles_dir)

        np.save(os.path.join(styles_dir, 'style-{}-chars.npy'.format(file_id+1)), np.array(bytes(input_text, 'utf-8')))
        np.save(os.path.join(styles_dir, 'style-{}-strokes.npy'.format(file_id+1)), result)

        chars_pth =  os.path.join(styles_dir, 'style-{}-chars.npy'.format(file_id+1))
        styles_pth = os.path.join(styles_dir, 'style-{}-strokes.npy'.format(file_id+1))      
        zip_path = os.path.join(downloads_dir, 'style{}.zip'.format(file_id+1))

        with ZipFile(zip_path, 'w') as zipObj:
            zipObj.write(chars_pth, os.path.basename(chars_pth))
            zipObj.write(styles_pth, os.path.basename(styles_pth))

        return JsonResponse(data = {'result':'OK', 'zip_path': os.path.join(settings.MEDIA_URL, os.path.basename(zip_path))})

    return HttpResponseBadRequest()
