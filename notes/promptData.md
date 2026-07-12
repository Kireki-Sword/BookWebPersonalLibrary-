


10. Ashita no Joe
11. Blood on the Tracks
12. Blue Period
14. The Horizon
16. Homunculus

stain gate 
monogatri series

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



You are creating Supabase-ready story catalog entries for my anime/manga/manhwa/manhua/webtoon/novel website.

The database is now a combined story catalog, not a manga-only catalog.

A single story entry can include multiple official formats, such as:
manga
anime
manhwa
manhua
webtoon
web novel
light novel
novel
game

The top-level row represents the overall story/franchise identity.

Format-specific details must go inside the correct JSONB info field:
manga/manhwa/manhua/webtoon details go inside mangaInfo
anime/movie/OVA/ONA details go inside animeInfo
novel/light novel/web novel details go inside novelInfo

Do not keep manga-only fields like status, releaseYear, chapters, volumes, publisher, or magazine at the top level anymore.

The final output must be a clean Supabase paste table, not a full JSON object.

Use this exact output structure every time:

[Story Title]

Chosen cover image to upload: [Best official manga/manhwa/manhua/webtoon/novel/anime edition cover]

Alternative if useful: [Backup official cover]

Reason: [Explain why this cover is the best official cover for the website. Focus on story meaning, character truth, colors, composition, artistic quality, website-card appeal, mood accuracy, symbolism, and spoiler safety. Do not automatically choose Volume 1, the newest volume, the final volume, or the most famous cover. Pick the cover that best represents the soul/message of the story while still looking beautiful and clickable.]

Column | Paste this value
id | primarytype-title-year
title | Title
alternativeTitles | ["Alt Title 1", "Alt Title 2"]
type | ["manga", "anime"]
creator | Creator Name
heroScore | 9.6
genres | ["Genre 1", "Genre 2", "Genre 3"]
tags | ["Tag 1", "Tag 2", "Tag 3", "Tag 4"]
featured | true
description | 7–8 sentence researched description
mangaInfo | [{"format":"Manga","status":"completed","volumes":"18","chapters":"162","magazines":["Big Comic Original"],"publisher":"Shogakukan","demographic":"Seinen","releaseYear":1994,"publicationPeriod":"1994–2001"}]
animeInfo | [{"title":"Anime Title","format":"TV Series","studios":["Studio Name"],"releasePeriod":"1997–1998","startYear":1997,"endYear":1998,"episodes":25,"status":"completed","notes":"Short spoiler-safe note"}]
novelInfo | []

Use this exact column order every time:

id
title
alternativeTitles
type
creator
heroScore
genres
tags
featured
description
mangaInfo
animeInfo
novelInfo

Do not include these old top-level manga-only fields anymore:

status
releaseYear
publicationPeriod
chapters
volumes
demographic
publisher
magazine

Those fields now belong inside mangaInfo or novelInfo only.

Important table formatting rules:

Do not write keys like this:
id: manga-one-piece-1997

Instead, in the table, write:
id | manga-one-piece-1997

For normal text fields, paste the value only.

For JSONB fields, use valid JSON with double quotes.

Correct:
["Action", "Adventure", "Comedy", "Fantasy"]

Wrong:
['Action', 'Adventure']

Wrong:
["Action", "Adventure",]

The JSONB fields are:
alternativeTitles
type
genres
tags
mangaInfo
animeInfo
novelInfo

Do not wrap the whole answer in a JSON object.
Do not wrap the whole answer in a code block.
Do not add extra fields.
Do not add explanations after the table unless asked.
Do not put citations, source names, or notes inside the JSON unless they are part of the requested field.
If sources are required by the system, keep citations outside the table values and never inside the JSONB cells.

Top-level field rules:

id:
Use primarytype-title-year.
The primary type should be the original or main source format.
Use lowercase, hyphen-separated text.
Base the year on the first release year of the original/main version.
Do not change the id later unless the original source was identified incorrectly.

Examples:
manga-one-piece-1997
manga-monster-1994
manga-vinland-saga-2005
manga-berserk-1989
manga-vagabond-1998
manga-steel-ball-run-2004
manhwa-solo-leveling-2018
lightnovel-re-zero-2014
webnovel-re-zero-2012
anime-cowboy-bebop-1998

