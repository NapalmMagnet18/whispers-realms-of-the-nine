# WHISPERS verified SSD game backup

Captured source: `169180d326f9fdaf949025587afc15409da95f7f`.

- `source-extracted/`: 648 source files / 7,127,235 bytes; every file matches its Git blob.
- `source-and-notes-rechecked.bundle`: complete captured Git history and notes; Git verification passed.
- `hosted-assets/files/`: 1632 captured current/historical asset files / 1,203,684,989 bytes; all SHA-256 checks passed.
- `ASSET-MAP.json`: current CDN-reference-to-local-file map. Current captured assets: 1579 unique files / 1,153,068,219 bytes.
- `supplied-design-and-assets/`: 2834 extracted design/library files / 1,639,835,923 bytes; every original manifest hash matches. Windows long paths are used for deep asset-pack folders.
- `engine-reference-and-schema/`: extracted available engine reference/schema. Spawn managed engine/server services are not a standalone exported engine.
- Portable encrypted save exports: development 119 rows; live 6 rows. Both decrypt and reconstruct into SQLite with integrity checks. Reads are sequential, not atomic. Capture intervals are in `database-manifest.json`.
- `restore_backup.py` supports offline restoration. The recovery key is only on the owner SSD. Keep `PRIVATE-recovery-key.txt` private and retain another secure offline copy; it is needed after Windows reset. It was not uploaded.

## Remaining gap

One actual uploaded font remains unavailable: `/cdn/value.09941fb1c169c38fd414536b37690057fc01b3117a5c63dd6571186540c8f370.woff2` (Cinzel; referenced in four UI files). Spawn and existing-storage format attempts returned 404. Historical/library exact-hash and targeted browser-cache searches found no copy. Six provider candidates were hashed; none matched. No replacement was invented. See `missing-font-investigation.json` and `font-provider-exact-hash-search.json`.

Two other unresolved references are illustrative documentation placeholders, not asset files. Model external buffer/texture dependencies: zero in captured GLB/glTF files.

This verifies all captured bytes; it does not claim the unavailable font or managed platform internals were exported. Runtime-generated paths beyond the scanner remain a coverage limitation. All original files are retained. This game audit does not clear the wider PC migration for reset/deletion. Central owns `F:\Codex\Workspaces` and its final audit. Reauthenticate existing service accounts after reset; Windows DPAPI credentials are not portable.

Machine-readable evidence: `STATUS.json`, `FINAL-VERIFICATION.json`, `source-file-verification.json`, `asset-file-verification.json`, `supplied-library-verification.json`, and `unavailable-current-assets.json`.
