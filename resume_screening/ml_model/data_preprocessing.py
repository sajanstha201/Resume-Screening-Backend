import nltk
from pathlib import Path
import os
nltk.download('punkt', download_dir='./nltk_data')
nltk.download('averaged_perceptron_tagger', download_dir='./nltk_data')
nltk.download('wordnet', download_dir='./nltk_data')
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
def remove_common_words(lemmas):
  current_dir=Path(__file__).parent
  with open(os.path.join(current_dir,'common_words_in_jb_description.txt'),'r') as file:
    content=file.read()
  common_words=[]
  [common_words.append(words) for row in content.split('\n') for words in row.split(',')]
  return [lemma for lemma in lemmas if lemma not in common_words]

def lemmatize_text(text):
  lemmatizer=WordNetLemmatizer()
  tokenized_text=word_tokenize(text)
  pos_text=nltk.pos_tag(tokenized_text)
  lemma_list=[]
  for word,pos in pos_text:
    pos_tag=pos[0].lower()
    if pos_tag not in ['v','p','c','i','d','t','w']:
      if pos_tag in ['a','n','r']:
        lemma=lemmatizer.lemmatize(word)
      else:
        lemma=word
      lemma_list.append(lemma)
  lemma_list=[lemma for lemma in lemma_list if lemma not in ['.',',',')','(','!','-']]
  lemma_list_lower=[]
  for lemma in lemma_list:
    lemma_list_lower.append(lemma.lower())
  lemma_list_no_duplicate=[]
  for i in range(0,len(lemma_list_lower)):
    if(lemma_list_lower[i] not in lemma_list_no_duplicate[0:len(lemma_list_no_duplicate)+1]):
      lemma_list_no_duplicate.append(lemma_list_lower[i])
  final_list=remove_common_words(lemma_list_no_duplicate)
  return list(set(final_list))

if __name__=="__main__":
  remove_common_words(['sajan','shresth'])