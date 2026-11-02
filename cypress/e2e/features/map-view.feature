# language: fr
# Brouillon dérivé du code (MapView.jsx, RestaurantMarkers.jsx, MarkerPopUp.jsx) : scénarios à valider par un humain.
# TODO(testid): rendu Leaflet, sélecteurs de repli sur les classes .leaflet-* et la popup.
Fonctionnalité: Carte et marqueurs de restaurants
  Pour repérer les restaurants autour d'une ville
  En tant qu'utilisateur
  Je vois la carte, les marqueurs et la popup de chaque restaurant

  Contexte:
    Soit les API externes sont simulées
    Et j'ouvre la page d'accueil

  # composant: MapView
  # étape: map-view
  # champ: map_container
  # selector: .leaflet-container
  # [NOMINAL]
  Scénario: La carte est affichée à l'ouverture
    Alors je vois la carte
    Et aucun marqueur n'est affiché

  # composant: RestaurantMarkers
  # étape: map-view
  # champ: map_marker
  # selector: .leaflet-marker-icon
  # intercept-required: GET search (featureType=city), GET search (amenity=McDonald)
  # [LISTE]
  # render: restaurants.map, un Marker par restaurant
  Scénario: Un marqueur est affiché par restaurant retourné
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Alors 2 marqueurs sont affichés

  # composant: RestaurantMarkers
  # étape: map-view
  # champ: map_marker
  # selector: .leaflet-marker-icon
  # intercept-required: GET search (amenity=McDonald) avec une liste vide
  # [CONDITIONNEL]
  # render: restaurants && restaurants.map, liste vide
  Scénario: Aucun marqueur quand aucun restaurant n'est trouvé
    Soit l'API de recherche de restaurants ne retourne aucun résultat
    Et j'ai lancé la recherche de restaurants pour "Lyon"
    Alors aucun marqueur n'est affiché

  # composant: MarkerPopUp
  # étape: map-view
  # champ: map_popup_name
  # selector: .leaflet-popup-content div.font-bold
  # intercept-required: GET search (featureType=city), GET search (amenity=McDonald)
  # [NOMINAL]
  Scénario: Cliquer un marqueur ouvre la popup du restaurant
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Quand je clique sur le marqueur numéro 1
    Alors la popup affiche le nom "McDonald's Lyon Bellecour"
    Et la popup propose le bouton Choisir

  # composant: MarkerPopUp
  # étape: map-view
  # champ: map_popup_choose
  # selector: .leaflet-popup-content button
  # intercept-required: GET lookup
  # [NOMINAL]
  Scénario: Choisir un restaurant dans la popup lance la recherche de ses détails
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Et je clique sur le marqueur numéro 1
    Quand je clique sur Choisir
    Alors un appel de détails est émis
