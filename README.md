# MacDonaldSearchMap
Une interface utilisateur permettant la recherche et l'affichage de restaurants McDonald's sur une carte interactive.

## Les technologies utilisées
- Figma : Utilisation de Figma la maquette initiale.
- Framework React.js : Utilisation du framework reactjs pour développer l'application.
- Librairie Axios : Utilisation d'Axios pour les appels HTTP.
- React Leaflet : Utilisation de la bibliothèque react leaflet pour intégrer Leaflet (carte interactive) dans 
  l'application React.
- API Nominatim : Appels à l'API Nominatim pour rechercher des villes et localiser des restaurants.
- Framework Vitest / librairie Jest Dom : Utilisation pour des tests unitaires efficaces.
- Librairie React Redux : Pour un partage des informations plus efficace entre composants.

## Description du parcours utilisateur
- Accueil : L’utilisateur arrive sur un écran affichant une carte interactive, un champ de recherche et un overlay 
  précisant qu’aucun restaurant n’est encore sélectionné.

- Recherche : L’utilisateur entre le nom de la ville souhaitée dans le champ de recherche.

- Affichage des suggestions : Une liste de villes correspondant aux caractères tapés s’affiche sous le champ dès 3 
  caractères saisis.

- Sélection : L’utilisateur sélectionne une ville parmi les suggestions.

- Géolocalisation : L'utilisateur peut utiliser un bouton de géolocalisation qui effectuera la recherche à l'endroit 
  localisé.

- Mise à jour de la carte : La carte se centre sur la ville sélectionnée, et les restaurants McDonald's sont affichés 
  sous forme de marqueurs sur toute la zone de la carte dans la limite de 20 restaurants.

- Interactivité des marqueurs : En cliquant sur un marqueur, une popup s’ouvre pour afficher l’adresse exacte du 
  restaurant ainsi qu’un bouton "Sélectionner".

- Validation : Lorsque l’utilisateur clique sur "Sélectionner", l’overlay affiche les détails du restaurant sélectionné 
  et un bouton "Continuer" redirigeant si possible vers le site du McDonald's en question. L'utilisateur pourra aussi 
  masquer les détails tout en gardant sa sélection via un bouton, ou même effacer sa sélection avec un bouton fermer.

