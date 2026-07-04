What I got wrong

The biggest mistake: I treated your idea like a set of separate scenes.

That is why the current version feels broken:

row appears
row disappears
quotes appear in center
quotes shrink and vanish
row appears again

That is not what you wanted.

You wanted:

row exists
evidence falls down
evidence physically becomes the button
button lands inside the row
scroll up reverses it
scroll down continues it

That is a completely different animation model.

Your version is a continuous transformation.

My version was more like separate slide transitions.

That is why it feels fake.

What the section should actually be

The better concept is:

A rating is a shell.
Scrolling fills the shell with proof.

So visually, the section should feel like a shelf / desk / library row where emotional evidence rains into the entry.

The row should not keep randomly appearing and disappearing. It should be the anchor.

The row should stay near the bottom or center-bottom as the “destination.” Then quotes, panels, characters, notes, and thoughts fall into it.

The button should not simply appear. The button should feel created from the thing above it.

So for example:

quote papers fall
quote papers stack
stack compresses
stack becomes [Quotes]
[Quotes] lands inside row

That is the correct mental model.

The research-backed direction
1. The row needs to become a real media object, not a tiny table row

Your cover is too small. I agree.

For manga, the cover should not be 64px wide. That makes the entry feel like a database row, not a personal library item.

Material Design says cards should arrange image, text, and actions with clear hierarchy, and Nielsen Norman Group says visual hierarchy depends heavily on scale, contrast, and grouping. Shopify Polaris also describes cards as structured objects with header/body/footer roles, where consistent placement helps people know where to look.

So the row should become more like a wide cinematic media card:

┌──────────────────────────────────────────────────────────────┐
│  ┌────────────┐   Vagabond                         9/10       │
│  │            │   Takehiko Inoue                              │
│  │   COVER    │   Manga · Completed                           │
│  │            │                                               │
│  └────────────┘   [Quotes] [Moments] [Characters] [Notes]     │
└──────────────────────────────────────────────────────────────┘

But the cover should be more like:

desktop: 110px–135px wide
tablet: 90px–110px wide
mobile: 76px–90px wide

Not 64px.

A manga cover has emotional identity. It should be one of the strongest visual elements in the row.

Microsoft Fluent’s layout guidance also supports this: spacing and hierarchy should create relationships between components and highlight what matters most.

2. Manga panels need to be big, not thumbnail cards

You are also right that the “moments” should not be tiny little cards.

For manga, panels are not decoration. Panels are the memory.

Comic layout research says page layout affects meaning through panel number, shape, size, arrangement, and gutters. Academic manga research also points out that panel layout is a major part of what makes a manga visually distinctive.

So moments should be shown like this:

        ┌─────────────────────┐
        │                     │
        │   LARGE PANEL 1     │
        │                     │
        └─────────────────────┘

   ┌──────────────────┐      ┌──────────────────┐
   │ LARGE PANEL 2    │      │ LARGE PANEL 3    │
   └──────────────────┘      └──────────────────┘

Not like this:

[small image] [small image] [small image]

For your section, I would use:

main panel: 360px–460px wide desktop
secondary panels: 240px–320px wide desktop
mobile: stacked full-width panels

The moment stage should feel like flipping through remembered panels on a desk.

3. Characters should be portrait cards, not small circles

You are right again.

A small circular face makes the character feel like a social media avatar. That is not strong enough for a manga/anime memory system.

Characters should appear as portrait cards:

┌──────────────────┐
│                  │
│   character img  │
│                  │
├──────────────────┤
│ Musashi Miyamoto │
│ changed slowly   │
└──────────────────┘

One primary character can be large, with supporting characters around it. That gives hierarchy:

              small trait
        ┌──────────────────┐
        │                  │
        │     Musashi      │
        │                  │
        └──────────────────┘

  Kojiro card      Otsu card      Takuan card

This fits visual hierarchy principles better than equal-sized circles. Bigger elements become the focal point, and smaller ones become supporting evidence.

4. The UX pattern should be progressive disclosure

The actual product idea is strong because it is progressive disclosure.

At first:

9/10

Then:

9/10 + Quotes

Then:

9/10 + Quotes + Moments

Then:

9/10 + Quotes + Moments + Characters

That is exactly what progressive disclosure is for: showing simple information first, then revealing deeper information gradually so the user is not overwhelmed. Nielsen Norman Group describes progressive disclosure as deferring advanced or secondary information to reduce complexity, and their usability heuristic “recognition rather than recall” says interfaces should make options visible instead of forcing users to remember details.

So your section should not dump everything at once.

It should reveal proof one category at a time.

But the animation needs to prove where the buttons came from.

That is the missing piece.

Best animation direction
The best style for us: scroll-scrubbed “evidence rain into shelf”

The best animation style is not regular CSS keyframes.

It should be a scroll-scrubbed pinned timeline.

That means:

scroll down = animation moves forward
scroll up = animation reverses
stop scrolling = animation stops exactly there

This matches what you asked for.

MDN describes scroll-driven animation as animation progress being linked to scroll progress instead of time. Chrome’s documentation and WebKit’s guide explain the same idea: the user’s scroll controls the timeline.

That is what we need.

Not:

user reaches stage
CSS animation plays by itself

But:

user scrolls 12%
quote falls 12%
user scrolls back
quote rises back 12%

That is the correct effect.

Use one pinned scene, not 11 sticky stages

My earlier structure used many sticky stages. That caused the broken feeling.

The better architecture is:

one pinned Section 2 scene
one row/shelf
one evidence layer above it
one timeline controlling everything

Like this:

┌──────────────────────────────────────────┐
│                                          │
│       evidence appears/falls here         │
│                                          │
│                                          │
│       ↓     ↓     ↓     ↓                │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ cover title score buttons shelf     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘

GSAP ScrollTrigger is built for this kind of thing because it supports pinning, scrubbing, snapping, and timeline-based scroll animation.

CSS scroll-driven animations are also possible, but browser support and complexity make GSAP easier for this specific cinematic section. Motion.dev is great for React scroll-linked animation, but since your project looks like plain HTML/CSS/JS, GSAP ScrollTrigger is the better fit.

The core animation should use object continuity

The button should feel like it came from the content.

That means we need continuity.

For example:

quote cards
  ↓
stack together
  ↓
shrink into pill
  ↓
pill lands in row

This is basically a layout transformation problem. The FLIP animation technique is specifically used to make elements move smoothly between layout states by measuring first position, last position, inverting the difference, then playing the transform. GSAP also has a Flip plugin for this exact kind of “same thing moves into a new layout” animation.

That is much closer to what you want than my earlier “shrink and fade in the center.”

What each category should look like
Quotes

Current issue:

floating quote cards in center
then vanish

Better:

quote strips fall from top
each has different x-position and slight rotation
they continue falling downward toward the row
they stack above the row
the stack compresses into [Quotes]
[Quotes] drops into button row

Visual style:

paper strips
not big cards
not too much rotation
warm paper
ink text
slight shadow

Animation:

fall vertically
slight rotate
small bounce when stacking
compress into pill
pill lands

Reason: motion should show relationships between objects, not just decorate. Material’s motion guidance says motion should help explain relationships, hierarchy, and changes in UI state. NN/G also says animation should be purposeful, brief, and tied to feedback/state/navigation rather than random decoration.

Moments / manga panels

Current issue:

images are too small
they look like generic thumbnails

Better:

large manga panel enters from above
secondary panels follow
panels drift slightly like memories
then panels slide downward and stack into [Moments]

Visual style:

large black-and-white panel frames
paper border
caption below or small label
one hero panel large
two supporting panels smaller

Animation:

large panel drops first
secondary panels slide from left/right
all move downward into row
button forms from mini stacked panel icon + label

Important: panels should be visible enough that a user understands this is manga evidence, not just “image decoration.”

Characters

Current issue:

small circular avatars
not emotionally strong

Better:

one large portrait card appears
supporting character cards appear behind/around it
trait words orbit lightly
then cards collapse into [Characters]

Visual style:

portrait cards, not circles
image takes most of the card
name + one trait underneath

Animation:

main character rises/falls into frame
supporting characters stagger in
traits fade around them
all descend into row
button forms

Reason: scale and grouping create hierarchy. The main character should be the focal point; supporting characters are secondary.

Notes

Current issue:

notes are just random cards

Better:

sticky notes drift down like paper
some rotate slightly
they overlap near the row
then fold/compress into [Notes]

Visual style:

small sticky note cards
short text only
one or two lines visible
not full paragraphs

Notes should feel personal but not overwhelming.

UX reason: readability matters. IxDF defines readability as how easily users can read and understand text; if notes become too long during animation, the user stops watching the motion and starts struggling to read.

Thoughts

Current issue:

thoughts are long paragraphs appearing like normal cards

Better:

one journal page opens
one or two sentence fragments fade in
then the page closes/folds into [Thoughts]

Visual style:

journal page
larger calm card
not many floating cards
less movement than quotes

Animation:

fade up
small type-on effect
page folds downward
becomes [Thoughts]

Thoughts should be the slowest and calmest because it is the deepest category.

The best final row design

The final row should not be tiny.

It should look like a completed memory object.

Something like:

┌──────────────────────────────────────────────────────────────┐
│ ┌────────────┐  Vagabond                         9/10        │
│ │            │  Takehiko Inoue                               │
│ │   COVER    │  Manga · Completed                            │
│ │            │                                               │
│ └────────────┘  Evidence saved                               │
│                 [Quotes] [Moments] [Characters] [Notes]      │
│                 [Thoughts]                                   │
└──────────────────────────────────────────────────────────────┘

The cover should be a real anchor.

The score should be strong but not the only strong thing.

The buttons should feel like proof categories.

This follows the idea that UI cards group related information and actions in one container, but the internal hierarchy must make the important parts obvious.

Best technical plan
Do not use many independent CSS animations for the important movement

CSS keyframes are okay for tiny ambient motion.

But the main transformation should be scroll-controlled.

Better stack:

CSS:
  colors
  layout
  row design
  card design
  base responsive styling

JS:
  one scroll timeline
  one pinned section
  scrubbed transforms
  button creation sequence
  reverse animation support

For this section, I would use:

GSAP + ScrollTrigger

Why:

pin section
scrub timeline
reverse automatically
precise start/end labels
easier debugging
better than manually calculating scroll progress

GSAP ScrollTrigger supports pinning and scrubbed scroll animation, which is exactly what this interaction needs.

Optional later:

Lenis

Only if you want smoother scrolling. Lenis is a lightweight smooth-scroll library, but I would not add it first. First we should make the animation correct using normal scroll.

The timeline should look like this

Not code yet, just structure:

0.00  row visible, empty
0.08  row score emphasized: "9/10 means nothing"
0.15  quote papers start falling
0.25  quotes stack near row
0.32  quote stack morphs into [Quotes]
0.36  [Quotes] lands in row

0.42  manga panels enter large
0.52  panels drift/readable
0.60  panels descend into row
0.66  [Moments] lands in row

0.70  character portrait cards appear
0.78  traits appear
0.84  character cards descend
0.88  [Characters] lands in row

0.91  notes fall
0.95  [Notes] lands

0.96  thought journal appears
1.00  [Thoughts] lands, final complete row

That is the story.

The row should not be replaced by different row copies. It should be one row whose buttons get added visually.

That is important.

Source map I used

I looked across these categories.

