# Klankhuis — webshop voor muziekinstrumenten (TMA-assortiment)

Een complete, snelle webshop-frontend voor muziekinstrumenten en accessoires, opgebouwd rond de merken en
productgroepen van **The Music Alliance** (TMA): de Europese distributiecoöperatie met 16.000+ producten van
200+ merken en eigen merken als Boston, Richwood, Korala, Salvador Cortez, Mayson, Gaucho, Hayman,
Stewart Ellis, GLX en Gatt Audio, plus exclusieve merken als NUX, Medeli, Crumar, Agner, Rotosound en Hosco.

## Starten

```bash
npm install
npm run dev          # ontwikkelserver op http://localhost:5173
npm run build        # productiebuild in dist/
npm run build:single # alles in één HTML-bestand (dist-single/index.html)
```

## Wat zit erin

| Onderdeel | Functies |
|---|---|
| **Navigatie** | Megamenu per categorie, mobiel menu, live zoeken met suggesties (producten, categorieën, merken), toetsenbordbediening |
| **Assortiment** | 10 hoofdcategorieën, 63 subcategorieën, 16 merken, 298 producten met afwerkingsvarianten |
| **Productoverzicht** | Filters (type, merk, prijs, niveau, score, voorraad, actie) met live tellingen, filters in de URL (deelbaar), 6 sorteringen, raster/lijst, ‘meer laden’ |
| **Productpagina** | Varianten met kleurwissel, voorraad + verwachte bezorgdatum, ‘vaak samen gekocht’-bundel, specificaties, reviews met verdeling, vergelijkbare en recent bekeken producten, sticky koopbalk op mobiel, schema.org-structured data |
| **Conversie** | Winkelwagen-drawer met upsell, voortgangsbalk gratis verzending, kortingscodes (`WELKOM10`, `MUZIEK5`), verlanglijst (deelbaar), vergelijken (max. 4, verschillen gemarkeerd) |
| **Keuzehulp** | 4 vragen (instrument, voor wie, niveau, budget) → persoonlijk advies + bijpassende accessoires |
| **Afrekenen** | 3 stappen (gegevens, bezorging, betaling) met NL/BE-postcodevalidatie, iDEAL/Bancontact/creditcard/PayPal/Klarna, bevestigingspagina |
| **Overig** | Merkenoverzicht A-Z + merkpagina's, aanbiedingenpagina, klantenservice/FAQ, nieuwsbrief, licht/donker thema, volledig responsive |

## Structuur

```
src/
  data/taxonomy.ts   categorieën + merken
  data/lines.ts      productlijnen per subcategorie (uitgevouwen tot producten)
  data/catalog.ts    catalogus, zoeken, gerelateerd, ‘vaak samen gekocht’
  state/store.tsx    winkelwagen, verlanglijst, vergelijken, recent bekeken (localStorage)
  lib/config.ts      winkelnaam, verzendkosten, drempels — hier aanpassen
  components/        header, zoekbalk, productkaart, filters, drawer, SVG-productillustraties
  pages/             alle pagina's
```

## Belangrijk: demodata

De merken, categorieën en productgroepen zijn gebaseerd op het publiek beschikbare TMA-assortiment. **Modelnummers,
prijzen, voorraad, specificaties en reviews zijn representatieve demodata** en de productafbeeldingen zijn
gegenereerde SVG-illustraties. Voor livegang:

1. Vervang `src/data/lines.ts` door een import van de TMA-dealerfeed (artikelen, prijzen, voorraad, afbeeldingen).
   Het `Product`-type in `src/data/types.ts` is het doelformaat.
2. Koppel afrekenen aan een betaalprovider (bijv. Mollie of Adyen) en een orderbackend.
3. Vervang de gegenereerde reviews door echte reviews (bijv. Kiyoh/Trustpilot).
4. Pas winkelnaam en contactgegevens aan in `src/lib/config.ts`.
