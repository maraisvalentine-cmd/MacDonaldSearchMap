# MacDonaldSearchMap
Une interface utilisateur permettant la recherche et l'affichage de restaurants Mac-Donald sur une carte interactive.

## Les technologies utilisées
- Figma : Utilisation de Figma la maquette initiale.
- Framework React.js : Utilisation du framework reactjs pour développer l'application.
- Librairie Axios : Utilisation d'Axios pour les appels HTTP. 
- React Leaflet : Utilisation de la bibliothèque react leaflet pour intégrer Leaflet (carte interactive) dans l'application React.
- API Nominatim : Appels à l'API Nominatim pour rechercher des villes et localiser des restaurants.
- Framework Vitest / librairie Jest Dom : Utilisation pour des tests unitaires efficaces.

## Description du parcours utilisateur
- Accueil : L’utilisateur arrive sur un écran affichant une carte interactive, un champ de recherche et un overlay précisant qu’aucun restaurant n’est encore sélectionné.
- Recherche : L’utilisateur entre le nom de la ville souhaitée dans le champ de recherche.
- Affichage des suggestions : Une liste de villes correspondant à la recherche s’affiche sous le champ.
- Sélection : L’utilisateur sélectionne une ville parmi les suggestions.
- Mise à jour de la carte : La carte se centre sur la ville sélectionnée, et les restaurants MacDonald y sont affichés sous forme de marqueurs.
- Interactivité des marqueurs : En cliquant sur un marqueur, une popup s’ouvre pour afficher l’adresse exacte du restaurant ainsi qu’un bouton "Sélectionner".
- Validation : Lorsque l’utilisateur clique sur "Sélectionner", l’overlay affiche les détails du restaurant sélectionné et un bouton "Continuer".

## Spécificités techniques :
Organisation du projet :
Architecture modulaire respectant les meilleures pratiques react.
Documentation complète des composants et services.
Carte interactive :
Utilisation de react leaflet pour gérer la carte et les marqueurs.
Fonctionnalité d’interaction avec les marqueurs pour afficher des popups dynamiques.
Requêtes API :
Intégration de l'API Nominatim pour la recherche de villes et des coordonnées géographiques.
Limitation des requêtes en déclenchant les appels API uniquement après validation (par exemple, un clic sur un bouton de recherche).
Améliorations potentielles :
Proposer une géolocalisation automatique pour centrer la carte sur la position actuelle de l'utilisateur.
Afficher les restaurants à proximité de la position actuelle.
Tests et validation :
Tests unitaires : Chaque composant React doit être testé individuellement.
Validation fonctionnelle : L’application complète doit être testée pour garantir :
Une architecture correcte des composants et des assets.
Un découpage clair et cohérent des différents modules et composants.
Livrables attendus :
Une application REACT fonctionnelle et déployée sur un serveur.
Présentation détaillée de l'architecture, des spécificités du framework, et du fonctionnement global.
Capacité à répondre à des demandes de modifications ou ajouts de code en direct.
Critères d’évaluation :
Maîtrise de react :
Syntaxe, architecture, et fonctionnalités spécifiques au framework.
Compatibilité des versions du framework et des dépendances utilisées.
Organisation et optimisation :
Cohérence dans le choix des dépendances.
Gestion correcte des variables d'environnement.
Utilisation optimale des solutions existantes pour résoudre les problèmes techniques.
Fonctionnalité :
Application livrée fonctionnelle et répondant aux attentes.
Capacité à identifier et résoudre les erreurs de développement.
Maîtrise des outils de débogage.

 
