# Klankhuis — webshop voor muziekinstrumenten (TMA-assortiment)

Een complete, snelle webshop-frontend voor muziekinstrumenten en accessoires, gevuld met de **echte productcatalogus
van The Music Alliance** (TMA): artikelnummers, merken, series, Nederlandse omschrijvingen, categorieën en
productfoto's, opgehaald uit de publieke online catalogus van een TMA-partner (themusicalliance.co.uk, NL-taal).

## Starten

```bash
npm install
npm run dev          # ontwikkelserver op http://localhost:5173
npm run build        # productiebuild in dist/
npm run build:single # alles in één HTML-bestand (dist-single/index.html)
```

## Catalogus bijwerken

```bash
python3 scripts/scrape_tma.py --new        # categorieën + productoverzichten + 'nieuw'-markering (~15 min)
python3 scripts/scrape_tma.py --details-only  # optioneel: EAN, kenmerken en extra foto's per product (~9.000 pagina's, ±2 uur)
python3 scripts/build_catalog.py           # → src/data/generated/catalog.json
npm run build
```

De scraper gebruikt alleen de Python-standaardbibliotheek, crawlt bewust rustig (2 parallelle verzoeken met pauze)
en cachet alles in `data/tma/cache/`, zodat een onderbroken run hervat. Ruwe data: `data/tma/catalog.json`.

### Productfoto's

- **Gewone build** (`npm run build`): foto's worden live van de TMA-server geladen.
- **Eigen hosting / artifact**: `python3 scripts/build_sprites.py` downloadt alle ±8.700 foto's naar
  `data/tma/images/` (ook bruikbaar voor eigen CDN) en bundelt ze tot ±350 sprite sheets (600 px per foto) in `data/tma/sprites/`
  (25 foto's per vel, gegroepeerd per categorie). `npm run build:single` gebruikt die sheets; publiceer de map
  `sprites/` naast `index.html`.

### Prijzen en voorraad

Prijzen en voorraad staan in de TMA-catalogus achter de dealerlogin en worden dus **niet** gescrapet.
Zet een dealerprijslijst neer als `data/tma/prices.csv`:

```
sku;price;stock
RD-12-BUS;179.00;12
SE-710-L;749.00;3
```

en draai `build_catalog.py` opnieuw. Zonder prijslijst toont de shop per productgroep een **richtprijs**
(duidelijk gemarkeerd als “Richtprijs” op de productpagina en in de footer) en “Leverbaar” zonder voorraadaantal.

## Wat zit erin

| Onderdeel | Functies |
|---|---|
| **Navigatie** | Megamenu per categorie, mobiel menu, live zoeken met suggesties (producten, categorieën, merken), toetsenbordbediening |
| **Assortiment** | Volledige TMA-catalogus: 12 hoofdcategorieën, subcategorieën en ‘soort’ per artikel, alle merken, echte foto’s (met SVG-terugval) |
| **Productoverzicht** | Filters (type, soort, merk met zoekveld, prijs, niveau, nieuw) met live tellingen, filters in de URL (deelbaar), 6 sorteringen, raster/lijst, ‘meer laden’ |
| **Productpagina** | Productfoto’s, artikelnummer/EAN, kenmerken, ‘vaak samen gekocht’-bundel, specificaties, vergelijkbare en recent bekeken producten, sticky koopbalk op mobiel, schema.org-structured data |
| **Conversie** | Winkelwagen-drawer met upsell, voortgangsbalk gratis verzending, kortingscodes (`WELKOM10`, `MUZIEK5`), verlanglijst (deelbaar), vergelijken (max. 4, verschillen gemarkeerd) |
| **Keuzehulp** | 3 vragen (instrument, voor wie, budget) → persoonlijk advies + bijpassende accessoires |
| **Afrekenen** | 3 stappen (gegevens, bezorging, betaling) met NL/BE-postcodevalidatie, iDEAL/Bancontact/creditcard/PayPal/Klarna, bevestigingspagina |
| **Overig** | Merkenoverzicht A-Z + merkpagina's, ‘Nieuw binnen’, klantenservice/FAQ, nieuwsbrief, licht/donker thema, volledig responsive |

## Structuur

```
scripts/scrape_tma.py       scraper TMA-catalogus (NL)
scripts/build_catalog.py    ruwe data → compacte shopcatalogus (mapping, richtprijzen, prijslijst)
src/data/generated/         gegenereerde catalogus (ingelezen door de shop)
src/data/taxonomy.ts        categorieën + redactionele merkinformatie
src/data/catalog.ts         producten, zoeken, gerelateerd, ‘vaak samen gekocht’
src/state/store.tsx         winkelwagen, verlanglijst, vergelijken, recent bekeken (localStorage)
src/lib/config.ts           winkelnaam, verzendkosten, drempels — hier aanpassen
src/components/, src/pages/ UI
```

## Belangrijk vóór livegang

1. **Gebruiksrecht.** Productteksten en -foto's zijn eigendom van TMA en de merken. Als TMA-dealer mag je ze
   doorgaans gebruiken, maar leg dit vast met TMA en vraag liefst de officiële dealerfeed (met prijzen en voorraad) aan.
2. **Foto's**: gebruik voor productie de gedownloade foto's uit `data/tma/images/` op eigen hosting/CDN.
3. **Bereik.** De publieke catalogus van deze partner bevat ±9.000 artikelen; het volledige TMA-aanbod (16.000+,
   o.a. elektrische gitaren, keyboards, PA) loopt via de Benelux-dealerportal/-feed.
4. Koppel afrekenen aan een betaalprovider (bijv. Mollie) en een orderbackend; pas winkelgegevens aan in `src/lib/config.ts`.
