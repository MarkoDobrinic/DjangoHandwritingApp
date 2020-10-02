from django.http import Http404, HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
import numpy as np
import os
from datetime import datetime 

from django.views.decorators.csrf import csrf_exempt
from handwritingapp.utils.utils import convert_coords, get_last_id

STYLES_PATH = os.path.join(os.path.sep, 'home', 'src', 'handwritingapp', 'models', 'styles')

def get_index(request):
    return render(request, 'index.html')
    
@csrf_exempt
def fetch_data(request):
    os.makedirs(STYLES_PATH, exist_ok=True)
    
    if request.is_ajax():
        result = []
        input_text = request.POST.get('input_text')

        for key, value in enumerate(request.POST):
            if value == "input_text":
                continue
            result.append([int(val) for val in request.POST.getlist(value)])
        
        result = np.array(result)
        result = convert_coords(result)

        file_id = get_last_id(STYLES_PATH)
        np.save(os.path.join(STYLES_PATH, 'style-{}-chars.npy'.format(file_id+1)), np.array(bytes(input_text, 'utf-8')))
        np.save(os.path.join(STYLES_PATH, 'style-{}-strokes.npy'.format(file_id+1)), result)
        return JsonResponse(data = {'result':'OK'})

    return HttpResponseBadRequest()
