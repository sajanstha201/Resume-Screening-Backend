from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.http import HttpResponse
from io import BytesIO
import json
from .ml_model.main import rating
from django.views.decorators.csrf import csrf_exempt

def home(request):
    return render(request,'home.html')

def response_(request):
    return JsonResponse({
        'name':'sajan srhesta',
        'age':'30'
    })
    
@csrf_exempt
def rating_response(request):
    data=request.body.decode('utf-8')
    data_dict = json.loads(data)
    job_description=data_dict['job_description']
    resume_detail=data_dict['resume_detail']
    rating_score=rating(jb_description=job_description,resume_dict=resume_detail)
    return JsonResponse(rating_score)

@csrf_exempt
def postRequest(request):
    print('sajan shrestha')
    return HttpResponse('<h1>hello</h1>')

def token_response(request):
    print('token request got successfully')
    return JsonResponse({'token':get_token(request)})