title:
Use the main catalog title in English when available.
This is the main display title for the whole story.
Do not repeat this same title inside mangaInfo, animeInfo, or novelInfo unless the specific version has a different official title or needs a title to separate multiple entries.

alternativeTitles:
Use a JSONB array.
Include official native titles, romanized titles, and important alternate English titles.
Do not include random fan nicknames unless they are widely recognized and useful.
Example:
["鋼の錬金術師", "Hagane no Renkinjutsushi"]

type:
Use a JSONB array.
Include every major official format that applies to the story.
Use only these exact values:

manga
anime
manhwa
manhua
webtoon
webcomic
oneShot
doujinshi
lightNovel
webNovel
novel
game

Examples:
type | ["manga"]
type | ["manga", "anime"]
type | ["manhwa", "webtoon", "anime"]
type | ["webNovel", "lightNovel", "manga", "anime"]

For anime movies, OVAs, ONAs, specials, and TV anime, use:
"anime"

Do not put movie, ova, or ona in the top-level type field.
Those belong inside animeInfo.format.

creator:
Use the original creator or main credited creator.
For manga, use the mangaka/writer-artist.
For light novels, use the author.
For anime-original works, use the main original creator, studio credit, or official creator credit if applicable.
Do not put anime studios here unless the work is anime-original and the studio/creator credit is the official creator identity.


heroScore:
Use a numeric value.
Example:
9.6

featured:
Use only:
true
false

genres:
Use a JSONB array.
Use 2–4 genres only.
Use only the allowed genre values listed below.

tags:
Use a JSONB array.
Use 3–6 tags only.
Use only the allowed tag values listed below.

description:
Write one clean paragraph.
The description must be 7–8 sentences.
The first sentence must start with the exact top-level title.

Example:
Monster is a psychological thriller manga about...

Do not start with a shortened title or alternate title.
Do not include spoilers.
Do not write a review.
Do not use generic praise like masterpiece, peak fiction, amazing, or emotional rollercoaster.
Do not mention the website, the database, Supabase, or the user inside the description.

The description should explain:
what the story is about
who it follows
the main conflict
the emotional or psychological struggle
the deeper themes
why the story is memorable or respected
important publication/adaptation/status context only if useful

Allowed genres:

Action
Adventure
Animation
Comedy
Coming-of-Age
Crime
Drama
Dystopian
Fantasy
Historical
Horror
Mystery
Philosophy
Psychological
Romance
Sci-Fi
Seinen
Shonen
Slice of Life
Sports
Supernatural
Thriller
War

Allowed tags:

Ambition
Antihero
Belonging
Character Study
Coming Of Age
Corruption
Death And Grief
Dreams
Existential
Faith And Doubt
Family
Friendship
Guilt
Identity
Justice
Loneliness
Love
Memory
Mind Games
Morality
Obsession
Philosophical
Power
Redemption
Revenge
Sacrifice
Self-Discovery
Social Commentary
Strategy
Survival
Trauma
Violence And Peace
War And Politics

Cover selection rules:

Find the best official cover for the website.
Do not choose based only on popularity.
Do not automatically choose Volume 1.
Do not automatically choose the newest volume.
Do not automatically choose the final volume.
Do not automatically choose the most famous cover.

Judge covers using this priority order:

1. Story message
The cover should represent what the story is truly about underneath the plot.

2. Character truth
The cover should show who the main character is becoming, their emotional conflict, or their deeper journey.

3. Visual beauty
The cover should have strong art, good composition, strong colors, and a memorable look.

4. Website-card appeal
The cover should still look good when small in a grid or hero card.

5. Mood accuracy
The cover should match the real feeling of the series.

6. Symbolism
Prefer covers that use posture, weather, color, background, framing, objects, or negative space to show the story’s themes.

7. Spoiler safety
Avoid covers that reveal major deaths, final twists, final forms, hidden identities, or ending spoilers.

8. Official art only
Use official manga volume covers, deluxe covers, omnibus covers, complete edition covers, perfect edition covers, collector edition covers, publisher reprint covers, light novel covers, official anime Blu-ray/DVD covers, or official theatrical poster art.

9. Check all editions
Check singles, new editions, deluxe editions, omnibus editions, complete editions, perfect editions, collector editions, anniversary editions, hardcover editions, bunkoban editions, kanzenban editions, English editions, Japanese editions, and publisher reprints when relevant.

