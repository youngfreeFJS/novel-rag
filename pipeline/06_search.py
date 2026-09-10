import json,sys,numpy as np,joblib,re
sys.path.insert(0,'scripts'); import jieba
from sklearn.preprocessing import normalize
emb=np.load('stage_a_analysis/03_vectorstore/embeddings.npy')
meta=json.load(open('stage_a_analysis/03_vectorstore/meta.json'))
texts=json.load(open('stage_a_analysis/03_vectorstore/texts.json'))
vec=joblib.load('stage_a_analysis/03_vectorstore/tfidf.joblib')
svd=joblib.load('stage_a_analysis/03_vectorstore/svd.joblib')
def search(q,k=5,max_pos=1.0):
    qv=normalize(svd.transform(vec.transform([' '.join(jieba.lcut(q))])))[0]
    sims=emb@qv
    idx=np.argsort(-sims)
    out=[]
    for i in idx:
        if meta[i]['pos']>max_pos: continue
        out.append((float(sims[i]),meta[i],texts[i]))
        if len(out)>=k: break
    return out
if __name__=='__main__':
    for q in ['聚宝盆炼化丹药','贺平生与王敦结拜兄弟情','筑基突破渡劫','乔慧珠的感情']:
        print('\n#Q:',q)
        for s,m,t in search(q,3):
            print(f"  [{s:.3f}] 第{m['chapter']}章《{m['title']}》 {t[:50]}")
