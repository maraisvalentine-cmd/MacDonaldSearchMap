# language: fr
# Brouillon dérivé du code (GeolocateComponent.jsx, MapView.jsx) : scénarios à valider par un humain.
Fonctionnalité: Géolocalisation
  Pour trouver les restaurants proches de ma position
  En tant qu'utilisateur
  Je clique sur le bouton de géolocalisation

  Contexte:
    Soit les API externes sont simulées
    Et j'ouvre la page d'accueil

  # composant: GeolocateComponent
  # étape: geolocate
  # champ: geolocate_button
  # selector: [data-testid=geolocate-button]
  # [NOMINAL]
  Scénario: Le bouton de géolocalisation est affiché
    Alors je vois le bouton de géolocalisation

  # composant: GeolocateComponent
  # étape: geolocate
  # champ: geolocate_button
  # selector: [data-testid=geolocate-button]
  # intercept-required: GET search (amenity=McDonald)
  # [NOMINAL]
  # render: LocateAndSearch, locationfound déclenche setPosition puis doSearch
  Scénario: Géolocaliser lance la recherche de restaurants autour de ma position
    Soit la géolocalisation du navigateur renvoie la position de Lyon
    Quand je clique sur le bouton de géolocalisation
    Alors un appel de recherche de restaurants est émis
    Et 2 marqueurs sont affichés

  # composant: GeolocateComponent
  # étape: geolocate
  # champ: geolocate_button
  # selector: [data-testid=geolocate-button]
  # [CONDITIONNEL]
  # render: locationerror non géré, aucune recherche lancée
  Scénario: Un refus de géolocalisation ne lance aucune recherche
    Soit la géolocalisation du navigateur est refusée
    Quand je clique sur le bouton de géolocalisation
    Alors aucun appel de recherche de restaurants n'a été émis
    Et aucun marqueur n'est affiché
