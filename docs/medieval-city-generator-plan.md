# Plan initial — Générateur de ville médiévale organique

## Vision

Créer un générateur de ville médiévale organique et pseudo-réaliste, affiché dans une page `index.html` au moyen de HTML, JavaScript et SVG. La ville ne doit pas seulement être jolie : sa géométrie doit être structurée, interrogable et réutilisable pour des calculs de chemins, de voisinage, d'occupation, d'obstacles et d'évolution urbaine.

## Objectifs principaux

- Générer une ville divisée en **quartiers** cohérents.
- Diviser chaque quartier en **cellules urbaines** séparées par des routes, rues, ruelles, allées, rivières, murailles ou autres limites.
- Diviser chaque cellule en **parcelles** pouvant contenir bâtiments, places, jardins, champs, cours ou espaces vides.
- Produire une disposition **organique**, non strictement orthogonale, avec des irrégularités crédibles.
- Conserver une représentation géométrique propre permettant :
  - le calcul de chemins piétons ou routiers ;
  - l'identification des obstacles et franchissements ;
  - les requêtes spatiales comme « quelle parcelle contient ce point ? » ;
  - l'export ou la réutilisation des données générées.
- Afficher le résultat en SVG depuis `index.html`, sans dépendance lourde dans un premier temps.

## Hiérarchie spatiale cible

```text
Ville
├── Contraintes globales
│   ├── relief simplifié
│   ├── rivière(s)
│   ├── murailles
│   ├── portes
│   └── axes historiques
├── Quartiers
│   ├── cellules
│   │   ├── parcelles
│   │   │   ├── bâtiments
│   │   │   ├── jardins
│   │   │   ├── places
│   │   │   ├── champs
│   │   │   └── cours / terrains libres
│   │   └── limites de cellule
│   └── routes internes
└── Graphe de circulation
    ├── routes principales
    ├── rues secondaires
    ├── ruelles
    ├── allées
    ├── ponts
    └── portes / passages
```

## Modèle de données recommandé

### Géométrie de base

Les objets géométriques doivent être conservés sous forme de coordonnées numériques indépendantes du SVG rendu.

- `Point` : `{ x, y }`
- `Segment` : `{ a: Point, b: Point }`
- `Polyline` : `Point[]`
- `Polygon` : `Point[]`, orienté de façon stable
- `Bounds` : boîte englobante pour accélérer les requêtes

### Entités urbaines

- `City` : paramètres, graine aléatoire, limites, quartiers, contraintes et graphes.
- `District` : polygone, type dominant, densité, richesse, fonction et cellules.
- `Cell` : polygone appartenant à un quartier, bordée par des voies ou obstacles.
- `Parcel` : polygone constructible ou agricole à l'intérieur d'une cellule.
- `Feature` : rivière, muraille, fossé, falaise, berge, pont, porte, marché, place.
- `Building` : empreinte au sol, hauteur symbolique, usage, entrée et raccordement à une voie.
- `PathGraph` : nœuds, arêtes, coût de traversée, type de voie et restrictions.

## Types de quartiers envisagés

- **Château / citadelle** : position dominante, accès contrôlé, forte densité de murs.
- **Quartier marchand** : proche des portes, ponts, places et axes principaux.
- **Quartier artisanal** : proche de l'eau ou des axes logistiques, parcelles irrégulières.
- **Quartier résidentiel dense** : ruelles étroites, petites parcelles, fronts bâtis serrés.
- **Quartier religieux** : église, cloître, cimetière, jardins ou place attenante.
- **Faubourgs** : hors les murs ou près des portes, densité plus faible.
- **Champs / jardins vivriers** : parcelles plus grandes, souvent près de la périphérie ou d'un cours d'eau.

## Approche algorithmique proposée

### 1. Initialisation déterministe

