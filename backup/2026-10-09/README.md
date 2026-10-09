# Updated snapshot and recovery — October 9, 2026

The current captured Spawn source is `0174febd8283af5d593db301a53db850448db960`: **636 source files and 2,283 main commits**, including 94 commits newer than the initial backup. GitHub also retains the initial snapshot `db35b6a37c86d7df7783bb4f0d1fcd2cc7a64ece` and its original bundle. The release tag remains attached to the original backup documentation commit; clone current GitHub `main` or the new `whispers-source-main-0174febd.bundle` for the refreshed source.

The release now has **13 attachments, 2,710,623,515 bytes**. Download the complete set described by [continuation/release-archives.json](continuation/release-archives.json). The original nine attachments are retained. Four additions comprise the hosted-asset additions ZIP, the updated full-history source bundle, and two encrypted private archives (original and refreshed).

- Hosted assets: **1,555 unique files, 1,186,374,471 original bytes**, covering 1,567 downloadable references. Three new files are in `whispers-hosted-assets-additions-0174febd.zip`. [The updated asset manifest](continuation/asset-manifest.json) maps every reference to its actual archive, saved file and hash.
- Local libraries: **2,834 files**, including every supplied asset-library file and relevant WHISPERS MMORPG document/package file. All 2,834 source files were rehashed during this continuation; no changed, new or absent file was found. The original four library archives remain current.
- Private snapshots: `WHISPERS_Private_Backup_Latest_0174febd.zip` includes all 22 dev tables / **2,325 rows**, all 8 live tables / **6 rows**, and an AES-256-GCM encrypted bundle of current main plus complete private Spawn-notes ancestry. Current database export ran from 2026-10-09T16:44:21Z to 16:45:19Z. The original encrypted snapshot is also retained. The owner explicitly approved public upload of both encrypted player/account data and private Spawn notes. Only ciphertext and non-sensitive recovery metadata are published; the recovery key stays outside all repositories and archives.

All source-file Git blob hashes and every attachment size/SHA-256 digest are checked against GitHub. Asset ZIP readback, full-history bundle verification, encryption roundtrips, stable per-table export counts and SQLite reconstruction/integrity checks passed. Database reads are paginated and sequential, not an atomic cross-table snapshot. The targeted source/history credential scan found no matches; it does not recognize every possible secret format.

## Recover the updated snapshot

1. Clone GitHub `main` into a new directory, or clone the updated source-only bundle. Download all 13 release attachments.
2. Run `python backup/2026-10-09/restore_backup.py verify backup/2026-10-09/continuation/release-archives.json <download-directory>` to verify every attachment, including encrypted archives.
3. Extract the original seven asset/library ZIP parts and the new hosted-asset additions ZIP into the same new recovery directory. Use `restore_backup.py verify-files` with `continuation/asset-manifest.json` and the original `local-library-manifest.json` to verify recovered files.
4. Extract the refreshed encrypted private archive into a separate directory. With Python's `cryptography` installed, use `restore_backup.py database <snapshot.json.aesgcm> <private-key-file> <new-output.sqlite>` for each database. Use `restore_backup.py decrypt <notes.bundle.aesgcm> <private-key-file> <new-output.bundle>` for the notes bundle. Existing outputs are refused; no remote database writes are performed. Extra DPAPI database copies require the original Windows user's DPAPI keys.
5. Keep the portable recovery key securely offline and separate from ciphertext. Losing this key prevents portable recovery of the encrypted saves and notes. Preserve original pack licenses and provenance. A live Spawn restore requires its supported upload/admin workflow; never force-push stale source or place binary assets in the live Spawn Git tree.

## Updated gaps

The refreshed scan found **1,642 references: 1,567 downloadable and 75 unavailable**. Of the unavailable references, **51 occur in current runtime files and 24 only in historical files/documentation/examples**. Exact names, source locations and storage HTTP failures appear in the [updated asset manifest](continuation/asset-manifest.json) and [audit](continuation/asset-audit.json). Missing immutable storage objects returned 404, including fonts and sound/voice recipes. These bytes cannot be downloaded from those addresses; no replacement was invented or purchased. No downloaded GLB/glTF has external image/buffer dependencies.

The engine 6.0.0 pin/reference and database schema are retained. Spawn's managed engine/server binary, transient rooms, external authentication and other platform services are not exportable through the documented interface. This is a verified dated content/data snapshot, not an independent off-platform server installation. No gameplay, terrain or saves were changed by this backup.

---

The following records describe the preserved **initial** snapshot and its original archive parts; use the continuation metadata above for current totals and recovery.

# Snapshot inventory and recovery

Target: `@whispers/whispers-realm-of-the-nine`, world `acbda8f4-161f-4a83-bea7-f338a1cfd22a`, app `70683675-28ac-43c2-b4bc-889c0d08c4a8`.

Source snapshot: `db35b6a37c86d7df7783bb4f0d1fcd2cc7a64ece`, 636 tracked files, 2,189 commits. The source was fetched again after packaging; no later source commit was present at that check. Source scanning found no matching Spawn/GitHub credentials, AWS key patterns or private-key headers. This targeted scan does not cover every possible secret format.

## Original public backup contents

Nine release attachments, totaling 2,628,539,202 bytes:

