# 🧪 Guide de Test Multi-Profils (Beta)

Puisque l'application utilise le stockage local de votre navigateur pour identifier votre "session", ouvrir plusieurs onglets classiques ne fonctionnera pas (ils partageront le même utilisateur).

Voici comment simuler plusieurs médecins/internes :

## Méthode 1 : Mode Incognito (La plus simple)
1. Ouvrez votre navigateur principal (Fenêtre A).
2. Créez un service et copiez le **Code de joining**.
3. Ouvrez une **Fenêtre de navigation privée** (Incognito) (Fenêtre B).
4. Allez sur `http://localhost:5174/join` et entrez le code.
5. Vous avez maintenant deux utilisateurs totalement différents.

## Méthode 2 : Plusieurs Navigateurs
*   Navigateur 1 (Chrome/Arc) : L'administrateur qui crée le groupe.
*   Navigateur 2 (Safari/Firefox) : L'interne qui demande à rejoindre.

---

## Scénario de test "Hard Core"

### 1. Préparation (Navigateur A)
- Créez un service "Urgences Test".
- Créez un groupe "Équipe de Nuit 🌙".
- Restez sur la page **Groupes**.

### 2. Candidature (Navigateur B)
- Rejoignez le service avec le code.
- Allez dans **Groupes**.
- Cliquez sur **Rejoindre** sur "Équipe de Nuit 🌙".
- Le bouton doit passer en "En attente".

### 3. Validation (Navigateur A)
- Sans rafraîchir, vous devriez voir apparaître la section **"Demandes à valider"**.
- Cliquez sur ✅.

### 4. Vérification (Navigateur B)
- Magie : Le statut de l'internne B passe instantanément à "Mon groupe" grâce au **Supabase Realtime**.

---

## 🛠️ Astuce pour "Reset" vos tests
Si vous voulez tout recommencer proprement sur le même navigateur :
1. Faites un clic droit -> **Inspecter**.
2. Allez dans l'onglet **Application** (ou Stockage).
3. Dans **Local Storage**, faites un clic droit sur l'URL et **Clear**.
4. Rafraîchissez la page : vous êtes redevenu un nouvel utilisateur.
