

Cowboy Bebop
pluto
gallactic wars
Gurren Lagann
Psycho Pass
Puella Magi Madoka Magica
Death Parade
Fate/stay night
Violet Evergarden    v 
Sword Art Online
Re:Zero − Starting Life in Another World
Monogatari Series
86—Eighty-Six
Samurai Champloo
10. Ashita no Joe
11. Blood on the Tracks
12. Blue Period
14. The Horizon


Choujin X Publishing
	Gantz
look back
Solanin
3-gatsu no Lion
nana
  	The Summit of the Gods
    Three Days of Happiness
the bokex
bastard
my derest slef with mecisu afoertthough
Girls' Last Tour
	Emanon: Memories of Emanon
  The Girl From the Other Side: Siúil, a Rún



# ANIME AND MANGA SUPABASE CATALOG MASTER PROMPT

You are creating researched, Supabase-ready story catalog entries for my Anime and Manga website.

The database catalogs only two broad formats:

* Manga
* Anime

Do not create top-level catalog formats for:

* Manhwa
* Manhua
* Webtoon
* Webcomic
* Novel
* Light Novel
* Web Novel
* Game

A Manga or Anime may be adapted from one of those unsupported sources, but the unsupported source must not be added to the top-level `type` field and must not receive its own information column.

The top-level row represents the shared identity of the story.

A story can contain:

* only Manga information
* only Anime information
* both Manga and Anime information

Specific Manga and Anime production types are stored as subformats inside `mangaInfo` and `animeInfo`.

Examples:

* Manga
* One-Shot
* Doujinshi
* TV Series
* Movie
* OVA
* ONA

Do not put those subformats inside the top-level `type` array.

---

# REQUIRED OUTPUT FORMAT

Use this exact output structure every time:

[Story Title]

Chosen cover image to upload: [Best official Manga or Anime cover]

Alternative if useful: [Backup official cover]

Reason: [Explain why the chosen official cover is best for the website. Focus on story meaning, character truth, visual beauty, composition, colors, small-card readability, mood accuracy, symbolism, and spoiler safety.]

Column | Paste this value
id | manga-title-year
title | Story Title
alternativeTitles | ["Alternative Title 1", "Alternative Title 2"]
type | ["manga", "anime"]
creator | Creator Name
heroScore | 9.5
genres | ["Genre 1", "Genre 2", "Genre 3"]
tags | ["Tag 1", "Tag 2", "Tag 3"]
featured | true
description | One researched paragraph containing 7–8 sentences
mangaInfo | []
animeInfo | []

Use this exact column order:

1. id
2. title
3. alternativeTitles
4. type
5. creator
6. heroScore
7. genres
8. tags
9. featured
10. description
11. mangaInfo
12. animeInfo

Do not add extra columns.

Do not remove any required columns.

Do not include `novelInfo`.

---

# TABLE FORMATTING RULES

Do not write:

id: manga-one-piece-1997

Write:

id | manga-one-piece-1997

For ordinary text fields, provide the value only.

For JSONB fields, use valid JSON.

The JSONB fields are:

* alternativeTitles
* type
* genres
* tags
* mangaInfo
* animeInfo

Use double quotation marks.

Correct:

["Action", "Adventure", "Comedy"]

Wrong:

['Action', 'Adventure', 'Comedy']

Do not use trailing commas.

Correct:

["Action", "Adventure"]

Wrong:

["Action", "Adventure",]

Do not wrap the whole answer inside a JSON object.

Do not wrap the whole answer inside a code block.

Do not place comments inside JSON.

Do not use `undefined`.

Use:

* `null`
* `[]`
* an empty string only when the field specifically requires text

Do not place citations, URLs, source names, or research notes inside JSONB values.

When citations are required, place them outside the table values.

---

# DATABASE SCOPE

This catalog contains only Manga and Anime.

Allowed broad top-level formats:

* manga
* anime

Correct:

type | ["manga"]

Correct:

type | ["anime"]

Correct:

type | ["manga", "anime"]

Wrong:

type | ["oneShot"]

Wrong:

type | ["movie"]

Wrong:

type | ["manga", "lightNovel", "anime"]

Wrong:

type | ["manhwa", "anime"]

One-Shot and Doujinshi are Manga subformats.

TV Series, Movie, OVA, ONA, and similar production types are Anime subformats.

They belong inside `mangaInfo.format` or `animeInfo.format`.

---

# INFORMATION PLACEMENT

The top-level row contains shared story information:

* id
* title
* alternativeTitles
* type
* creator
* heroScore
* genres
* tags
* featured
* description

`mangaInfo` contains Manga-specific information:

* Manga subformat
* Manga title when needed
* publication status
* volumes
* chapters
* magazines
* publisher
* demographic
* release year
* publication period
* Manga-specific notes

`animeInfo` contains Anime-specific information:

* Anime subformat
* Anime title when needed
* production studios
* release period
* start year
* end year
* episodes
* movies
* Anime status
* Anime-specific notes

Do not mix these categories.

Do not place Manga demographic inside `genres`.

Do not place Anime studios at the top level.

Do not place episodes inside `mangaInfo`.

Do not place Manga magazines inside `animeInfo`.

---

# ID RULES

Use one of these structures:

manga-title-year

anime-title-year

The ID must use the earliest supported format included in the database.

Use `manga` when:

* the Manga came before the Anime
* the Manga is the primary supported version
* the story has Manga but no Anime

Use `anime` when:

* the work is Anime-original
* no Manga version is included
* the Anime was released before a later Manga adaptation

Examples:

manga-one-piece-1997
manga-monster-1994
manga-berserk-1989
manga-vagabond-1998
manga-attack-on-titan-2009
manga-chainsaw-man-2018
anime-cowboy-bebop-1998
anime-psycho-pass-2012

Use lowercase.

Separate words using hyphens.

Remove punctuation that would make the ID inconsistent.

Use the first release year of the earliest supported Manga or Anime version.

Do not change the ID later unless the original supported format or release year was previously identified incorrectly.

## Unsupported original sources

Some Anime or Manga are adapted from:

* Light Novels
* Novels
* Web Novels
* Games
* Manhwa
* Manhua
* Webtoons

Those source formats are outside this catalog.

Do not use them in the ID.

For example, when an Anime adapts a Light Novel but no Manga is included:

anime-example-title-2020

Mention the original source only in a short `animeInfo.notes` value when useful.

---

# TITLE RULES

Use the main official or widely established English catalog title when available.

The top-level title represents the shared story identity.

Use official capitalization and punctuation.

Do not use:

* random fan nicknames
* memes
* unofficial abbreviations
* misspelled titles
* shortened titles when an official full title is available

Do not repeat the same title inside `mangaInfo` or `animeInfo` unless the specific version needs its own title.

---

# ALTERNATIVE TITLE RULES

`alternativeTitles` must always be a JSON array.

Include useful official alternative titles such as:

* native titles
* romanized titles
* alternate official English titles
* former official titles
* important subtitle variations

Example:

alternativeTitles | ["進撃の巨人", "Shingeki no Kyojin"]

Do not include:

* random fan nicknames
* memes
* unnecessary abbreviations
* unofficial translations with little recognition
* the exact same title as the top-level title

When there are no useful alternative titles, use:

alternativeTitles | []

---

# TYPE RULES

`type` must always be a JSON array.

Use only:

* manga
* anime

Examples:

type | ["manga"]

type | ["anime"]

type | ["manga", "anime"]

Do not use:

* Manga
* One-Shot
* Doujinshi
* TV Series
* Movie
* Movie Series
* OVA
* ONA
* Special
* TV Recut
* Compilation Movie
* Short

Those are subformats and belong inside the correct information array.

Do not use demographics inside `type`.

Do not use unsupported source formats inside `type`.

---

# CREATOR RULES

Use the original creator or primary credited creator.

For Manga:

* use the mangaka
* use the officially credited writer-artist
* use both creators when the work has a separate writer and artist who are equally central

For Anime-original works:

* use the official original creator credit
* use the main credited creator
* use the studio only when it is officially credited as the original creator identity

Do not use an Anime studio as the creator for a Manga adaptation.

Anime studios belong inside `animeInfo.studios`.

Use one clean text value.

Example:

creator | Tsugumi Ohba and Takeshi Obata

Do not use a JSON array in the creator field.

When an Anime or Manga adapts an unsupported source, use the original credited creator when that creator represents the shared story identity.

---

# HERO SCORE RULES

Use a numeric value between 0 and 10.

Example:

heroScore | 9.6

Do not put the number inside quotation marks.

Use reasonable precision.

One decimal place is usually enough.

Consider:

* writing quality
* character depth
* thematic depth
* originality
* consistency
* visual storytelling
* artistic or production quality
* influence
* long-term reputation
* story execution
* adaptation quality when the Anime is important to the shared identity

Do not copy one public database score directly.

Do not automatically give every famous title a score above 9.

Do not treat popularity as the same thing as quality.

---

# FEATURED RULES

Use only:

true

or:

false

Do not place the value inside quotation marks.

Use `true` when the story should receive additional visibility on the website.

Do not automatically mark every popular title as featured.

---

# GENRE RULES

`genres` must always be a valid JSON array.

Genres describe the broad kind of story and its major narrative forces.

There is no fixed minimum number of genres.

There is no fixed maximum number of genres.

Include every allowed genre that clearly, repeatedly, and meaningfully applies to the complete story.

Do not stop at four genres.

Do not remove an important genre because the story already has several others.

Do not add weak genres merely to make the array longer.

A simple story may naturally use two or three genres.

A complex story may naturally use six, seven, eight, or more genres.

The correct amount is:

All and only the genres that meaningfully apply.

---

# ALLOWED GENRES

Use only these exact values:

* Action
* Adventure
* Comedy
* Coming-of-Age
* Crime
* Drama
* Dystopian
* Fantasy
* Historical
* Horror
* Martial Arts
* Music
* Mystery
* Philosophical
* Political
* Psychological
* Romance
* Sci-Fi
* Slice of Life
* Sports
* Supernatural
* Thriller
* War
* Western

Do not invent additional genre spellings.

Do not use unsupported variations.

---

# GENRE INCLUSION TEST

Add a genre when one or more of these statements are strongly true:

1. It is a major part of the central premise.
2. It repeatedly drives important conflicts.
3. It strongly defines the overall tone or experience.
4. It remains important across a meaningful portion of the story.
5. Removing it would give readers an inaccurate understanding.
6. A reader searching for that genre would reasonably expect this title.
7. It helps distinguish the story from other titles.

Do not add a genre when:

* it appears only in one short scene
* it appears only in one minor arc
* it applies only to a side character
* it is technically present but not important
* it is based only on marketing language
* it is based only on a trailer
* it would reveal a major spoiler
* it is being added only to increase search visibility

Evaluate the complete spoiler-safe identity of the story.

Do not classify a long series only from its first season or opening arc.

---

# GENRE DEFINITIONS

## Action

Use when fighting, combat, pursuit, dangerous confrontation, or high-intensity physical conflict is a major recurring part of the story.

Do not add Action because one fight occurs.

## Adventure

Use when travel, exploration, discovery, quests, or movement into unfamiliar places is central.

## Comedy

Use when humor is a major and recurring part of the intended experience.

Do not add Comedy only because occasional jokes exist.

## Coming-of-Age

Use when emotional, moral, or social growth toward maturity is one of the main journeys.

## Crime

Use when criminal activity, organized crime, policing, investigation, courts, or legal justice is central.

## Drama

Use when serious emotional, interpersonal, moral, or social conflict drives the story.

## Dystopian

Use when an oppressive, controlled, damaged, or deeply unjust society is central to the world and conflict.

## Fantasy

Use when magic, impossible worlds, invented supernatural systems, or mythic elements are central.

## Historical

Use when the story is meaningfully grounded in a real historical period or important historical events.

## Horror

Use when fear, dread, disturbing imagery, monstrosity, psychological terror, or threatening supernatural forces are major parts of the intended experience.

## Martial Arts

Use when martial arts, technique, training, schools, competition, or martial philosophy is central.

## Music

Use when music creation, performance, bands, idols, or musical development drives the story.

## Mystery

Use when discovering hidden information, solving questions, investigating events, or interpreting clues is central.

## Philosophical

Use when the story repeatedly and meaningfully examines ideas such as:

* freedom
* morality
* existence
* purpose
* truth
* responsibility
* consciousness
* human nature
* fate
* the value of life

Do not add Philosophical because of one meaningful quote.

## Political

Use when governance, institutions, ideology, state power, diplomacy, succession, revolution, propaganda, or political strategy is central.

## Psychological

Use when trauma, identity, perception, mental states, obsession, memory, manipulation, or internal conflict is deeply explored.

Do not omit Psychological simply because Action, Drama, or Horror has already been selected.

## Romance

Use when romantic attraction, longing, partnership, or relationship development is central.

## Sci-Fi

Use when speculative science, technology, space travel, artificial intelligence, cybernetics, or scientific experimentation is central.

## Slice of Life

