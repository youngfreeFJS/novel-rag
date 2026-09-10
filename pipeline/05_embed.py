import json,sys,numpy as np,time,re
sys.path.insert(0,'scripts')
import jieba
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
import joblib
recs=[json.loads(l) for l in open('stage_a_analysis/01_chunks/chunks.jsonl')]
texts=[r['text'] for r in recs]
print('tokenizing',len(texts),'chunks...',flush=True)
def tok(s): return [w for w in jieba.lcut(s) if w.strip() and not re.match(r'^[\s\W_]+$',w)]
t0=time.time()
corpus=[' '.join(tok(t)) for t in texts]
print('tokenized in',round(time.time()-t0),'s',flush=True)
vec=TfidfVectorizer(max_features=60000,token_pattern=r'(?u)\S+',min_df=2)
X=vec.fit_transform(corpus)
print('tfidf',X.shape,flush=True)
DIM=256
svd=TruncatedSVD(n_components=DIM,random_state=42)
emb=svd.fit_transform(X)
emb=normalize(emb).astype('float32')
print('svd emb',emb.shape,'explained var',round(float(svd.explained_variance_ratio_.sum()),3),flush=True)
np.save('stage_a_analysis/03_vectorstore/embeddings.npy',emb)
joblib.dump(vec,'stage_a_analysis/03_vectorstore/tfidf.joblib')
joblib.dump(svd,'stage_a_analysis/03_vectorstore/svd.joblib')
meta=[{k:r[k] for k in ('id','chapter','title','chunk_idx','pos')} for r in recs]
json.dump(meta,open('stage_a_analysis/03_vectorstore/meta.json','w'),ensure_ascii=False)
json.dump(texts,open('stage_a_analysis/03_vectorstore/texts.json','w'),ensure_ascii=False)
print('vector store saved: dim',DIM,flush=True)
