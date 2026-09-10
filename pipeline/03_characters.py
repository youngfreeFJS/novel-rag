import json,re,collections
chs=json.load(open('stage_a_analysis/chapters_full.json'))
maxch=max(c['chapter'] for c in chs)
# High-precision speaker extraction: names before speech verbs
verb=r'(?:道|说道|问道|笑道|冷笑道|沉声道|喝道|叹道|开口|喊道|怒道|冷哼|说|问|喃喃)'
sp=re.compile(r'([一-龥]{2,4})'+verb+r'[：:，]')
# Also honorific-name pattern
cand=collections.Counter()
for c in chs:
    for m in sp.finditer(c['text']):
        cand[m.group(1)]+=1
# clean obvious non-names (leading verbs/pronouns)
stop=set('他她它你我们这那有说的了是不都也就还便又却道向朝被把将会能要没在и之其此为以人个只中大小老者上下前后里外声音心中脸上眼中')
def ok(n):
    if any(ch in stop for ch in n[0]): return False
    if n in ('平生','老大'): return False
    return True
cand2=collections.Counter({k:v for k,v in cand.items() if ok(k) and v>=15})
# merge protagonist variants: 贺平生 core
top=cand2.most_common(80)
print('TOP candidate speakers:')
for n,v in top[:50]: print(f'  {n}\t{v}')
json.dump(dict(top),open('stage_a_analysis/02_entities/_raw_speakers.json','w'),ensure_ascii=False)