Use when ordinary daily experiences, family, relationships, school, work, or quiet routines form a major part of the narrative.

## Sports

Use when athletic competition, training, teams, tournaments, or sports careers are central.

## Supernatural

Use when spirits, curses, demons, ghosts, psychic powers, supernatural beings, or unexplained forces are central.

## Thriller

Use when suspense, danger, pursuit, conspiracy, uncertainty, or escalating tension drives the story.

## War

Use when organized warfare, occupation, military campaigns, resistance, national conflict, or the consequences of war are central.

## Western

Use when frontier settings, gunslinger traditions, Western imagery, or Western narrative structures are substantial.

---

# DO NOT USE THESE AS GENRES

Do not use formats as genres:

* Anime
* Animation
* Manga
* One-Shot
* Doujinshi
* Movie
* OVA
* ONA

Do not use demographics as genres:

* Shonen
* Seinen
* Shojo
* Josei
* Kodomo

Do not use moods as genres when an appropriate tag exists.

Examples:

Use:

Fantasy

as the genre and:

Dark Fantasy

as the tag.

Use:

Drama

as the genre and:

Tragedy

as the tag.

Use:

Philosophical

as the genre and:

Existential

as the tag.

Use:

War

or:

Political

as genres and:

War And Politics

as a tag.

---

# DEMOGRAPHIC RULES

Demographic is not a genre.

Demographic is not a top-level column.

Demographic belongs inside each relevant `mangaInfo` object.

Use only these exact demographic values:

* Shonen
* Seinen
* Shojo
* Josei
* Kodomo
* Unknown

Use:

Shonen

not:

Shōnen
Shounen
shonen

Use:

Shojo

not:

Shōjo
Shoujo
shojo

Magazine names may use official macrons, but controlled demographic values must use the exact simple spelling.

Use the officially associated publication demographic.

Do not guess demographic from:

* the age of the protagonist
* violence
* darkness
* romance
* art style
* popularity
* the gender of readers
* the gender of the creator

A violent Manga is not automatically Seinen.

A Manga about teenagers is not automatically Shonen.

A romance Manga is not automatically Shojo.

When an official Japanese Manga demographic cannot be verified, use:

"demographic": "Unknown"

Correct:

genres | ["Action", "Drama", "Psychological"]

mangaInfo | [{"format":"Manga","demographic":"Seinen"}]

Wrong:

genres | ["Action", "Drama", "Psychological", "Seinen"]

Anime does not receive a Manga demographic value.

Do not put demographic inside `animeInfo`.

---

# TAG RULES

`tags` must always be a valid JSON array.

Tags describe more specific information than genres.

Tags may describe:

* subgenres
* themes
* character struggles
* relationships
* settings
* narrative structures
* supernatural elements
* political ideas
* social ideas
* moods
* recurring story devices

There is no fixed minimum number of tags.

There is no fixed maximum number of tags.

Do not stop at six tags.

Include every allowed tag that clearly and meaningfully applies.

Do not add weak or barely relevant tags.

A simple story may naturally have only a few tags.

A layered story may naturally have ten or more.

A large, complex story may reasonably have many tags.

The correct amount is:

All and only the tags that meaningfully apply.

---

# ALLOWED TAGS

Use only the exact values below.

## Fantasy, science-fiction, and world tags

* Alternate History
* Alternate Reality
* Apocalypse
* Artificial Intelligence
* Cyberpunk
* Dark Fantasy
* Dungeon
* Epic Fantasy
* Far Future
* Fantasy World
* Game World
* Gothic
* High Fantasy
* Isekai
* Low Fantasy
* Mecha
* Modern Fantasy
* Mythic Fantasy
* Near Future
* Parallel Worlds
* Portal Fantasy
* Post-Apocalyptic
* Regression
* Reverse Isekai
* Space Opera
* Steampunk
* Time Loop
* Time Travel
* Urban Fantasy
* Virtual Reality

## Horror and supernatural tags

* Body Horror
* Cosmic Horror
* Curses
* Demons
* Dragons
* Folk Horror
* Ghosts
* Gods And Mythology
* Immortality
* Kaiju
* Magic
* Monster Horror
* Monsters
* Occult
* Psychic Powers
* Spirits
* Superpowers
* Transformation
* Vampires
* Witches
* Zombies

## Action, conflict, and adventure tags

* Assassins
* Battle Royale
* Death Game
* Detective
* Espionage
* Heist
* Legal
* Martial Arts Tournament
* Military
* Pirates
* Police Procedural
* Quest
* Revenge Quest
* Road Journey
* Samurai
* Survival
* Survival Game
* Tournament Arc
* Training Arc

## Setting and activity tags

* Ancient World
* Cooking
* Feudal Japan
* Historical Setting
* Idol
* Magic School
* Medical
* Medieval
* Military Academy
* Music Performance
* Performing Arts
* Prison
* Royal Court
* Rural Setting
* School Life
* Small Town
* Space
* Sports Competition
* Urban Setting
* Victorian
* Workplace

## Character and perspective tags

* Antihero
* Character Study
* Chosen One
* Ensemble Cast
* Female Protagonist
* Male Protagonist
* Multiple Protagonists
* Secret Identity
* Underdog
* Unreliable Narrator
* Villain Protagonist

## Story structure and narrative tags

* Episodic
* Mind Games
* Multiple Timelines
* Mystery Box
* Nonlinear Narrative
* Political Intrigue
* Redemption Arc
* Slow Burn
* Strategy

## Relationship tags

* Boys' Love
* Enemies To Allies
* Enemies To Lovers
* Family
* Forbidden Love
* Found Family
* Friends To Lovers
* Friendship
* Girls' Love
* Love
* Love Triangle
* Mentor And Student
* Parent And Child
* Rivals
* Second Chance Romance
* Sibling Bond
* Slow Burn Romance
* Unrequited Love

## Psychological, emotional, and personal tags

* Ambition
* Belonging
* Coming Of Age
* Death And Grief
* Dreams
* Existential
* Forgiveness
* Guilt
* Human Nature
* Identity
* Legacy
* Loneliness
* Memory
* Memory Loss
* Mental Health
* Obsession
* Parenthood
* Responsibility
* Self-Discovery
* Trauma

## Moral, philosophical, political, and social tags

* Abuse Of Power
* Authority
* Class Conflict
* Colonialism
* Corruption
* Cycle Of Violence
* Dehumanization
* Discrimination
* Duty And Honor
* Environmentalism
* Faith And Doubt
* Fate And Free Will
* Freedom
* Individual Versus Society
* Justice
* Leadership
* Morality
* Power
* Prejudice
* Propaganda
* Rebellion
* Redemption
* Revenge
* Sacrifice
* Social Commentary
* Technology And Humanity
* Truth And Lies
* Violence And Peace
* War And Politics

