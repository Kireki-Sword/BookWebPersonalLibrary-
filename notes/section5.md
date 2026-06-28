PHASE 1 — The Cover Rain
What happens
The section is pinned — meaning the page stops scrolling and the animation plays while you scroll in place on top of it.
Pinned elements keep important content fixed on the screen while users scroll, creating a more engaging and guided browsing experience — helping users focus on what matters most and move naturally through the page. Medium
Source: animation-addons.com
Left column — covers float UP
Book and manga covers start below the screen (translateY(+100vh)) and float upward continuously. Each cover is slightly offset in timing so they don't all move at once — staggered like leaves rising in wind. They rotate slightly as they rise, between -8deg and +8deg randomly. Different sizes. Different speeds. Warm and alive.
Right column — covers fall DOWN
Same covers but reversed. They start above the screen (translateY(-100vh)) and fall downward. Same stagger, same slight rotations. Opposite direction.
Both columns run simultaneously
Left going up. Right going down. At the same time. The whole screen feels alive with stories.
How long does it play
The section is pinned for +=2000px of scroll distance — meaning you scroll 2000 pixels while the page stays fixed and the animation plays. This gives you enough time to feel it without it being too long.
jsgsap.timeline({
  scrollTrigger: {
    trigger: '.section-5',
    pin: true,
    start: 'top top',
    end: '+=2000',
    scrub: 1
  }
})
Source: gsap.com/docs

PHASE 1 → PHASE 2 TRANSITION
What happens
As you keep scrolling past the cover rain:
Step 1 — The covers on both sides slow down and fade out simultaneously. Both columns fade together. Not one then the other. Together.
Step 2 — Out of the fading covers, one specific cover rises from the center — The Brothers Karamazov. It scales up from small to full, moving from the middle of the screen upward toward the top center where it locks into place.
Step 3 — While the cover rises the two profile cards build themselves in below it. Card A fades in from the left simultaneously with Card B fading in from the right. They meet symmetrically below the centered cover.
Step 4 — Inside both cards the username and avatar fade in first. Then the library rows appear one by one with a stagger of 0.15 seconds between each row. Shared titles glow warm brown on both sides at exactly the same moment.
This whole transition is one continuous GSAP timeline scrubbed to scroll so you control every frame with your scroll wheel.
Timelines allow scroll-based storytelling — each scroll section reveals part of the story, with every animation tied precisely to scroll progress. Web Designer Depot
Source: dev.to

PHASE 2 — Same Book Different Souls
Structure
The Brothers Karamazov cover stays pinned at top center the entire time. Neutral. Belongs to neither person.
Below it two perfectly symmetrical columns. Left is kai.reads. Right is nova.pages. Both columns always reveal at exactly the same time — never one before the other.
How content reveals — Round by Round
Each round is triggered by continued scrolling. The section stays pinned and the GSAP timeline progresses with scroll.
Round 1 — Quotes

Both quotes fade in simultaneously from opacity: 0 and translateY(20px) to fully visible. They arrive together. You read both at the same time. The difference hits naturally.
Round 2 — Moments

Both moment descriptions slide up simultaneously from below. Same animation — translateY(30px) to 0, opacity 0 to 1. Same timing both sides.
Round 3 — Characters

Character images and names fade in together on both sides. If they chose different characters from the same book — you see that immediately side by side.
Round 4 — Thoughts

This one is different. The thoughts are longer and more personal. They don't just fade in — they type themselves in letter by letter using a typewriter effect. Both sides typing simultaneously. This is the slowest and most deliberate reveal because Thoughts is the deepest thing on the whole site.
The typewriter effect is done with GSAP SplitText — it splits the paragraph into individual characters then staggers their opacity from 0 to 1:
jsgsap.from(chars, {
  opacity: 0,
  stagger: 0.02,
  scrollTrigger: { scrub: 1, ... }
})
Source: freefrontend.com
Scroll reversal — everything unwinds
Because everything uses scrub: true — scroll back up and every single thing reverses perfectly. Thoughts un-type themselves. Characters fade back out. Moments slide back down. Quotes disappear. The cover shrinks back to center. The profile cards fold back in. The covers start raining again. You can go back and forth as many times as you want.
With scrub, scrolling forward plays the animation and scrolling backward reverses it. Web Designer Depot

Full Summary
PhaseTechniqueLibraryEffectCover rainPinned section + staggered translateYGSAP ScrollTriggerCovers float up left, fall down rightTransitionScrubbed timeline + scale + opacityGSAP ScrollTriggerCovers fade, book rises, cards appearProfile buildStaggered fadeInUp per rowGSAP ScrollTriggerRows appear one by oneRound revealsSimultaneous opacity + translateYGSAP ScrollTriggerBoth sides always togetherThoughtsSplitText typewriterGSAP SplitTextLetters type themselves inReversalscrub: true on everythingGSAP ScrollTriggerAll reverses on scroll up

Does this feel like the ultimate animation for section 5?




2. The Brothers Karamazov x2
3. Siddhartha
4. The Count of Monte Cristo
5. The Great Gatsby
6. Red Rising
7. Thus Spoke Zarathustra
8. A Silent Voice
9. Interstellar
10. Parasite
11. Grave of the Fireflies
12. The Green Mile
13. Breaking Bad
14. Supernatural
15. Doctor Who
16. True Detective
17. Dark
18. Berserk
19. One Piece
20. Billy Bat
22. Tokyo Ghoul:re
23. Vinland Saga
24. The Climber
25. add a romace koran tv teh mst famous one 
26. best horror movie