Do not use fan art, wallpapers, unofficial edits, random posters, or anime key visuals unless the story is anime-original and no official book-style cover exists.

mangaInfo rules:

mangaInfo must always be a JSONB array.
If there is no manga/manhwa/manhua/webtoon/comic version, use:
mangaInfo | []

mangaInfo is for manga/manhwa/manhua/webtoon/comic-specific facts only.

Use this standard shape:

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

Allowed mangaInfo.format values:

Manga
One-Shot
Manhwa
Manhua
Webtoon
Webcomic
Doujinshi

Use exactly these spellings.
Do not write:
manga
TV manga
Comic
Korean comic
Web Toon
webtoon

Use:
Manga
Webtoon
Manhwa

mangaInfo.status values:

completed
ongoing
hiatus
cancelled
unknown

Use lowercase only.

volumes and chapters:
Use strings.
For completed, hiatus, or cancelled works, use verified numeric strings.

Correct:
"volumes": "18"
"chapters": "162"

For ongoing manga/manhwa/manhua/webtoon, use:
"volumes": "-"
"chapters": "-"

Do this even if current volume/chapter counts exist, because ongoing counts keep changing.

magazines:
Always use the plural key:
"magazines"

Never use:
"magazine"

magazines must always be a JSON array.

Correct:
"magazines": ["Weekly Shōnen Jump"]

Wrong:
"magazine": "Weekly Shōnen Jump"

Wrong:
"magazines": ["Weekly Young Sunday, Weekly Big Comic Spirits"]

Correct:
"magazines": ["Weekly Young Sunday", "Weekly Big Comic Spirits"]

If a manga moved magazines, split each magazine into its own array item.

Examples:
"magazines": ["Monthly Animal House", "Young Animal"]
"magazines": ["Weekly Shōnen Jump", "Ultra Jump"]
"magazines": ["Weekly Shōnen Magazine", "Monthly Afternoon"]

If there is no magazine, use:
"magazines": []

publisher:
Use the official publisher.
Keep spelling consistent.

Examples:
Shueisha
Shogakukan
Kodansha
Hakusensha
Square Enix
Media Factory
Kadokawa
D&C Media

demographic:
Use one of these controlled values:

Shonen
Seinen
Shojo
Josei
Kodomo
Unknown

Use Shonen, not Shōnen, for demographic values.
Use Shojo, not Shōjo, for demographic values.
Magazine names can use macrons, but demographic values should stay simple and consistent.

releaseYear:
Use a number, not a string.

Correct:
"releaseYear": 1989

Wrong:
"releaseYear": "1989"

publicationPeriod:
Use a text string.
Use an en dash between years.

Examples:
"publicationPeriod": "1994–2001"
"publicationPeriod": "1989–present"
"publicationPeriod": "2020–2022"

Use "present" only for ongoing works.

notes inside mangaInfo:
Only include "notes" when needed.
Notes must belong to the manga/manhwa/manhua/webtoon version only.

Use notes when:
the manga is not the original source
the manga is an adaptation of a novel/anime/game
the manga covers only a specific arc
the manga has multiple separate versions
the manga publication history needs a short clarification

Example:
"notes": "Manga adaptation of the first story arc; not the original source"

Do not put anime notes in mangaInfo.
Do not put novel notes in mangaInfo.
Do not put general website notes in mangaInfo.

title inside mangaInfo:
Do not include title if the manga title is exactly the same as the top-level title.

Only include "title" inside mangaInfo when:
the manga version has a different official title
there are multiple manga versions/arcs and titles are needed to distinguish them
the manga is a spin-off, sequel, remake, or alternate adaptation with its own title

Example where title is not needed:
Top-level title: Berserk

mangaInfo:
[
  {
    "format": "Manga",
    "status": "ongoing",
    "volumes": "-",
    "chapters": "-",
    "magazines": ["Monthly Animal House", "Young Animal"],
    "publisher": "Hakusensha",
    "demographic": "Seinen",
    "releaseYear": 1989,
    "publicationPeriod": "1989–present"
  }
]

Example where title is needed:
Top-level title: Re:Zero - Starting Life in Another World

