# language: fr
# Brouillon dérivé du code (SelectionDetails.jsx) : scénarios à valider par un humain.
# TODO(testid): boutons repérés par leur attribut role (hide, close, show, continue), reste en sélecteurs de repli.
Fonctionnalité: Détails du restaurant sélectionné
  Pour consulter l'adresse et les informations d'un restaurant
  En tant qu'utilisateur
  Je vois un bandeau de détails que je peux réduire, rouvrir et fermer

  Contexte:
    Soit les API externes sont simulées
    Et j'ouvre la page d'accueil

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_empty_label
  # selector: span.font-bold
  # render: !address, aucun restaurant sélectionné
  # [NOMINAL]
  Scénario: Aucun restaurant n'est sélectionné à l'ouverture
    Alors le bandeau indique "Aucun restaurant sélectionné"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_address
  # selector: .grid > div:first-child
  # intercept-required: GET lookup (osm_ids=W11111111)
  # [NOMINAL]
  Scénario: Choisir un restaurant affiche son adresse
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 1
    Alors le bandeau indique "Restaurant sélectionné"
    Et les détails contiennent "McDonald's"
    Et les détails contiennent "Rue de la République"
    Et les détails contiennent "Lyon 2e Arrondissement"
    Et les détails contiennent "69002 Lyon"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_address
  # selector: .grid > div:first-child
  # intercept-required: GET lookup (osm_ids=W11111111)
  # [CONDITIONNEL]
  # render: osm_type way converti en W
  Scénario: Un restaurant de type way est recherché avec le préfixe W
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 1
    Alors le dernier appel de détails porte sur l'identifiant "W11111111"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_address
  # selector: .grid > div:first-child
  # intercept-required: GET lookup (osm_ids=N22222222)
  # [CONDITIONNEL]
  # render: osm_type autre que way ou relation converti en N
  Scénario: Un restaurant de type node est recherché avec le préfixe N
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 2
    Alors le dernier appel de détails porte sur l'identifiant "N22222222"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_phone
  # selector: .grid > div:nth-child(2)
  # intercept-required: GET lookup
  # [CONDITIONNEL]
  # render: extraData.phone && ..., extraData.opening_hours && ...
  Scénario: Le téléphone et les horaires sont affichés quand ils existent
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 1
    Alors les détails contiennent "Tel :"
    Et les détails contiennent "+33 4 78 00 00 00"
    Et les détails contiennent "Ouverture :"
    Et les détails contiennent "Mo-Su 07:00-23:00"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_hours
  # selector: .grid > div:nth-child(2)
  # intercept-required: GET lookup sans phone, opening_hours ni suburb
  # [CONDITIONNEL]
  # render: extraData.phone && ..., extraData.opening_hours && ..., address.suburb && ...
  Scénario: Les informations absentes ne sont pas affichées
    Soit l'API de détails retourne un restaurant sans coordonnées de contact
    Et j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 1
    Alors les détails ne contiennent pas "Tel :"
    Et les détails ne contiennent pas "Ouverture :"
    Et les détails ne contiennent pas "Lyon 2e Arrondissement"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_hide
  # selector: button[role=hide]
  # intercept-required: GET lookup
  # [CONDITIONNEL]
  # render: hide ? bouton show : boutons hide et close
  Scénario: Réduire le bandeau masque les détails
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Et j'ai choisi le restaurant numéro 1
    Quand je clique sur le bouton "Réduire"
    Alors les détails sont masqués
    Et le bouton "Afficher" est visible
    Et le bouton "Réduire" n'est pas affiché
    Et le bouton "Fermer" n'est pas affiché

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_show
  # selector: button[role=show]
  # intercept-required: GET lookup
  # [CONDITIONNEL]
  # render: hide=false après clic sur show
  Scénario: Rouvrir le bandeau réaffiche les détails
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Et j'ai choisi le restaurant numéro 1
    Et je clique sur le bouton "Réduire"
    Quand je clique sur le bouton "Afficher"
    Alors les détails contiennent "Rue de la République"
    Et le bouton "Réduire" est visible

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_close
  # selector: button[role=close]
  # intercept-required: GET lookup
  # [CONDITIONNEL]
  # render: resetSelectedRestaurant, retour à !address
  Scénario: Fermer le bandeau désélectionne le restaurant
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Et j'ai choisi le restaurant numéro 1
    Quand je clique sur le bouton "Fermer"
    Alors le bandeau indique "Aucun restaurant sélectionné"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_continue
  # selector: a:has(button[role=continue])
  # route: lien externe extraData.website
  # intercept-required: GET lookup
  # [NAVIGATION]
  Scénario: Le bouton Continuer pointe vers le site du restaurant
    Soit j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 1
    Alors le bouton "Continuer" est visible
    Et le lien Continuer pointe vers "https://www.mcdonalds.fr/restaurants/lyon-bellecour"

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_continue
  # selector: a:has(button[role=continue])
  # intercept-required: GET lookup sans website
  # [CONDITIONNEL]
  # TODO(testid): comportement sans site web à confirmer avec le métier, le code passe to=undefined à Link.
  Scénario: Le bouton Continuer reste affiché sans site web
    Soit l'API de détails retourne un restaurant sans site web
    Et j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 1
    Alors le bouton "Continuer" est visible

  # composant: SelectionDetails
  # étape: selection-details
  # champ: details_empty_label
  # selector: span.font-bold
  # intercept-required: GET lookup en erreur 500
  # [CONDITIONNEL]
  # render: onError de mutateDetails, address reste null
  Scénario: Une erreur de l'API de détails laisse le bandeau vide
    Soit l'API de détails répond une erreur
    Et j'ai lancé la recherche de restaurants pour "Lyon"
    Quand j'ai choisi le restaurant numéro 1
    Alors le bandeau indique "Aucun restaurant sélectionné"
