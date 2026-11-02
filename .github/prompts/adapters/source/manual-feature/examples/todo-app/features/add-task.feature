# langue: fr
Fonctionnalité: Ajout d'une tâche

  # champ: task_title
  # [nominal]
  Scénario: Une tâche ajoutée apparaît dans la liste
    Étant donné que la liste des tâches est vide
    Quand j'ajoute la tâche "Acheter du pain"
    Alors la tâche "Acheter du pain" apparaît dans la liste

  # champ: task_title
  # [nominal]
  Scénario: Le champ titre est obligatoire
    Quand je valide sans saisir de titre
    Alors un message "Titre requis" est affiché
