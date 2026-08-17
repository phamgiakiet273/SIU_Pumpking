# SIU_Pumpking — client runbook

```
THIS MACHINE                                  SERVER
  browser → hub_service :9021 ──── tunnel ──▶ SIGLIP_v2 :9029 → qdrant :6333
                    │        └──── tunnel ──▶ util      :9025
                    │
      frames ───────┴─ 307 ─▶ local nginx :9027 → YOUR aic_2025/0/frames/
      video  ─────────  307 ─▶ tunnel :9028 ────▶ server nginx :9027
```

Search queries (small JSON) and video cross the tunnel. **Frames** — by far the
most requests — are served from your own disk.

---

## What you need on disk

Just the keyframes:

```
<DATA_ROOT>/0/frames/low_res_autoshot/Keyframes_L26/keyframes/L26_V001/00016.avif
```

where `<DATA_ROOT>` is the folder that **contains** `0/`.

**Videos are not local.** Your `0/` has no `original/` folder, so video playback
is redirected to the server's nginx through the tunnel (step 4). Only the clip
you actually click gets streamed.

**You do NOT need** `0/fps/`, `0/speech_to_text2/`, `0/shot/`,
`utils/object/`, or `0/features/` — even though you have some of them. The hub
never opens them; the util and SIGLIP services read them on the server and send
back the results. Verified by running the hub with all of those paths pointing
at a nonexistent directory: clean startup, and search / translate / s2t /
neighbouring frames / video-name list all worked.

The `*_PATH` entries in `.env` may therefore dangle. Leave them as shipped.

---

## 1. Environment (conda)

```bash
cd SIU_Pumpking_local
cp .env.client .env          # .env is gitignored; this is the tracked template
conda env create -f create_env_local.yml
conda activate siu_pumpking_local
```

13 packages, no CUDA. The server's `create_env.yml` (~10 GB: torch,
transformers, open-clip, qdrant-client, full CUDA 12.8 toolkit) is **not**
needed — none of it is reachable from the hub. Use it only if you also intend
to run the model services locally.

## 2. Point nginx at your dataset

Open **`nginx/conf/nginx.conf`** and edit **one line** — the `alias` under
`location /img/`, marked `<<< EDIT`:

```nginx
location /img/ {
    alias /mnt/e/random42/data/aic_2025/;   # <<< EDIT: your DATA_ROOT
}
```

Rules:

- `<DATA_ROOT>` is the folder that **contains** `0/` — not `0/` itself, and not
  `0/frames`.
- **Keep the trailing `/`.** Without it nginx concatenates paths wrong and
  every thumbnail 404s.
- Absolute path.

Example — if your frames are at `/home/kiet/data/aic_2025/0/frames/...`:

```nginx
alias /home/kiet/data/aic_2025/;
```

Nothing else needs touching. There is no `/video/` block to edit — it is
commented out because you don't have the videos; video is handled by the
tunnel in step 4.

## 3. Run nginx

nginx ships in this repo — no install needed. `-p` must be an **absolute**
path:

```bash
cd SIU_Pumpking_local

nginx/sbin/nginx \
  -p /path/to/SIU_Pumpking_local/nginx \
  -c conf/nginx.conf

nginx/sbin/nginx -s reload    # after editing nginx.conf
nginx/sbin/nginx -s stop
```

Check the config before starting:

```bash
nginx/sbin/nginx -t -p /path/to/SIU_Pumpking_local/nginx -c conf/nginx.conf
```

## 4. Tunnel to the server — A or B

Three things are tunnelled: SIGLIP (9029), util (9025), and the server's nginx
for **video** (9027 → local 9028, since your own nginx already owns 9027).

**A. SSH (default; `.env` needs no edit)**

```bash
ssh -N \
  -L 9029:localhost:9029 \
  -L 9025:localhost:9025 \
  -L 9028:localhost:9027 \
  <user>@<server-host>
```

**B. ngrok** — on the **server**, using the team's reserved domains:

```bash
ngrok/ngrok http --url=hallie-sabulous-nicholle.ngrok-free.dev 9029   # SIGLIP
ngrok/ngrok http --url=<reserved-domain-for-util> 9025                # util
ngrok/ngrok http --url=siupumpking.nginxdomain.ngrok.app 9027         # video
```

then on this machine, in `.env`:

```ini
SIGLIP_V2_HOST_PUBLIC = "https://hallie-sabulous-nicholle.ngrok-free.dev"
UTIL_HOST_PUBLIC      = "https://<reserved-domain-for-util>"
NGINX_VIDEO_HOST      = "https://siupumpking.nginxdomain.ngrok.app/video"
```

