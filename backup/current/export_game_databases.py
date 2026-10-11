import sys,json,hashlib,datetime,time,os
from pathlib import Path
sys.path.insert(0,r'C:\Users\drago\Documents\Codex\2026-10-06\you-re-joining-whispers-on-spawn\work\spawn')
import spawn_tools,secret_store
ROOT=Path(__file__).resolve().parent.parent
OUT=Path(os.environ.get('WHISPERS_BACKUP_OUTPUT_DIR',str(ROOT/'work/full-game-backup'))); OUT.mkdir(parents=True,exist_ok=True)
WORLD='acbda8f4-161f-4a83-bea7-f338a1cfd22a'
def query(db,sql):
    answer=spawn_tools.request('POST',f'/api/sdk/v1/{WORLD}/agent/db',{'database':db,'statements':[{'sql':sql}]})
    if not answer.get('ok'):raise RuntimeError('Database query did not succeed')
    return answer['results'][0]['rows']
def q(value):return '"'+value.replace('"','""')+'"'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
me=spawn_tools.request('GET','/api/agent/v1/me')
# Do not write identity or account response into public backup metadata.
text=json.dumps(me)
if WORLD not in text or 'spaiber' not in text:raise RuntimeError('Expected existing account/world not present')
print('Existing spaiber account and target world verified',flush=True)
selected=os.environ.get('WHISPERS_BACKUP_DATABASE')
if selected not in (None,'dev','live'):raise RuntimeError('Invalid selected database')
databases=(selected,) if selected else ('dev','live')
manifest_path=OUT/'database-manifest.json'
summary=[e for e in json.loads(manifest_path.read_text()) if e['database'] not in databases] if selected and manifest_path.exists() else []
for db in databases:
    snapshot={'format':'spawn-readonly-typed-rows-v1','database':db,'world':WORLD,'startedAt':now(),'schema':query(db,"SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name"),'tables':[]}
    # Platform internals are now explicitly refused by the supported SQL door.
    omitted={v['name'] for v in snapshot['schema'] if v['type']=='table' and v['name'].startswith('_')}
    snapshot['excludedPlatformTables']=sorted(omitted)
    snapshot['scope']='game tables and their schema; platform internals excluded'
    snapshot['schema']=[v for v in snapshot['schema'] if v['name'] not in omitted and v['tbl_name'] not in omitted]
    for item in snapshot['schema']:
        if item['type']!='table':continue
        name=item['name']
        cols=query(db,"SELECT name,type,pk FROM pragma_table_info('"+name.replace("'","''")+"')")
        before=query(db,'SELECT count(*) AS n FROM '+q(name))[0]['n']
        select=[]
        for i,col in enumerate(cols):
            c=q(col['name']);select.extend([f'typeof({c}) AS t{i}',f'CASE WHEN typeof({c}) = \'blob\' THEN hex({c}) ELSE {c} END AS v{i}'])
        order=','.join(q(c['name']) for c in sorted(cols,key=lambda c:c['pk']) if c['pk']) or 'rowid'
        rows=[];offset=0
        while True:
            page=query(db,'SELECT '+','.join(select)+' FROM '+q(name)+' ORDER BY '+order+f' LIMIT 100 OFFSET {offset}')
            rows.extend(page)
            if len(page)<100:break
            offset+=len(page)
        after=query(db,'SELECT count(*) AS n FROM '+q(name))[0]['n']
        snapshot['tables'].append({'name':name,'columns':cols,'countBefore':before,'countAfter':after,'rows':rows})
        print(json.dumps({'database':db,'table':name,'rows':len(rows),'countStable':before==after==len(rows)}),flush=True)
    snapshot['finishedAt']=now()
    raw=json.dumps(snapshot,ensure_ascii=False,separators=(',',':')).encode('utf-8')
    protected=secret_store.protect(raw)
    if secret_store.protect(protected,True)!=raw:raise RuntimeError('Snapshot encryption roundtrip failed')
    target=OUT/f'database-{db}-2026-10-09.json.dpapi'; target.write_bytes(protected)
    if secret_store.protect(target.read_bytes(),True)!=raw:raise RuntimeError('Encrypted file verification failed')
    summary.append({'database':db,'file':target.name,'bytes':len(protected),'sha256':hashlib.sha256(protected).hexdigest(),'tables':len(snapshot['tables']),'rows':sum(len(t['rows']) for t in snapshot['tables']),'countsStable':all(t['countBefore']==t['countAfter']==len(t['rows']) for t in snapshot['tables']),'startedAt':snapshot['startedAt'],'finishedAt':snapshot['finishedAt'],'roundtripVerified':True,'consistency':'paginated reads; not an atomic database transaction','protection':'Windows CurrentUser DPAPI; requires original Windows user DPAPI keys','scope':snapshot['scope'],'excludedPlatformTables':snapshot['excludedPlatformTables']})
    summary.sort(key=lambda e:('dev','live').index(e['database']))
    manifest_path.write_text(json.dumps(summary,indent=2))
print(json.dumps(summary),flush=True)
