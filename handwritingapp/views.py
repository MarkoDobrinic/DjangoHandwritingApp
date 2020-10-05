from django.http import Http404, HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
import numpy as np
import os
import json
from datetime import datetime 
from pprint import pprint

from django.views.decorators.csrf import csrf_exempt
from handwritingapp.utils.utils import convert_coords, get_last_id

def get_index(request):
    return render(request, 'index.html')
    
@csrf_exempt
def fetch_data(request):

    os.makedirs(os.path.join(os.getcwd(), 'handwritingapp', 'models', 'styles'), exist_ok=True)
    styles_dir = os.path.join(os.getcwd(), 'handwritingapp', 'models', 'styles')

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

        return JsonResponse(data = {'result':'OK'})

    return HttpResponseBadRequest()
