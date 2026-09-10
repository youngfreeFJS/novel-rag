import json,sys,numpy as np,joblib
sys.path.insert(0,'scripts'); import jieba
from sklearn.preprocessing import normalize
emb=np.load('stage_a_analysis/03_vectorstore/embeddings.npy')
meta=json.load(open('stage_a_analysis/03_vectorstore/meta.json'))
texts=json.load(open('stage_a_analysis/03_vectorstore/texts.json'))
vec=joblib.load('stage_a_analysis/03_vectorstore/tfidf.joblib')
svd=joblib.load('stage_a_analysis/03_vectorstore/svd.joblib')
def search(q,k=5):
    qv=normalize(svd.transform(vec.transform([' '.join(jieba.lcut(q))])))[0]
    sims=emb@qv; idx=np.argsort(-sims)[:k]
    return [{'score':round(float(sims[i]),3),'chapter':meta[i]['chapter'],
             'title':meta[i]['title'],'pos':meta[i]['pos'],
             'text':texts[i][:220]} for i in idx]
queries=['聚宝盆炼化丹药强化法宝','乔慧珠与贺平生的婚约','筑基结丹突破天劫',
         '王敦灵药谷初遇','萧家萧不凡的恩怨','秘境夺宝厮杀','温不晚的情感线',
         '化神期大战龙蛟']
demo=[{'query':q,'results':search(q)} for q in queries]
json.dump(demo,open('stage_a_analysis/retrieval_demo.json','w'),ensure_ascii=False,indent=1)
print('retrieval demo queries:',len(demo))
for d in demo[:2]:
    print('Q:',d['query']); 
    for r in d['results'][:2]: print(f"   [{r['score']}] 第{r['chapter']}章 {r['text'][:30]}")
