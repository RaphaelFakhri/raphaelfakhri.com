// Blog posts. The homepage lists the titles; src/pages/[slug].astro renders one page per post
// at /<slug>. Bodies are HTML strings (rendered with set:html). Dictated by voice, AI-written,
// human-directed. No em-dashes.
export const posts = [
  {
    slug: 'prompt-and-wait',
    title: 'Prompt and wait',
    animation: true,
    body: `
      <p>Where I think work is going: you name the goal, agents recurse until it&rsquo;s done. Here&rsquo;s one making you a burger.</p>
      <div id="flow"></div>
      <p>That is not science fiction. It is the thing we already have, pointed at a longer horizon and given the ability to call itself. The loop is the whole trick: keep going until the goal is met.</p>
      <p>What it does to scarcity is the interesting part. If any goal can be filled at close to zero cost and the only input left is patience, then scarcity of stuff is basically solved. That is abundance, on the supply side. The honest catch is who owns the fleets. Making things free is a technology problem. Sharing them is not.</p>
      <p>And here is the part that matters. When production gets cheap, the scarce thing moves. Solve making, and the bottleneck jumps to time, or attention, or knowing what to even ask for. So the skill that survives every version of this is the same one: find the thing actually holding the goal back, and move it. Right now, for me, it is that not enough people know I exist. So I wrote this.</p>
    `,
  },
  {
    slug: 'the-offer',
    title: 'It is not the skills. It is the offer.',
    body: `
      <p>For a while I thought the hard part was building. It is not. Anyone can build now. The hard part is the offer, and getting a person to say yes.</p>
      <p>I have watched it happen. You have the skills, you say so, and people politely pass or laugh it off. That is not them saying you are not good. It is them saying the offer is aimed wrong: wrong buyer, wrong problem, or a promise that does not sound worth paying for. A bad offer is fixable. Missing skills would not be.</p>
    `,
  },
  {
    slug: 'anybody-can-code',
    title: 'Anybody can code',
    body: `
      <p>Anybody can code now, so being able to build is not a moat. It is table stakes.</p>
      <p>The scarce thing is attention. If nobody knows you exist, the best product in the world sells nothing. So the real skill, the one worth learning, is distribution: making something a lot of people actually see. I am not good at it yet. That is exactly why it is what I am working on, and this page is me starting.</p>
    `,
  },
];
