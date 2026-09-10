import re, json, os
t=open('source/raw.txt',encoding='utf-8').read()
lines=t.split('\n')
ad=re.compile(r'(ixdzs|电子书Txt|请访问|E-mail|章节内容开始|内容简介：|『状态)')
t='\n'.join(ln for ln in lines if not ad.search(ln))
# split on inline chapter markers anywhere
marker=re.compile(r'第\s*(\d+)\s*章\s*([^\n]*)')
matches=list(marker.finditer(t))
chapters=[]
for i,m in enumerate(matches):
    num=int(m.group(1)); title=m.group(2).strip()
    start=m.end()
    end=matches[i+1].start() if i+1<len(matches) else len(t)
    body=t[start:end].strip()
    chapters.append({'chapter':num,'title':title,'text':body})
total=sum(len(c['text']) for c in chapters)
json.dump([{'chapter':c['chapter'],'title':c['title'],'chars':len(c['text'])} for c in chapters],
          open('stage_a_analysis/02_entities/chapters.json','w'),ensure_ascii=False)
json.dump(chapters,open('stage_a_analysis/chapters_full.json','w'),ensure_ascii=False)
nums=[c['chapter'] for c in chapters]
print('chapters:',len(chapters),'range',min(nums),'-',max(nums))
print('total body chars:',total,'avg',total//len(chapters))
# gaps
missing=sorted(set(range(min(nums),max(nums)+1))-set(nums))
print('missing count:',len(missing),'first few:',missing[:10])
print('samples:',[(c['chapter'],c['title']) for c in chapters[:2]+chapters[100:102]])