- Four `whispers-local-libraries-part-*.zip` archives: all 2,655 files from the supplied 3D Game Engine ASSETS root, plus 179 files in the WHISPERS MMORPG development-document directories and matching original ZIPs. Total original bytes: 1,639,835,923. Original file names, directories, reference images, pack licenses and attribution files are preserved. Other games' development documents are outside this MMORPG backup.
- Three `whispers-hosted-assets-part-*.zip` archives: 1,552 unique files, 1,177,015,359 original bytes, covering 1,564 downloadable current/historical/dynamically assembled references. Each archive extracts under `hosted-assets/files/`. The file name is the SHA-256 of its contents plus the original file type; `asset-manifest.json` maps every reference to its archive, saved file, source and content hash. Existing generated assets were downloaded by their resolved immutable addresses; missing assets were not generated or replaced.
- `whispers-source-main-2026-10-09.bundle`: full original main ancestry. Git bundle verification passed.
- `whispers-engine-reference-and-schema.zip`: the published engine 6.0.0 API reference/skills and the development database table schema. The engine pin is SHA-256 `f9a549e12a59063358e30fdc50e79bcc43cc28f00e66d9327c6d08ad960baf82`. The engine repository publishes vocabulary and guidance, not the managed simulation/server implementation.

`public-archives.json` records exact archive sizes and SHA-256 hashes. Every asset/library file was hashed while backing up and rehashed after reading it from the ZIP. Downloaded GLB/glTF files were checked for external buffer/image URIs; none were found. Nested local ZIP archives were inspected for matching credential patterns in text entries; no matches were found.

## Original encrypted private snapshots

The following original snapshots were exported, encrypted and verified. After the owner explicitly approved public upload of the encrypted player/account data and private Spawn notes, `WHISPERS_Private_Backup_2026-10-09.zip` was uploaded to the release. The recovery key was not uploaded. A refreshed encrypted snapshot is also attached; see the continuation section above.

- Development database: all 22 tables, 2,244 rows.
- Live database: all 8 tables, 6 rows.
- Complete source/Spawn-notes Git bundle, including `refs/notes/spawn` and its ancestry.

Database exports preserve schema and SQLite value types, including BLOBs as hex. All per-table before/after row counts matched exported counts. Reads were paginated and sequential, not an atomic multi-table snapshot. Both exports reconstructed into SQLite and passed `PRAGMA integrity_check`. AES-256-GCM encryption roundtrips passed; extra Windows CurrentUser DPAPI copies also roundtripped successfully. Ciphertexts and private notes are bundled locally as `WHISPERS_Private_Backup_2026-10-09.zip`. The portable recovery key is stored separately on the owner's computer with an owner-only file ACL, outside every repository. Never upload that key. Preserve it securely offline if the backups must survive loss of this Windows installation. DPAPI copies require the original Windows user's DPAPI keys.

`database-manifest.json` describes the locally held encrypted snapshots and their verification. It contains no player rows or encryption key.

## Original snapshot gaps and platform limits

The scan found 1,637 distinct asset references. Seventy-three could not be downloaded: 49 are referenced by current runtime files and 24 occur only in documentation/examples or historical files. Their exact names, source locations, HTTP results and attempted immutable storage addresses appear in `asset-manifest.json`; `asset-audit.json` separates the two groups. The current gaps include two Cinzel font names and sound/voice recipes. Initial CDN responses were 400/401 and direct immutable storage checks returned 404. These bytes were unavailable at the snapshot time; the source references remain preserved. Historical JPEG references were recovered using available equivalent immutable extensions where the same hashed value existed.

Spawn's managed engine binary/server implementation, room processes, socket connections, external authentication, billing, and transient in-memory sessions are not exposed as exportable game files by the documented agent API. The engine pin/reference is preserved. SQLite platform metadata is retained in the private snapshots, but it does not reproduce the platform services or revive a server-side backup bookmark independently.

## Recover the original snapshot

1. Clone this GitHub repository into a **new** directory. Alternatively clone the source-only bundle. The original live Spawn world remains authoritative for later development; never force-push a stale backup over newer work.
2. Download all nine release attachments into a new download directory. With Python 3, run `python backup/2026-10-09/restore_backup.py verify backup/2026-10-09/public-archives.json <download-directory>` to check their exact hashes and sizes.
3. Extract all seven asset/library ZIP parts into the same new recovery directory, preserving relative paths. They use disjoint paths and do not require replacing existing game source.
4. Run `python backup/2026-10-09/restore_backup.py verify-files backup/2026-10-09/asset-manifest.json <recovery-directory>` and repeat with `local-library-manifest.json`. The manifest also lets a local asset server map original `/cdn/...` names to the recovered content-addressed files. A Spawn restore should use the documented upload-by-bytes mechanisms with the preserved type/hash and handle any audio conversion through Spawn's supported interface; do not put binary assets into the live Spawn Git tree.
5. For locally held encrypted private data, install Python's `cryptography` library on the recovery machine. Decrypt/reconstruct with `python restore_backup.py database <snapshot.json.aesgcm> <private-key-file> <new-output.sqlite>`. Recover a notes bundle with `python restore_backup.py decrypt <notes.bundle.aesgcm> <private-key-file> <new-output.bundle>`. The helper refuses to overwrite its output, does not print the key or player rows, and never writes to Spawn. A database restore to a running world requires an authorized supported Spawn/admin workflow; this backup does not invent a writable database endpoint.

Keep original archive hashes, licenses and provenance when copying or restoring assets. This operation made no gameplay, save, terrain or engine changes to the live world.
