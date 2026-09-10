import json,re
chs=json.load(open('stage_a_analysis/chapters_full.json'))
maxch=max(c['chapter'] for c in chs)
SIZE=700; OVER=120
def split_body(txt):
    # split by paragraphs first, then pack to ~SIZE with overlap
    paras=[p.strip() for p in txt.split('\n') if p.strip()]
    chunks=[]; buf=''
    for p in paras:
        if len(buf)+len(p) <= SIZE:
            buf += p
        else:
            if buf: chunks.append(buf)
            if len(p)>SIZE:
                # hard wrap long paragraph
                for i in range(0,len(p),SIZE-OVER):
                    chunks.append(p[i:i+SIZE])
                buf=''
            else:
                buf=p
    if buf: chunks.append(buf)
    # add overlap by prefixing tail of previous
    out=[]
    for i,c in enumerate(chunks):
        if i>0:
            c=chunks[i-1][-OVER:]+c
        out.append(c)
    return out
recs=[]
for c in chs:
    parts=split_body(c['text'])
    for j,txt in enumerate(parts):
        recs.append({'id':f"ch{c['chapter']:04d}_{j:03d}",'chapter':c['chapter'],
                     'title':c['title'],'chunk_idx':j,
                     'pos':round(c['chapter']/maxch,4),'text':txt})
with open('stage_a_analysis/01_chunks/chunks.jsonl','w') as f:
    for r in recs: f.write(json.dumps(r,ensure_ascii=False)+'\n')
print('chunks:',len(recs))
print('avg chunk len:',sum(len(r['text']) for r in recs)//len(recs))
print('sample id:',recs[0]['id'],'| pos',recs[0]['pos'])
