# AIC 2025 Repository Architecture

## Overview
This repository is structured as a small service cluster around a central FastAPI hub. The hub serves the web UI, accepts user-facing search and submission requests, and delegates specialized work to internal services over HTTP. The core retrieval stack is built around precomputed video-frame embeddings stored in Qdrant, with support services for reranking, translation, dataset navigation, and competition submission.

The 2025 SOICT paper shows that the full Pumpking system is broader than the online services exposed in this repo. It is best understood as a two-phase architecture:
- `offline dataset pre-processing`: segment videos, extract representative keyframes, run speech/object/semantic extraction, then build enriched Qdrant indexes
- `online query processing`: search those indexes through FastAPI services, inspect results in the UI, and submit answers to the competition server

At a high level:

```text
Browser/UI
  -> Hub service
      -> SIGLIP alpha service -> Qdrant
      -> SIGLIP beta service  -> Qdrant
      -> optional METACLIP service -> Qdrant
      -> Rerank service
      -> Util service
      -> Submission service -> competition API
      -> Nginx image/video hosts -> dataset files

Offline dataset build
  -> shot detection + clustering
  -> segment construction
  -> speech / object / semantic extraction
  -> embedding generation + compression
  -> Qdrant collection + metadata payloads
```

## Paper-Aligned System View
From the 2025 paper, the intended end-to-end data flow is:

```text
Raw videos
  -> shot boundary detection
  -> adaptive shot clustering
  -> segment formation
  -> ASR / object detection / OCR / caption / keyword extraction
  -> VLM / LLM semantic fusion
  -> SigLIP embeddings + metadata storage
  -> Qdrant retrieval
  -> Hub orchestration, UI review, and submission
```

This repo shows the serving layer clearly. The paper explains the offline indexing assumptions behind it.

## Runtime Entry Points
- `services/hub_service.py`: main entrypoint for the user-facing application.
- `services/SIGLIP_v2_service.py`: text, image, temporal, and scroll retrieval for the primary SIGLIP index.
- `services/SIGLIP_v2_B_service.py`: a second SIGLIP index with the same API surface.
- `services/METACLIP_service.py`: alternate retrieval service using METACLIP embeddings.
- `services/rerank_service.py`: post-retrieval color reranking.
- `services/util_service.py`: translation and dataset helper endpoints.
- `services/submission_service.py`: wraps the AIC competition submission API.
- `services/result_manager_service.py`: separate FastAPI app for result browsing and media access.
- `server.py`: legacy Flask server; useful for historical UI flows but no longer the main architecture.

## Common Service Pattern
Most services follow the same structure:

```text
service module -> setup_app() -> handler instance -> router -> FastAPI app
```

- `apis/api.py` provides the common FastAPI base for internal services.
- `apis/hub.py` extends that pattern for the main UI-facing hub.
- `apis/result_manager.py` does the same for the result manager UI.
- `routes/` defines HTTP endpoints.
- `handlers/` contains the actual orchestration or business logic.
- `configs/` reads environment variables for ports, hosts, dataset paths, and model/database settings.
- `schema/` defines Pydantic request and response contracts.

## Main Hub Responsibilities
`handlers/hub_handler.py` is the orchestration center.

It does not run retrieval models itself. Instead, it:
- accepts form-based requests from the frontend
- forwards them to downstream services using `httpx`
- normalizes returned records for the frontend
- adds derived fields such as `index`, `video_path`, and `frame_path`
- redirects image and video requests to Nginx-backed media hosts
- caches competition `session_id` and `eval_id` through a background refresh loop

The hub exposes two SIGLIP retrieval variants:
- `siglip_alpha_*` -> `SIGLIP_V2_HOST_PUBLIC`
- `siglip_beta_*` -> `SIGLIP_V2_B_HOST_PUBLIC`

This lets the frontend compare or switch between multiple vector indexes without changing its own request model.

## Retrieval Services
The retrieval services are the model-serving layer.

### SIGLIP Alpha and Beta
`SIGLIP_v2_service.py` and `SIGLIP_v2_B_service.py` each:
- load a `SIGLIP2` model at startup
- connect to Qdrant through `engine/vector_database/qdrant_database.py`
- expose:
  - `/text_search`
  - `/image_search`
  - `/temporal_search`
  - `/scroll`
  - `/setup_database`

`handlers/SIGLIP_v2_handler.py` and `handlers/SIGLIP_v2_B_handler.py` convert text or image input into embeddings, then query Qdrant. Temporal search splits a query into sentence segments, embeds each segment, and uses `search_temporal()` to merge multi-event evidence.

### METACLIP
`METACLIP_service.py` mirrors the same pattern with a METACLIP model. Architecturally it is a peer retrieval service, though the current hub routes focus on SIGLIP alpha and beta.

## Offline Indexing and Semantic Pipeline
The 2025 paper makes clear that retrieval quality depends on an upstream preprocessing pipeline, even though much of that pipeline is not exposed here as user-facing services.

The intended indexing flow is:
1. Detect shot boundaries.
2. Cluster frames within each shot in SigLIP embedding space.
3. Keep boundary frames and, when useful, a semantically distinct mid-shot frame.
4. Group frames into larger semantic segments.
5. Extract synchronized speech transcripts and visual semantics.
6. Generate richer metadata such as captions, OCR text, keywords, and summaries.
7. Store embeddings and metadata together in Qdrant.

According to the paper, the 2025 system used:
- `AutoShot` for initial shot detection
- `DBSCAN` over `SigLIP2` embeddings for adaptive shot clustering
- `YOLOv11` to classify frames such as anchor, news, and transition for segment formation
- `Qwen-2.5-VL-3B` plus `Gemini`-style abstraction for semantic metadata generation