UI / visual design sources
Material Design cards: cards need clear hierarchy between image, text, and actions.
Material layout: layout directs attention and makes action easier.
NN/G visual hierarchy: size, contrast, and color guide the eye.
NN/G visual design principles: scale, hierarchy, balance, contrast, and Gestalt improve usability.
Shopify Polaris card layout: cards have header/body/footer roles and consistent placement helps users find things.
Microsoft Fluent layout: spacing and hierarchy create relationships and help people make decisions.
IBM Carbon tile/card guidance: cards can support complex hierarchy and multiple actions.
Atlassian Design System components/layout: page layout and tags/lozenges help structure and label information.
Adobe Spectrum: design systems create cohesive product experiences.
IxDF visual hierarchy: hierarchy helps users navigate a digital product.
UX / information behavior sources
NN/G progressive disclosure: reveal deeper information gradually to reduce complexity.
NN/G recognition rather than recall: visible options reduce memory load.
NN/G memory recognition vs recall: recognition gives users context to retrieve information.
NN/G card vs list view: lists are efficient, cards are more visually engaging and better for grouping.
NN/G carousel usability: controls and visibility matter when presenting multiple visual items.
Baymard carousel UX: carousel-like patterns can fail if users overlook content or controls are weak.
IxDF readability: text must remain easy to read and understand.
Comic layout analysis: panel arrangement affects meaning and pacing.
Manga panel-layout research: panel layout is a distinctive part of manga identity.
Scrollytelling research: scroll narratives can give users control and make content easier to explore.
Animation / motion sources
Material motion: motion should communicate relationships, hierarchy, and UI state.
Material motion physics: motion should make UI feel expressive and easy to use.
Apple HIG motion: custom motion should be intentional and respectful.
NN/G role of animation: animation should be brief, subtle, and purposeful.
NN/G animation duration: define trigger, transformation, duration, easing, and accessibility.
NN/G distracting animations: motion attracts attention, so it must match the user’s need.
MDN scroll-driven animations: animation can be linked directly to scroll progress.
Chrome scroll-driven animation docs: scroll timelines and view timelines support declarative scroll animation.
WebKit scroll-driven guide: scroll progress can drive animation instead of time.
GSAP ScrollTrigger: supports pinning, scrubbing, snapping, and scroll-based timelines.
Motion.dev scroll animation guide: scroll-linked animation maps scroll progress to visual properties.
FLIP animation technique: use First, Last, Invert, Play to animate layout changes smoothly.
Final recommendation

The best direction is:

One pinned cinematic section.
One strong media row.
One large manga cover.
Large readable evidence visuals above it.
Evidence falls downward into the row.
Each evidence type morphs into its button.
Scroll down plays forward.
Scroll up reverses perfectly.

So before writing code, I would redesign Section 2 around this exact storyboard:

Empty row
↓
Quote papers fall
↓
Quote papers stack into [Quotes]
↓
Manga panels fall/slide in large
↓
Panels stack into [Moments]
↓
Character portrait cards appear
↓
Portraits compress into [Characters]
↓
Notes drift down
↓
Notes fold into [Notes]
↓
Thought journal appears
↓
Journal closes into [Thoughts]
↓
Final complete row

That is the cleanest version of your idea. It is more cinematic, more understandable, more manga-specific, and much closer to the feeling you originally described.

Good. We should keep talking and not code yet.

I’m going to be honest: I should not pretend that “100 random websites” automatically makes the answer better. What matters is using the strongest sources: official design systems, UX research, animation docs, accessibility/performance docs, manga/comics layout research, and creative web inspiration. I expanded the research across those areas and the answer below is the combined design direction.

The biggest conclusion is this:

Section 2 should not be a normal section with animations inside it.

It should be one pinned cinematic system:
a living background + one strong manga row + evidence falling into that row.

The current idea is still right. The execution needs a better system.

1. The background should become part of the story

Right now, the background is mostly decorative. It is warm, but it does not react to what is happening.

For this section, the background should behave like a living paper desk / manga memory board.

Not crazy. Not distracting. But alive.

The best background idea for Inkwell is:

warm paper surface
soft moving light
subtle manga panel grid lines
tiny ink/paper dust movement
stage-based atmosphere changes

Motion design research says motion should explain relationships and state changes, not just decorate the page. Material Design says motion should communicate spatial relationships, functionality, and intention; NN/G says animation should be brief, purposeful, and not distracting; Apple also warns against unnecessary or overwhelming motion.

So the background should not be:

random particles everywhere
fast moving blobs
huge animated gradient stealing attention

It should be:

slow breathing background that changes depending on the evidence type
Best background behavior

When the row is empty:

quiet paper background
faint shelf line
soft center glow behind the row

When quotes fall:

thin falling paper shadows
very faint vertical motion
background warms slightly

When manga panels appear:

faint manga gutter lines appear behind them
background becomes more ink/paper contrast

When characters appear:

soft spotlight behind the main character card
background becomes calmer and more focused

When notes appear:

subtle sticky-note board feeling
small rotated paper shadows

When thoughts appear:

background becomes quieter
soft ink wash behind journal page
less movement

The background should support the current evidence type. It should not be one animation playing forever.

This fits the idea from scroll-driven animation docs: the animation should be tied to the user’s scroll progress, so scrolling down moves the scene forward and scrolling up reverses it.

2. The scroll animation should be one pinned timeline

This is the most important technical/design correction.

My earlier approach used many sticky stages. That made the section feel like separate scenes.

Your idea needs one continuous timeline.

The model should be:

scroll down = timeline moves forward
scroll up = timeline reverses
stop scrolling = animation pauses exactly there

This is called a scroll-linked or scroll-driven animation. MDN, Chrome, WebKit, and W3C all describe the same principle: animation progress can be connected to scroll progress instead of time.

For your project, the best implementation is:

GSAP ScrollTrigger for pin + scrub
GSAP Flip or clone/proxy elements for “thing becomes button”
CSS for layout, color, shape, background

GSAP ScrollTrigger supports pinning, scrubbing, snapping, and timeline control, which matches your exact need. GSAP Flip is useful because it is made for smooth transitions between different layout states, so evidence can visually become a button instead of simply fading away.

So the correct section architecture is:

one pinned container
one shelf row
one evidence stage above the row
one button tray inside the row
one scroll timeline controlling all movement

Not:

11 sticky sections
row disappears
evidence appears
evidence shrinks
new row appears

That old version breaks the illusion.

3. The row should be redesigned bigger

You are right: the cover is too small.

The current row feels like a database row. For manga, that is wrong. Manga is visual. The cover should carry identity and emotion.

Cards and media cards are meant to group one subject with rich media, title, supporting text, and actions. Material Design says card images and text should clearly show hierarchy, NN/G says visual hierarchy comes from scale, contrast, grouping, and color, and Fluent says spacing creates relationships and helps people decide what matters.

Better row sizing

Desktop row:

width: 1040px–1120px
height: 190px–230px after buttons are added
cover: 120px–140px wide
cover height: 180px–210px

Tablet row:

cover: 96px–112px wide
row width: 90vw

Mobile row:

cover: 82px–96px wide
stacked layout
score under title or top-right
buttons wrap below
Better row layout

The row should look more like this:

┌──────────────────────────────────────────────────────────────┐
│ ┌────────────┐  Vagabond                         9/10        │
│ │            │  Takehiko Inoue                               │
│ │   COVER    │  Manga · Completed                            │
│ │            │                                               │
│ └────────────┘  Evidence saved                               │
│                 [Quotes] [Moments] [Characters] [Notes]      │
│                 [Thoughts]                                   │
└──────────────────────────────────────────────────────────────┘

The score should still be visible, but it should not be the only thing with weight. The whole point is that the rating becomes meaningful after proof is added.

Eye order

The user’s eye should move like this:

1. Cover
2. Title
3. Score
4. Falling evidence
5. New button landing in row

That order makes sense because the cover tells the user what story this is, the title confirms it, the score creates the problem, and the evidence explains the score.

4. Buttons should not just appear — they should be “formed”

This is the heart of the section.

The button should feel like the final compressed form of the evidence.

So the animation should be:

evidence appears
evidence moves downward
evidence stacks near the row
evidence compresses
button forms
button falls/lands into the row

Not:

evidence fades out
button fades in

Material motion says animation should help explain relationships between elements and outcomes. That means the button must visually relate to the evidence that created it.

Correct button formation
Quotes
quote strips fall
quote strips stack
stack squeezes into a pill
[Quotes] lands inside row
Moments
large manga panels slide/fall in
panels overlap into a small stack
stack compresses into [Moments]
button lands inside row
Characters
portrait cards appear
main character card leads
supporting cards gather behind
cards compress into [Characters]
button lands inside row
Notes
sticky notes drift down
notes fold/stack
stack compresses into [Notes]
button lands inside row
Thoughts
journal page opens
short thought line appears
page closes/folds
fold becomes [Thoughts]
button lands last

The landing should have a tiny bounce, but not cartoonish. More like:

fall → soft impact → settle
5. Manga panels must be large and visible

The “Moments” part should be the most visually manga-specific part.

The current small image cards are not enough. They look like generic thumbnails.

Manga/comics research and guides repeatedly emphasize that panel size, gutters, layout, and reading flow shape meaning and pacing. One manga panel-layout study specifically focuses on how panel layout features contribute to the identity of manga works, and comic layout sources explain that panel size and gutters guide pacing and reader attention.

So the moment stage should feel like panels from a manga page landing on a desk.

Better Moments layout
          ┌──────────────────────────────┐
          │                              │
          │        HERO PANEL             │
          │                              │
          └──────────────────────────────┘

 ┌─────────────────────┐       ┌─────────────────────┐
 │   SECONDARY PANEL   │       │   SECONDARY PANEL   │
 └─────────────────────┘       └─────────────────────┘

Suggested sizes:

hero panel: 420px–540px wide
secondary panels: 260px–340px wide
caption: tiny, optional
border: black/ink, not warm brown only

The panels should have:

slight rotation
paper shadow
black manga frame border
visible image area
maybe one panel partially overlaps another

Do not make them tiny.

Do not make them all equal.

One big panel should be the emotional anchor.

6. Characters should be portrait cards, not circles

The current circular character images feel too small and social-media-like.

Characters should be shown as portrait cards.

A manga character is not just a face. The card should show body/pose if available, or at least a larger vertical crop.

Visual hierarchy research says scale and grouping guide attention, and cards help group related information into a single understandable object.

Better character layout
             changed slowly

        ┌───────────────────┐
        │                   │
        │      Musashi      │
        │                   │
        ├───────────────────┤
        │ Musashi Miyamoto  │
        │ restless → still  │
        └───────────────────┘

   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │   Kojiro    │   │    Otsu     │   │   Takuan    │
   └─────────────┘   └─────────────┘   └─────────────┘

Suggested sizes:

main character card: 220px–280px tall
supporting cards: 150px–190px tall
image area: 70% of card
text area: 30% of card

Traits should be short:

quiet
changed slowly
honest
restless
at peace

Not paragraphs.

The character section should feel like a cast board.

7. Quotes should be readable paper strips

Quotes should not be giant blocks in the center. They should feel like saved fragments.

Best shape:

horizontal paper strips
280px–440px wide
slight rotation
warm paper
ink text
soft shadow

They should fall vertically, not appear in place.

Motion path:

start above viewport
fall into evidence area
rotate slightly
land in loose stack
continue falling into row
compress into [Quotes]

This matches your “raining/falling” idea better.

The quotes should not vanish at the center. They should move toward the row.

8. Notes and Thoughts need different emotional weight

Notes and Thoughts should not look the same.

They are different layers of depth.

Notes

Notes are quick personal observations.

Visual style:

sticky notes
small
warm cream/yellow paper
1–2 lines visible
slight rotation

Animation:

drift down
overlap
stack
fold into [Notes]
Thoughts

Thoughts are deeper.

Visual style:

one journal page
larger
calmer
less rotation
more whitespace

Animation:

journal page fades/falls in slowly
one or two lines reveal
page closes or folds downward
becomes [Thoughts]

This matters because UX readability research emphasizes that text must remain easy to read and understand. Long moving paragraphs are harder to process, so the visual stage should show only a short preview.

9. Hover interactions should preview, not distract

Hover should make the section feel interactive, but it should not fight the scroll animation.

NN/G describes microinteractions as small feedback moments, and warns that animation should be purposeful. IxDF also describes microinteractions as subtle cues that make interaction feel more intuitive.

Best hover interactions
Cover hover
cover lifts 3px
slight tilt
soft shine moves across cover
row shadow deepens

Purpose:

this is a physical saved object
Score hover
9/10 gently pulses once
small text appears: “but why?”

Purpose:

reminds user that score alone is incomplete
Button hover

Each button should show a tiny preview card above it.

hover [Quotes]      → one quote preview
hover [Moments]     → tiny manga panel preview
hover [Characters]  → character portrait preview
hover [Notes]       → sticky note preview
hover [Thoughts]    → journal line preview

This makes the buttons informative, not just decorative.

But previews should be small and quick:

appear in 140–180ms
move 6–10px
fade/scale only
no huge layout shift

CSS-Tricks and Codrops show lots of creative hover/cursor effects, but for this project the effect should be restrained because the scroll animation is already the main spectacle.

10. The background can respond to hover too

This is a nice detail.

When hovering a button:

Quotes hover      → tiny paper flecks behind row
Moments hover     → faint panel grid behind row
Characters hover  → soft portrait spotlight
Notes hover       → sticky-note shadow shape
Thoughts hover    → subtle ink wash

