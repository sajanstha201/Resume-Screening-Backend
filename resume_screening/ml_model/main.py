from .data_preprocessing import lemmatize_text
from .evaluation_function import find_cosine_similairty, calculate_match_score,find_cosine_similarity2
import math
import pandas as pd
#use this function when a critical key is not given as a seprate file
def rating(jb_description,resume_dict):
    critical_keyword=lemmatize_text(jb_description)
    score_dict={}
    for key,resume in resume_dict.items():
        lemmatized_resume=lemmatize_text(resume)
        match_score=calculate_match_score(critical_list=critical_keyword,text_list=lemmatized_resume)
        similar_score=find_cosine_similarity2(jb_description,resume)
        score_dict[key]=math.ceil(match_score*10)
    ordered_score=ordering_dict(score_dict)
    return ordered_score,make_pdf(ordered_score)

#use this function when the user give a seprate file for critical keyword
def rating2(jb_description,resume_dict,critical_keywords):
    score_dict={}
    critical_keywords=lemmatize_text(critical_keywords)
    for key,resume in resume_dict.items():
        lemmatized_resume=lemmatize_text(resume)
        match_score=calculate_match_score(critical_list=critical_keywords,text_list=lemmatized_resume)
        similar_score=find_cosine_similarity2(jb_description,resume)
        score_dict[key]=math.ceil((similar_score+match_score*3)/4*10)
    ordered_score=ordering_dict(score_dict)
    return ordered_score,make_pdf(ordered_score)

def ordering_dict(score):
    new_dict={}
    for i in range(0,len(score)):
        max_key=next(iter(score))
        for key,value in score.items():
            if(score[max_key]<score[key]):
                max_key=key
        new_dict[max_key]=score[max_key]
        score.pop(max_key)
    for key,value in new_dict.items():
        if(value>10):
            new_dict[key]=10
    return new_dict
def make_pdf(score):
    key_list=[]
    value_list=[]
    for key,value in score.items():
        key_list.append(key)
        value_list.append(value)
    pdf_dict={
        'Name of applicant':key_list,
        'Rating':value_list
    }
    return pd.DataFrame(pdf_dict)

if __name__=='__main__':
    d={'sajan shrestha':20,
        'abhishek khadka':10,
        'devraj silwal':35}
    print(make_pdf(d))
    