Not all of those steps are directly visible as first-class runtime services in this repository, but the retrieval layer assumes their outputs already exist.

## Vector Store and Payload Design
`engine/vector_database/qdrant_database.py` is the core data access layer.

Its `addDatabase()` method builds a Qdrant collection from:
- precomputed frame embeddings
- FPS dictionaries
- speech-to-text metadata
- shot metadata
- uniqueness metadata

Each stored point includes both a vector and payload fields such as:
- `idx_folder`
- `video_name`
- `frame_name`
- `fps`
- `s2t`
- `is_unique`
- `frame_class`
- `related_start_frame`
- `related_end_frame`

That payload enables more than nearest-neighbor retrieval. It supports:
- text/image embedding search
- temporal sequence search
- filtering by video name or ASR text
- filtering by frame class
- scrolling through a detected shot segment
- duplicate or unique-frame navigation

The paper suggests the logical payload is richer than the fields visible in code alone. In the full 2025 system, indexed records are expected to carry or be associated with:
- speech transcripts
- OCR text
- keywords
- captions
- segment summaries
- shot or segment boundary relationships

Architecturally, this is `vector retrieval + metadata retrieval`, not just embedding lookup.

## Media Delivery Path
The hub and result manager do not stream heavy media directly. They build canonical dataset-relative paths and redirect to Nginx hosts configured in `configs/nginx_config.py`.

There are two main media channels:
- image host: usually low-resolution keyframes for UI browsing
- video host: original video assets

This keeps the FastAPI services focused on orchestration and metadata while Nginx handles static file delivery.

## Utility Service
`util_service.py` groups secondary capabilities that are still necessary for the workflow:
- translation via an external Google Translate-compatible endpoint
- neighboring-frame lookup for local exploration around a keyframe
- frame-vector or shot-range lookup using Qdrant
- video-name enumeration by batch

The hub uses this service to support search refinement and UI navigation.

## Rerank Service
`rerank_service.py` is a lightweight post-processing service. Its current job is color-based reranking.

`handlers/rerank_handler.py` loads per-frame color JSON files from paths defined by `RERANK_COLOR_PATH`, derives a dominant color ordering key, sorts candidates, then rotates the list so the best-scoring original result stays first. This means reranking complements retrieval rather than replacing the retrieval score entirely.

## Submission Service
`submission_service.py` isolates all communication with the competition backend.

It handles:
- login and session reuse
- fetching the active evaluation ID
- KIS submission
- QA submission
- TRAKE submission
- forced relogin

The hub periodically calls this service in the background to keep `session_id` and `eval_id` fresh, then forwards user submission requests through it.

## Result Manager Service
`result_manager_service.py` is a sibling UI-oriented service, separate from the main hub. It serves its own templates and focuses on:
- resolving media paths from `video_name` and `frame_name`
- redirecting to Nginx image/video endpoints
- exposing per-video FPS metadata

This appears to support result inspection and management workflows distinct from the main search UI.

## Shared Data and Configuration Dependencies
Nearly all services depend on `.env` for coordination. The most important shared inputs are:
- dataset roots and keyframe locations from `configs/app.py`
- public/internal service URLs from `configs/hub_config.py`
- Qdrant connection settings and collection names from model-specific configs
- Nginx image/video hosts from `configs/nginx_config.py`
- submission credentials and base URL from `configs/submission.py`

Architecturally, the services are loosely coupled through HTTP but tightly coupled through shared filesystem conventions and shared payload structure in Qdrant.

## Request Flow Examples

### Text Retrieval
1. Browser submits form data to `/hub/siglip_alpha_text_search`.
2. `HubHandler` forwards JSON to the SIGLIP alpha service.
3. `SIGLIPV2Handler` embeds the text and queries Qdrant.
4. Results come back with payload metadata.
5. Hub adds dataset-relative `video_path` and `frame_path`.
6. Frontend uses those paths with `/hub/send_img/...` or `/hub/send_video/...`.

### Image Retrieval
1. Browser sends an image path, URL, or data URI to the hub.
2. Hub loads the image, converts it to base64 JPEG, and forwards it.
3. SIGLIP service embeds the image and runs vector search in Qdrant.
4. Hub normalizes the response for the frontend.

### Temporal Retrieval
1. Browser submits a multi-sentence event description.
2. Hub forwards the raw text and `main_event_index`.
3. Retrieval service splits the text into segments and embeds each one.
4. The anchor event is searched globally first.
5. Earlier and later events are searched inside constrained temporal windows around that anchor result set.
6. Qdrant temporal logic merges candidate segments into ordered video matches.

This matches the 2025 paper's `dynamic-anchor sliding window` design. The architectural point is that temporal retrieval is anchor-driven, and the UI can explicitly choose the main event to avoid cascading errors from a bad first match.

### Competition Submission
1. Browser submits a chosen answer through hub endpoints.
2. Hub uses cached `session_id` and `eval_id`.
3. Submission service formats the payload for the AIC API and posts it.
4. Hub returns the submission result or parsed error detail.

## Architectural Notes
- The active architecture is microservice-like, but still repo-local and deployment-coupled.
- The hub is intentionally thin on ML logic; heavy model inference lives in retrieval services.
- Qdrant payload design is the backbone of the system, because it combines embeddings with video-specific metadata and offline-generated semantic annotations.
- Nginx is a delivery tier, not a business-logic tier.
- `server.py` reflects an older monolithic path and should be treated as legacy unless a task explicitly requires it.
- The paper indicates the strongest 2025 advantages came from the CLIP-centered retrieval stack, richer metadata, and dynamic temporal search.
- The paper also indicates the main weakness was final-round latency from heavyweight VLM / LLM inference, especially for VQA and TRAKE workflows.
