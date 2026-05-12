# Générateur de ville médiévale

Application web sans dépendances lourdes qui génère une ville médiévale organique en JavaScript, HTML et SVG, affichée depuis `index.html`.

Le générateur produit une géométrie structurée et réutilisable : quartiers, cellules, parcelles, routes, ruelles, rivière, murailles, bâtiments, jardins, champs et graphe de circulation. La documentation détaillée du plan initial se trouve dans [`docs/medieval-city-generator-plan.md`](docs/medieval-city-generator-plan.md).

## Lancer localement

Ouvrez `index.html` dans un navigateur moderne ou servez le dossier avec un serveur statique :

```bash
python3 -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

## Vérifier la génération

```bash
npm run check
```

Cette commande vérifie la syntaxe des modules principaux et génère une ville de test afin de valider la présence des quartiers, cellules, parcelles, bâtiments et chemins.


## Publier sur GitHub Pages

Ce dépôt contient un workflow GitHub Actions prêt à publier `index.html` et les fichiers statiques du dépôt sur GitHub Pages : [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

### Configuration côté GitHub

1. Poussez le dépôt sur GitHub, idéalement avec la branche par défaut nommée `main`.
2. Dans GitHub, ouvrez **Settings** → **Pages**.
3. Dans **Build and deployment**, choisissez **Source: GitHub Actions**.
4. Vérifiez que les Actions sont autorisées dans **Settings** → **Actions** → **General** si votre organisation les limite.
5. Poussez un commit sur `main` ou lancez manuellement le workflow **Deploy static site to GitHub Pages** depuis l’onglet **Actions**.
6. Une fois le job terminé, GitHub affiche l’URL dans **Settings** → **Pages**. Elle aura généralement la forme `https://<utilisateur>.github.io/<repo>/`.

### Adapter la branche de publication

Le workflow se déclenche actuellement sur `main`. Si votre branche par défaut s’appelle autrement, modifiez la section suivante dans `.github/workflows/pages.yml` :

```yaml
on:
  push:
    branches: ["main"]
```

Remplacez `main` par le nom de votre branche, par exemple `work` ou `master`.
