# LocaLLM

Un mini-ChatGPT qui fonctionne directement dans votre navigateur, sans cloud ni collecte de données.

## Fonctionnalités principales
- Chargement local du modèle Llama&nbsp;3.2 3B grâce à **WebLLM**
- Interface de chat moderne avec sélection du modèle
- Réponses générées en streaming pour un rendu fluide
- Basé sur **Next.js** et **Tailwind CSS**

## Installation rapide
```bash
npm install
npm run dev
```
Ouvrez ensuite votre navigateur sur [http://localhost:3000](http://localhost:3000).

## Utilisation de base
1. Sélectionnez le modèle dans l'en-tête de la page
2. Tapez votre question dans la zone de texte
3. Envoyez pour obtenir la réponse générée localement

## Technologies utilisées
- [Next.js](https://nextjs.org/)
- [WebLLM](https://mlc.ai/web-llm/)
- [React](https://react.dev/) et [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## À propos
Ce projet est fourni sous licence MIT. Il permet d'expérimenter facilement les modèles de langage directement sur sa machine.

## Docker
Pour lancer l'application dans un conteneur&nbsp;:
```bash
docker build -t locallm .
docker run -p 3000:3000 locallm
```
La configuration s'effectue via des variables d'environnement passées au conteneur.

## Docker Compose
Vous pouvez également démarrer le service via `docker compose` :
```bash
cp .env.example .env # créez vos variables d'environnement
docker compose up --build
```
