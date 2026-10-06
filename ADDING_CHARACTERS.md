# Adding a character

Repo notes for future updates. This file is not linked from the site.

`data.js` is the only content file and the **source of truth**. Edit it directly; there is no build step.
(Split copies kept outside this repo are only snapshots. Before rebuilding `data.js` from them, check they match it exactly, or hand edits will be lost.)

## Rules

- Family-friendly: no sexual content, no explicit words, no degrading roles and no gore. Every character is an adult.
  Turn adult or degrading roles into SFW ones (wife/fiancée, partner, colleague, executive, guardian, disciple…).
- Don't mention where the source material came from anywhere on the site.

## 1. Portrait images

Put two JPEGs in `images/characters/`, named after the character's `img` value (normally the same as the slug):

| File | Size | Quality |
|---|---|---|
| `<slug>.jpg` | 606 × 900 (2:3 portrait) | JPEG q85, progressive |
| `<slug>-thumb.jpg` | 202 × 300 (same crop) | JPEG q82, progressive |

Crop to 2:3 first, then resize both from that crop. Most portraits are full-length. For revealing or form-fitting art, crop
to head and shoulders with the face centred (as with `park-ji-yeon`). Example (Pillow):

```python
from PIL import Image
im = Image.open(src).convert('RGB')
W, H = im.size; w = round(H * 2 / 3); l = (W - w) // 2      # centre 2:3 crop (adjust box as needed)
c = im.crop((l, 0, l + w, H))
c.resize((606, 900), Image.LANCZOS).save(f'images/characters/{slug}.jpg', quality=85, optimize=True, progressive=True)
c.resize((202, 300), Image.LANCZOS).save(f'images/characters/{slug}-thumb.jpg', quality=82, optimize=True, progressive=True)
```

To replace a portrait, overwrite both files and update the character's `caption` and the portrait paragraph in `appearance`.

## 2. Character entry

Add an `EONC.push({...});` block before the final `(function(){var order=[...]` line in `data.js`, and add the slug
to `order`. That list sets the display order. Characters missing from it are still shown, at the end.
Copy an existing block (for example `park-ji-yeon`) and fill in every field:

- `slug`, `img`, `short` (display name), `color` (accent hex), `epithet` (short phrase used in the World page list),
  `tags` (any of `sword`, `mage`, `divine`, `leader`, `eon`; these drive the filter chips)
- `name`, `fullName`, `tagline`, `aliases[]`, `titles[]`, `race`, `age` (must clearly be adult), `height`, `build`,
  `hair`, `eyes`, `origin`, `affiliation`, `role`, `status`, `caption`
- `sagas[]` and `firstSaga`: chronicle ids, which must exist in `sagas`
- `tier`: a key of `tiers` (`t1` Beyond Concept, `t1b` Transcendent, `t2` Primordial … `t6` Champion, `t7` Luminary for non-magical worlds). Add a new tier
  if none fits; the ranking page lists tiers automatically.
- `stats`: `{off,def,spd,mys,utl,rea}`, each 1–10. Overall score = their average.
- `note` (optional box shown at the top), `intro`
- `bio[]` and `personality[]`: lists of `{h:"Heading",t:"Text"}`. Separate paragraphs with `\n\n`.
- `appearance`: text
- `powersIntro`, `powers[]`: groups `{cat,blurb,items:[P(...)]}` where
  `P(name, "s"|"e", "Core"|"Peak"|"Support", what, how, limits, feats, alt)`. Use `"s"` for a name taken from the story
  and `"e"` for an editor's name. Give unnamed powers evocative names, as the existing pages do.
- `relationships[]`: `{who, name, kind, text}`. If `who` is another character's slug, the entry links to her page and shows
  her thumbnail. The infobox shows the first six.
- `trivia[]`, `quotes[]` as `["quote","context"]`

Inline markup in text: `**bold**`, `*italic*`, `[[slug]]`, `[[slug|label]]`, `[[place:id]]` and `[[saga:id]]`.

## 3. Chronicle and places

- Add a chronicle to `sagas`: `{id,num,title,world,chars[],blurb,summary,beats[]}`. If a chronicle is set in a world that
  already exists, copy that world's `world` string exactly. The site counts distinct worlds from those strings.
- Add places to `places`: `{id,name,region,type,chars[],sagas[],desc}`. `region` becomes a filter chip on the Places page.
- If it's a new world, add a sentence to the "{W} worlds" section in `world.sections` and any glossary terms.

## 4. What updates automatically

Character counts and number words (home hero, "Meet the N", characters page, filter placeholder, World page list,
ranking intro), prev/next navigation, the ranking ladder, the comparison table, the tier lists, search, the home and
character grids (2/3/4 responsive columns) and the chronicle list.
In `data.js` text, write `{n}`/`{N}` for the number of characters, `{w}`/`{W}` for worlds and `{s}`/`{S}` for chronicles,
lower-case or capitalised. Never write "seven", "eight" and so on by hand. `{LIST}` expands to every character's name and epithet.

## 5. Check before pushing

```bash
python3 -m http.server 8765        # then open http://localhost:8765/#/c/<slug>
grep -ciE "<explicit-word-list>" data.js   # must be 0
```

Open the new character's page, a chronicle page, Power Ranking and a search for the name, and look for console errors.
Then commit and push to `main`. GitHub Pages redeploys in about a minute.
