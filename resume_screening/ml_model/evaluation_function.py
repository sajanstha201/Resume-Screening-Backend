# from transformers import BertTokenizer,TFBertModel
from sklearn.metrics.pairwise import cosine_similarity
# from sklearn.feature_extraction.text import TfidfVectorizer
import sys
# def find_cosine_similairty(text1,text2):
#     if not text1 or not text2:
#         return 0
#     tokenizer=BertTokenizer.from_pretrained('bert-base-uncased')
#     model=TFBertModel.from_pretrained('bert-base-uncased')
#     output1=model(tokenizer(text1,return_tensors='tf',padding=True,truncation=True))
#     output2=model(tokenizer(text2,return_tensors='tf',padding=True,truncation=True))
#     score=cosine_similarity(output1[1][0].numpy().reshape(1,-1),output2[1][0].numpy().reshape(1,-1))
#     score= score if score>0.5 else 0
#     return score

def calculate_match_score(critical_list,text_list):
    n_of_keyword_match=sum(1 for key in critical_list if key in text_list)
    keyword_score=n_of_keyword_match/(len(critical_list)+ sys.float_info.epsilon)
    return keyword_score

# def find_cosine_similarity2(text1,text2):
#     vectorizer=TfidfVectorizer(stop_words='english')
#     tfidf_matrix=vectorizer.fit_transform([text1,text2])
#     similarity_matrix=cosine_similarity(tfidf_matrix[0],tfidf_matrix[1])
#     return similarity_matrix[0][0]