# Mitrică — bot de Discord

Bot de Discord în română (discord.js v14, Node 18+), ton sarcastic/absurd. Rulează ca pod în k3s, în homelab. Botul e outbound-only: se conectează la Discord, Mongo și Ollama ca client — fără Service, fără Ingress.

## Infrastructură (homelab)

| Ce | Unde | Detalii |
|---|---|---|
| Host Proxmox | `192.168.1.190` | hypervisor |
| VM k3s | `192.168.1.108` | k3s single-node + Traefik ingress; aici trăiește botul; are GPU-ul (GTX 1660 Ti) prin PCI passthrough |
| Ollama | pod în k3s, namespace `media` | API în cluster: `http://ollama.media.svc.cluster.local:11434` |
| ComfyUI | pod în k3s, namespace `media` | API în cluster: `http://comfyui.media.svc.cluster.local:8188`; UI la `comfy.lab.rcroi.xyz`; checkpoint DreamShaper 8 (SD 1.5) |

- Ollama rulează în același cluster (namespace `media`), pe GPU partajat cu Jellyfin prin time-slicing — în timpul unei rafale de transcodare inferența poate încetini de ~20x, de aici timeout-ul generos (120s) din comenzi.
- Modelul stă permanent în VRAM (`OLLAMA_KEEP_ALIVE=-1` + postStart warm-up în manifestul lui Ollama).
- Modele Ollama disponibile: `qwen2.5:7b` (folosit acum, ~1-5s/răspuns cald), `llama3.2:3b` (mai rapid, dacă 7B devine lent), `phi3.5`.
- GPU-ul e unul singur — cererile `/ask` concurente se procesează secvențial în Ollama; ok pentru un server mic.
- `kubectl` merge din WSL de pe PC (kubeconfig arată spre VM).
- Există certificat wildcard `*.lab.rcroi.xyz` în cluster (irelevant pentru bot).

## Structura repo-ului

- `src/mitrica.js` — entrypoint; încarcă `src/functions/`, apoi login + conectare Mongo. Căile `./src/...` sunt relative la cwd → rulează mereu din rădăcina repo-ului.
- `src/commands/<categorie>/<comanda>.js` — un fișier per slash command (`data` + `execute`).
- `src/functions/handlers/` — auto-load comenzi/evenimente; comenzile se înregistrează per-guild la pornire (`CLIENT_ID` + `GUILD_ID`).
- `src/events/client/` — `ready`, `interactionCreate`.
- `frontend/` — React separat, NU face parte din imaginea Docker / deploy.
- MongoDB e folosit de `quote` și `cuminvat` (`MONGO_URL`). `/ask` și `/proverb` folosesc Ollama.
- `/imagine`: qwen scrie un prompt absurd în engleză + o frază "viziune" (JSON mode), apoi ComfyUI generează 512×512 (25 pași, dpmpp_2m karras). VRAM-ul de 6 GB nu încape qwen (4.7 GB) + SD 1.5, deci comanda descarcă qwen (`keep_alive: 0`) înainte și dă `POST /free` la ComfyUI după; următorul `/ask` reîncarcă qwen singur (~5s). O singură generare simultan (flag `ocupat`), cooldown 60s/user. Workflow-ul e hardcodat în API-format în `imagine.js`.
- `/proverb`: lista de ~170 proverbe e în `src/data/proverbe.js`; comanda alege 5-6 și cere LLM-ului un proverb nou absurd, cu fallback pe tăietură mecanică (frankenstein) dacă Ollama nu răspunde.

## Env vars (toate injectate din Secretul `mitrica-env`, mai puțin Ollama)

- `MITRICA_TOKEN` — tokenul de Discord (secret)
- `CLIENT_ID`, `GUILD_ID` — pentru înregistrarea slash commands (secret)
- `MONGO_URL` — conexiunea Mongo (secret, OPȚIONAL: fără el botul pornește normal, doar `/quote` și `/cuminvat` răspund că n-au bază de date; momentan nu există Mongo deployat nicăieri)
- `OLLAMA_URL` (default `http://ollama.media.svc.cluster.local:11434`), `OLLAMA_MODEL` (default `qwen2.5:7b`) — setate simplu în manifest
- `COMFY_URL` (default `http://comfyui.media.svc.cluster.local:8188`), `COMFY_CHECKPOINT` (default `DreamShaper_8_pruned.safetensors`) — pentru `/imagine`

## Deploy

Imaginea trăiește în `ghcr.io/rarescroicia/mitrica` (pachet public). GitHub Actions o buildează și o publică la fiecare push pe `main` (`.github/workflows/docker.yml`, cu `GITHUB_TOKEN` — fără PAT). Fluxul:

```bash
git push             # → CI buildează și publică imaginea (~1 min)
make deploy          # kubectl apply + rollout restart; podul trage imaginea nouă din ghcr
make logs            # kubectl -n bots logs -f deployment/mitrica
```

Manifestul are `imagePullPolicy: Always` — importul manual de imagini pe nod nu mai funcționează și nu mai e necesar. Tag suplimentar per commit (`ghcr.io/rarescroicia/mitrica:<sha>`) pentru rollback.

Manifest: `k8s/mitrica.yaml` (Namespace `bots` + Deployment, `strategy: Recreate` ca să nu ruleze două instanțe simultan). Secretul se creează o dată, manual (vezi `k8s/mitrica-secret.example.yaml`); secretul real NU intră în git sau în imagine.

Verificare: `kubectl -n bots get pods`.

## Convenții de cod

- Răspunsurile botului sunt în română, sarcastice/absurde ("jumătatea de neuron" din README).
- Comenzile care durează >3s (orice apel LLM) fac `interaction.deferReply()` întâi, apoi `editReply` — Discord cere răspuns în 3 secunde.
- Limita Discord: 2000 caractere per mesaj — `slice(0, 2000)` pe orice răspuns de LLM.
- `fetch` e nativ (Node 18+) — nu adăuga node-fetch.
- Nu modifica comportamentul comenzilor existente decât dacă ți se cere explicit.
- Stil: CommonJS (`require`), fără diacritice în stringurile de cod existente (proverbele hardcodate sunt excepția).
