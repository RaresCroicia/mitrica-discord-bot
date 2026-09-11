// Porneste/opreste ComfyUI la cerere, prin API-ul Kubernetes (scaleaza deployment-ul media/comfyui).
// ComfyUI sta la 0 replici cand nu e folosit (ia ~0,7 GB RAM + GPU-ul); il pornim inainte de o generare
// si il oprim dupa COMFY_IDLE_MINUTES fara cereri. Drepturile vin din ServiceAccount-ul "mitrica"
// (Role "comfyui-scaler" in namespace media, vezi k8s/mitrica.yaml). CA-ul API-ului e incarcat de Node
// prin NODE_EXTRA_CA_CERTS (setat in manifest), token-ul e montat automat in pod.
const fs = require('fs');

const COMFY_URL = process.env.COMFY_URL || 'http://comfyui.media.svc.cluster.local:8188';
const [NAMESPACE, DEPLOYMENT] = (process.env.COMFY_DEPLOYMENT || 'media/comfyui').split('/');
const IDLE_MS = (parseInt(process.env.COMFY_IDLE_MINUTES, 10) || 10) * 60 * 1000;
const START_TIMEOUT_MS = 4 * 60 * 1000;

const K8S_URL = 'https://kubernetes.default.svc';
const TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const SCALE_PATH = `/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${DEPLOYMENT}/scale`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// In afara clusterului (dezvoltare locala) nu exista token: nu scalam nimic, presupunem ca ComfyUI e pornit.
function inCluster() {
    return fs.existsSync(TOKEN_PATH);
}

async function setReplicas(n) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf8').trim();
    const res = await fetch(K8S_URL + SCALE_PATH, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json'
        },
        body: JSON.stringify({ spec: { replicas: n } }),
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`scale ${DEPLOYMENT}=${n}: ${res.status} ${(await res.text()).slice(0, 200)}`);
}

async function raspunde() {
    try {
        const res = await fetch(`${COMFY_URL}/system_stats`, { signal: AbortSignal.timeout(5000) });
        return res.ok;
    } catch {
        return false;
    }
}

let timerOprire = null;

// Porneste ComfyUI daca nu raspunde si asteapta sa fie gata. Intoarce true daca a fost pornire la rece.
async function porneste(onColdStart) {
    if (timerOprire) {
        clearTimeout(timerOprire);
        timerOprire = null;
    }
    if (await raspunde()) return false;
    if (!inCluster()) throw new Error('ComfyUI nu raspunde si nu sunt in cluster ca sa-l pornesc');

    console.log('Pornesc ComfyUI...');
    await setReplicas(1);
    if (onColdStart) await onColdStart();

    const deadline = Date.now() + START_TIMEOUT_MS;
    while (Date.now() < deadline) {
        await sleep(3000);
        if (await raspunde()) {
            console.log('ComfyUI e gata.');
            return true;
        }
    }
    throw new Error('ComfyUI nu a pornit in timp util');
}

// Programeaza oprirea dupa IDLE_MS; orice noua pornire anuleaza timer-ul.
function programeazaOprire() {
    if (!inCluster()) return;
    if (timerOprire) clearTimeout(timerOprire);
    timerOprire = setTimeout(async () => {
        timerOprire = null;
        try {
            await setReplicas(0);
            console.log('ComfyUI oprit (inactiv).');
        } catch (err) {
            console.warn('Nu am putut opri ComfyUI:', err.message);
        }
    }, IDLE_MS);
    timerOprire.unref();
}

// La pornirea botului: daca ComfyUI a ramas pornit (botul a fost restartat cu timer-ul in aer), il oprim dupa fereastra de idle.
programeazaOprire();

module.exports = { porneste, programeazaOprire };