- Utiliser une graine pseudo-aléatoire pour rendre les villes reproductibles.
- Définir une emprise globale : cercle irrégulier, ovale, promontoire ou vallée.
- Générer les contraintes structurantes : rivière, relief abstrait, muraille, portes, ponts et axes principaux.

### 2. Squelette de circulation

- Placer quelques pôles : château, marché, église, portes, ponts, port ou gué.
- Connecter ces pôles par des axes organiques avec courbes et légères déviations.
- Construire un graphe navigable à partir de ces axes.
- Ajouter des voies secondaires qui suivent les quartiers et évitent les obstacles.

### 3. Découpage en quartiers

- Déduire les quartiers à partir des pôles, des axes et des contraintes.
- Utiliser une partition organique, par exemple croissance de régions ou Voronoï bruité.
- Ajuster les frontières pour suivre routes, murailles, rivières ou ruptures naturelles.

### 4. Découpage en cellules

- Dans chaque quartier, générer des cellules séparées par rues, ruelles ou limites fortes.
- Adapter la taille moyenne des cellules au type de quartier.
- Densifier près des marchés, portes et axes principaux.
- Garder chaque cellule comme polygone exploitable.

### 5. Découpage en parcelles

- Diviser chaque cellule en parcelles depuis ses accès routiers.
- Favoriser les fronts de rue pour les bâtiments urbains.
- Laisser des parcelles plus profondes pour jardins, cours ou champs.
- Éviter les parcelles trop fines ou non constructibles, sauf ruelles et recoins volontaires.

### 6. Placement du contenu

- Placer les bâtiments dans les parcelles constructibles, avec retrait variable.
- Créer des places près des carrefours et bâtiments importants.
- Placer jardins, vergers ou champs en périphérie ou dans les grandes parcelles.
- Associer chaque bâtiment à une entrée reliée au graphe de circulation.

### 7. Rendu SVG

- Convertir les entités géométriques en calques SVG : eau, relief, murailles, routes, parcelles, bâtiments, végétation, annotations.
- Garder le rendu séparé de la génération pour permettre des tests géométriques sans DOM.
- Prévoir des styles CSS simples et modifiables.

## Architecture de fichiers cible

```text
index.html
src/
├── main.js
├── rng.js
├── geometry/
│   ├── primitives.js
│   ├── polygon.js
│   ├── intersection.js
│   └── spatial-index.js
├── generation/
│   ├── city-generator.js
│   ├── constraints.js
│   ├── districts.js
│   ├── cells.js
│   ├── parcels.js
│   ├── buildings.js
│   └── path-graph.js
├── render/
│   ├── svg-renderer.js
│   └── styles.js
└── debug/
    ├── overlays.js
    └── validation.js
```

## Contraintes géométriques à respecter

- Les polygones doivent autant que possible être simples, fermés et non auto-intersectés.
- Les routes et rivières doivent être représentées par des polylignes avec largeur ou par des polygones selon les besoins.
- Les limites entre cellules doivent pouvoir devenir des arêtes de graphe ou des obstacles.
- Les parcelles doivent rester incluses dans leur cellule parente.
- Les bâtiments doivent rester inclus dans leur parcelle, sauf cas spéciaux explicitement marqués.
- Les ponts, portes et passages doivent créer des connexions explicites dans le graphe de circulation.

## Données nécessaires au calcul de chemins

Le graphe de circulation doit stocker :

- des nœuds pour les carrefours, portes, ponts, entrées de bâtiments et accès de parcelles ;
- des arêtes pour les segments praticables ;
- un type d'arête : route principale, rue, ruelle, allée, pont, passage de porte, chemin agricole ;
- un coût de traversée selon largeur, encombrement, pente abstraite, danger ou importance ;
- les restrictions éventuelles : fermé par muraille, traversée d'eau interdite, accès privé.

## Paramètres de génération prévus