## Mood and tone tags

* Absurdist
* Atmospheric
* Bittersweet
* Bleak
* Contemplative
* Dark Comedy
* Emotional
* Feel-Good
* Grimdark
* Heartwarming
* Hopeful
* Iyashikei
* Melancholic
* Satire
* Suspense
* Surreal
* Tragedy
* Wholesome

---

# TAG INCLUSION TEST

Include a tag when one or more of these statements are strongly true:

1. It appears repeatedly across important parts of the story.
2. It affects the protagonist, main conflict, world, or central message.
3. It represents an important relationship or character struggle.
4. It helps distinguish the story from similar titles.
5. A reader searching for the tag would reasonably expect this story.
6. It improves accurate similar-title matching.
7. It remains important beyond one short scene or minor arc.

Exclude a tag when:

* it appears only once
* it applies only to a minor side character
* it is only technically present
* it is based on speculation
* it would reveal a major twist
* it duplicates another tag without adding meaning
* it is only a content warning
* it describes a studio, publisher, demographic, or release status
* it is being added only to create more similarity matches

Do not include duplicate tags.

Do not invent additional tags.

Do not use different spellings for the same controlled tag.

---

# GENRE AND TAG RELATIONSHIP

Genres are broad categories.

Tags are more specific.

Example:

Psychological is a genre.

Related tags may include:

* Character Study
* Trauma
* Identity
* Guilt
* Obsession
* Memory Loss
* Mental Health
* Unreliable Narrator

Philosophical is a genre.

Related tags may include:

* Existential
* Human Nature
* Morality
* Fate And Free Will
* Faith And Doubt
* Freedom
* Responsibility
* Truth And Lies

War is a genre.

Related tags may include:

* Military
* Cycle Of Violence
* Propaganda
* Sacrifice
* Survival
* Dehumanization
* Violence And Peace
* War And Politics

Fantasy is a genre.

Related tags may include:

* Dark Fantasy
* High Fantasy
* Low Fantasy
* Magic
* Dragons
* Fantasy World
* Gods And Mythology

Horror is a genre.

Related tags may include:

* Body Horror
* Cosmic Horror
* Monster Horror
* Gothic
* Curses
* Demons
* Occult

Do not remove a valid genre because a related tag is included.

Do not remove a valid tag because a related genre is included.

They serve different search and recommendation purposes.

---

# SIMILAR-TITLE SYSTEM RULES

The website compares titles using shared genres and tags.

Missing important genres or tags can cause similar stories to rank too low.

Adding weak or inaccurate genres and tags can cause unrelated stories to rank too high.

Therefore:

* include every clearly applicable genre
* include every clearly applicable tag
* do not use artificial number limits
* do not under-tag
* do not over-tag
* do not copy arrays blindly from another database
* evaluate the complete story
* evaluate sequels and continuations independently
* evaluate remakes and alternate versions independently

A sequel can have a different genre focus from the original.

Example:

An original series may use:

["Drama", "Horror", "Psychological", "Supernatural"]

A continuation may additionally require:

["Action", "Crime", "Political", "Thriller"]

because its focus changed.

Do not automatically copy the exact same genres and tags between related entries.

---

# DESCRIPTION RULES

Write one clean paragraph.

The description must contain 7–8 complete sentences.

The first sentence must begin with the exact top-level title.

Correct:

Monster is a psychological thriller Manga about...

Wrong:

The series is about...

Wrong:

This Manga follows...

Wrong:

It tells the story of...

Do not begin with a shortened or alternative title.

The description must be spoiler-safe.

Do not reveal:

* major deaths
* hidden identities
* final villains
* ending outcomes
* final transformations
* secret family relationships
* late betrayals
* major timeline revelations

Do not write a review.

Do not use generic praise such as:

* masterpiece
* peak fiction
* amazing
* incredible
* greatest ever
* emotional rollercoaster
* must-watch
* must-read

Do not mention:

* the website
* the database
* Supabase
* this prompt
* the user
* recommendation algorithms

The description should naturally explain:

* what the story is about
* who it follows
* the main conflict
* the setting
* the emotional struggle
* the psychological struggle when relevant
* the deeper themes
* why the story is remembered or respected
* adaptation context only when useful

Do not overload the description with dates, episode counts, volume counts, studios, or publishers.

Those facts belong in `mangaInfo` and `animeInfo`.

---

# COVER SELECTION RULES

Choose the best official Manga or Anime cover for the website.

Do not choose only based on popularity.

Do not automatically choose:

* Volume 1
* the newest volume
* the final volume
* the most famous cover
* the Japanese edition
* the English edition
* the first Anime poster

Consider all relevant official editions when possible.

Possible official cover sources include:

* regular Manga volume covers
* deluxe-edition covers
* omnibus covers
* complete editions
* perfect editions
* collector editions
* anniversary editions
* hardcover editions
* bunkoban editions
* kanzenban editions
* publisher reprints
* official Blu-ray covers
* official DVD covers
* official theatrical posters
* official Anime home-video artwork

Use this priority order:

## 1. Story meaning

The cover should represent what the story is truly about beneath the surface plot.

## 2. Character truth

The cover should communicate the protagonist’s emotional conflict, development, identity, or deeper journey.

## 3. Visual beauty

The cover should have strong:

* composition
* colors
* illustration
* visual balance
* readability

## 4. Website-card appeal

The cover must remain clear and attractive at a small size.

Avoid artwork whose important details disappear when reduced.

## 5. Mood accuracy

The cover should match the true atmosphere of the story.

## 6. Symbolism

Prefer meaningful use of:

* posture
* weather
* color
* objects
* framing
* background
* negative space
* contrast
* shadows

## 7. Spoiler safety

Avoid covers that reveal:

* major deaths
* final forms
* ending locations
* final battles
* hidden identities
* final villains
* important late-story relationships

## 8. Official art only

Do not use:

* fan art
* unofficial edits
* wallpapers
* social-media edits
* screenshots
* AI-generated images
* unofficial collages

Use Anime key visuals only when they are official and no stronger official cover-style image is available.

The reason must explain why the cover fits the story and works well on the website.

Do not merely say that it is popular or looks good.

---

# MANGAINFO RULES

`mangaInfo` must always be a JSON array.

Use:

mangaInfo | []

when there is no Manga version.

Each separate Manga publication may receive its own object.

Examples of separate entries include:

* the main Manga
* an original pilot One-Shot
* a separate remake
* an alternate Manga adaptation
* an officially published Doujinshi
* a sequel Manga

Use this standard structure:

[
{
"format": "Manga",
"status": "completed",
"volumes": "18",
"chapters": "162",
"magazines": ["Big Comic Original"],
"publisher": "Shogakukan",
"demographic": "Seinen",
"releaseYear": 1994,
"publicationPeriod": "1994–2001"
}
]

---

# ALLOWED MANGA SUBFORMATS

Use only these exact `mangaInfo.format` values:

* Manga
* One-Shot
* Doujinshi

Use exactly these spellings.

Do not use:

* manga
* Comic
* One Shot
* oneshot
* Dōjinshi
* Fan Manga

The top-level `type` must still use:

"manga"

Example:

type | ["manga"]

mangaInfo | [{"format":"One-Shot", ...}]

---

# MANGA STATUS VALUES

Use only:

* completed
* ongoing
* hiatus
* cancelled
* unknown

Use lowercase.

Do not use:

* finished
* publishing
* currently publishing
* discontinued
* on break

Map the verified status to the controlled value.

---

# MANGA VOLUMES AND CHAPTERS

Use strings.

Correct:

"volumes": "18"

"chapters": "162"

For completed works, use verified numeric strings.

For ongoing Manga, use:

"volumes": "-"

"chapters": "-"

Use `"-"` even when a current count is known, because ongoing counts continue changing.

For a One-Shot, usually use:

"volumes": "1"

"chapters": "1"

unless the official release structure is different.

Do not invent counts.

When reliable sources disagree, investigate whether they count:

* bonus chapters
* numbered chapters
* special chapters
* split chapters
* digital releases

Use the count most appropriate to the official publication.

---

# MANGA MAGAZINES

Always use the plural key:

"magazines"

Never use:

"magazine"

`magazines` must always be an array.

Correct:

"magazines": ["Weekly Shōnen Jump"]

Correct:

"magazines": ["Weekly Young Sunday", "Weekly Big Comic Spirits"]

Wrong:

"magazine": "Weekly Shōnen Jump"

Wrong:

"magazines": ["Weekly Young Sunday, Weekly Big Comic Spirits"]

If a Manga moved magazines, list each magazine separately.

Examples:

"magazines": ["Monthly Animal House", "Young Animal"]

"magazines": ["Weekly Shōnen Jump", "Ultra Jump"]

"magazines": ["Weekly Shōnen Magazine", "Monthly Afternoon"]

If there is no magazine, use:

"magazines": []

---

# MANGA PUBLISHER

Use the official original publisher.

Keep publisher spellings consistent.

Examples:

* Shueisha
* Shogakukan
* Kodansha
* Hakusensha
* Square Enix
* Media Factory
* Kadokawa
* VIZ Media

Do not automatically use the English license holder as the main publisher.

When necessary, mention an English publisher briefly in `notes`.

---

# MANGA DEMOGRAPHIC

Every Manga object should include:

"demographic": "Value"

Allowed values:

* Shonen
* Seinen
* Shojo
* Josei
* Kodomo
* Unknown

Use the officially verified publication demographic.

Do not infer demographic from tone or content.

For One-Shots, use the demographic associated with the official publication when known.

For Doujinshi or self-published works, usually use:

"demographic": "Unknown"

Demographic belongs inside each individual Manga object because separate Manga versions may have different publication demographics.

---

# MANGA RELEASE YEAR

Use a number.

Correct:

"releaseYear": 1989

Wrong:

"releaseYear": "1989"

Use the first release year of that specific Manga publication.

---

# MANGA PUBLICATION PERIOD

Use a text string.

Use an en dash between years.

Examples:

"publicationPeriod": "1994–2001"

"publicationPeriod": "1989–present"

"publicationPeriod": "2022"

Use `present` only for verified ongoing works.

For a One-Shot released in one year:

"publicationPeriod": "2018"

---

# MANGA NOTES

Only include `notes` when useful.

Use notes to explain:

* an adaptation from an unsupported source
* an original pilot
* a separate continuity
* a remake
* an alternate Manga version
* unusual publication history
* special chapter counting
* sequel or spin-off status

Example:

"notes": "Manga adaptation of a Light Novel; the prose version is outside this catalog"

Example:

"notes": "Original pilot One-Shot that preceded the serialized Manga"

Keep notes short and spoiler-safe.

Do not place Anime-specific information in Manga notes.

Do not write reviews inside notes.

---

# TITLE INSIDE MANGAINFO

Do not include `title` when:

* there is only one Manga entry
* its title is exactly the same as the top-level title

Include `title` when:

* multiple Manga entries exist
* the One-Shot has a different title
* the Manga is a remake
* the Manga is a sequel
* the Manga is a spin-off
* an alternate adaptation exists
* the entry would be confusing without a title

Example without an internal title:

mangaInfo | [{"format":"Manga","status":"completed","volumes":"12","chapters":"108","magazines":["Magazine Name"],"publisher":"Publisher Name","demographic":"Shonen","releaseYear":2005,"publicationPeriod":"2005–2010"}]

Example with an internal title:

mangaInfo | [{"title":"Example Title Pilot","format":"One-Shot","status":"completed","volumes":"1","chapters":"1","magazines":["Magazine Name"],"publisher":"Publisher Name","demographic":"Shonen","releaseYear":2004,"publicationPeriod":"2004","notes":"Original pilot One-Shot"}]

---

# DOUJINSHI RULES

Use `Doujinshi` only for an officially relevant self-published or creator-published Manga work that belongs in the catalog.

Do not include random fan-created Doujinshi.

Do not include unofficial derivative works.

For an official or creator-made Doujinshi, use:

"format": "Doujinshi"

The publisher may be:

"publisher": "Self-published"

Use:

"magazines": []

Use:

"demographic": "Unknown"

unless an official demographic is clearly applicable.

Example:

mangaInfo | [{"title":"Example Doujinshi","format":"Doujinshi","status":"completed","volumes":"1","chapters":"1","magazines":[],"publisher":"Self-published","demographic":"Unknown","releaseYear":2010,"publicationPeriod":"2010"}]

---

# ANIMEINFO RULES

`animeInfo` must always be a JSON array.

Use:

animeInfo | []

when there is no Anime version.

Each separate Anime production should have its own object.

Separate objects may be used for:

* TV seasons
* separate TV adaptations
* movies
* movie series
* OVAs
* ONAs
* TV specials
* recuts
* compilation movies
* shorts
* alternate continuities
* remakes

Use this standard shape:

[
{
"title": "Example Title",
"format": "TV Series",
"studios": ["Studio Name"],
"releasePeriod": "2015–2016",
"startYear": 2015,
"endYear": 2016,
"episodes": 24,
"status": "completed",
"notes": "Anime adaptation of the Manga"
}
]

---

# ALLOWED ANIME SUBFORMATS

Use only these exact `animeInfo.format` values:

* TV Series
* Movie
* Movie Series
* OVA
* ONA
* TV Special
* Special
* TV Recut
* Compilation Movie
* Short

Do not use:

* Anime
* TV Show
* TV series
* Film
* Film Series
* Movie Trilogy
* Web Anime
* Recut
* TV recut

Use the controlled spelling.

The top-level `type` still uses only:

"anime"

Example:

type | ["anime"]

animeInfo | [{"format":"Movie", ...}]

---

# ANIME STUDIOS

Always use the plural key:

"studios"

Never use:

"studio"

`studios` must always be a JSON array.

Correct:

"studios": ["Bones"]

Correct:

"studios": ["Liden Films", "GEMBA", "Millepensee"]

Wrong:

"studio": "Bones"

Wrong:

"studios": ["Liden Films / GEMBA / Millepensee"]

Split multiple studios into separate array items.

Use stable canonical spellings.

Examples:

* A-1 Pictures
* Bones
* CloverWorks
* David Production
* GEMBA
* Kyoto Animation
* Liber
* Liden Films
* Madhouse
* MAPPA
* Millepensee
* OLM
* P.A. Works
* Pierrot
* Production I.G
* Saber Works
* Science SARU
* Studio 4°C
* Studio Signpost
* Sunrise
* TMS Entertainment
* Toei Animation
* Trigger
* Ufotable
* Wit Studio
* Zero-G

Do not use inconsistent spellings such as:

* BONES
* bones
* Studio 4C
* David Productions
* LIDENFILMS
* Production IG
* UfoTable
* WIT Studio

Use the exact same studio spelling throughout the database.

---

# ANIME RELEASE PERIOD

Use a string.

Examples:

"releasePeriod": "1997–1998"

"releasePeriod": "2022"

"releasePeriod": "2026–present"

"releasePeriod": "TBA"

Use an en dash between years.

Use `present` only for an Anime currently releasing.

Use `TBA` when no reliable year is confirmed.

---

# ANIME START AND END YEARS

Use a number when known.

Use `null` when unknown.

Completed example:

"startYear": 2015

"endYear": 2016

Ongoing example:

"startYear": 2026

"endYear": null

Upcoming with no confirmed year:

"startYear": null

"endYear": null

Do not guess.

---

# ANIME EPISODES

Use `episodes` for:

* TV Series
* OVA
* ONA
* TV Special
* Special
* TV Recut
* Short

Use a number.

Example:

"episodes": 24

For completed Anime, use the verified final count.

For ongoing Anime, use a currently verified count only when useful.

Do not invent a final episode count.

Do not place `episodes` inside a Movie object.

---

# ANIME MOVIES

Use `movies` for:

* Movie
* Movie Series
* Compilation Movie

Examples:

"movies": 1

"movies": 3

Do not use:

"films"

Use:

"movies"

Do not place `movies` inside a TV Series object.

A single Movie normally uses:

"movies": 1

A Movie Series uses the verified total number of movies.

---

# ANIME STATUS VALUES

Use only:

* completed
* ongoing
* upcoming
* cancelled
* unknown

Use lowercase.

Do not use:

* finished
* airing
* not yet aired
* announced
* production
* delayed

Map reliable information to the controlled status.

---

# ANIME NOTES

Anime notes must describe only that specific Anime production.

Use short spoiler-safe notes to explain:

* adaptation relationship
* season relationship
* remake status
* recut status
* alternate continuity
* original ending
* source coverage
* production context
* sequel announcement
* uncertain official title
* unsupported original source

Examples:

"notes": "Anime adaptation of the Manga"

"notes": "Second TV adaptation that follows the Manga storyline more closely"

"notes": "TV recut of the film trilogy with additional and remastered material"

"notes": "Anime adaptation of a Light Novel; the prose version is outside this catalog"

"notes": "Announced sequel or continuation; official final title not yet confirmed"

Do not place Manga publication facts inside Anime notes.

Do not include spoilers.

Do not write reviews.

---

# TITLE INSIDE ANIMEINFO

Do not include `title` when:

* there is only one Anime entry
* the Anime title is exactly the same as the top-level title
* the entry is understandable without repeating it

Include `title` when:

* multiple seasons exist
* movies exist
* OVAs or ONAs exist
* multiple adaptations exist
* a remake exists
* a recut exists
* an alternate continuity exists
* the Anime has a different official title
* the entry would be confusing without a title

Examples:

Fullmetal Alchemist
Fullmetal Alchemist: Brotherhood
Fullmetal Alchemist the Movie: Conqueror of Shamballa
Berserk: The Golden Age Arc
Berserk: The Golden Age Arc - Memorial Edition
Kingdom Season 2

Do not assign a numbered season unless official sources use that season number.

For an announced continuation with no confirmed title, use a safe descriptive title.

Example:

"title": "Example Title Sequel"

"notes": "Announced sequel or continuation; official final title not yet confirmed"

---

# UNSUPPORTED ORIGINAL SOURCES

An Anime or Manga may adapt:

* a Light Novel
* a Novel
* a Web Novel
* a Game
* a Manhwa
* a Manhua
* a Webtoon

Do not add the unsupported source format to `type`.

Do not create:

* novelInfo
* gameInfo
* manhwaInfo
* webtoonInfo

Mention the source relationship only when it improves clarity.

Example:

type | ["anime"]

animeInfo | [{"format":"TV Series","studios":["Studio Name"],"releasePeriod":"2020","startYear":2020,"endYear":2020,"episodes":12,"status":"completed","notes":"Anime adaptation of a Light Novel; the prose version is outside this catalog"}]

Example:

type | ["manga", "anime"]

mangaInfo | [{"format":"Manga","status":"ongoing","volumes":"-","chapters":"-","magazines":["Magazine Name"],"publisher":"Publisher Name","demographic":"Seinen","releaseYear":2018,"publicationPeriod":"2018–present","notes":"Manga adaptation of a Light Novel; the prose version is outside this catalog"}]

animeInfo | [{"format":"TV Series","studios":["Studio Name"],"releasePeriod":"2021","startYear":2021,"endYear":2021,"episodes":12,"status":"completed","notes":"Anime adaptation of the same original story"}]

---

# TITLE REPETITION RULES