This creates interaction without needing huge popups.

The background becomes part of the meaning.

But it must stay subtle:

opacity: 0.08–0.18
movement: 4px–14px
duration: 250ms–400ms
11. Borders and shapes should change by evidence type

Right now everything uses the same rounded card style.

That makes the section feel too samey.

Better:

Main row
large radius: 28px–34px
warm paper border
soft deep shadow
Quote strips
radius: 14px–18px
slight torn-paper / soft paper feel
thin warm border
Manga panels
radius: 6px–12px
black/ink border
stronger rectangular shape

Because manga panels should feel like panels, not app cards.

Character cards
radius: 18px–24px
portrait-card shape
image-heavy
Notes
radius: 12px–18px
rotated sticky paper
Thoughts
radius: 22px–28px
journal/card shape
more whitespace

Different shapes help users understand that each evidence type has its own meaning.

12. Animation should use gravity

You specifically said the evidence should feel like it is raining/falling.

That means the animation should obey a simple physical idea:

things enter from above
fall downward
slow slightly near destination
land into row

Avoid random side-to-side center animations.

Use this pattern:

start y: -120px to -400px
middle y: visible evidence area
end y: row button tray
scale down only near the end
opacity stays visible until it reaches row

The mistake before was scaling/fading too early.

The better timing:

0%–65%: evidence is full size and readable
65%–85%: evidence starts moving toward row
85%–95%: evidence compresses
95%–100%: button lands

That way the user has time to see the evidence before it becomes a button.

13. The final timeline

This is the best full section sequence:

0.00
Empty row appears.
Cover/title/author/score visible.
Buttons area is empty.

0.08
Score gets slight emphasis.
Tiny line: “A number is only the surface.”

0.15
Quotes begin falling from above.

0.25
Quotes are readable.
They overlap like paper on a desk.

0.34
Quotes descend toward row.
Quote stack compresses.

0.39
[Quotes] button falls into row.

0.45
Large manga hero panel drops in.
Two secondary panels slide/fall in.

0.56
Panels are fully visible and readable.

0.64
Panels descend into row and stack.

0.69
[Moments] button lands next to [Quotes].

0.73
Main character portrait card appears.
Supporting character cards appear around it.

0.81
Trait words appear around character cards.

0.87
Character cards gather downward.

0.90
[Characters] button lands.

0.92
Notes drift down like sticky notes.

0.95
Notes fold/compress.

0.965
[Notes] button lands.

0.97
Journal thought page appears calmly.

0.99
Journal folds downward.

1.00
[Thoughts] button lands.
Final row is complete.

The final row should stay visible at the end.

14. Best technical method

Use this structure:

HTML:
  one section
  one pinned scene
  one row
  evidence layers
  button tray

CSS:
  all visual design
  responsive layout
  hover states
  background states
  reduced-motion fallback

JS:
  GSAP timeline
  ScrollTrigger pin + scrub
  evidence movement
  button landing
  reverse behavior

Use transform and opacity for animation performance. Web.dev and Chrome’s Lighthouse docs explain that transform/opacity animations avoid expensive layout/paint work better than animating things like width, height, top, and left. MDN also warns that will-change should be used carefully, not everywhere.

So the animation should mostly use:

transform: translate3d(...), scale(...), rotate(...);
opacity;
filter only lightly;

Avoid animating:

width;
height;
top;
left;
margin;
padding;
box-shadow too heavily;

Box shadows can exist, but do not animate giant shadows constantly.

15. Accessibility rules

Because this section will have a lot of motion, it needs a reduced-motion version.

WCAG guidance says animation from interactions needs a way to be disabled unless essential, and Apple also says reduce automatic/repetitive motion for people with motion sensitivity.

Reduced motion version should be:

no falling
no scrubbed transformation
show row
then show evidence categories as calm stacked cards
buttons already visible

Not a blank or broken section.

For users who prefer reduced motion:

Section title
Final row
Below it: Quotes, Moments, Characters, Notes, Thoughts previews

Same information, less motion.

16. The best final design direction

The section should feel like this:

A warm manga desk.
A single saved library entry sits there.
At first, it only has a rating.
As you scroll, the memories behind the rating fall into the entry.
Each memory type becomes a button.
By the end, the score feels earned.

That is the strongest version.

Not “cool animations.”

Not “cards appearing.”

A physical metaphor:

proof falls into the shelf

That metaphor should guide everything.

17. What we should remove from the old version

Remove these ideas:

many sticky stages
row disappearing completely
tiny cover
tiny manga images
circular character avatars
all evidence centered
evidence shrinking/fading before reaching row
random card layout
all categories using same shape

Keep these ideas:

warm Inkwell colors
paper texture
rating tells you nothing concept
quotes/moments/characters/notes/thoughts categories
buttons as proof categories
scroll reveal
18. Best source-backed principles we are following

The section design should follow these principles:

Visual hierarchy:
cover/title/score must be obvious.

NN/G and Material both support hierarchy through scale, contrast, grouping, and card structure.

Progressive disclosure:
show score first, then reveal deeper proof.

This matches the UX pattern of revealing complexity gradually instead of overwhelming the user.

Motion with meaning:
animation must show relationship and transformation.

Material, Apple, and NN/G all support purposeful, restrained, relationship-based motion.

Scroll-linked control:
scroll down plays forward, scroll up reverses.

This is exactly what scroll-driven animation and GSAP ScrollTrigger are built for.

Manga-specific visual language:
moments need real panel scale, gutters, and visible frames.

Manga/comics research supports panel layout, size, and gutters as part of storytelling and meaning.

Performance:
animate transform and opacity, not layout-heavy properties.

Web.dev, Lighthouse, and MDN support this animation-performance direction.

Final combined vision

This is the final direction I think is best:

Section title:
A rating tells you nothing.

Pinned scene:
Warm paper background with subtle living manga-grid texture.

Main object:
One large premium manga library row.

Start:
Cover, title, author, Manga, Completed, 9/10.
No buttons.

Scroll:
Quote papers rain down.
They stack, compress, and become [Quotes].
Button falls into row.

Then:
Large manga panels fall/slide in.
They stack, compress, and become [Moments].
Button falls into row.

Then:
Large character portrait cards appear.
Traits appear around them.
Cards gather and become [Characters].
Button falls into row.

Then:
Sticky notes drift down.
They fold into [Notes].
Button falls into row.

Then:
Journal thought page appears.
It closes into [Thoughts].
Button lands last.

End:
The same row is complete.
9/10 now has proof.

This is the version that fits your original idea best. It is more cinematic, more manga-specific, more interactive, and easier to understand.

Next step should be a new Section 2 storyboard/wireframe, not code yet.

Yes. Before we redesign/code Section 2, these are the **extra things we still need to study** so the section does not just look “animated,” but feels polished, readable, emotional, and usable.

I would not study 100 random inspiration sites blindly. The better move is to study **the missing design topics** below, then use inspiration sites only to see how those principles are applied.

---

# 1. Scrollytelling structure

We need to study **how scroll becomes a story**, not just how to animate on scroll.

For Section 2, the scroll is the narrative:

```text
rating alone
↓
proof appears
↓
proof becomes category
↓
category lands in the row
↓
rating becomes meaningful
```

Scrollytelling works well when scroll gives the user control while the page reveals information step by step. Research on scrollytelling describes it as a way to move through dynamic narratives with images, text, and interaction while keeping scrolling as the simple main control. ([arXiv][1])

What we should study:

```text
story beats
pacing
where to pause
how much information per scroll segment
how to avoid overwhelming the user
```

For us, the section should have **5 clean chapters**:

```text
Quotes
Moments
Characters
Notes
Thoughts
```

Not 20 tiny animations.

---

# 2. Scroll-scrubbed animation

This is the technical animation model we need most.

The old version was wrong because animations played on their own. What you want is:

```text
scroll down = animation moves forward
scroll up = animation reverses
stop scrolling = animation stops
```

CSS scroll-driven animations are designed around that exact idea: animation progress is controlled by scroll progress instead of time. ([MDN Web Docs][2])

But for our section, I still think we should study **GSAP ScrollTrigger** because it supports pinning, scrubbing, snapping, and complex scroll timelines, which is exactly what our “evidence falls into row” section needs. ([GSAP][3])

What we should study:

```text
pinned sections
scrub timelines
timeline labels
scroll progress mapping
reverse animation
snap points
how to keep the row fixed while evidence moves
```

This is probably the most important missing topic.

---

# 3. Motion choreography

We need to study **how multiple objects move together**.

Right now the section idea has many objects:

```text
row
cover
score
quote papers
manga panels
character cards
notes
journal page
buttons
background layers
```

If everything moves randomly, it feels messy.

Material motion talks about motion as a way to show relationships, hierarchy, and intention. Fluent also describes motion as something that helps people recognize changes and understand transitions. ([Google Design][4])

What we should study:

```text
which object moves first
which object follows
how long each part waits
which object is the anchor
which movement is primary
which movement is background only
```

For us, the row is the anchor. Evidence moves. Buttons land. Background supports.

---

# 4. Easing and gravity

Your “falling/raining” idea needs believable movement.

If objects fall at a constant speed, it looks fake. Good motion needs acceleration and easing. Material’s motion guidance says easing makes movement feel more natural than stiff linear motion, and emphasized easing can make objects come to a gentle rest. ([Material Design][5])

What we should study:

```text
falling acceleration
soft landing
small bounce
overshoot
settling motion
rotation while falling
how much bounce is too much
```

For Inkwell, the landing should be soft and premium, not cartoonish.

Good feeling:

```text
fall → compress slightly → settle
```

Bad feeling:

```text
fall → huge bounce → goofy rubber effect
```

---

# 5. FLIP / morphing animation

This is another major missing piece.

The evidence should not just disappear and then the button appears. The evidence should feel like it **becomes** the button.

That means we need to study layout transformation, especially the FLIP technique:

```text
First position
Last position
Invert the difference
Play the animation
```

FLIP is made for making layout changes feel continuous instead of jumpy. ([GSAP][3])

What we should study:

```text
how a quote stack becomes [Quotes]
how panel stack becomes [Moments]
how character cards become [Characters]
how notes fold into [Notes]
how journal page becomes [Thoughts]
```

This is what will make the section feel expensive.

---

# 6. Visual hierarchy

We still need to study exactly what the eye should notice first.

Right now, the row cover is too small and the evidence visuals are not strong enough. Visual hierarchy is about arranging things so people instantly understand what matters most. ([IxDF - Interaction Design Foundation][6])

What we should study:

```text
cover size
title size
score size
button size
evidence size
spacing between groups
contrast between row and background
```

For Section 2, the eye order should be:

```text
1. manga cover
2. title
3. rating
4. falling evidence
5. new button landing
```

If the eye goes to the background first, the design failed.

---

# 7. Gestalt grouping

This matters a lot for the row.

The buttons must feel like they belong to the row, and each evidence type must feel like a group before becoming a button.

The Gestalt principle of proximity says elements close together are perceived as related. NN/G explains that spacing can make elements feel grouped or separate. ([Nielsen Norman Group][7])

What we should study:

```text
spacing between cover and title
spacing between title and metadata
spacing between score and row content
spacing between buttons
spacing between evidence cards before they collapse
```

For us:

```text
evidence floating above = separate memory
evidence stacked near row = becoming related
button inside row = saved category
```

That relationship must be visible.

---

# 8. Manga panel composition

We are showing manga, so we need to study panel language.

Moments cannot look like normal web thumbnails. They need to feel like manga panels.

Comic and manga layout research points out that panel arrangement, size, gutters, and reading order affect meaning and pacing. ([Nielsen Norman Group][8])

What we should study:

```text
panel size
panel border thickness
gutters
black/white contrast
large hero panel vs smaller supporting panels
overlapping panels
how panels guide the eye
```

Best direction:

```text
one large hero manga panel
two smaller supporting panels
visible gutters
ink-like borders
large enough to actually see
```

---

# 9. Character card design

Characters should not be tiny circles.

We need to study portrait-card layouts, cast cards, and how image-heavy cards create emotional connection.

Cards are useful because they group an image, title, metadata, and actions into one object. Material’s card guidance treats cards as containers for related content and actions. ([MUI][9])

What we should study:

```text
portrait card proportions
image crop
name placement
trait placement
primary character vs supporting characters
how characters collapse into one button
```

Better direction:

```text
large Musashi portrait card
smaller supporting character cards
short trait labels
then all gather into [Characters]
```

---

# 10. Background atmosphere

This is the new big thing you brought up, and it matters.

The background should not be flat. But it also should not compete with the evidence.

We should study:

```text
ambient background motion
parallax depth
paper texture
manga grid overlays
spotlights
ink-wash effects
soft particles/dust
stage-based background changes
```

Awwwards describes parallax as creating depth by moving background layers slower than foreground layers. Used carefully, that can make a page feel more immersive. ([Awwwards][10])

For us, background should respond by stage:

```text
empty row       → quiet paper
quotes          → falling paper shadows
moments         → faint manga panel grid
characters      → portrait spotlight
notes           → sticky-note board texture
thoughts        → quiet ink wash
final row       → warm complete glow
```

The background should whisper, not shout.

---

# 11. Hover microinteractions

After the scroll animation, the row should still feel interactive.

Microinteractions are small feedback moments that make an interface feel responsive and understandable. ([Codrops][11])

What we should study:

```text
hover previews
button lift
cover tilt
score hover
cursor feedback
small tooltip previews
how much motion is too much
```

Best hover idea:

```text
hover [Quotes]     → small quote preview
hover [Moments]    → manga panel preview
hover [Characters] → character portrait preview
hover [Notes]      → sticky note preview
hover [Thoughts]   → journal line preview
```

The buttons should not only be labels. They should feel explorable.

---

# 12. Cursor interaction

This is optional, but worth studying.

Creative sites often use custom cursors, cursor trails, and image trails for expressive interaction. Codrops has many cursor and motion-trail experiments that show how cursor movement can create playful, interactive visual feedback. ([Codrops][12])

But for our section, we should be careful.

Good cursor idea:

```text
normal cursor most of the time
small warm dot or glow only when hovering evidence/buttons
maybe tiny label: “open quotes”
```

Bad cursor idea:

```text
huge custom cursor everywhere
image trail constantly following the mouse
effects that distract from reading
```

Cursor effects should be subtle.

---

# 13. Typography and readability

We need to study text limits.

Quotes, notes, thoughts, title, author, metadata, and buttons all need different text rules.

Readability guidance commonly discusses line length and line height; Smashing Magazine notes that line length around 45–85 characters can work for web reading, while line height affects scannability. ([smashingmagazine.com][13])

What we should study:

```text
quote length
note length
thought preview length
button label length
metadata size
line-height
max-width
font pairing
```

For Section 2:

```text
quotes: 1–2 lines
notes: 1–3 lines
thoughts: short preview, not full essay
buttons: 1 word if possible
```

The motion should not force the user to read long moving paragraphs.

---

# 14. Accessibility and reduced motion

This section will have a lot of movement, so this is not optional.

WCAG says users need ways to pause, stop, or hide automatically moving content that can distract them, and animation from interactions also needs care when motion is not essential. ([W3C][14])

Apple also explains that reduced motion supports users who can experience discomfort from certain motion effects. ([Apple Developer][15])

What we should study:

```text
prefers-reduced-motion
reduced-motion fallback layout
keyboard navigation
focus states
hover alternatives for touch screens
contrast
not hiding information only inside animation
```

Reduced-motion version should be:

```text
title
final row
static evidence previews
no falling animation
no scrubbed transformation
```

Same message, less motion.

---

# 15. Performance

A cinematic section can easily become laggy.

We need to study what is safe to animate.

Web.dev recommends using `transform` and `opacity` for high-performance animations and avoiding properties that trigger layout or paint when possible. MDN also warns that `will-change` should be used carefully, not everywhere. ([web.dev][16])

What we should study:

```text
transform-based animation
opacity animation
GPU compositing
image sizes
lazy loading
avoiding layout thrashing
avoiding too many blur filters
avoiding huge shadows moving every frame
```

For us:

```text
animate translate/scale/rotate/opacity
do not animate width/height/top/left
use blur carefully
use background effects lightly
```

---

# 16. Responsive storytelling

This is more than “make it fit mobile.”

The whole animation may need a different layout on mobile.

Desktop:

```text
large pinned scene
big row
falling evidence above
buttons land inside row
```

Mobile:

```text
shorter pinned scene or normal stacked story
cover still visible
panels full width
buttons wrap
less background motion
```

What we should study:

```text
mobile scroll length
thumb reach
panel readability
button wrapping
horizontal overflow
reduced parallax on mobile
```

The mobile version should not try to cram the desktop animation into a tiny screen.

---

# 17. State design

We need to define every state before code.

For each button/category:

```text
not unlocked
currently forming
landed
hovered
focused
active/open
```

For the row:

```text
empty
quotes added
moments added
characters added
notes added
complete
```

For the background:

```text
neutral
quote mode
moment mode
character mode
note mode
thought mode
complete mode
```

This prevents messy CSS/JS later.

---

# 18. Content strategy

We should also study the actual words.

The section title is strong:

```text
A rating tells you nothing.
```

But the microcopy around the row matters too.

Possible row microcopy:

```text
Evidence saved
What made it a 9/10
Memory depth
Why it stayed with you
```

The buttons should probably be:

```text
Quotes
Moments
Characters
Notes
Thoughts
```

But “Moments” might be better than “Favourite Moment” because it is shorter and fits better in a button.

What we should study:

```text
button labels
metadata labels
one-line explanation
empty state copy
final state copy
hover preview copy
```

Copy should be short because the animation already carries the meaning.

---

# 19. Interaction after the animation

At the end, what can the user do?

This matters because the section should not only be a movie. It should feel like product UI.

Possible interactions:

```text
click Quotes → expands quote preview
click Moments → opens panel preview
click Characters → opens character cards
click Notes → opens notes
click Thoughts → opens journal preview
```

But we do not need full modals right away. We can start with hover previews and small expandable cards.

What we should study:

```text
button affordance
preview cards
expansion panels
popover positioning
keyboard access
mobile tap behavior
```

---

# 20. Design system consistency

Finally, we need to study how this section connects to the rest of your site.

It should not feel like a totally different website.

Things to keep from Section 1:

```text
warm paper colors
Newsreader titles
Inter body text
rounded premium cards
warm brown accents
soft shadows
button hover lift
```

Things Section 2 can add:

```text
manga panel frames
falling paper
ink texture
larger cover
scroll-based transformation
living background
```

That gives it a new moment without breaking the brand.

---

# The missing study checklist

Before coding, these are the exact areas we should study/design:

```text
1. Scrollytelling structure
2. Scroll-scrubbed animation
3. Motion choreography
4. Gravity/easing
5. FLIP/morphing
6. Visual hierarchy
7. Gestalt grouping
8. Manga panel composition
9. Character portrait cards
10. Living background atmosphere
11. Hover microinteractions
12. Cursor interaction
13. Typography/readability
14. Accessibility/reduced motion
15. Animation performance
16. Responsive storytelling
17. UI state design
18. Microcopy/content strategy
19. Post-animation interaction
20. Design system consistency
```

The most important 5 are:

```text
1. Scroll-scrubbed animation
2. FLIP/morphing into buttons
3. Manga panel composition
4. Living background atmosphere
5. Accessibility/performance
```

Those are the ones that will decide whether the section feels premium or broken.

[1]: https://arxiv.org/abs/2207.03616?utm_source=chatgpt.com "ScrollyVis: Interactive visual authoring of guided dynamic narratives for scientific scrollytelling"
[2]: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations?utm_source=chatgpt.com "CSS scroll-driven animations - MDN Web Docs"
[3]: https://gsap.com/docs/v3/Plugins/ScrollTrigger/?utm_source=chatgpt.com "ScrollTrigger | GSAP | Docs & Learning"
[4]: https://design.google/library/making-motion-meaningful?utm_source=chatgpt.com "Making Motion Meaningful"
[5]: https://m2.material.io/design/motion/speed.html?utm_source=chatgpt.com "Speed"
[6]: https://ixdf.org/literature/topics/visual-hierarchy?utm_source=chatgpt.com "What is Visual Hierarchy? — updated 2026"
[7]: https://www.nngroup.com/articles/gestalt-proximity/?utm_source=chatgpt.com "Proximity Principle in Visual Design"
[8]: https://www.nngroup.com/articles/principles-visual-design/?utm_source=chatgpt.com "5 Principles of Visual Design in UX"
[9]: https://mui.com/material-ui/?utm_source=chatgpt.com "React components that implement Material Design"
[10]: https://www.awwwards.com/websites/parallax/?utm_source=chatgpt.com "Best Parallax Websites | Web Design Inspiration"
[11]: https://tympanus.net/codrops/tag/motion-trail/?utm_source=chatgpt.com "Motion Trail"
[12]: https://tympanus.net/codrops/hub/tag/motion-trail/?utm_source=chatgpt.com "Demos tagged “Motion Trail” | Creative Hub"
[13]: https://www.smashingmagazine.com/2014/09/balancing-line-length-font-size-responsive-web-design/?utm_source=chatgpt.com "Size Matters: Balancing Line Length And Font Size In ..."
[14]: https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html?utm_source=chatgpt.com "Understanding Success Criterion 2.2.2: Pause, Stop, Hide"
[15]: https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/?utm_source=chatgpt.com "Reduced Motion evaluation criteria - Manage App ..."
[16]: https://web.dev/articles/animations-guide?utm_source=chatgpt.com "How to create high-performance CSS animations | Articles"
















The best homepage structure for Inkwell

This is the structure I would use now:

1. Hero
Emotional headline + clear product explanation + product preview card

2. The Empty Shelf
Your scroll animation: “A rating tells you nothing.”

3. Search Anything
Show searching a title and adding it to the library

4. Build Your Library
Show Reading, Watching, Completed, Planned, Paused, Dropped

5. Your Profile Has Meaning
Show how saved entries become part of a public/private profile

6. Find People Through Stories
Profiles, public entries, chat, social discovery

7. FAQ / Doubt Killer
Answer privacy, what content types, why not MAL/Goodreads/Letterboxd, public vs private

8. Final CTA
Start your library

That order works because it goes:

Emotion → proof → product utility → personal value → social value → trust → action
What your homepage should say
Hero
Some stories leave a mark.

Track what you read and watch.
Save the quotes, moments, characters, and notes that stayed with you.

[Start your library]
[Explore entries]

Your current Hero is close, but I would make the second line more product-clear.

Section 2

Keep:

A rating tells you nothing.

This section should not have a long paragraph. The animation explains it.

Section 3
Find it. Save it. Keep going.

Search books, manga, anime, films, and shows.
Add them to your library and sort them by what you are reading, watching, planning, or finishing.

Visual:

Search: Vagabond
[Add to Library]
[Reading] [Completed] [Planned]
Section 4
Save what stayed with you.

Quotes for the lines you remember.
Moments for the scenes that changed the story.
Characters for the people who stayed in your head.
Notes for what it meant to you.
Section 5
Your library becomes a map of your taste.

Not just what you finished.
What you returned to. What you dropped. What you still plan to start.
Section 6
Your profile is more than a list.

Show the stories that shaped you, the quotes you saved, and the thoughts you chose to share.
Section 7
Find people through stories.

Explore public entries, discover profiles, and talk with people who felt something from the same story.
FAQ
Is Inkwell only for books?
No. It is for books, manga, anime, films, and shows.

Is this just another rating app?
No. Ratings are included, but Inkwell is built around quotes, moments, characters, and notes.

Can my notes be private?
Yes. Some thoughts are personal. You choose what to share.

Can I just use it as a tracker?
Yes. You can keep it simple, or go deeper when a story matters.

Why use this instead of MAL, Goodreads, or Letterboxd?
Because Inkwell is built for the meaning behind the rating, not only the rating itself.
What to do

Use one main CTA: Start your library.

Show the actual product in the Hero.

Keep Section 2 cinematic because it explains your difference better than a paragraph.

Make every section answer one question:

What is this?
Why is it different?
How does it work?
Why should I care?
Can I trust it?
What do I do now?

Use short text. People scan.

Add a small FAQ near the bottom.

Make the social part about taste and connection, not just “chat.”

What to avoid

Do not make the homepage only emotional. People still need to understand the product.

Do not make it only features. Then it becomes boring.

Do not use fake stats like “10,000 users” if you do not have them.

Do not add too many CTAs.

Do not make the Section 2 animation so long that people feel stuck.

Do not use huge uncompressed images.

Do not hide the actual product until later.

Do not say “rating app” too much. That makes people compare you directly to existing trackers. Say:

A story library for what stayed with you.
The most important advice

Your homepage should feel like this:

At first, I understand the emotion.
Then I understand the product.
Then I understand why it is different.
Then I trust it enough to try it.

For Inkwell, the strongest positioning is:

Inkwell is not just where you rate stories.
It is where you keep what they left behind.

We are mostly **done studying the big topics**. I think there are only a few things still missing before code:

1. **Asset plan**: manga covers/panels/character art need to be assets you own, made yourself, licensed, or safe placeholders. The design can support panels, but we should not build around random copyrighted screenshots as final production assets.

2. **Reduced-motion version**: because this section will rely heavily on scroll motion, we need a calmer version for users who prefer reduced motion. MDN and Apple both describe reduced-motion preferences as a real accessibility setting that sites/apps should respect. ([MDN Web Docs][1])

3. **Browser/support decision**: CSS scroll-driven animations are improving, but MDN still marks some animation-timeline features as limited availability; for this complex pinned/scrubbed/morphing section, GSAP ScrollTrigger is the safer implementation choice because it supports pinning, scrub, and scroll-based timelines. ([MDN Web Docs][2])

4. **Performance rules**: this section must animate mostly `transform` and `opacity`, not layout properties like `width`, `height`, `top`, or `left`, because web performance guidance recommends transform/opacity for smoother animation. ([web.dev][3])

So yes: we are ready to make the full plan.

---

# Section 2 master concept

The final idea should be:

```text id="8bz1jf"
A rating is empty until memories fall into it.
```

The user starts with:

```text id="cx3kbf"
Vagabond — 9/10
```

But that means nothing.

Then, as the user scrolls, the proof behind the rating falls into the row:

```text id="pslc8p"
quotes
manga panels
characters
notes
thoughts
```

Each proof type becomes a button inside the row.

So the section teaches:

```text id="qg98mj"
Inkwell does not only save ratings.
It saves why the rating mattered.
```

This follows progressive disclosure: show the simple thing first, then reveal deeper information gradually. It also matches visual hierarchy and card-design principles: cards should group image, title, text, and actions clearly around one subject. ([Material Design][4])

---

# 1. Section structure plan

I would rebuild the HTML structure. Your current HTML uses many separate `.scroll-stage` blocks, but the better version should use **one pinned scene** with one row and one evidence layer. The old structure makes each part feel disconnected; the new structure makes everything feel like one continuous transformation. 

## New HTML structure idea

```html id="j286kf"
<section id="section-2-memory-depth" class="memory-depth-section">
  <header class="memory-depth-header">
    <span class="section-label">Beyond the score</span>
    <h2>A rating tells you nothing.</h2>
    <p>A number can show how much you liked something. Inkwell helps you remember why.</p>
  </header>

  <div class="memory-depth-scroll">
    <div class="memory-depth-scene">

      <div class="memory-bg" aria-hidden="true">
        <div class="memory-bg-paper"></div>
        <div class="memory-bg-grid"></div>
        <div class="memory-bg-spotlight"></div>
        <div class="memory-bg-dust"></div>
        <div class="memory-bg-ink"></div>
      </div>

      <div class="memory-stage" aria-hidden="true">
        <div class="quote-layer"></div>
        <div class="moment-layer"></div>
        <div class="character-layer"></div>
        <div class="notes-layer"></div>
        <div class="thought-layer"></div>
      </div>

      <article class="memory-row" aria-label="Vagabond saved entry">
        <!-- cover, title, author, score, buttons -->
      </article>

    </div>
  </div>
</section>
```

## Why this structure is better

The whole section becomes one controlled scene:

```text id="w2atrz"
background layer
evidence layer
row layer
button layer
hover preview layer
```

That makes the animation easier to control and easier to reverse. Scroll-driven animation should be tied to scroll progress, so scrolling forward moves the scene forward and scrolling backward reverses it. ([MDN Web Docs][5])

---

# 2. Header plan

## Text

Keep the title:

```text id="6add6s"
A rating tells you nothing.
```

It is strong, simple, and fits the whole section.

## Header layout

Desktop:

```text id="j0kk89"
centered
max-width: 760px–860px
large Newsreader title
small uppercase brown label
soft paragraph underneath
```

Mobile:

```text id="6l0e7t"
left aligned
title slightly smaller
paragraph shorter width
```

## Header animation

The header should not be too dramatic. It should fade up before the pinned scene starts.

```text id="xh2bpc"
label fades up first
title fades up second
paragraph fades up third
then scene begins
```

The header should prepare the user emotionally, but the main cinematic movement should happen in the pinned scene.

---

# 3. Main row plan

The row is the most important object.

It should feel like a premium saved manga entry, not a spreadsheet row.

Material card guidance says cards should contain content/actions about one subject, and hierarchy between image/text/actions should be clear. ([Material Design][4])

## Recommended row design

```text id="rqt54q"
large rounded media card
warm paper surface
big manga cover
title + author
metadata pills
score
evidence buttons
```

## Desktop sizing

```text id="rnylz7"
row width: 1040px–1120px
row min-height: 190px
row final height with buttons: 220px–245px
cover width: 124px–140px
cover height: 186px–210px
border radius: 30px–34px
```

## Tablet sizing

```text id="72f6wr"
row width: 90vw
cover width: 100px–116px
row height: 180px–220px
```

## Mobile sizing

```text id="b84xnv"
row width: calc(100vw - 32px)
cover width: 82px–96px
layout becomes stacked
buttons wrap under title
score moves near title
```

## Row layout option A — recommended

```text id="xdy4aa"
┌──────────────────────────────────────────────────────────────┐
│ ┌────────────┐  Vagabond                         9/10        │
│ │            │  Takehiko Inoue                               │
│ │   COVER    │  Manga · Completed                            │
│ │            │                                               │
│ └────────────┘  Evidence saved                               │
│                 [Quotes] [Moments] [Characters] [Notes]      │
│                 [Thoughts]                                   │
└──────────────────────────────────────────────────────────────┘
```

Best because it keeps the cover, title, rating, and buttons together in one object.

## Row layout option B

```text id="4jahxe"
┌────────────┐ ┌─────────────────────────────────────────────┐
│   COVER    │ │ Vagabond                         9/10       │
│            │ │ Takehiko Inoue                              │
└────────────┘ │ [Quotes] [Moments] [Characters]             │
               └─────────────────────────────────────────────┘
```

This looks more editorial, but it separates the cover too much.

## Row layout option C

```text id="t9lh12"
cover above
title below
score below
buttons below
```

This is best only for mobile.

**Recommendation:** use option A for desktop/tablet and option C for mobile.

---

# 4. Row details plan

## Cover

The cover should be large because manga is visual. The old cover size was too small. It should be a strong visual anchor.

Style:

```text id="f8zgg2"
aspect-ratio: 2 / 3
border-radius: 18px
soft shadow
tiny inner highlight
slight paper depth
```

Hover:

```text id="m38dwe"
cover lifts 3px
tilts 1–2 degrees
small shine moves across
row shadow deepens slightly
```

Purpose:

```text id="wvv0gs"
This feels like a physical saved item.
```

## Title

```text id="3m1vns"
Vagabond
```

Style:

```text id="na3c8l"
font: Newsreader
size: 2rem–2.4rem desktop
weight: 650
color: --ink
tight letter spacing
```

## Author

```text id="fpz4ap"
Takehiko Inoue
```

Style:

```text id="e5m5iq"
font: Inter
size: 0.95rem–1rem
color: --ink-light
```

## Metadata

Use one line:

```text id="04icsh"
Manga · Completed
```

Better than two separate pills at first. It is cleaner.

Option:

```text id="15fs2t"
[Manga] [Completed]
```

The two-pill version feels more app-like. The single-line version feels more elegant.

**Recommendation:** use single-line metadata in the main row, and maybe use pills only on hover/expanded state.

## Score

```text id="65p78x"
9/10
```

Style:

```text id="06ha5y"
large but not overpowering
display font
warm brown dark
inside soft score capsule
```

Hover idea:

```text id="3qf8mt"
score capsule gently brightens
small text appears: “but why?”
```

This reinforces the section message.

---

# 5. Evidence button tray plan

The button tray starts empty.

Then buttons land one by one:

```text id="w4zrvy"
[Quotes]
[Moments]
[Characters]
[Notes]
[Thoughts]
```

## Button style

```text id="u2o5wd"
pill shape
height: 38px–42px
padding: 0 1rem
font-size: 0.82rem–0.88rem
font-weight: 700
warm border
cream background
```

## Button states

Each button needs these states:

```text id="7ighv7"
locked       = not visible yet
forming      = evidence is becoming the button
landed       = button is inside row
hovered      = preview appears
focused      = keyboard outline
active/open  = preview stays open or expands
```

## Button landing animation

```text id="rnvtas"
starts above row
falls into tray
slight squash on impact
small bounce
settles
```

Do not make it cartoonish. Fluent motion guidance says elevation and movement can help show relationships and hierarchy, but it should stay clear and intuitive. ([Fluent 2 Design System][6])

---

# 6. Background plan

The background should feel alive but quiet.

It should support the scene, not steal attention.

## Background layers

```text id="x3m92f"
1. paper base
2. faint manga grid
3. warm spotlight
4. dust/ink specks
5. stage atmosphere overlay
6. bottom shelf glow
```

## Layer 1 — paper base

Style:

```text id="z2lvcy"
warm cream
subtle noise texture
very faint grid
```

This matches the existing warm visual system from your page CSS. 

## Layer 2 — manga grid

A very faint panel-grid overlay.

```text id="buobd9"
opacity: 0.04–0.10
thin brown/ink lines
appears stronger during Moments stage
```

Purpose:

```text id="htkn9h"
makes the section feel manga-specific
```

## Layer 3 — spotlight

Soft radial glow behind the current active evidence.

```text id="xdqh75"
quotes: warm paper glow
moments: slightly inkier contrast glow
characters: portrait spotlight
notes: warmer sticky-note glow
thoughts: calmer ink wash
```

## Layer 4 — dust / ink specks

Tiny floating paper particles.

```text id="ihnoip"
opacity: very low
slow movement
not many particles
```

## Layer 5 — stage atmosphere

Each evidence type changes the background slightly.

```text id="0do05x"
empty      = quiet paper
quotes     = falling paper shadows
moments    = manga gutters
characters = soft character spotlight
notes      = sticky note warmth
thoughts   = ink wash calm
final      = warm complete glow
```

## Background option A — subtle

Almost static, only soft glow changes.

Best for performance and readability.

## Background option B — alive

More particles, parallax, shifting grid.

More cinematic, but riskier.

## Background option C — hybrid

Subtle by default, stronger only during evidence moments.

**Recommendation:** option C.

---

# 7. Scroll timeline plan

Use one pinned scene with a scrubbed timeline.

GSAP ScrollTrigger is the best practical option for this because it supports scroll-based animation with `scrub`, `pin`, and timeline control. CSS scroll-driven animations are promising, but some features still have limited availability, so they are less ideal for this complex interaction today. ([GSAP][7])

## Timeline overview

```text id="vqubop"
0.00–0.08   empty row appears
0.08–0.14   rating is emphasized
0.14–0.34   quotes fall and become [Quotes]
0.34–0.56   panels fall and become [Moments]
0.56–0.74   characters appear and become [Characters]
0.74–0.88   notes drift and become [Notes]
0.88–1.00   thoughts appear and become [Thoughts]
```

## Scroll behavior

```text id="rf03ah"
scroll down = timeline moves forward
scroll up = timeline reverses
stop scrolling = timeline pauses
```

This is important. Nothing should play on its own and disconnect from the scroll.

---

# 8. Empty row animation

## Starting state

The row appears with:

```text id="521fwo"
cover
title
author
metadata
score
empty button tray
```

## Motion

```text id="2mxrzt"
row fades up
cover settles slightly later
score appears last
button tray is empty
```

## Message

The score is there, but it feels incomplete.

Possible small text inside row:

```text id="u8twyo"
Evidence saved
```

At the start it could be:

```text id="te52as"
No evidence saved yet
```

Then after first button lands:

```text id="mmec87"
Evidence saved
```

Option A:

```text id="4sspnj"
No evidence saved yet
```

Very clear, but maybe too literal.

Option B:

```text id="qj1fw1"
What made it matter
```

More poetic.

Option C:

```text id="x6m61m"
Evidence saved
```

Works better after buttons exist.

