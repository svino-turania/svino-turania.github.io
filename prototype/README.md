# Prototipo: il fregio dei Menestrelli

Rotta usa e getta, fuori dalla produzione. Domanda: come regge il fregio dei
Menestrelli dentro la pagina — disegno a tratto unico in oro tinto, paragrafo
bordeaux sovrapposto, etichetta sopra, rigo a terra?

**Vincitore (19 novembre 2026): D · Largo** — 34 rem con 10 rem di
sovrapposizione, tratto 1,6, telefono 18 rem. La decisione vive nell'issue #70:
<https://github.com/svino-turania/svino-turania.github.io/issues/70>.

## Le varianti

| chiave | nome | cosa prova |
| --- | --- | --- |
| A | Fregio | la proposta iniziale: 30 rem, sovrapposizione 6 rem |
| B | Sigillo | più grande e abbassato, tratto 2,2 |
| C | Sopra | controllo: il fregio sopra il testo, centrato, nessuna sovrapposizione |
| D | Largo | la sovrapposizione di B con il tratto di A — **vincente** |
| E | Profondo | più sovrapposizione ancora, tratto sottile |

Il disegno è un segnaposto proporzionato, non l'illustrazione finale: serve a
giudicare ingombro, sovrapposizione, gerarchia e leggibilità. I quattro
strumenti restano quelli del paragrafo approvato.

## Aprirlo

```sh
python3 -m http.server 8000
```

Poi <http://localhost:8000/prototype/programma.html>. Cambia variante con
`?variant=A`…`E`, con le frecce ← → o con la barra in basso. La barra è il
controllo del prototipo, non parte del disegno: nelle schermate a pagina intera
copre l'ultima riga della sezione.

Il foglio di stile è quello vero (`../assets/css/style.css`), con i font
self-hosted; l'unica aggiunta è lo stile del prototipo e il disegno in linea.
