all: init run

init:
	chmod +x startMitrica

run: init
	./startMitrica

# --- k3s deploy ---
# Imaginea se publica automat in ghcr.io la fiecare push pe main
# (.github/workflows/docker.yml). Deploy = restart la pod, care trage
# imaginea proaspata din registry.
IMAGE = ghcr.io/rarescroicia/mitrica:latest

image:
	docker build -t $(IMAGE) .

deploy:
	kubectl apply -f k8s/mitrica.yaml
	kubectl -n bots rollout restart deployment/mitrica
	kubectl -n bots rollout status deployment/mitrica

logs:
	kubectl -n bots logs -f deployment/mitrica

.PHONY: all init run image deploy logs