**Recommendation:** start with “What made it matter” faintly, then after buttons land it becomes “Evidence saved.”

---

# 9. Quotes plan

## Visual design

Quotes should be paper strips, not big center cards.

```text id="ct4oc6"
width: 300px–440px
height: auto
1–2 lines max
paper cream background
soft border
slight rotation
soft shadow
```

## Layout

They fall from above into the upper/middle stage.

```text id="obtu3i"
quote 1 falls left
quote 2 falls right
quote 3 falls center-left
quote 4 falls center-right
```

## Animation

```text id="ff12ea"
fall from y: -260px
rotate between -5deg and 5deg
land with tiny bounce
remain readable for a moment
then fall lower toward row
stack together
compress into [Quotes]
button falls into tray
```

The important fix:

```text id="dtmc66"
Do not shrink in the center.
Move downward into the row.
```

## Hover preview after landed

Hovering `[Quotes]` shows one quote preview above the button:

```text id="ft7s3e"
small paper strip
appears 8px above button
quick fade/scale
```

---

# 10. Moments / manga panels plan

This is the biggest visual moment.

Manga panels should be large and readable, not thumbnails. Manga research shows panel layout is a meaningful part of manga identity, and guides for comic/manga layout emphasize panel borders, gutters, and visual flow. ([arXiv][8])

## Visual design

```text id="g55t7y"
one hero panel
two supporting panels
black/ink border
small warm paper mat
slight rotation
clear gutter spacing
```

## Sizes

Desktop:

```text id="5rfhrj"
hero panel: 440px–540px wide
supporting panels: 260px–340px wide
```

Tablet:

```text id="9s7bzr"
hero panel: 360px–440px wide
supporting panels: 220px–280px wide
```

Mobile:

```text id="pznbn5"
hero panel: full width
supporting panels: stacked full width or hidden until tap
```

## Layout

```text id="qrl7h7"
hero panel center-top
supporting panel left-bottom
supporting panel right-bottom
```

## Animation

```text id="obcxa4"
hero panel falls first
secondary panels slide/fall in after
panels hold large enough to read
then panels drop toward row
overlap into a stack
stack compresses into [Moments]
button lands next to [Quotes]
```

## Button label choice

Option A:

```text id="1gxsb8"
Moments
```

Short and clean.

Option B:

```text id="76uc5n"
Favourite Moment
```

More specific but too long for the row.

Option C:

```text id="q63650"
Panels
```

Very manga-specific, but less general for books/movies later.

**Recommendation:** use `Moments`. It works for manga, anime, books, movies, and games.

---

# 11. Characters plan

Characters should be portrait cards, not small circles.

Small circles look like profile avatars. Portrait cards feel like story evidence.

## Visual design

```text id="tkkvpa"
main character card large
supporting character cards smaller
image takes 70% of card
name + trait takes 30%
rounded rectangle
warm border
soft shadow
```

## Main card

```text id="mibk4m"
Musashi Miyamoto
restless → still
```

Size:

```text id="i5nr55"
width: 220px–260px
height: 300px–360px
```

## Supporting cards

```text id="f22gxw"
Kojiro
Otsu
Takuan
```

Size:

```text id="734z6h"
width: 140px–170px
height: 190px–230px
```

## Animation

```text id="e4km6s"
main portrait card falls/rises into center
supporting cards stagger around it
trait words fade around main character
cards gather downward
cards stack behind one another
stack compresses into [Characters]
button lands in row
```

## Character layout option A — cast board

Main character center, support cards around.

Best for emotion.

## Character layout option B — horizontal carousel

Cards slide across.

Cleaner, but less cinematic.

## Character layout option C — one large character only

Simplest and strongest.

**Recommendation:** option A for desktop, option C or stacked cards for mobile.

---

# 12. Notes plan

Notes should feel personal and quick.

They should not be long paragraphs.

## Visual design

```text id="qusy98"
sticky notes
warm paper
slight rotations
short handwritten-like rhythm, but still Inter font
1–3 lines max
```

## Animation

```text id="6zvbos"
notes drift down slower than quotes
rotate slightly
overlap near row
fold/stack
compress into [Notes]
button lands
```

## Notes content rules

```text id="x5gqao"
max 80–120 characters each
no full essay
one idea per note
```

Example:

```text id="29ct0p"
“Chapter 3 slows down so you sit with Musashi.”
```

This keeps text scannable. NN/G says web users often scan, so short and scannable text matters. ([Nielsen Norman Group][9])

---

# 13. Thoughts plan

Thoughts are the deepest category.

They should feel calmer than the other evidence types.

## Visual design

```text id="5ui7q2"
one journal page
larger white/cream card
more whitespace
soft ink-wash background
not many floating objects
```

## Animation

```text id="bpvn36"
journal page falls in softly
opens or unfolds slightly
one thought preview fades in
page folds/closes
compresses into [Thoughts]
button lands last
```

## Text

Keep it short in the animation:

```text id="qr57dm"
“Vagabond made me realize I was confusing movement with progress.”
```

Do not show a huge paragraph during the scroll animation.

The full thought can appear only on hover/click later.

---

# 14. Button hover preview plan

After the final row is complete, buttons should become interactive.

NN/G describes microinteractions as small, single-purpose moments that communicate status, feedback, or brand; this is exactly how the hover previews should work. ([Nielsen Norman Group][9])

## Hover previews

```text id="gzsagt"
Quotes     → paper quote preview
Moments    → mini manga panel preview
Characters → portrait preview
Notes      → sticky note preview
Thoughts   → journal line preview
```

## Hover animation

```text id="blhex2"
duration: 140ms–190ms
opacity: 0 → 1
scale: 0.96 → 1
translateY: 8px → 0
```

## Hover background response

Very subtle:

```text id="a6sqzs"
hover Quotes     → paper flecks slightly brighten
hover Moments    → panel grid appears slightly
hover Characters → spotlight shifts toward row
hover Notes      → sticky warmth
hover Thoughts   → ink wash softens
```

## Touch/mobile version

Hover does not exist on mobile, so tapping a button should open a small preview card.

---

# 15. Cursor plan

Do not use a huge custom cursor.

A subtle cursor enhancement is okay only over interactive evidence/buttons.

## Option A — normal cursor

Safest and cleanest.

## Option B — small warm dot/glow

Only active over buttons and cards.

## Option C — custom cursor with label

Example:

```text id="xosrme"
View quote
Open moment
```

Could feel premium, but it adds complexity.

**Recommendation:** start with option A or B. Do not add heavy cursor effects yet.

---

# 16. Background animation detail plan

## Ambient movement

The background should move very slowly:

```text id="da59l8"
paper texture: static
spotlight: slow position change
dust: tiny slow drift
grid: opacity changes by stage
ink wash: opacity/scale changes by stage
```

## Stage background states

```text id="mcnrzg"
state-empty:
  quiet paper
  low glow

state-quotes:
  warm paper strips shadow
  slightly brighter upper area

state-moments:
  panel grid opacity rises
  ink border mood increases

state-characters:
  center spotlight
  background calms

state-notes:
  warmer note-board tone

state-thoughts:
  ink wash appears
  motion slows

state-complete:
  warm glow behind finished row
```

## Important rule

The background should never become the main subject.

Visual hierarchy research says users need a clear order of importance; if the background grabs attention before the cover/title/evidence, it is too strong. ([IxDF - Interaction Design Foundation][10])

---

# 17. Spacing and grouping plan

Gestalt proximity matters a lot here: elements near each other are perceived as related, and elements separated by space feel unrelated. ([Nielsen Norman Group][11])

## Use spacing to tell the story

```text id="ze7mtt"
evidence high above row = loose memory
evidence closer to row = being organized
evidence stacked above row = becoming category
button inside row = saved
```

## Row internal spacing

```text id="pbqssb"
cover to text: 1.3rem–1.7rem
title to author: 0.35rem
author to metadata: 0.55rem
metadata to buttons: 1rem
button gap: 0.55rem–0.7rem
score from title group: enough to feel separate but related
```

## Common region

The row border is important. NN/G’s common-region principle says items inside the same boundary are perceived as grouped. So when the buttons land inside the row border, the user understands they now belong to the saved entry. ([Nielsen Norman Group][12])

---

# 18. Typography plan

Keep the existing brand fonts.

```text id="tnnkei"
Display: Newsreader
Body: Inter
```

## Header

```text id="rsv2a7"
label: 0.76rem, uppercase, letter-spaced
h2: clamp(3rem, 6vw, 5.2rem)
paragraph: 0.98rem, line-height 1.8
```

## Row

```text id="1dozp7"
title: 2rem–2.4rem desktop
author: 0.95rem–1rem
metadata: 0.82rem–0.9rem
score: 1.6rem–1.9rem
button: 0.82rem–0.88rem
```

## Evidence

```text id="43iq70"
quotes: Newsreader, 1.05rem–1.25rem
notes: Inter, 0.88rem–0.95rem
thought: Newsreader or Inter, 1rem–1.08rem
captions: Inter, 0.75rem–0.82rem
```

---

# 19. Border and shape plan

Each evidence type should have its own shape language.

```text id="vzvwi3"
main row:
  large rounded rectangle, 30px radius

quote strips:
  medium rounded paper, 14px–18px radius

manga panels:
  sharper rectangle, 6px–12px radius, ink border

characters:
  portrait cards, 20px–26px radius

notes:
  sticky note shape, 12px–18px radius

thoughts:
  journal page, 24px–30px radius
```

This helps the user understand that each category is different.

---

# 20. Accessibility plan

## Reduced motion

Reduced-motion users should see:

```text id="uz5de7"
header
complete row
static previews underneath
no falling
no scrubbed animation
no particles
```

Do not hide the content. Just remove the intense motion.

WCAG describes motion from interaction and auto-moving content as accessibility concerns, and Apple also says repeated/large motion should be reduced when the user setting asks for it. ([W3C][13])

## Keyboard

Every button needs:

```text id="7rnpd3"
focus-visible outline
Enter/Space opens preview
Escape closes preview
Tab order follows visual order
```

## Screen readers

The animated evidence layer should usually be `aria-hidden="true"` because it is decorative storytelling. The actual meaningful content should exist in the row and preview buttons.

---

# 21. Performance plan

Use:

```text id="w54yby"
transform
opacity
clip-path only lightly
filter only lightly
```

Avoid:

```text id="7y1v65"
animating width/height/top/left
too many huge shadows
too many blur filters
large unoptimized images
```

Images should be optimized:

```text id="p03m2n"
cover: around 300–500px wide
panels: around 800–1100px wide max
characters: around 500–700px tall max
use modern formats when possible
lazy-load below initial viewport
```

---

# 22. Responsive plan

## Desktop

Full cinematic experience.

```text id="ig2fjq"
pinned scene
large row
big panels
full evidence fall
subtle background
hover previews
```

## Tablet

Still cinematic, but compressed.

```text id="5b71h4"
slightly smaller row
fewer supporting cards visible
panels smaller
button tray wraps sooner
```

## Mobile

Simpler and more readable.

```text id="h8aqpo"
shorter scroll
less pinning
cover still visible
panels full-width
characters stack
buttons wrap
hover becomes tap
background quieter
```

Desktop can be cinematic. Mobile must be smooth and readable.

---

# 23. Implementation plan

## Phase 1 — rebuild HTML

Create the new structure:

```text id="9ylbcw"
section
header
scroll wrapper
pinned scene
background layers
evidence layers
single row
button tray
preview layer
```

## Phase 2 — static CSS

Before animation, make the final layout look good.

This means:

```text id="4hpogw"
row looks premium
cover is correct size
buttons look right
evidence cards look right
background looks alive but subtle
mobile layout works
```

No animation yet.

## Phase 3 — evidence visual CSS

Style each type:

```text id="v892z1"
quote strips
manga panels
character portrait cards
sticky notes
journal thought page
```

## Phase 4 — GSAP timeline

Build one timeline:

```text id="aor1a1"
pin scene
scrub timeline
animate row
animate quotes
form Quotes button
animate panels
form Moments button
animate characters
form Characters button
animate notes
form Notes button
animate thoughts
form Thoughts button
```

## Phase 5 — morph/landing polish

Add:

```text id="bbj829"
button landing
tiny bounce
stack compression
background mode changes
reverse scroll cleanup
```

## Phase 6 — hover previews

Add previews after buttons are landed:

```text id="4vfop5"
hover quote preview
hover moment preview
hover character preview
hover note preview
hover thought preview
```