The top-level `title` is the shared story title.

Inside `mangaInfo` and `animeInfo`, `title` is optional.

Do not repeat the same title unnecessarily.

Use an internal title only when:

* a version has a different official title
* several entries need distinction
* the entry is a season
* the entry is a movie
* the entry is a pilot
* the entry is a sequel
* the entry is a remake
* the entry is a recut
* the entry is an alternate continuity
* the entry is a separate One-Shot
* the entry is a separate Doujinshi

The website may use:

displayTitle = item.title ?? story.title

---

# SPELLING AND CONSISTENCY RULES

Be extremely consistent because the website searches and filters using these values.

The same genre must always use the same spelling.

The same tag must always use the same spelling.

The same demographic must always use the same spelling.

The same subformat must always use the same spelling.

The same studio must always use the same spelling.

The same magazine must always use the same spelling.

The same publisher must always use the same spelling.

The same status must always use the same spelling.

Use exact:

* capitalization
* punctuation
* spacing
* macrons when part of an official name

Important magazine spellings include:

* Weekly Shōnen Jump
* Weekly Young Jump
* Ultra Jump
* Weekly Shōnen Magazine
* Monthly Shōnen Gangan
* Big Comic Spirits
* Weekly Big Comic Spirits
* Big Comic Original
* Monthly Afternoon
* Morning
* good! Afternoon
* Weekly Young Sunday
* Monthly Animal House
* Young Animal
* Monthly Comic Alive

Do not write:

* Weekly Shonen Jump
* Weekly Shounen Jump
* Weekly Young jump
* Big Comics Spirits
* Good Afternoon

Use:

* Weekly Shōnen Jump
* Weekly Young Jump
* Big Comic Spirits
* good! Afternoon

Important publisher spellings include:

* Shueisha
* Shogakukan
* Kodansha
* Hakusensha
* Square Enix
* Media Factory
* Kadokawa
* VIZ Media

---

# RESEARCH AND VERIFICATION RULES

Research and verify facts before producing the entry.

Prefer current and reliable sources such as:

* official Manga publisher pages
* official magazine pages
* official Anime websites
* official production announcements
* official studio pages
* official volume listings
* official home-video listings
* official theatrical pages
* recognized Anime and Manga databases
* reputable reference sources when official information is unavailable

Use more than one source when facts are unclear or conflicting.

Current status must be verified carefully.

Do not rely only on memory for:

* ongoing status
* hiatus status
* completion status
* upcoming Anime
* episode counts
* movie counts
* studios
* magazines
* publishers
* sequel titles
* release windows
* volume counts
* chapter counts

Do not guess.

When information is unknown, use an honest value.

Examples:

"status": "unknown"

"startYear": null

"endYear": null

"magazines": []

mangaInfo | []

animeInfo | []

For completed Manga:

* use verified numeric strings for volumes and chapters

For ongoing Manga:

* use `"-"` for volumes and chapters

For completed Anime:

* use verified final episode or movie counts

For ongoing Anime:

* do not invent the final count

For upcoming Anime:

* use `"status": "upcoming"`
* do not invent an episode count
* use `"startYear": null` when no year is confirmed
* use `"endYear": null`

For announced sequels:

* use the official title when confirmed
* use a safe descriptive title when it is not confirmed
* explain the uncertainty briefly in notes

---

# JSONB QUALITY RULES

All JSONB values must be valid JSON.

Use double quotation marks only.

Do not use single quotation marks.

Do not use trailing commas.

Do not place comments inside JSON.

Do not use undefined values.

Use arrays for multiple values.

Correct:

"studios": ["Pierrot", "Studio Signpost"]

Wrong:

"studios": ["Pierrot / Studio Signpost"]

Correct:

"magazines": ["Weekly Young Sunday", "Weekly Big Comic Spirits"]

Wrong:

"magazines": ["Weekly Young Sunday, Weekly Big Comic Spirits"]

Correct:

alternativeTitles | ["ベルセルク", "Beruseruku"]

Wrong:

alternativeTitles | ['ベルセルク', 'Beruseruku']

Correct:

genres | ["Action", "Drama", "Horror", "Philosophical", "Psychological", "Supernatural"]

Wrong:

genres | ["Action", "Drama", "Seinen", "Anime"]

Correct:

tags | ["Character Study", "Existential", "Identity", "Morality", "Trauma"]

Wrong:

tags | ["Deep", "Dark", "Sad", "Good Characters"]

---

# FINAL QUALITY CHECK

Before outputting an entry, confirm all of the following:

* The database entry is for Manga, Anime, or both.
* `type` contains only `manga`, `anime`, or both.
* Manga and Anime subformats are not placed inside `type`.
* The ID uses the earliest supported Manga or Anime format.
* The main title is official and stable.
* Alternative titles are useful and non-duplicated.
* The creator represents the original story identity.
* Anime studios are not placed in the creator field for adaptations.
* `heroScore` is numeric.
* `featured` is a Boolean.
* Genres use only allowed controlled values.
* Every clearly applicable genre is included.
* No genre was removed merely to fit a number limit.
* No weak genre was added merely to increase the count.
* Demographic is not included in genres.
* Demographic appears only inside `mangaInfo`.
* Demographic uses an allowed controlled value.
* Tags use only allowed controlled values.
* Every clearly applicable tag is included.
* No tag was removed merely to fit a number limit.
* No weak tag was added merely to increase the count.
* The description begins with the exact top-level title.
* The description contains 7–8 complete sentences.
* The description is spoiler-safe.
* The selected cover is official.
* The selected cover works at a small website-card size.
* The selected cover avoids major spoilers.
* Manga facts appear only inside `mangaInfo`.
* Anime facts appear only inside `animeInfo`.
* `novelInfo` is not included.
* Unsupported source formats are mentioned only in notes when useful.
* Ongoing Manga counts use `"-"`.
* Unknown facts are represented honestly.
* Studio, publisher, magazine, demographic, genre, tag, subformat, and status spellings are consistent.
* All JSONB values are valid JSON.
* The final table contains exactly 12 columns.
* No extra fields are added.

---

# FINAL OUTPUT RULES

Output only the finished catalog entry.

Use a clear heading with the story title.

Include:

1. chosen cover
2. optional alternative cover
3. cover reason
4. exact Supabase paste table

Do not output the entire entry as a JSON object.

Do not wrap the whole answer in a code block.

Do not add extra fields.

Do not add `novelInfo`.

Do not include old top-level publication fields.

Do not add a research summary after the table.

Do not add explanations after the table unless specifically requested.

---

# COMPLETE EXAMPLE: MANGA AND ANIME

