from django.http import Http404, HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views import View
import numpy as np

from handwritingapp.utils.convert_coordinates import convert_coords

def index(request):
    return render(request, "index.html")

class IndexView(View):
    def get(self, request, *args, **kwargs):
        return render(request, 'index.html')

    def post(self, request, *args, **kwargs):
        try:
            moves = request.POST.get('moves')
            print(moves)
        except:
            raise Http404("Moves do not exist")

        return render(request, 'index.html', {'moves': moves})

def fetch_data(request):
    if request.is_ajax():
        print(request.POST)
        result = []
        for key, value in enumerate(request.POST):
            result.append([int(val) for val in request.POST.getlist(value)])
        result = np.array(result)
        result = convert_coords(result)
        np.save('result.npy', result)
        print(result)
        return JsonResponse({'result':'OK'}, status=200)

    return HttpResponseBadRequest()
