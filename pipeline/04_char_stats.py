import json,collections,itertools
chs=json.load(open('stage_a_analysis/chapters_full.json'))
chs=sorted(chs,key=lambda c:c['chapter'])
maxch=max(c['chapter'] for c in chs)
CHARS=['贺平生','王敦','乔慧珠','骆冰瑶','辛宝宝','温不晚','周青眉','金苦','玉宁','苏真真',
'赵灵儿','韩厚止','炼霓虹','明日月','计无心','梁画秋','南七七','苏暮雨','九皇子','韦同',
'乔小乔','商曦红','徐昆仑','田小青','金刚妖帝','顾白蘋','桃碧芙','苏念','陆晓慈','凤帝',
'采石仙君','郝云','青玄','张老大']
stats={c:{'freq':0,'first':None,'last':None,'chapters':0,'series':[0]*(maxch+1)} for c in CHARS}
cooc=collections.Counter()
for c in chs:
    ch=c['chapter']; txt=c['text']
    present=[]
    for name in CHARS:
        cnt=txt.count(name)
        if cnt>0:
            s=stats[name]; s['freq']+=cnt; s['chapters']+=1
            if s['first'] is None: s['first']=ch
            s['last']=ch; s['series'][ch]+=cnt
            if cnt>=2: present.append(name)
    for a,b in itertools.combinations(sorted(present),2):
        cooc[(a,b)]+=1
# rank
ranked=sorted(CHARS,key=lambda n:-stats[n]['freq'])
out=[]
for n in ranked:
    s=stats[n]
    out.append({'name':n,'freq':s['freq'],'first_chapter':s['first'],
                'last_chapter':s['last'],'chapters_present':s['chapters'],
                'span':(s['last']-s['first']+1) if s['first'] else 0})
json.dump(out,open('stage_a_analysis/02_entities/characters.json','w'),ensure_ascii=False,indent=1)
# downsample series into 60 bins for timeline viz
BINS=60
def binize(series):
    b=[0]*BINS
    for ch in range(1,maxch+1):
        b[min(BINS-1,(ch-1)*BINS//maxch)]+=series[ch]
    return b
tl={n:binize(stats[n]['series']) for n in ranked}
json.dump({'bins':BINS,'maxch':maxch,'timeline':tl},
          open('stage_a_analysis/02_entities/timeline.json','w'),ensure_ascii=False)
# edges among top 22
topN=ranked[:22]
edges=[]
for (a,b),w in cooc.items():
    if a in topN and b in topN and w>=5:
        edges.append({'source':a,'target':b,'weight':w})
json.dump({'nodes':[{'name':n,'freq':stats[n]['freq']} for n in topN],'edges':edges},
          open('stage_a_analysis/02_entities/network.json','w'),ensure_ascii=False,indent=1)
print('CHARACTER RANKING (freq / first-ch / #chapters / span):')
for r in out: print(f"  {r['name']:6s} freq={r['freq']:5d}  first=ch{str(r['first_chapter']):>4}  in {r['chapters_present']:4d} chapters  span={r['span']}")
print('\nnetwork edges:',len(edges))
