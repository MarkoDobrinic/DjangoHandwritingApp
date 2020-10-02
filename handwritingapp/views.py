from django.http import Http404, HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
import numpy as np
import os
from datetime import datetime 

from django.views.decorators.csrf import csrf_exempt
from handwritingapp.utils.utils import convert_coords, get_last_id

def get_index(request):
    return render(request, 'index.html')
    
@csrf_exempt
def fetch_data(request):

    os.makedirs(os.path.join(os.getcwd(), 'handwritingapp', 'models', 'styles'), exist_ok=True)
    styles_dir = os.path.join(os.getcwd(), 'handwritingapp', 'models', 'styles')

    if request.is_ajax():
        result = []
        input_text = request.POST.get('input_text')

        for key, value in enumerate(request.POST):
            if value == "input_text":
                continue
            result.append([float(val) for val in request.POST.getlist(value)])
        
        result = np.array(result)
        result = convert_coords(result)

        file_id = get_last_id(styles_dir)
        np.save(os.path.join(styles_dir, 'style-{}-chars.npy'.format(file_id+1)), np.array(bytes(input_text, 'utf-8')))
        np.save(os.path.join(styles_dir, 'style-{}-strokes.npy'.format(file_id+1)), result)
        return JsonResponse(data = {'result':'OK'})

    return HttpResponseBadRequest()
