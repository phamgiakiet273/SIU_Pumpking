# Repository Guidelines

## Project Purpose for Agents
This repository was built for AIC (AI Challenge 2025), a hackathon-style competition focused on video retrieval. Teams receive a dataset of raw videos and must build a system that can find, localize, and reason about relevant video moments.

The competition has three main task formats:
1. `Text-to-video retrieval`: given a text description of a cutscene, return the matching start/end timestamps or keyframes.
2. `Image-guided retrieval`: given a displayed image from a cutscene, infer the scene content and retrieve the matching video segment. This format is used in live finals.
3. `VQA`: answer questions about a cutscene, including object counts, colors, actions, and similar scene details.

This repo is intended to contain the application and model-serving components needed for that system, excluding the actual competition dataset. When reading the codebase, assume the core product goal is end-to-end retrieval over video-derived assets such as keyframes, metadata, embeddings, object annotations, and scene-level context.

## Agent Workflow Note
Before making changes, check for a shared worklog at `../worklog.md` relative to the repository root if it is available in the workspace. Use it as the first source of session context, current goals, recent changes, blockers, and next-step handoff notes.

## Shared External Context
- AIC 2026 working folder: `https://drive.google.com/drive/folders/1rTALXURz93Eg5BS04hFLSWw_MPKEnlcN?usp=drive_link`
- AIC 2026 slide deck: `https://docs.google.com/presentation/d/1V2XS_m0_gzqe_0Wh_edhxrwFsrYIWe8pAJHbtEjdD_w/edit?usp=drive_link`
- Current deck status: most slides are still template content. The only concrete planning signal found so far is slide 3, which lists workstreams for:
  - CLIP model research
  - new technology research
  - UI
  - AVSR (audio-visual speech recognition)
  - video retrieval
  - shot retrieval
- Do not treat the current AIC 2026 slide deck as a reliable architecture reference yet; use it as planning context only unless the technical slides are later filled in.

## Project Structure & Module Organization
`services/` contains the active FastAPI apps, with `services/hub_service.py` as the main local entrypoint. `routes/`, `handlers/`, `apis/`, and `schema/` hold routing, request handling, API wiring, and data contracts. `configs/` centralizes environment-backed settings. `src/` and `engine/` contain offline processing, feature extraction, and model code. Frontend assets live in `templates/`, `templates_result_manager/`, and `static/`. Treat `engine/Object_Detection/Detic/` and `nginx/` as vendored or third-party code unless a task explicitly targets them.

## Build, Test, and Development Commands
Create the environment with `conda create -n siu-pumpking python=3.11.12` and `pip install -r requirements.txt`. Run the main service with `uvicorn services.hub_service:app --host 127.0.0.1 --port 5501`. The legacy Flask server can be started with `python server.py` when you need to inspect older UI flows. Install local hooks with `pre-commit install`, then run `pre-commit run --all-files` before opening a PR.

## Coding Style & Naming Conventions
Use 4-space indentation and keep Python formatted with Black; the repo already wires Black through `.pre-commit-config.yaml`. Follow the existing module pattern: `*_service.py`, `*_router.py`, `*_handler.py`, and config classes such as `HubConfig` or `AppConfig`. Prefer `snake_case` for functions, variables, and files, and `PascalCase` for classes. Keep environment variable names uppercase and define new settings in `configs/` instead of scattering `os.getenv()` calls.

## Testing Guidelines
There is no full automated test suite yet. Existing checks are lightweight scripts such as `python docs/test_get_path.py` and `python utils/test_load_object_dict.py`. Add focused smoke tests next to the feature area you change, and document any required dataset paths or `.env` values so another contributor can reproduce the run.

## Commit & Pull Request Guidelines
Recent history uses concise Conventional Commit prefixes such as `feat:` and `fix:`. Keep commit subjects short and imperative, for example `feat: add qdrant fallback search`. PRs should include the problem being solved, key files changed, required environment or data assumptions, and screenshots for UI updates under `templates/` or `static/`.

## Configuration Tips
This project depends heavily on `.env` values such as `IMAGE_LOCAL_PATH`, dataset roots, and model paths. Do not commit secrets, local absolute paths, or large generated artifacts under `log/` or dataset directories.