## Phase 7 — accessibility/performance

Add:

```text id="uofnwc"
prefers-reduced-motion fallback
keyboard states
image optimization
mobile fallback
performance cleanup
```

---

# 24. Decisions for us to choose before code

## Row style

A. Large horizontal media row — **recommended**
B. Cover separated from info card
C. Fully stacked card

## Background intensity

A. Very subtle
B. Strong cinematic
C. Hybrid — **recommended**

## Moment label

A. Moments — **recommended**
B. Favourite Moment
C. Panels

## Character display

A. Main portrait + supporting cards — **recommended**
B. Horizontal card carousel
C. One main character only

## Button preview

A. Hover only
B. Click/tap only
C. Hover on desktop, tap on mobile — **recommended**

## Animation tool

A. Pure CSS scroll-driven animation
B. GSAP ScrollTrigger — **recommended**
C. Manual JS scroll calculations

## Reduced motion

A. Hide animation and show final row only
B. Static story cards under final row — **recommended**
C. Smaller animations only

---

# Final plan summary

The best Section 2 is:

```text id="3sf2ay"
One pinned cinematic scene.

A large Vagabond row sits as the anchor.

The row starts with only:
cover, title, author, Manga · Completed, 9/10.

As the user scrolls:
quotes fall into the row and become [Quotes].
manga panels fall into the row and become [Moments].
character portrait cards become [Characters].
sticky notes become [Notes].
a journal thought page becomes [Thoughts].

The background changes softly with each evidence type.

At the end:
the same row is complete,
and the rating finally means something.
```

My recommended choices are:

```text id="y04egy"
Row: large horizontal media row
Background: hybrid living background
Moments label: Moments
Characters: main portrait + supporting cards
Button preview: hover desktop, tap mobile
Animation: GSAP ScrollTrigger
Reduced motion: static final row + preview cards
```

This gives us the strongest design direction before touching the HTML/CSS/JS.

[1]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion?utm_source=chatgpt.com "prefers-reduced-motion CSS media feature - MDN Web Docs"
[2]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline?utm_source=chatgpt.com "animation-timeline CSS property - MDN Web Docs"
[3]: https://web.dev/articles/animations-guide?utm_source=chatgpt.com "How to create high-performance CSS animations | Articles"
[4]: https://m3.material.io/components/cards/guidelines?utm_source=chatgpt.com "Cards – Material Design 3"
[5]: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations?utm_source=chatgpt.com "CSS scroll-driven animations - MDN Web Docs"
[6]: https://fluent2.microsoft.design/motion?utm_source=chatgpt.com "Motion - Fluent 2 Design System"
[7]: https://gsap.com/docs/v3/Plugins/ScrollTrigger/?utm_source=chatgpt.com "ScrollTrigger | GSAP | Docs & Learning"
[8]: https://arxiv.org/abs/2412.19141?utm_source=chatgpt.com "How Panel Layouts Define Manga: Insights from Visual Ablation Experiments"
[9]: https://www.nngroup.com/articles/microinteractions/?utm_source=chatgpt.com "Microinteractions in User Experience"
[10]: https://ixdf.org/literature/topics/visual-hierarchy?utm_source=chatgpt.com "What is Visual Hierarchy? — updated 2026"
[11]: https://www.nngroup.com/articles/gestalt-proximity/?utm_source=chatgpt.com "Proximity Principle in Visual Design"
[12]: https://www.nngroup.com/articles/common-region/?utm_source=chatgpt.com "The Principle of Common Region: Containers Create ..."
[13]: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html?utm_source=chatgpt.com "Understanding SC 2.3.3: Animation from Interactions ..."


































































Yes. With the code you gave, I now have a much clearer idea of the **real Inkwell visual system**.

Your website already has a strong identity:

```text
warm paper
deep espresso ink
brown book/leather accents
soft premium shadows
Newsreader display typography
Inter UI typography
subtle blur/glass nav
rounded card language
```

So Section 2 should **not** become a random flashy animation section. It needs to feel like the same website, but more alive.

I researched the interaction and design side again using design systems and UX sources: Material interaction states, NN/g microinteractions and animation guidance, Carbon spacing/motion/color layering, Shopify Polaris spacing/card layout, and similar systems. The useful lesson is: hover/focus/pressed states should be clear but restrained; spacing should group related content; animation should give feedback and explain state changes; and color/elevation should create layers, not noise. Material specifically treats hover, focus, pressed, selected, and activated as distinct states; NN/g defines microinteractions as trigger-feedback pairs; Carbon explains color layering and spacing scales; Polaris emphasizes spacing/proximity inside cards. ([Material Design][1])

# Ultimate Section 2 Design Plan

## 1. The core identity

Section 2 should feel like:

```text
a warm memory desk
a manga/book entry sitting on paper
evidence scattered around it
the row slowly becoming meaningful
```

Section 1 says:

```text
Some stories leave a mark.
```

Section 2 proves:

```text
A rating tells you nothing until memories explain it.
```

So the visual rule is:

```text
Section 1 = emotional promise.
Section 2 = physical proof.
```

That means Section 2 needs more depth, more tactile cards, more hover life, and a better row hierarchy.

---

# 2. Use your existing color system

From your global CSS, these are the important colors:

```css
--cream: #FAF6EF;
--cream-dark: #EFE5D8;
--warm-brown: #B8794E;
--warm-brown-dark: #7F4B2F;
--warm-brown-light: #E2B98F;
--ink: #241A11;
--ink-mid: #4E3A29;
--ink-light: #6F5A45;
--ink-faint: #9B8772;
--surface: #FFFCF8;
```

We should **not** invent a new palette.

Instead, Section 2 should use those colors better.

## Background colors

Use:

```text
base = --cream
paper shadow = --cream-dark
main surface = --surface
warm glow = --warm-brown-light
accent glow = --warm-brown
deep text = --ink
secondary text = --ink-light
```

## Avoid

```text
cold gray
pure white everywhere
orange neon
heavy yellow
flat beige-on-beige
```

The current Section 2 problem is not the palette itself. The problem is that the colors are not layered enough.

Carbon’s color guidance is useful here: UI should use layered surfaces so each object has a clear spatial level, instead of everything sitting on one flat background. ([Carbon Design System][2])

---

# 3. Background plan

Your Section 1 background feels premium because it has warm gradients and depth. Section 2 currently feels too flat.

The new Section 2 background should have **six layers**.

## Layer 1: warm paper base

The section base remains:

```css
var(--cream)
```

This keeps the page connected to Section 1.

## Layer 2: large ambient glow

Add a large soft glow behind the row:

```text
position: center / lower-middle
color: warm-brown-light with very low opacity
shape: large radial ellipse
purpose: makes the row feel staged
```

This should feel like warm light on paper.

## Layer 3: subtle side vignette

Add darker warmth near edges:

```text
left/right edges slightly deeper
center stays clean
```

This helps guide the eye toward the row and evidence.

## Layer 4: faint manga grid

A very faint grid/panel pattern:

```text
opacity low by default
stronger during Moments stage
not visible enough to distract
```

This connects to manga without making the background busy.

## Layer 5: paper grain

Subtle paper texture using CSS gradients:

```text
tiny dots
low opacity
no harsh noise
```

This makes it feel physical.

## Layer 6: cursor-following glow

This is important.

The cursor effect should apply to **both the background and the row**, but not in the same way.

```text
background cursor glow = large, soft, slow
row cursor glow = smaller, brighter, only while hovering row
evidence cursor glow = local highlight only on hovered card
```

The cursor effect should feel like:

```text
a warm reading lamp
not a neon gaming trail
```

So the glow should be amber/cream, blurred, low-opacity, and disabled on mobile/reduced motion.

---

# 4. Cursor-following effect plan

## Background cursor glow

Use CSS variables later controlled by JavaScript:

```css
--cursor-x
--cursor-y
```

The background pseudo-element uses:

```css
radial-gradient(circle at var(--cursor-x) var(--cursor-y), ...)
```

Effect:

```text
when mouse moves across Section 2, the paper subtly brightens under the cursor
```

This makes the section feel alive even before the scroll animation.

## Row cursor glow

The row gets its own variables:

```css
--row-x
--row-y
```

When hovering the row:

```text
small warm light follows inside the card
border warms
surface slightly brightens
shadow becomes deeper
```

Do **not** make this too strong. It should be visible but classy.

## Evidence local glow

Each evidence card gets a hover highlight:

```text
quote: paper edge light
moment: image sheen
character: portrait highlight
note: sticky paper glow
thought: journal ink glow
```

This gives life without adding popups.

---

# 5. Section spacing plan

The current Section 2 has too much empty vertical space. The header and row feel disconnected.

Better visual rhythm:

```text
header at top
row enters sooner
evidence appears around the row
row sits lower-middle, not at the very bottom
```

Viewport composition:

```text
top 18–25% = title/context
middle 30–65% = evidence
lower-middle 62–78% = row anchor
```

The row should feel like the desk object that everything falls toward.

Do not leave huge blank space between title and row unless it is intentionally used for falling evidence.

---

# 6. Header plan

The header should stay similar to Section 1 but quieter.

Use:

```text
Newsreader title
Inter paragraph
brown uppercase label
centered desktop
left aligned mobile
```

But reduce unnecessary vertical emptiness.

The title:

```text
A rating tells you nothing.
```

should feel strong, but it should not push the row too far away.

Suggested behavior:

```text
desktop: big title, max-width controlled
tablet/mobile: tighter spacing
during scroll: header can fade/soften as row becomes focus
```

---

# 7. Row redesign plan

This is the biggest improvement.

Current row problem:

```text
too wide
too much empty middle space
cover broken
buttons feel like footer
rating is isolated
```

New row layout:

```text
[ Cover ] [ Main content + buttons ] [ Rating ]
```

Visually:

```text
┌────────────────────────────────────────────────────────┐
│ Cover   Vagabond                           9/10        │
│         Takehiko Inoue                                 │
│         Manga · Completed                              │
│                                                        │
│         Quotes  Moments  Characters  Notes  Thoughts   │
└────────────────────────────────────────────────────────┘
```

## Row width

Use:

```text
desktop max-width: 980px–1040px
not 1120px+
```

The row should feel dense and premium, not stretched.

## Row surface

The row should be slightly brighter than the background:

```text
background = cream
row = surface / soft white cream
```

This creates separation.

## Row shadow

Use your existing:

```css
--shadow-hero-card
```

But make it more focused:

```text
soft large shadow under row
small darker contact shadow directly below
```

This makes the card feel like it is sitting on the paper desk.

## Row border

Use:

```css
rgba(184, 121, 78, 0.24)
```

On hover:

```text
border warms slightly
```

## Row gloss

Yes, the row can have a glossy/light sweep effect, but it should not become glassy.

The correct style is:

```text
polished paper sheen
not plastic
not glassmorphism
```

Effect:

```text
on row hover, a soft diagonal highlight moves from left to right
very low opacity
slow enough to feel premium
```

This matches your Section 1 card direction.

---

# 8. Row hover plan

When hovering the whole row:

```text
row lifts 2–3px
shadow deepens
border warms
inner cursor glow appears
soft sheen moves across surface
cover lifts slightly
rating warms slightly
buttons become a little more alive
```

But this must be subtle.

Do not make every child jump strongly at the same time. The row hover is the global “card is alive” effect. Then individual parts have their own stronger hover effects.

---

# 9. Cover plan

The cover is currently broken. That must be fixed first.

The path should load the real image. Otherwise the design will always look bad.

## Cover size

Use:

```text
desktop: 132px–148px wide
tablet: 112px
mobile: 92px–100px
```

## Cover styling

```text
aspect ratio 2/3
rounded 18px
stronger shadow
slight contrast
slightly darker than the row
```

## Cover hover

```text
lift 4px
rotate -1deg or 1deg
image saturates/contrasts slightly
gloss streak crosses the cover
shadow becomes sharper
```

This should be one of the most premium parts of the row.

---

# 10. Title/meta plan

Currently the title is okay, but spacing is wrong.

Group:

```text
Vagabond
Takehiko Inoue
Manga · Completed
```

The meta should not float far to the right.

Either use chips under the author or style `.media-row-format` and `.media-row-status` as small chips near the title.

The user’s eye should read:

```text
cover → title → author → meta → buttons → score
```

Use proximity: related things closer together, unrelated things farther apart. Polaris and Carbon spacing guidance both support using consistent spacing scales to create clear grouping and rhythm. ([Polaris React][3])

