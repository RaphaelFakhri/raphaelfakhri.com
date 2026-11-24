export const articles = [
  {
    slug: 'offline-sync-without-data-loss',
    title: 'What actually breaks in mobile offline sync (and how to guard it)',
    date: 'November 2026',
    isoDate: '2026-11-20',
    readTime: '4 min read',
    summary:
      'Stale overwrites, out-of-order responses, and upgrade-time storage migrations — practical lessons from shipping a 130+ screen React Native app.',
    paragraphs: [
      'Most mobile sync bugs do not happen when a user is completely offline. They happen on flaky mobile networks: a slow request from thirty seconds ago resolves after a newer edit, a user switches tabs mid-flight, or an app update changes the local storage layout while queued writes are still waiting to flush.',
      'When I built Zaky in React Native and Expo, local state lived in MMKV so screens opened immediately without blocking on the network. That made the UI fast, but it also meant naive fire-and-forget writes were guaranteed to corrupt state under real-world conditions.',
      'Four small design choices eliminated almost every class of sync bug:',
      '1. Serialize mutations per entity. Never allow two writes to the same record to race over the wire. A lightweight in-memory queue per key guarantees that update B only leaves the device after update A has settled or failed cleanly.',
      '2. Guard against stale overwrites. Every sync response carries a monotonically increasing version or timestamp from the server (or a client revision counter). If a response returns for an older local revision than the user has already moved past, discard the response instead of rolling back newer local edits.',
      '3. Persist deferred queues and retry on foreground. Network drops on iOS and Android rarely trigger clean exceptions right when the radio dies. Storing pending mutations in MMKV and replaying them whenever AppState returns to active—or connectivity recovers—keeps user actions durable across OS suspension.',
      '4. Version local storage schemas from day one. App store updates land on devices with months of old persisted payloads. Writing explicit, idempotent migration functions keyed by a schema version number lets you evolve local models without wiping user state or crashing on launch.',
      'None of this requires a heavyweight sync engine. It just requires treating the phone as an occasionally connected database rather than a thin browser tab.',
    ],
  },
  {
    slug: 'two-agent-review-loops',
    title: 'Why I run a review loop instead of trusting a single coding agent',
    date: 'October 2026',
    isoDate: '2026-10-18',
    readTime: '3 min read',
    summary:
      'One coding agent is fast, confident, and quietly wrong on edge cases. Pairing generation with an adversarial reviewer and deterministic CI checks changes the error profile.',
    paragraphs: [
      'A single LLM coding pass is great at getting to 80% quickly and terrible at noticing the last 20% it silently broke: a missing null check, an unguarded race condition, a broken migration, or a subtle mismatch with an existing interface.',
      'What actually improved my day-to-day engineering output was stopping the habit of accepting one-shot generations and putting agents inside a structured review loop backed by deterministic checks.',
      'The workflow is simple. First, write down the exact constraints, interfaces, and invariants before asking for code. Let one agent implement the change against those constraints. Then run the deterministic layer—typecheck, linter, architecture boundaries (such as dependency-cruiser), and real integration tests against actual databases or containers.',
      'After the deterministic checks pass, hand the diff to a second, clean-context reviewer pass whose only job is to look for regressions, security flaws, unstated assumptions, and edge cases. Because it does not share the author’s sunk-cost context, it catches the exact shortcuts the first pass rationalized away.',
      'The important distinction is who owns the judgment. The loop does not replace engineering ownership—you still design the system boundaries, decide which invariants matter, verify the failure modes, and read the diff before anything ships. What the loop replaces is the blind spot of a single pass.',
      'When you combine hard deterministic gates (real SQL Server containers, worker crash-recovery tests, strict types) with a clean-context review pass, AI stops behaving like a sloppy autocomplete and starts behaving like a disciplined force multiplier.',
    ],
  },
];
