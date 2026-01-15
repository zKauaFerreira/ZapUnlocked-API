# <img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/fr.svg" width="40"> [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) 📲✨

![ZapUnlocked-API Banner](https://github.com/zKauaFerreira/ZapUnlocked-API/raw/refs/heads/documentation/images/hero-dark.svg)

<p align="center">
  <img src="https://img.shields.io/github/stars/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Stars">
  <img src="https://img.shields.io/github/forks/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Forks">
  <img src="https://img.shields.io/github/repo-size/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Repo Size">
  <img src="https://img.shields.io/github/license/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="License">
</p>

## Qu'est-ce que [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) ?

**[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)** est une solution professionnelle, **100% gratuite et open-source**, conçue pour transformer WhatsApp en un puissant outil d'automatisation. Construite sur le moteur **Baileys**, cette API offre une interface REST simple pour gérer les sessions, envoyer des médias complexes et créer des interactions intelligentes sans avoir besoin d'une base de données lourde.

> [!TIP]
> Parfait pour les développeurs à la recherche de rapidité dans l'intégration de bots, de notifications et de systèmes de service client automatisés.

---


## 🚀 Fonctionnalités Phares

- **Boutons Stateless** : Créez des flux interactifs sans avoir besoin de base de données, avec des webhooks chiffrés.
- **Appairage sans QR Code** : Connectez-vous via un code numérique, idéal pour les serveurs sans interface graphique ou caméras.
- **Conversion Automatique de l'Audio** : Envoyez des audios qui apparaissent comme des messages vocaux enregistrés (PTT) nativement sur iOS et Android.
- **File d'Attente de Médias Intelligente** : Gestion automatique pour éviter une consommation excessive de mémoire.
- **Placeholders Dynamiques** : Personnalisez vos messages et webhooks avec des variables comme `{{name}}`, `{{day}}` et `{{phone}}`.

---

## 🛤️ Routes Principales

### 📨 Envoi de Messages
- `POST /send` - Envoyer un Message Texte
- `POST /send_reaction` - Envoyer une Réaction avec Emoji
- `POST /send_wbuttons` - Envoyer un Message avec Bouton (Stateless)
- `POST /send_sticker` - Envoyer un Autocollant
- `POST /send_image` - Envoyer une Image
- `POST /send_video` - Envoyer une Vidéo
- `POST /send_audio` - Envoyer un Audio (avec conversion automatique)
- `POST /send_document` - Envoyer un Document

### 🔍 Consultas et Gestion
- `POST /contacts/info` - Informations Détaillées du Contact
- `GET /fetch_messages` - Récupérer l'Historique des Messages
- `GET /recent_contacts` - Lister les Contacts Récents
- `GET /management/volume_stats` - Vérifier l'Utilisation du Disque
- `DELETE /management/cleanup` - Effacer l'Historique des Messages

### 🔗 Connexion et Session
- `GET /status` - État de la Connexion et de la Session
- `GET /qr` - Voir le QR Code Interactif
- `GET /qr/image` - Obtenir l'Image du QR Code (Base64)
- `POST /qr/pair` - Générer un Code d'Appairage Numérique
- `POST /qr/logout` - Déconnexion et Réinitialisation de la Session

### 📡 Webhooks (Globaux)
- `POST /webhook/config` - Configurer l'URL du Webhook
- `POST /webhook/toggle` - Activer/Désactiver la Réception
- `DELETE /webhook/delete` - Supprimer la Configuration

### ⚙️ Profil et Confidentialité
- `POST /settings/profile` - Changer le Nom et la Photo du Bot
- `POST /settings/privacy` - Ajuster la Confidentialité (Vu à, etc.)
- `POST /settings/block` - Bloquer/Débloquer un Contact

---

## 🚂 Hébergement 100% Gratuit sur Railway ☁️

Cette API a été optimisée pour être hébergée **entièrement gratuitement** via **Railway**. Profitez des ressources du plan Free pour garder votre bot en ligne 24h/24 et 7j/7 sans frais de serveur.

👉 **[Cliquez ici pour voir le guide de configuration sur Railway](https://zapdocs.kauafpss.qzz.io/essentials/quickstart)**

---

## 📖 Documentation Officielle

Pour une documentation technique détaillée, des exemples de code et un playground interactif, visitez notre site officiel.

👉 **[Accéder à la Documentation Officielle](https://zapdocs.kauafpss.qzz.io)**

---

## ❤️ Crédits et Remerciements

Ce projet n'est possible que grâce au travail incroyable de la communauté open-source :

- **[Itsukichan](https://github.com/itsukichann/baileys)**: Pour le fantastique fork de Baileys qui aide par la facilité de créer des fonctions en suivant la documentation.
- **[Baileys (WhiskeySockets)](https://github.com/WhiskeySockets/Baileys)** : La bibliothèque de base qui a révolutionné la connexion avec WhatsApp.
- **[Railway](https://railway.app/)** : Pour avoir mis à disposition une infrastructure gratuite de haute qualité (1 vCPU, 0,5 Go de RAM et 500 Mo de stockage dans le plan Free).

---

## 📄 Licence

Ce projet est sous **Licence MIT**. N'hésitez pas à utiliser, modifier et distribuer le code. Pour plus de détails, veuillez consulter le fichier [LICENSE](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/LICENSE).

---

Fait avec 💜 par [Kauã Ferreira](https://www.instagram.com/kauafpss_/).

**Amusez-vous à automatiser avec [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) !** 😎📱🚀

👉 **[Retour au README principal](../README.md)**