---

# 11. Rating plan

The rating should normally be clean.

Default:

```text
9/10
```

Hover/focus:

```text
but why?
```

So remove permanent “but why?” from normal view.

## Rating default

```text
small capsule
clean white/cream surface
strong 9/10
no clutter
```

## Rating hover

```text
capsule expands or adds bottom padding slightly
“but why?” fades/slides in
background warms
border warms
score lifts 1px
```

This creates a small interaction moment.

It matches the concept perfectly:

```text
A rating looks simple.
When you question it, the deeper evidence matters.
```

---

# 12. Button tray plan

Buttons should not be previews. They are the final saved evidence labels.

The buttons should be inside the content column, not separated like a footer.

Remove or soften the divider line.

## Button layout

```text
buttons under meta
left aligned with title
wrap naturally
small gap
```

## Button states

```text
locked = hidden before evidence arrives
forming = barely visible / compressed state
landing = falling/bounce state
landed = normal saved pill
hover = warm lift
active = pressed down
focus = visible keyboard ring
```

Material’s interaction-state guidance is useful here: hover/focus/pressed/selected states should be distinguishable, not all the same. ([Material Design][1])

## Button hover

```text
translateY(-2px)
border becomes warm-brown
background becomes warm cream
text becomes ink
small shadow appears
```

No preview.

---

# 13. Evidence interactivity plan

This is the most important “alive” upgrade.

The evidence cards should feel physical even before JS animation.

## Global evidence rule

Evidence cards should not act like buttons unless they really open something. But they can still have hover feedback.

So:

```text
hover = physical reaction
click = no fake action for now
cursor = default or subtle, not pointer unless clickable
```

NN/g’s microinteraction guidance says the best small interactions are trigger-feedback pairs. Here, the trigger is hover/focus, and the feedback is a small physical response. ([Nielsen Norman Group][4])

---

# 14. Quote interaction plan

Quotes should feel like loose paper strips.

## Default quote style

```text
cream paper strip
soft border
Newsreader text
slight rotation
soft shadow
paper edge highlight
```

## Hover one quote

```text
lift 6px
rotate closer to 0deg
shadow deepens
paper surface brightens
text darkens
z-index increases
```

## Hover quote group

When hovering the quote area:

```text
all quotes spread slightly
hovered quote comes forward
non-hovered quotes soften slightly
```

This creates the “scattered paper” feeling.

## Focus state

If quotes become focusable later:

```text
outline warm brown
same lift but no chaotic movement
```

---

# 15. Moment/manga panel interaction plan

Manga panels should be more visual and stronger.

## Default panel style

```text
larger panel
ink-like border
paper mat
small caption
image not too washed out
one hero panel
two supporting panels
```

## Hover panel

```text
panel lifts 8px
image zooms 1.03x inside frame
ink border darkens
caption becomes more visible
shadow deepens
neighbor panels dim slightly
```

This makes it feel like selecting a manga panel from a board.

## Stage background

During Moments stage:

```text
manga grid becomes more visible
background contrast slightly increases
```

---

# 16. Character card interaction plan

Characters should be portrait cards, not circles.

## Default character card

```text
portrait rectangle
rounded corners
image-heavy
name plate at bottom
warm border
soft card shadow
```

## Hover character

```text
card lifts
z-index increases
image brightens
name plate warms
other character cards dim slightly
```

This creates focus and hierarchy.

## Main character

Musashi should be the largest card.

Supporting characters should be smaller.

On mobile, hide extra character cards so the layout does not get crowded.

---

# 17. Notes interaction plan

Notes should feel like sticky notes.

## Default note

```text
small warm note
slight rotation
top tape mark
soft shadow
Inter text
```

## Hover note

```text
lift 6px
rotation changes slightly
top tape highlight appears
shadow deepens
paper brightens
```

Notes should feel tactile and quick, not like essay cards.

---

# 18. Thoughts interaction plan

Thoughts should be calmer than all other evidence.

## Default thought card

```text
journal page
larger cream card
soft ink wash
more whitespace
Newsreader text
less rotation
```

## Hover thought page

```text
page lifts softly
ink wash becomes visible
shadow grows slowly
text becomes slightly darker
```

No bouncy movement. This is the emotional/deep stage.

---

# 19. Background mood by stage

CSS should prepare classes:

```css
.is-stage-empty
.is-stage-quotes
.is-stage-moments
.is-stage-characters
.is-stage-notes
.is-stage-thoughts
.is-stage-final
```

## Empty

```text
quiet paper
small row glow
```

## Quotes

```text
warmer glow
paper strips feel highlighted
```

## Moments

```text
manga grid stronger
slightly sharper contrast
```

## Characters

```text
soft spotlight behind portrait cluster
```

## Notes

```text
warmer sticky-note tone
```

## Thoughts

```text
subtle ink wash
slightly calmer/darker center
```

## Final

```text
row glow strongest
card feels complete
buttons feel settled
```

---

# 20. Motion and timing plan

Even though we are focusing on CSS now, the CSS needs to prepare for JS.

Use motion like this:

```text
small hover effects: 180ms–260ms
row sheen: 650ms–900ms
button landing later: 450ms–650ms
evidence hover lift: 220ms–320ms
```

NN/g says UX animation should be brief, subtle, and purposeful; Carbon also separates motion into productive/expressive uses with consistent easing. ([Nielsen Norman Group][5])

## Use these properties

```text
transform
opacity
filter small amounts
box-shadow small changes
background-position / radial-gradient vars
```

## Avoid

```text
animating width
animating height
animating top/left
heavy blur everywhere
constant motion on every element
```

---

# 21. Accessibility plan

We need reduced motion.

For `prefers-reduced-motion: reduce`:

```text
disable cursor-follow glow movement
disable big transforms
disable scatter animation
disable row sheen movement
keep color/outline hover states
show final row statically
```

Also:

```text
all real buttons get focus-visible
buttons keep target size around 40px+
hover-only effects should not be required to understand content
```

The interaction should be nice, not necessary.

---

# 22. Mobile plan

Mobile should not try to copy the full cinematic desktop layout.

## Mobile row

```text
cover left
title/right content beside it
score under title or beside title
buttons wrap below
row width 100%
less empty space
```

## Mobile background

```text
less grid
less cursor glow
simpler paper glow
```

## Mobile evidence

```text
quotes stack
one manga hero panel + one supporting panel
main character + two support characters
notes stack
one thought page
```

No hover dependency on mobile.

---

# 23. What to remove from the current CSS

Remove or replace these ideas:

```text
row max-width 1120px
footer-like button tray with strong divider
always visible “but why?”
flat background with weak depth
evidence cards with weak hover
meta chips floating far right
giant dead space between header and row
```

Keep:

```text
warm palette
Newsreader + Inter
premium shadows
rounded card language
evidence categories
no button previews
reduced motion fallback
```

---

# 24. CSS architecture for final code

The final Section 2 CSS should be built in this order:

```text
1. Section variables
2. Background layers
3. Cursor glow hooks
4. Header
5. Scroll scene/stage shell
6. Row shell
7. Row inner 3-column layout
8. Row gloss/sheen/cursor hover
9. Cover
10. Title/author/meta
11. Rating hover with “but why?”
12. Button tray inside content column
13. Button states
14. Shared evidence card settings
15. Quotes
16. Moments
17. Characters
18. Notes
19. Thoughts
20. Evidence hover interactions
21. Stage mood classes
22. Tablet layout
23. Mobile layout
24. Reduced motion
```

This will make the CSS clean and easier to animate later.

---

# 25. Future JS hooks the CSS should prepare

Even though we are not writing JS yet, CSS needs hooks like:

```css
.section-empty-shelf.is-enhanced
.scroll-stage.is-active
.evidence-card.is-readable
.evidence-card.is-gathering
.evidence-card.is-compressing
.depth-button.is-locked
.depth-button.is-forming
.depth-button.is-landing
.depth-button.is-landed
```

Also cursor variables:

```css
--cursor-x
--cursor-y
--row-x
--row-y
```

Later JS updates those variables.

---

# Final ultimate plan

The final design should work like this:

```text
The user scrolls into Section 2.
The warm paper background already feels alive.
The row appears as a compact premium saved-entry card.
The cover is strong and real.
The rating is clean: 9/10.
On rating hover, “but why?” appears.
The row has a soft cursor-follow glow.
The row has a subtle paper sheen on hover.
Every part of the row has its own microinteraction.
Quotes feel like loose paper.
Moments feel like manga panels.
Characters feel like portrait cards.
Notes feel like sticky notes.
Thoughts feel like a journal page.
Buttons do not preview anything.
Buttons represent saved evidence.
Later, JavaScript makes each evidence type fall into the row and become a button.
At the end, the row feels complete and earned.
```

The design rule for the final CSS:

```text
warm, physical, premium, alive — but never noisy.
```

And the most important layout rule:

```text
The row is the anchor.
The evidence is the motion.
The buttons are the result.
The background is the atmosphere.
```

[1]: https://m3.material.io/foundations/interaction/states/applying-states?utm_source=chatgpt.com "States – Material Design 3"
[2]: https://carbondesignsystem.com/elements/color/overview/?utm_source=chatgpt.com "Color"
[3]: https://polaris-react.shopify.com/patterns/card-layout?utm_source=chatgpt.com "Card layout"
[4]: https://www.nngroup.com/articles/microinteractions/?utm_source=chatgpt.com "Microinteractions in User Experience"
[5]: https://www.nngroup.com/articles/animation-purpose-ux/?utm_source=chatgpt.com "The Role of Animation and Motion in UX"

























































Yes — after login, the marketing homepage should basically disappear from the main experience.

The homepage is for people who do not understand Inkwell yet. Once someone logs in, they already understand the product. They should go straight into the app.

Your current nav has Home, Search, My Library, Social, plus Log in and Sign up. I would change that depending on whether the user is logged out or logged in.

Best setup
Before login

The website is a marketing + preview site.

Navbar should be:

Logo / Inkwell
Home
Explore
How it works
Log in
Sign up

Or simpler:

Logo / Inkwell
Explore
Log in
Sign up

I would remove “My Library” from the logged-out navbar because the user does not have a library yet. Clicking “My Library” before creating an account feels weird because there is nothing real to show.

You can keep Search/Explore before login because browsing is useful. But if they try to save something:

Create an account to save this to your library.

For Social, I would not call it “Social” before login. I would call it:

Explore

Because logged-out users can explore public profiles or public entries, but they cannot fully participate.

Before login pages

Use this structure:

/               → homepage landing page
/search         → public search / explore page
/login          → log in
/signup         → create account
/profile/name   → public profile, view-only

Logged-out users can:

View homepage
Search titles
Preview public profiles
Preview public entries
Understand the app

Logged-out users cannot:

Add to library
Save notes
Change status
Rate items
Follow people
Chat
Edit profile

When they try, show:

Create an account to save your library.
After login

The website becomes the actual app.

Navbar should be:

Logo / Inkwell
Search
My Library
Social
Profile

Maybe also:

Notifications
Settings
Log out

After login, the user should not land on the marketing homepage.

They should land on either:

/dashboard

or:

/library

My recommendation:

Send logged-in users to My Library

Because Inkwell’s core product is the personal library.

So after login:

Login → My Library
Sign up → onboarding/search first item → My Library

The logo should not take them back to the marketing homepage. It should take them to:

/dashboard

or:

/library
Should logged-in users still be able to see the homepage?

Yes, but not as a main nav item.

They can access it through:

About Inkwell

in the footer or settings.

But the main app nav should not include “Home” as the marketing homepage. That would be confusing.

Best before vs after structure
LOGGED OUT NAV

Inkwell
Home
Explore
Log in
Sign up
LOGGED IN NAV

Inkwell
Search
My Library
Social
Profile
What to do with My Library before login

Do not show it in the main nav.

But if someone clicks a CTA like “Start your library,” send them to signup.

Start your library → signup

If they search something and click “Add”:

Add → signup modal/page
Message: Create an account to save this to your library.
What to do with Social before login

Do not make it full social.

Before login, use:

Explore

It can show public profiles or public shelves.

After login, use:

Social

Now they can follow, interact, maybe chat later.

Final recommendation

Use two different experiences:

Before login:
Marketing site + public preview.

After login:
Actual app.

And use this rule:

Viewing = allowed without account.
Saving/editing/interacting = account required.

That gives people enough value to understand Inkwell, but still makes account creation necessary for the real product.