- `seed` : graine de génération.
- `citySize` : taille globale.
- `density` : densité bâtie moyenne.
- `wallEnabled` : présence d'une muraille.
- `riverEnabled` : présence d'une rivière.
- `districtCount` : nombre cible de quartiers.
- `organicNoise` : intensité des irrégularités.
- `streetComplexity` : densité du réseau secondaire.
- `fieldRatio` : part des parcelles agricoles ou vivrières.

## Jalons proposés

### Jalon 1 — Documentation et socle

- Documenter les objectifs, la hiérarchie spatiale et l'architecture cible.
- Créer `index.html` minimal, `src/main.js` et un rendu SVG vide ou de test.
- Mettre en place un générateur pseudo-aléatoire déterministe.

### Jalon 2 — Géométrie et rendu de base

- Implémenter les primitives géométriques.
- Ajouter les fonctions de polygone utiles : aire, centroïde, boîte englobante, inclusion de point.
- Afficher des polygones et polylignes SVG depuis des données JS.

### Jalon 3 — Contraintes globales

- Générer l'emprise de ville, une rivière optionnelle, une muraille et quelques portes.
- Produire les premiers axes principaux entre portes, ponts, marché et château.

### Jalon 4 — Quartiers et cellules

- Générer des quartiers organiques.
- Découper chaque quartier en cellules bordées par le réseau viaire ou des limites fortes.
- Ajouter une couche de debug affichant les identifiants et frontières.

### Jalon 5 — Parcelles et contenu

- Diviser les cellules en parcelles.
- Placer bâtiments, places, jardins et champs selon le type de quartier.
- Relier les entrées de bâtiments au graphe de circulation.

### Jalon 6 — Navigation et validation

- Construire le graphe complet de circulation.
- Ajouter un calcul de chemin simple, par exemple Dijkstra ou A*.
- Ajouter des validations : inclusion des parcelles, connexité minimale, absence d'intersections invalides majeures.

## Critères de réussite initiaux

- Une même graine produit toujours la même ville.
- Le rendu SVG peut afficher distinctement quartiers, cellules, parcelles, routes, eau, murailles et bâtiments.
- Les données générées restent accessibles en JavaScript indépendamment du rendu.
- Il est possible de sélectionner deux points connectés et de calculer un chemin approximatif entre eux.
- La ville obtenue paraît organique : rues courbes ou irrégulières, parcelles non uniformes, quartiers adaptés à leurs fonctions.

## Questions à trancher plus tard

- Faut-il gérer un vrai relief ou seulement une influence abstraite sur les routes ?
- La génération doit-elle rester entièrement côté client ou prévoir un export/import JSON ?
- Le style visuel doit-il imiter une carte manuscrite, un plan cadastral ou une vue schématique ?
- Faut-il permettre l'édition manuelle de la ville générée ?
- Le projet doit-il rester sans dépendances ou accepter une petite bibliothèque géométrique si nécessaire ?

## État d'implémentation initial

Le premier jalon fonctionnel est maintenant présent dans le dépôt :

- `index.html` fournit l'interface de génération, les contrôles de paramètres et les panneaux de carte/statistiques.
- `src/main.js` orchestre la lecture des paramètres, la génération, la validation et le rendu.
- `src/rng.js` fournit un générateur pseudo-aléatoire déterministe basé sur une graine textuelle.
- `src/geometry/` contient les primitives, opérations de polygone, intersections et un index spatial simple.
- `src/generation/` génère l'emprise organique, la rivière, les murailles, portes, quartiers, cellules, parcelles, bâtiments, routes et le graphe de circulation.
- `src/render/svg-renderer.js` convertit les données géométriques en calques SVG séparés.
- `src/debug/validation.js` effectue des contrôles géométriques et de connexité de base.
- `scripts/validate-generation.js` exécute une génération déterministe de test et vérifie que la structure minimale est utilisable.

Cette version reste volontairement légère : elle privilégie une géométrie simple, déterministe et inspectable avant d'ajouter des algorithmes plus avancés de subdivision et de correction topologique.
