"""Offline backup checks/recovery. Never changes a Spawn world or existing saves."""
import argparse,json,hashlib,sqlite3
from pathlib import Path
def digest_file(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        while chunk:=f.read(1024*1024):h.update(chunk)
    return h.hexdigest()
def quote(s):return '"'+s.replace('"','""')+'"'
def reconstruct(snapshot,target):
    if target.exists():raise RuntimeError('Refusing to overwrite existing destination')
    db=sqlite3.connect(str(target))
    try:
        db.execute('PRAGMA foreign_keys=OFF')
        for item in snapshot['schema']:
            if item['type']=='table' and item['name']!='sqlite_sequence' and item['sql']:db.execute(item['sql'])
        for table in snapshot['tables']:
            db.execute('DELETE FROM '+quote(table['name']))
            cols=table['columns'];sql='INSERT INTO '+quote(table['name'])+' ('+','.join(quote(c['name']) for c in cols)+') VALUES ('+','.join('?' for c in cols)+')'
            rows=[[bytes.fromhex(row['v'+str(i)]) if row['t'+str(i)]=='blob' else row['v'+str(i)] for i in range(len(cols))] for row in table['rows']]
            db.executemany(sql,rows)
            if db.execute('SELECT count(*) FROM '+quote(table['name'])).fetchone()[0]!=len(rows):raise RuntimeError('Row count mismatch')
        for item in snapshot['schema']:
            if item['type'] in ('index','view','trigger') and item['sql']:db.execute(item['sql'])
        db.commit()
        if db.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise RuntimeError('SQLite integrity check failed')
    finally:db.close()
def main():
    parser=argparse.ArgumentParser(description=__doc__);commands=parser.add_subparsers(dest='command',required=True)
    p=commands.add_parser('verify');p.add_argument('archive_manifest',type=Path);p.add_argument('download_directory',type=Path)
    p=commands.add_parser('verify-files');p.add_argument('file_manifest',type=Path);p.add_argument('extraction_directory',type=Path)
    p=commands.add_parser('database');p.add_argument('encrypted_snapshot',type=Path);p.add_argument('key_file',type=Path);p.add_argument('new_sqlite_file',type=Path)
    p=commands.add_parser('decrypt');p.add_argument('encrypted_snapshot',type=Path);p.add_argument('key_file',type=Path);p.add_argument('new_output_file',type=Path)
    args=parser.parse_args()
    if args.command=='verify':
        entries=json.loads(args.archive_manifest.read_text())
        for e in entries:
            path=args.download_directory/e['file']
            if path.stat().st_size!=e['bytes'] or digest_file(path)!=e['sha256']:raise RuntimeError('Archive hash mismatch: '+e['file'])
        print('Verified '+str(len(entries))+' archive SHA-256 hashes.')
    elif args.command=='verify-files':
        entries=json.loads(args.file_manifest.read_text());count=0
        for e in entries:
            if 'status' in e and e['status']!='downloaded':continue
            name='hosted-assets/'+e['file'] if 'reference' in e else e['path'];path=args.extraction_directory/name
            if path.stat().st_size!=e['bytes'] or digest_file(path)!=e['sha256']:raise RuntimeError('File hash mismatch: '+name)
            count+=1
        print('Verified '+str(count)+' file references.')
    else:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        raw=args.encrypted_snapshot.read_bytes()
        if raw[:8]!=b'WSPBK001':raise RuntimeError('Unsupported encrypted snapshot')
        key=bytes.fromhex(args.key_file.read_text().strip())
        clear=AESGCM(key).decrypt(raw[8:20],raw[20:],b'WHISPERS-SPAWN-BACKUP-AES256GCM-v1')
        if args.command=='database':
            reconstruct(json.loads(clear),args.new_sqlite_file)
            print('Recovered a new local SQLite database; integrity_check passed. No remote writes performed.')
        else:
            with args.new_output_file.open('xb') as f:f.write(clear)
            print('Decrypted into a new local file. No remote writes performed.')
if __name__=='__main__':main()
