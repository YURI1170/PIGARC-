# PIGARC - Système de Gestion des Ressources et des Projets

PIGARC est une application web moderne pour la gestion des ressources et des projets, développée avec Spring Boot et Thymeleaf.

## Fonctionnalités

- Gestion des ressources (humaines, matérielles, financières)
- Gestion des projets
- Tableau de bord avec statistiques
- Système de rapports
- Interface utilisateur moderne et responsive
- Authentification et autorisation

## Technologies utilisées

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL/PostgreSQL

### Frontend
- Thymeleaf
- Tailwind CSS
- JavaScript (ES6+)
- Chart.js pour les graphiques
- Axios pour les requêtes HTTP

## Prérequis

- JDK 17 ou supérieur
- Maven
- Node.js et npm
- Base de données MySQL ou PostgreSQL

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/pigarc.git
cd pigarc
```

2. Configurer la base de données :
- Créer une base de données MySQL/PostgreSQL
- Configurer les paramètres de connexion dans `application.properties`

3. Installer les dépendances frontend :
```bash
npm install
```

4. Compiler et démarrer l'application :
```bash
mvn spring-boot:run
```

5. Accéder à l'application :
- URL : http://localhost:8080
- Identifiants par défaut : admin/admin

## Structure du projet

```
pigarc/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/pigarc/
│   │   │       ├── controllers/
│   │   │       ├── models/
│   │   │       ├── repositories/
│   │   │       ├── services/
│   │   │       └── config/
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   └── images/
│   │       └── templates/
│   │           ├── fragments/
│   │           └── pages/
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── js/
│   │   └── css/
│   ├── package.json
│   └── vite.config.js
└── pom.xml
```

## Développement

### Backend
- Les contrôleurs REST sont dans `controllers/`
- Les modèles de données dans `models/`
- Les services métier dans `services/`
- Les repositories JPA dans `repositories/`

### Frontend
- Les pages Thymeleaf dans `templates/`
- Les fragments réutilisables dans `templates/fragments/`
- Les styles dans `static/css/`
- Le JavaScript dans `static/js/`

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Créer une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub. 