The nginx tunnel from your old `run` script is still needed — but now only for
video, not frames. Note it must be **browser**-reachable (the hub redirects the
browser to it), which is why a reserved domain matters: a free ngrok endpoint
would serve its interstitial page instead of the video. The UI tunnel
(`siupumpking.webinterface.ngrok.app 9021`) is no longer needed — the hub runs
on this machine now. qdrant is never tunnelled; only SIGLIP talks to it.

## 5. Run the hub

```bash
conda activate siu_pumpking_local
uvicorn services.hub_service:app --host 0.0.0.0 --port 9021 --workers 4
```

Open <http://localhost:9021>.

## 6. Verify

```bash
curl http://localhost:9021/hub/ping                      # hub
curl http://localhost:9029/siglip_alpha/ping             # tunnel → SIGLIP
curl http://localhost:9025/util/ping                     # tunnel → util

# frames, served locally -> 200, Content-Type: image/avif
curl -I "http://localhost:9027/img/0/frames/low_res_autoshot/Keyframes_L26/keyframes/L26_V001/00016.avif"

# video, through the tunnel -> 200, Content-Type: video/mp4
curl -I "http://localhost:9028/video/0/videos/Videos_L21/video/L21_V001.mp4"
```

Substitute a frame/video that actually exists. If the frame 404s, re-check the
`alias` trailing slash; if the video 404s or hangs, the nginx tunnel is down.

---

## Differences from the server copy

Application code is identical.

| | Server | This machine |
|---|---|---|
| Services run | hub, SIGLIP_v2, util, nginx | hub, nginx |
| Conda env | `create_env.yml` (~10 GB, CUDA) | `create_env_local.yml` (13 pkgs) |
| `SIGLIP_V2_HOST_PUBLIC` | `http://localhost:9029` | tunnel → server :9029 |
| `UTIL_HOST_PUBLIC` | `http://localhost:9025` | tunnel → server :9025 |
| `NGINX_IMAGE_HOST` | `http://localhost:9027/img` | same — but aliases *your* path |
| `NGINX_VIDEO_HOST` | `http://localhost:9027/video` | `http://localhost:9028/video` (tunnel) |
| nginx serves | frames + videos | **frames only** |
| nginx `alias` | `/mnt/e/random42/data/aic_2025/` | your `<DATA_ROOT>/` |
| `HUB_MAX_WORKERS` | 20 | 4 |
| `REQUEST_TIMEOUT` | 30 | 60 |
| Dataset | full | `0/frames/` only |
| ngrok tunnels | UI + SIGLIP + nginx | SIGLIP + util + nginx(video), or none with SSH |

## Gotchas

- **Trailing slash on `alias`** — the single most common cause of blank
  thumbnails.
- **Leave the `DATASET_*` / `*_PATH` values in `.env` alone.** They are string
  prefixes only: the hub builds an absolute path then `os.path.relpath`s it
  against the same prefix, so it cancels out and only `0/frames/...` reaches
  the browser. Your real location lives in the nginx `alias`.
- **Frames you don't have** 404 individually; the rest of the UI keeps working.
  qdrant on the server indexes batches 0 and 1 — with only batch 0 locally,
  batch-1 hits show broken thumbnails.
- **`ENABLE_SUBMISSION` / `ENABLE_SIGLIP_BETA` / `ENABLE_RERANK` are `false`**
  because the server does not run those services. While off, the hub omits
  their routes and the UI hides the SUBMIT tab, the BETA model radios and the
  per-thumbnail T/Q/R buttons.
- **Bundled nginx** is a Linux x86-64 binary (1.24.0, built on Ubuntu 24.04).
  It needs `libpcre.so.3`, `libssl.so.3`, `libcrypto.so.3`, `libz`. On a
  non-Ubuntu distro missing PCRE1, either `sudo apt install libpcre3` or fall
  back to your own `nginx` on `PATH` with the same `-p` / `-c` arguments.

## No-nginx fallback

The hub can serve the frames itself via StaticFiles (slower). Skip steps 2–3
and set in `.env`:

```ini
NGINX_IMAGE_HOST = "http://localhost:9021/img"
IMAGE_LOCAL_PATH = "/your/path/to/data/aic_2025"
```

Leave `NGINX_VIDEO_HOST` on the tunnel either way — the videos aren't local.