Example Title

Chosen cover image to upload: Official complete-edition Manga cover featuring the protagonist against a restrained symbolic background

Alternative if useful: Official Anime Blu-ray cover with clearer character visibility

Reason: This cover best represents the protagonist’s internal conflict without revealing late-story events. Its strong central composition remains readable when displayed as a small website card. The restrained background supports the emotional tone rather than distracting from the character. Its colors reflect the story’s combination of danger, isolation, and hope. The posture of the protagonist suggests the burden at the center of the story. It is official artwork and avoids final forms, deaths, and ending imagery. It is therefore a stronger catalog choice than selecting Volume 1 automatically.

Column | Paste this value
id | manga-example-title-2005
title | Example Title
alternativeTitles | ["Example Japanese Title", "Example Romanized Title"]
type | ["manga", "anime"]
creator | Creator Name
heroScore | 9.3
genres | ["Action", "Drama", "Fantasy", "Philosophical", "Psychological"]
tags | ["Character Study", "Existential", "Freedom", "Identity", "Morality", "Sacrifice", "Survival", "Trauma"]
featured | true
description | Example Title is a story about a young protagonist confronting a dangerous world shaped by forces they do not yet understand. The central conflict places personal survival against responsibilities that grow beyond the protagonist’s original goals. As the cast learns more about their society, simple ideas of justice and loyalty become increasingly difficult to maintain. The story gives significant attention to identity, fear, grief, and the consequences of acting under pressure. Its action and fantasy elements support a deeper examination of freedom, morality, and human nature. Relationships between allies and rivals continually reshape how the protagonist understands power and responsibility. The Manga develops these questions through long-form visual storytelling, while the Anime introduces the same world through movement, music, and performance. The work is remembered for connecting large-scale conflict with intimate psychological struggles.
mangaInfo | [{"format":"Manga","status":"completed","volumes":"12","chapters":"108","magazines":["Weekly Shōnen Jump"],"publisher":"Shueisha","demographic":"Shonen","releaseYear":2005,"publicationPeriod":"2005–2011"},{"title":"Example Title Pilot","format":"One-Shot","status":"completed","volumes":"1","chapters":"1","magazines":["Weekly Shōnen Jump"],"publisher":"Shueisha","demographic":"Shonen","releaseYear":2004,"publicationPeriod":"2004","notes":"Original pilot One-Shot that preceded the serialized Manga"}]
animeInfo | [{"format":"TV Series","studios":["Bones"],"releasePeriod":"2013","startYear":2013,"endYear":2013,"episodes":24,"status":"completed","notes":"Anime adaptation of the Manga"},{"title":"Example Title: The Movie","format":"Movie","studios":["Bones"],"releasePeriod":"2015","startYear":2015,"endYear":2015,"movies":1,"status":"completed","notes":"Original theatrical continuation connected to the TV Anime"}]

---

# COMPLETE EXAMPLE: ANIME-ONLY

Example Anime

Chosen cover image to upload: Official Blu-ray cover showing the central cast beneath the story’s main visual symbol

Alternative if useful: Official theatrical-style poster with a simpler central composition

Reason: The Blu-ray artwork represents the central relationships without revealing the conclusion. Its arrangement of the cast shows both unity and emotional distance, which reflects the story’s main conflict. The visual symbol above them communicates the larger mystery without exposing its answer. Strong contrast keeps the image clear at a small size. The colors match the work’s tense and reflective atmosphere. The artwork is official and designed for cover presentation rather than temporary promotion. It provides a more complete representation of the story than a generic early key visual.

Column | Paste this value
id | anime-example-anime-2012
title | Example Anime
alternativeTitles | ["Example Native Title"]
type | ["anime"]
creator | Original Creator Name
heroScore | 8.9
genres | ["Crime", "Drama", "Philosophical", "Psychological", "Sci-Fi", "Thriller"]
tags | ["Artificial Intelligence", "Authority", "Character Study", "Corruption", "Human Nature", "Justice", "Morality", "Technology And Humanity"]
featured | false
description | Example Anime is a science-fiction thriller about investigators working within a society governed by predictive technology. The story follows characters who must enforce a system while gradually confronting its moral and psychological limitations. Criminal cases expose conflicts between public safety, individual freedom, and institutional power. The central cast responds differently to the pressure of being measured and judged by technology. Its mystery structure supports broader questions about justice, responsibility, and human nature. The futuristic setting remains closely connected to recognizable fears about surveillance and social control. Character relationships become increasingly important as professional duty conflicts with personal conscience. The Anime is remembered for combining procedural suspense with sustained philosophical questions.
mangaInfo | []
animeInfo | [{"format":"TV Series","studios":["Production I.G"],"releasePeriod":"2012–2013","startYear":2012,"endYear":2013,"episodes":22,"status":"completed"}]

---

# COMPLETE EXAMPLE: MANGA-ONLY ONE-SHOT

Example One-Shot

Chosen cover image to upload: Official collected-edition cover featuring the protagonist and the central visual motif

Alternative if useful: Official magazine cover from the original publication

Reason: The collected-edition artwork gives the protagonist enough visual focus to remain clear as a small card. Its central motif communicates the story’s emotional subject without revealing its final development. The limited color palette supports the work’s quiet and reflective atmosphere. The composition feels complete even though the story is short. It is official publication artwork and avoids panels that would expose key events. The cover better represents the complete emotional identity of the One-Shot than a text-heavy magazine page.

Column | Paste this value
id | manga-example-one-shot-2018
title | Example One-Shot
alternativeTitles | ["Example Native Title"]
type | ["manga"]
creator | Creator Name
heroScore | 8.4
genres | ["Drama", "Psychological"]
tags | ["Character Study", "Death And Grief", "Identity", "Memory", "Self-Discovery"]
featured | false
description | Example One-Shot is a short Manga about a person confronting a memory that has shaped their understanding of themselves. The story follows a focused emotional conflict rather than a large external adventure. Small interactions gradually reveal how the protagonist has interpreted the past. Its restrained structure gives significant weight to silence, expression, and visual symbolism. The Manga examines grief, identity, and the difficulty of separating memory from truth. The limited length keeps the narrative concentrated on one important decision. Its artwork carries much of the emotional meaning without requiring extensive explanation. The One-Shot is remembered for delivering a complete character study within a concise form.
mangaInfo | [{"format":"One-Shot","status":"completed","volumes":"1","chapters":"1","magazines":["Weekly Shōnen Jump"],"publisher":"Shueisha","demographic":"Shonen","releaseYear":2018,"publicationPeriod":"2018"}]
animeInfo | []