mangaInfo:
[
  {
    "title": "Re:Zero - Starting Life in Another World: Chapter 1 - A Day in the Capital",
    "format": "Manga",
    "status": "completed",
    "volumes": "2",
    "chapters": "11",
    "magazines": ["Monthly Comic Alive"],
    "publisher": "Media Factory",
    "demographic": "Seinen",
    "releaseYear": 2014,
    "publicationPeriod": "2014–2015",
    "notes": "Manga adaptation of the first story arc; not the original source"
  }
]

animeInfo rules:

animeInfo must always be a JSONB array.
If there is no anime adaptation, use:
animeInfo | []

animeInfo is for anime-specific facts only.

Use this standard shape:

[
  {
    "title": "Fullmetal Alchemist: Brotherhood",
    "format": "TV Series",
    "studios": ["Bones"],
    "releasePeriod": "2009–2010",
    "startYear": 2009,
    "endYear": 2010,
    "episodes": 64,
    "status": "completed",
    "notes": "Second TV anime adaptation that follows the manga storyline more closely"
  }
]

Allowed animeInfo.format values:

TV Series
Movie
Movie Series
OVA
ONA
TV Special
Special
TV Recut
Compilation Movie
Short

Use exactly these spellings.

Do not write:
TV series
tv show
Anime
Film trilogy
Movie trilogy
Film
Recut
TV recut

Use:
TV Series
Movie
Movie Series
TV Recut

studios:
Always use the plural key:
"studios"

Never use:
"studio"

studios must always be a JSON array.

Correct:
"studios": ["Bones"]

Correct for multiple studios:
"studios": ["Liden Films", "GEMBA", "Millepensee"]

Wrong:
"studio": "Bones"

Wrong:
"studios": ["Liden Films / GEMBA / Millepensee"]

Split multiple studios into separate array items so the website can search and filter by each studio.

Studio spelling must be stable and consistent.
The same studio must always be written the same exact way every time.

Use these canonical spellings:

Bones
Pierrot
Studio Signpost
Studio 4°C
OLM
David Production
Zero-G
Liber
Saber Works
Liden Films
GEMBA
Millepensee
MAPPA
Madhouse
Wit Studio
Production I.G
Toei Animation
Sunrise
TMS Entertainment
Ufotable
Kyoto Animation
A-1 Pictures
CloverWorks
Trigger
Science SARU
P.A. Works

Do not write variations like:
BONES
bones
Studio 4C
Studio 4 °C
David Productions
LIDENFILMS
LidenFilms
Production IG
UfoTable
WIT Studio

releasePeriod:
Use a text string.
Examples:
"releasePeriod": "1997–1998"
"releasePeriod": "2022"
"releasePeriod": "TBA"
"releasePeriod": "2026–present"

startYear:
Use a number when known.
Use null when unknown or TBA.

endYear:
Use a number when known.
Use null when ongoing, upcoming, unknown, or TBA.

Examples:
"startYear": 2026
"endYear": null

episodes:
Use a number for TV Series, OVA, ONA, TV Recut, TV Special, Special, or Short when verified.
For completed anime, use the verified final episode count.
For ongoing anime, use the currently verified released episode count only if useful and make sure status is "ongoing".
Do not invent a final episode count.

movies:
Use a number for Movie or Movie Series.

Examples:
"movies": 1
"movies": 3

Do not use "films".
Use "movies".

animeInfo.status values:

completed
ongoing
upcoming
cancelled
unknown

Use lowercase only.

notes inside animeInfo:
Notes must describe only that anime entry.
Keep notes short and spoiler-safe.
Use notes to explain adaptation relationship, continuity, season status, source coverage, or special production context.

Examples:
"notes": "First TV anime adaptation with an original direction after early manga material"
"notes": "Second TV anime adaptation that follows the manga storyline more closely"
"notes": "TV recut of the Golden Age film trilogy with added and remastered material"
"notes": "Announced sequel/continuation; official final title not yet confirmed"

Do not put manga publication notes inside animeInfo.
Do not put novel source notes inside animeInfo unless it directly explains what the anime adapts.

title inside animeInfo:
Do not include title if there is only one anime entry and the title is exactly the same as the top-level title, unless including it improves clarity.

Include "title" inside animeInfo when:
the anime has a different official title
there are multiple seasons
there are movies
there are OVAs, ONAs, specials, or recuts
there are multiple continuities
the entry needs a title to distinguish it from another anime entry

