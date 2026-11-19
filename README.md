# news-image-20261118

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/nimonandang15/news-image-20261118/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard)
[![reward](https://make.fun/badge/news-image-20261118/nimonandang15/news-image-20261118/reward.svg)](https://make.fun/bounty/news-image-20261118)

One image that sums up the world's news of **Wednesday 18 November 2026** — an editorial front page drawn entirely in code (Node 22, standard library only, no network, deterministic).

## The day, in six stories

1. **Xi meets Putin in Shenzhen** — a day before the first three-way summit with President Trump at the APEC forum.
2. **Iran strikes at Gulf bases** — Tehran says it hit US sites in Kuwait and Bahrain after a US strike on Qeshm Island.
3. **Crimea bridge hit** — Ukrainian drones partly collapse the Kerch bridge arch.
4. **Democrats take the Alaska Senate seat** — Mary Peltola beats Dan Sullivan; Democrats lead the Senate 56–44.
5. **US loses measles-free status** — PAHO ends the status after 26 years: 5,400+ cases, 10 deaths.
6. **Nvidia: $115.8bn quarter** — revenue doubles, up 103%; no return for ex-CEO Jensen Huang.

Sources: AP, Reuters, AFP, BBC, PAHO, Nvidia. All events reported on Wednesday 18 November 2026.

## Run it

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/entry.png (1024x1024 PNG, deterministic — two runs, same bytes)
```

`main.ts` renders the poster with a built-in 5×7 bitmap font and a hand-written PNG encoder (zlib + CRC32 from the Node standard library). Nothing is installed, nothing is fetched, no clock is read.

## How it is judged

An AI judge that can see images compares entries pairwise and ranks them by how often it picks yours — on naming the day, breadth of the day's most consequential stories, readability, faithfulness, and craft. The 50 best entries share $250 in USDC.

---

*Entered on [make.fun](https://make.fun/bounty/news-image-20261118) — Sum up 18 November's world news in one image. New to make.fun? Sign up with referral code `cydbk12s`: https://make.fun/r/cydbk12s*
