# bman-proxy

Proxy server per le API bman gestionale. Risolve i problemi CORS permettendo al pannello web di comunicare con bman.

## Variabili d'ambiente (Railway)

| Variabile | Valore |
|---|---|
| BMAN_DOMAIN | natisrl.bman.it |
| BMAN_PORT | 8443 |

## Endpoint

- `GET /` — health check
- `POST /api/getOrdini` — lista ordini
- `POST /api/setStatoOrdine` — aggiorna stato ordine
- `POST /api/getClienti` — lista clienti
- `POST /api/getAnagrafiche` — lista articoli