Examples:
Fullmetal Alchemist
Fullmetal Alchemist: Brotherhood
Fullmetal Alchemist the Movie: Conqueror of Shamballa
Berserk: The Golden Age Arc
Berserk: The Golden Age Arc - Memorial Edition
Kingdom Season 2
Kingdom Season 6 Sequel

Do not label an upcoming sequel as Season 7 unless official sources call it Season 7.
If the official wording is only "sequel" or "continuation", use a safe title like:
"Kingdom Season 6 Sequel"

novelInfo rules:

novelInfo must always be a JSONB array.
If there is no novel/light novel/web novel version, use:
novelInfo | []

novelInfo is for prose-specific facts only.

Use this standard shape:

[
  {
    "format": "Light Novel",
    "status": "ongoing",
    "volumes": "-",
    "chapters": "-",
    "publisher": "Media Factory",
    "imprint": "MF Bunko J",
    "releaseYear": 2014,
    "publicationPeriod": "2014–present",
    "notes": "Commercial light novel version based on the original web novel"
  }
]

Allowed novelInfo.format values:

Web Novel
Light Novel
Novel

Use exactly these spellings.

novelInfo.status values:

completed
ongoing
hiatus
cancelled
unknown

Use lowercase only.

volumes and chapters:
Use strings.
For completed works, use verified numeric strings when available.
For ongoing works, use:
"volumes": "-"
"chapters": "-"

publisher:
Use the official publisher when applicable.
For web novels, publisher may be the platform.

Examples:
Shōsetsuka ni Narō
Media Factory
Kadokawa
ASCII Media Works
Dengeki Bunko

imprint:
Use only when useful and verified.
Example:
"imprint": "MF Bunko J"

platform:
Use only for web novels or web-published fiction when useful.
Example:
"platform": "Shōsetsuka ni Narō"

releaseYear:
Use a number.

publicationPeriod:
Use a text string.
Examples:
"publicationPeriod": "2012–present"
"publicationPeriod": "2014–present"
"publicationPeriod": "2006–2008"

notes inside novelInfo:
Notes must describe only the novel/web novel/light novel version.

Example:
"notes": "Original web novel version"
"notes": "Commercial light novel version based on the original web novel"

title inside novelInfo:
Do not include title if the novel title is exactly the same as the top-level title.

Only include title when:
the novel version has a different official title
there are multiple novel versions
there is a sequel or side-story novel with its own title
the web novel and light novel need separate titles for clarity

Information placement rules:

The top level is for shared story identity only.

Top-level fields:
id
title
alternativeTitles
type
creator
heroScore
genres
tags
featured
description

mangaInfo is for:
manga format
manga status
manga volumes
manga chapters
manga magazines
manga publisher
manga demographic
manga release year
manga publication period
manga-specific notes

animeInfo is for:
anime title when needed
anime format
anime studios
anime release period
anime start year
anime end year
anime episodes
anime movies
anime status
anime-specific notes

novelInfo is for:
novel/light novel/web novel format
novel status
novel volumes
novel chapters
novel publisher
novel imprint
novel platform
novel release year
novel publication period
novel-specific notes

Do not mix these.

Examples:
If the manga is an adaptation of a light novel, put that note in mangaInfo.
If the anime has an original ending, put that note in animeInfo.
If the web novel is the original source, put that note in novelInfo.
If the anime sequel title is not officially confirmed, put that note in animeInfo.
Do not put these notes at the top level.

Title repetition rules:

The top-level title is the main title.

Inside mangaInfo, animeInfo, and novelInfo, title is optional.

Do not repeat the same title inside an info object unless it is useful.

Use inside title only when:
the format has a different official title
there are multiple seasons/movies/arcs/versions
the version is a sequel, spin-off, recut, remake, or alternate continuity
the entry would be confusing without it

Website display fallback rule:
The site can display item.title if it exists, otherwise it can fall back to the top-level story title.

Conceptually:
displayTitle = item.title ?? story.title

Spelling and consistency rules:

Be extremely consistent with names because the website will search and filter by these values.

The same magazine must always use the same spelling.
The same studio must always use the same spelling.
The same publisher must always use the same spelling.
The same format must always use the same spelling.
The same status must always use the same spelling.

Use exact capitalization.
Use exact punctuation.
Use exact spacing.
Use exact macrons when the canonical name uses them.

Important magazine spellings:

Weekly Shōnen Jump
Weekly Young Jump
Ultra Jump
Weekly Shōnen Magazine
Monthly Shōnen Gangan
Big Comic Spirits
Weekly Big Comic Spirits
Big Comic Original
Monthly Afternoon
Morning
good! Afternoon
Weekly Young Sunday
Monthly Animal House
Young Animal
Monthly Comic Alive

Do not write:
Weekly Shonen Jump
Weekly shōnen jump
Weekly Shounen Jump
Weekly Young jump
Big Comics Spirits
Good Afternoon
good Afternoon

Use:
Weekly Shōnen Jump
Weekly Young Jump
Big Comic Spirits
good! Afternoon

Important publisher spellings:

Shueisha
Shogakukan
Kodansha
Hakusensha
Square Enix
Media Factory
Kadokawa
D&C Media
Yen Press
VIZ Media

Do not write variations unless the official publisher name is different.

Research and verification rules:

Verify facts before outputting.
Use reliable official or high-quality sources when possible:
official publisher pages
official anime websites
official streaming/news pages
official volume listings
recognized manga/anime databases
reputable encyclopedia/reference pages only when official data is unavailable

Check current status carefully.
Ongoing, upcoming, hiatus, and recently completed works can change.
Do not guess current facts.
Do not invent episode counts, volume counts, chapter counts, release windows, or studios.
If a fact is unknown, use:
"unknown"
null
[]
or omit the optional field depending on the field type.

Use:
"status": "unknown"
"startYear": null
"endYear": null
"magazines": []
animeInfo | []
novelInfo | []

Do not pretend uncertain information is confirmed.

For completed manga/manhwa/manhua/webtoon:
Use verified numeric strings for chapters and volumes.

For ongoing manga/manhwa/manhua/webtoon:
Use "-" for chapters and volumes.

For completed anime:
Use verified final numeric episode/movie counts.

For upcoming anime:
Do not invent episode counts.
Use:
"status": "upcoming"
"startYear": null if year is not confirmed
"endYear": null

For announced sequels:
Use the official announced title if known.
If the official title is not confirmed, use a safe descriptive title and explain in notes.

Example:
"title": "Kingdom Season 6 Sequel"
"notes": "Announced sequel/continuation; official final title not yet confirmed"

JSONB quality rules:

All JSONB must be valid JSON.
Use double quotes only.
No single quotes.
No trailing commas.
No comments inside JSON.
No undefined values.
Use null when needed.
Use arrays for multi-value fields.

Correct:
"studios": ["Pierrot", "Studio Signpost"]

Wrong:
"studios": ["Pierrot / Studio Signpost"]

Correct:
"magazines": ["Weekly Young Sunday", "Weekly Big Comic Spirits"]

Wrong:
"magazines": ["Weekly Young Sunday, Weekly Big Comic Spirits"]

Correct:
"alternativeTitles": ["ベルセルク", "Beruseruku"]

Wrong:
"alternativeTitles": ['ベルセルク', 'Beruseruku']

Final output rules:

Output only the entry.
Use a clear heading with the story title.
Use the cover choice section.
Use the exact table format.
Do not output a full JSON object.
Do not wrap the whole answer in code.
Do not add extra fields.
Do not include old top-level manga-only fields.
Do not add explanations after the table unless asked.

Final table must look like this:

Column | Paste this value
id | manga-example-2000
title | Example Title
alternativeTitles | ["Example Native Title", "Example Romanized Title"]
type | ["manga", "anime"]
creator | Creator Name
heroScore | 9.5
genres | ["Action", "Drama", "Fantasy"]
tags | ["Trauma", "Survival", "Morality", "Sacrifice"]
featured | true
description | Example Title is a 7–8 sentence description that starts with the exact title and avoids spoilers.
mangaInfo | [{"format":"Manga","status":"completed","volumes":"18","chapters":"162","magazines":["Big Comic Original"],"publisher":"Shogakukan","demographic":"Seinen","releaseYear":1994,"publicationPeriod":"1994–2001"}]
animeInfo | [{"title":"Example Title","format":"TV Series","studios":["Studio Name"],"releasePeriod":"2000–2001","startYear":2000,"endYear":2001,"episodes":26,"status":"completed","notes":"Short spoiler-safe anime-specific note"}]
novelInfo | []