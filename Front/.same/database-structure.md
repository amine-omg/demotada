# Database Structure for Teachizy Clone

## Users Table
- id (primary key)
- email
- password_hash
- first_name
- last_name
- role (instructor/admin/student)
- avatar_url
- created_at
- updated_at

## Formations (Courses) Table
- id (primary key)
- title
- description
- instructor_id (foreign key to users)
- category
- status (draft/published/archived)
- thumbnail_url
- duration_hours
- price
- created_at
- updated_at

## Apprenants (Students) Table
- id (primary key)
- user_id (foreign key to users)
- formation_id (foreign key to formations)
- enrollment_date
- progress_percentage
- completion_date
- status (enrolled/completed/dropped)

## Lessons Table
- id (primary key)
- formation_id (foreign key to formations)
- title
- content
- video_url
- order_index
- duration_minutes

## Student_Progress Table
- id (primary key)
- apprenant_id (foreign key to apprenants)
- lesson_id (foreign key to lessons)
- completed
- completed_at
- time_spent_minutes

## Typical Menu Structure (to be confirmed):
### Formations Section:
- Liste des formations
- Créer une formation
- Statistiques des formations
- Gestion des catégories

### Apprenants Section:
- Liste des apprenants
- Progrès des apprenants
- Statistiques d'engagement
- Communications

### Profile Section:
- Informations personnelles
- Paramètres du compte
- Notifications
- Déconnexion
