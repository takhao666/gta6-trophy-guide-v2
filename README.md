[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/takhao666/gta6-trophy-guide-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/takhao666/gta6-trophy-guide-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI

An offline guide and tracker for all 55 Grand Theft Auto VI PlayStation 5 trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden).

- **A cited guide for every trophy** — each guide is written in our own words and names its sources beside it (mainly PowerPyx's trophy guide, cross-checked against KeenGamer, Push Square, GTASpotter and EGamers). Two trophies are honestly marked unconfirmed where no verified method exists yet.
- **Roadmap to the platinum** — three stages (~200 hours, difficulty 4/10), built from the official descriptions.
- **The one missable trophy flagged** — Positive Mental Attitude: meditate with Lucia on Jason's balcony in Chapter 1.
- **A real tracker** — tick trophies off, progress saves in localStorage, export to a file and import it back; filters by kind (story, missable, collectibles, activities, robbery, side quests), grade and earned state; a spoiler setting hides story trophies until earned; search across names, descriptions and guides.
- **Fully offline** — static files under `app/`, no network requests at run time. Serve `app/` with any static server and open `index.html`.

Unofficial fan guide. Not affiliated with Rockstar Games, Take-Two Interactive or PlayStation. No Rockstar artwork, logos or game screenshots are used.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8083
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
