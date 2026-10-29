// Mock content: the demo volunteer, the welcome email, the streams, the local groups, the vacancies and the leads'
// profiles. All people, numbers and dates are made up; the links with an `href` are real public pages, and so are the
// links written [label](https://…) inside a text (ui.js `richText`).
// Views read these objects live on every render, so the lead view's mock edits and decisions change them in place
// (until the page is reloaded). Nothing here is persisted: the volunteer's own progress lives in state.js.

export const volunteer = {
  name: 'Jordan Miller',
  firstName: 'Jordan',
  initials: 'JM',
  email: 'jordan.miller@example.com',
  place: 'Ann Arbor, MI',
}

// Same text as the vault note ";welcome email for the volunteer hub prototype".
export const welcomeEmail = {
  from: 'People for a Pause <hello@pfpai.org>',
  to: 'Jordan Miller <jordan.miller@example.com>',
  subject: 'Welcome to People for a Pause',
  before: [
    'Hi Jordan,',
    'Thanks for signing up, and welcome. We’re Americans from all walks of life, working together to stop the race to superintelligent AI: with an international treaty, and with laws here at home.',
    'You’re on our newsletter now, and your place in our volunteer hub is ready.',
  ],
  button: 'Open your volunteer hub',
  buttonNote: 'The button signs you in; no password needed.',
  after: [
    'In the hub, pick a local group near you or one of our nationwide efforts to join, like town halls or op-eds. Your first action takes two minutes, and you can take it right away. Once you’re accepted, you join our Discord from there too.',
    'No AI expertise needed. Glad to have you with us!',
  ],
  signature: 'The People for a Pause team',
  ps: 'P.S. Just want to stay informed? That’s what the newsletter is for; you don’t need to do anything else.',
}

// The main page lists the local groups within RADIUS_MI of you, nearest first (Spec 6.2, 17.2).
export const RADIUS_MI = 100

// The onboarding's hours choice (Spec 5); your profile shows it.
export const hoursOptions = ['Under 1 hour', '1–2 hours', '2–5 hours', '5–10 hours', 'Over 10 hours']

export const LUMA = 'https://luma.com/pfp' // PFP's events calendar, linked on peopleforapause.org

// kind 'start': Getting started, joined in one click, no application. kind 'stream': a nationwide pipeline that needs
// an application.
// A stream's tasks are an individual pipeline: the same steps for everyone, each volunteer marks their own progress.
// A task's `action` is one of {href} (real page), {mock} (not part of the prototype), {copy} (text to copy), {route}.
// A resource without `href` is mock.
// `expectations`: the lead's text on the apply page (Spec 7.1), editable in the lead view: paragraphs split by an empty
// line, links written [label](https://…).
// For the lead view (Spec 21): `members` (everyone in the stream: `steps` = how many of its steps, from the first,
// they did; see below the list), `applications` and `claudeAccepts` (as in groups, see there).
export const streams = [
  {
    id: 'getting-started',
    kind: 'start',
    title: 'Getting started',
    tagline: 'Your first actions, and the basics on AI risk.',
    description: [
      'Actions you can take on your own, right now. None takes more than 15 minutes, so there’s always something to do, also while an application waits.',
    ],
    tasks: [
      {
        id: 'message',
        title: 'Message your representatives',
        time: '2 min',
        summary: 'The quickest way to make your voice count in Congress.',
        steps: [
          'Open ControlAI’s tool and enter your address. It finds your representative and your two senators.',
          'It drafts the message for you. Add a sentence in your own words: personal messages count more.',
          'Sign and send. Their staff log your position and brief the lawmaker.',
        ],
        action: { label: 'Open ControlAI’s tool', href: 'https://act.controlai.org/' },
      },
      {
        id: 'learn',
        title: 'Learn why we want a pause',
        time: '15 min',
        summary: 'Who we are, and why scientists call for a ban on superintelligence.',
        steps: [
          'Read the About page of our website: who we are and what we stand for.',
          'Then read the Statement on Superintelligence: AI scientists and public figures from left and right call for a ban on building superintelligence.',
          'Want more? The resources on the Getting started page go deeper.',
        ],
        links: [
          { label: 'About People for a Pause', href: 'https://peopleforapause.org/about/' },
          { label: 'Statement on Superintelligence', href: 'https://superintelligence-statement.org/' },
        ],
      },
      {
        id: 'invite',
        title: 'Invite two friends',
        time: '5 min',
        summary: 'Movements grow through friends.',
        steps: [
          'Think of two people who’d care: a friend, a family member, a coworker.',
          'Send each of them a personal note with our signup link. A personal note works far better than a post.',
        ],
        action: { label: 'Copy the signup link', copy: 'https://peopleforapause.org/get-involved/' },
      },
    ],
    doneNote: 'That’s the basics. Next: join a local group or a stream.',
    resourcesTitle: 'New to AI risk? Start here',
    resources: [
      {
        title: 'Statement on Superintelligence',
        type: 'Website',
        note: 'The call to ban superintelligence, signed by AI scientists and public figures from left and right.',
        href: 'https://superintelligence-statement.org/',
      },
      {
        title: 'If Anyone Builds It, Everyone Dies',
        type: 'Book',
        note: 'The 2025 bestseller by Eliezer Yudkowsky and Nate Soares on why the race to superintelligence ends badly for everyone.',
        href: 'https://ifanyonebuildsit.com/',
      },
      {
        title: 'Statement on AI Risk',
        type: 'Website',
        note: 'One sentence on the risk of extinction from AI, signed in 2023 by hundreds of AI scientists and the heads of the big AI companies.',
        href: 'https://aistatement.com/',
      },
    ],
  },
  {
    id: 'town-halls',
    kind: 'stream',
    title: 'Town halls',
    tagline: 'Ask your representatives, in public, where they stand on superintelligence.',
    lead: 'Dana Whitfield',
    commitment: 'About 4 hours a month',
    where: 'In person, near you',
    discord: '#town-halls',
    description: [
      'Town halls, debates and candidate forums are where elected officials face their voters. One calm, clear question from a constituent gets their attention, and often an answer on the record.',
      'From November to January, members of Congress and the newly elected hold events back home before the new Congress starts. We want our question asked at as many of them as we can.',
    ],
    expectations:
      `Attend one of our town hall workshops first (online, 90 minutes): how to find a town hall, what to ask, and how to handle the answer. The next ones are on Sat Nov 7, 1 pm ET and Tue Nov 10, 7 pm ET, on [our Luma calendar](${LUMA}). In your application, tell me which workshop you attended or will attend.`,
    applyPlaceholder: 'e.g. I’m signed up for the workshop on Nov 7, and a friend wants to come along to town halls.',
    claudeAccepts: false,
    commitmentText: 'I can commit to this: about 4 hours a month until January.',
    tasks: [
      {
        id: 'find',
        title: 'Find a town hall near you',
        time: '30 min',
        summary: 'Look up your officials’ public events and pick one to go to.',
        steps: [
          'Look up who represents you: your member of the House and your two senators.',
          'Check their websites, newsletters and social media for town halls, telephone town halls and community forums. Candidates and state legislators count too.',
          'Search local news and community Facebook groups for “town hall” and the name of your town.',
          'Found one? Start a thread in #town-halls on our Discord with the date, the place and a link. Volunteers nearby can join you, and Dana helps you prepare.',
        ],
        links: [{ label: 'Find your representative (house.gov)', href: 'https://www.house.gov/representatives/find-your-representative' }],
        action: { label: 'Start a thread in #town-halls', mock: 'This would open #town-halls on our Discord.' },
      },
      {
        id: 'question',
        title: 'Prepare your question',
        time: '20 min',
        summary: 'A short, personal question that ends with a clear yes or no.',
        steps: [
          'Pick a question from the question bank in the resources, or write your own.',
          'Keep it under 30 seconds: who you are, why you care, then the question.',
          'End with a yes-or-no ask, e.g. “Will you support an international treaty that bans the development of superintelligent AI?”',
          'Post your draft in your thread. Someone gives you feedback within a day.',
        ],
      },
      {
        id: 'ask',
        title: 'Go and ask',
        time: '1–2 hours',
        summary: 'Attend, ask your question and note the answer.',
        steps: [
          'Arrive early and sit near the front, where you’re easier to call on.',
          'Raise your hand early, and keep your question short and calm.',
          'If you can, have a friend record the answer. Check the event’s rules first.',
          'Afterwards, give the staff our one-page handout and ask who handles AI policy in the office.',
        ],
      },
      {
        id: 'report',
        title: 'Report back',
        time: '10 min',
        summary: 'Tell us what you asked and what they said.',
        steps: [
          'Post in your thread what you asked, what they answered and, if you have one, the video.',
          'We log every answer, follow up with the office and share the best moments.',
        ],
      },
    ],
    doneNote: 'Now find the next one: most officials hold several events before January.',
    resources: [
      { title: 'Town hall guide', type: 'Guide', note: 'Everything from the workshop on six pages.' },
      { title: 'Workshop recording', type: 'Video', note: 'The full 90-minute workshop, if you want a refresher.' },
      { title: 'Question bank', type: 'Doc', note: 'Tested questions for House members, senators and candidates.' },
      { title: 'One-page handout for staff', type: 'PDF', note: 'What we ask for and why, to leave with the office.' },
    ],
    members: [
      { name: 'Alicia Ramos', steps: 0 }, { name: 'Hannah Weiss', steps: 1 }, { name: 'Olivia Grant', steps: 2 },
      { name: 'Wendy Carter', steps: 4 }, { name: 'Brian Kelly', steps: 0 }, { name: 'Isaac Thompson', steps: 1 },
      { name: 'Tanya Price', steps: 3 }, { name: 'Grace Adeyemi', steps: 0 }, { name: 'Paul Jacobs', steps: 2 },
      { name: 'Aaron Fischer', steps: 4 }, { name: 'Luis Herrera', steps: 1 }, { name: 'Frank Russo', steps: 0 },
      { name: 'Rosa Delgado', steps: 2 }, { name: 'Megan O’Brien', steps: 1 }, { name: 'Emily Chen', steps: 0 },
      { name: 'Victor Huang', steps: 3 }, { name: 'Beth Sullivan', steps: 4 }, { name: 'Darnell Moore', steps: 0 },
      { name: 'Noah Schmidt', steps: 1 }, { name: 'Steve Larson', steps: 2 }, { name: 'Sofia Castillo', steps: 0 },
      { name: 'Janet Morales', steps: 1 }, { name: 'Carlos Vega', steps: 4 },
    ],
    applications: [
      {
        id: 'maria',
        name: 'Maria Gonzalez',
        place: 'Mesa, AZ',
        when: '2 days ago',
        text: 'I’m signed up for the workshop on Nov 7. My congressman holds a town hall in Mesa on Nov 14, and I want to ask him where he stands on a treaty.',
        about: 'Retired middle school teacher and grandmother of four. My grandkids use AI for everything, and nobody seems to be in charge of where it’s going.',
        hours: '2–5 hours',
        screen: 'accept',
        reasons: ['Signed up for the Nov 7 workshop, as you ask.', 'Has already found a town hall: Mesa, Nov 14.'],
        status: 'pending',
      },
      {
        id: 'kevin',
        name: 'Kevin Doyle',
        place: 'Columbus, OH',
        when: 'Yesterday',
        text: 'I work nights, so I can’t make either workshop. But I’ve spoken up at plenty of town halls as a union steward, so I know how they run.',
        about: 'Union steward at a warehouse. I worry about what happens when AI can do every job, including building the next AI.',
        hours: '1–2 hours',
        screen: 'review',
        reasons: ['Can’t attend a workshop, which you ask for.', 'Has spoken at town halls before. The workshop recording might be enough.'],
        status: 'pending',
      },
      {
        id: 'signals',
        name: 'AI Profit Signals',
        place: null,
        when: '3 hours ago',
        text: 'Make $5,000 a week with our AI trading bot!!! Limited spots, join now at ai-profit-signals.biz',
        about: '',
        hours: 'Over 10 hours',
        screen: 'spam',
        reasons: ['Advertises a trading bot and links to it.', 'Says nothing about town halls, and the profile is empty.'],
        status: 'pending',
      },
    ],
  },
  {
    id: 'op-eds',
    kind: 'stream',
    title: 'Op-eds and letters',
    tagline: 'Write for your local paper. Your neighbors read it, and so do your representatives’ staff.',
    lead: 'Sam Okafor',
    commitment: 'A few hours, once',
    where: 'From home',
    discord: '#op-eds',
    description: [
      'A letter to the editor (150–250 words) or an op-ed (600–750 words) in your local paper reaches thousands of people where you live, and congressional staff clip them for their boss.',
      'No writing experience needed: watch the workshop recording, use the guide, and a volunteer editor gives you feedback before you submit.',
    ],
    expectations:
      'Tell me which paper you’d like to write for and your angle, in a sentence or two. Rough ideas are fine; we shape them together.',
    applyPlaceholder: 'e.g. The Ann Arbor News. I’m a teacher and want to write about the world my students will grow up in.',
    claudeAccepts: true,
    commitmentText: 'I can commit to this: a few hours in the next two weeks.',
    tasks: [
      {
        id: 'pick',
        title: 'Watch the workshop and pick your paper',
        time: '1 hour',
        summary: 'Learn the format, then choose where to send your piece.',
        steps: [
          'Watch the op-ed workshop recording in the resources.',
          'Pick one paper: your local daily or weekly is your best shot. Look up its submission page and word limit.',
          'Big paper? Write a letter to the editor (150–250 words). Local paper? An op-ed (600–750 words) has a good chance.',
        ],
      },
      {
        id: 'draft',
        title: 'Write your draft and get feedback',
        time: '2–3 hours',
        summary: 'One local angle, one clear point.',
        steps: [
          'Start from something local or personal: your job, your kids, a story from your town.',
          'Make one point: companies are racing to build superintelligence without anyone’s consent, and an international treaty can stop them.',
          'Post your draft in #op-eds. A volunteer editor replies within two days.',
        ],
      },
      {
        id: 'submit',
        title: 'Submit it and tell us',
        time: '15 min',
        summary: 'Send it in, and share it when it runs.',
        steps: [
          'Submit through the paper’s form, with your name, town and phone number: papers check who wrote a piece.',
          'Post the link in #op-eds when it runs. No reply after a week? Try the next paper.',
        ],
      },
    ],
    doneNote: 'Well done! Write the next one for another paper, or help edit drafts in #op-eds.',
    resources: [
      { title: 'Op-ed workshop recording', type: 'Video', note: '60 minutes on how to get published, with examples.' },
      { title: 'Writing guide', type: 'Guide', note: 'Letters and op-eds step by step, with a template for each.' },
      { title: 'Talking points', type: 'Doc', note: 'Why superintelligence is dangerous, and why a treaty is the answer.' },
      { title: 'Published pieces', type: 'List', note: 'Twelve letters and op-eds by our volunteers.' },
      { title: 'Submission pages of US papers', type: 'Sheet', note: 'Word limits and links for 200+ papers.' },
    ],
    members: [
      { name: 'Natalie Ross', steps: 0 }, { name: 'Robert Chang', steps: 1 }, { name: 'Ethan Cole', steps: 2 },
      { name: 'Claire Dubois', steps: 3 }, { name: 'James Whitaker', steps: 0 }, { name: 'Lauren Mitchell', steps: 1 },
      { name: 'Fatima Ali', steps: 0 }, { name: 'Monica Reyes', steps: 2 }, { name: 'Andre Washington', steps: 3 },
      { name: 'Kyle Bennett', steps: 0 }, { name: 'Omar Siddiqui', steps: 1 }, { name: 'Harold Simmons', steps: 2 },
      { name: 'Diane Foster', steps: 0 }, { name: 'Peggy Walsh', steps: 1 }, { name: 'Susan Ward', steps: 3 },
    ],
    applications: [
      {
        id: 'helen',
        name: 'Helen Park',
        place: 'Portland, OR',
        when: '3 days ago',
        text: 'The Oregonian, or the Portland Tribune if that’s too big. I’m an ER nurse: every new drug is tested for years before patients get it, and AI companies release whatever they build.',
        about: 'ER nurse in Portland. I read If Anyone Builds It, Everyone Dies over the summer and haven’t stopped thinking about it.',
        hours: '1–2 hours',
        screen: 'accept',
        reasons: ['Names her paper and her angle, as you ask.', 'A strong personal angle: a nurse on safety testing.'],
        status: 'accepted',
        by: 'claude',
      },
      {
        id: 'rick',
        name: 'Rick Becker',
        place: 'Plano, TX',
        when: 'Yesterday',
        text: 'The Dallas Morning News. I want to write about AI taking our jobs and why we should tax the robots.',
        about: 'Small business owner, two kids. AI is going to wipe out half the jobs in my town.',
        hours: 'Under 1 hour',
        screen: 'review',
        reasons: ['Names his paper, as you ask.', 'His angle is jobs and a robot tax, not superintelligence and a treaty: he may need steering.'],
        status: 'pending',
      },
    ],
  },
]

// A stream member's progress as the ids of the steps they did (`done`, from their first `steps`), like your own
// progress in state.js: so it stays right when the lead view adds, moves or removes steps.
for (const stream of streams)
  for (const member of stream.members || []) member.done = stream.tasks.slice(0, member.steps).map((task) => task.id)

// A local group's project is a team project: people claim different tasks. Members are in it by default.
// A team task's `owner` is the member who claimed it (or null); the volunteer's own claims live in state.js.
// `applications` (streams have them too): mock applications for the lead view (Spec 21), each with the applicant's
// profile (`place`, `about`, `hours` a week: Spec 5.1) and Claude's pre-screen (Spec 14): `screen` 'accept' | 'review'
// | 'spam' and its `reasons`. `status` 'pending' | 'accepted' | 'rejected' changes in place when the lead decides;
// `by: 'claude'` marks an application Claude accepted.
// `claudeAccepts` (streams too): the lead's setting (Spec 14): false = "I review every application", true = "Claude
// accepts clear cases, I review the rest": Claude then accepts the applications it rates Accept (state.js).
export const groups = [
  {
    id: 'detroit',
    kind: 'group',
    title: 'Detroit area',
    distance: 40,
    place: 'Royal Oak, MI',
    tagline: 'Southeast Michigan: public events, tabling, and meetings with our representatives.',
    lead: 'Maya Johnson',
    members: ['Maya Johnson', 'Chris Patel', 'Priya Raman', 'Dave Kowalski', 'Angela Brooks', 'Tom Nguyen', 'Rachel Stein', 'Marcus Hill', 'Linda Ortiz'],
    meets: 'Every other Thursday, 7 pm',
    nextMeeting: 'Thu Nov 12, 7 pm, at the Royal Oak Public Library',
    discord: '#detroit-area',
    description: [
      'We’re neighbors from Detroit, Dearborn, Royal Oak and Troy who want our representatives to back an international treaty that bans superintelligence.',
      'We meet every other Thursday at 7 pm, alternating between the Royal Oak Public Library and Zoom, and we run one public event a month.',
    ],
    expectations:
      'Tell us a little about yourself and which of our meetings you could make. Before your first meeting, I’ll invite you to a 15-minute video call to say hi.',
    applyPlaceholder: 'e.g. I live in Ann Arbor and could make most Thursday meetings, at least the ones on Zoom.',
    claudeAccepts: false,
    projects: [
      {
        id: 'evening',
        title: 'Community evening: “Should we pause AI?”',
        description:
          'A free public evening at the Royal Oak Public Library on Thu Dec 3, 7 pm: a 20-minute talk, questions and pizza. Our goal: 40 guests and 10 new sign-ups.',
        tasks: [
          { id: 'room', title: 'Book the library room', note: 'For 50 people, with a projector.', owner: 'Maya Johnson', done: true },
          { id: 'speaker', title: 'Confirm the speaker', note: 'A computer science professor from Wayne State; send her the format.', owner: 'Chris Patel', done: false },
          { id: 'flyer', title: 'Make the flyer', note: 'One page from the template: date, place and a QR code to the event page.', owner: null, done: false },
          { id: 'post-flyers', title: 'Put up flyers', note: '30 flyers on campuses, in coffee shops, churches and on community boards.', owner: null, done: false },
          { id: 'online', title: 'Post the event online', note: 'Luma, Meetup, Nextdoor and local Facebook groups.', owner: 'Priya Raman', done: true },
          { id: 'press', title: 'Invite local press', note: 'Email the Daily Tribune and WDET with our press note.', owner: null, done: false },
          { id: 'door', title: 'Run the sign-up table at the door', note: 'Greet guests, collect emails and hand out postcards.', owner: null, done: false },
          { id: 'pizza', title: 'Order pizza and drinks', note: 'For 40. Keep the receipt: national pays up to $150.', owner: 'Dave Kowalski', done: false },
        ],
      },
    ],
    applications: [
      {
        id: 'nadia',
        name: 'Nadia Haddad',
        place: 'Dearborn, MI',
        when: 'Yesterday',
        text: 'I’m a pharmacist in Dearborn and can make most Thursday meetings, in person too. I’d love to help with the community evening.',
        about: 'Pharmacist and mom. I want our representatives to take this seriously before it’s too late.',
        hours: '2–5 hours',
        screen: 'accept',
        reasons: ['Lives in Dearborn, in your area.', 'Can make your Thursday meetings, as you ask.'],
        status: 'pending',
      },
      {
        id: 'greg',
        name: 'Greg Wilson',
        place: 'Toledo, OH',
        when: '2 days ago',
        text: 'I live in Toledo, about an hour from Royal Oak. Could I join on Zoom only? There’s no group in Ohio yet.',
        about: 'Retired engineer and Air Force veteran. AI is a national security problem, and I want to help.',
        hours: '5–10 hours',
        screen: 'review',
        reasons: ['Lives in Toledo, Ohio, about 70 miles away: outside your area.', 'Asks to join on Zoom only. With 5–10 hours a week, he might be a good fit to start a group in Toledo.'],
        status: 'pending',
      },
    ],
  },
]

// Vacancies (Spec 6.4, 8, 17.4): roles we need volunteers for nationally, plus starting a local group. Each has its
// page; you apply on the shared apply page with one field, why you'd be a good fit; no acceptance in the demo.
export const vacancies = [
  {
    id: 'social-media',
    kind: 'vacancy',
    title: 'Social media',
    tagline: 'Run our accounts on X, Instagram and TikTok.',
    commitment: '10+ hours a week',
    where: 'From home',
    description: [
      'Post our events, share what our volunteers achieve, and answer questions in the comments. You plan the posts with our organizing director and get photos and clips from the local groups.',
      'A good fit if you already post a lot and know what works on at least one platform.',
    ],
    applyPlaceholder: 'e.g. I run the Instagram account of my church: 2,000 followers, a post every week.',
  },
  {
    id: 'media',
    kind: 'vacancy',
    title: 'Media outreach',
    tagline: 'Get our message into newspapers, radio and TV.',
    commitment: '10+ hours a week',
    where: 'From home',
    description: [
      'Pitch stories to journalists, write press releases for our events, and prepare our volunteers for interviews. You keep the list of reporters who cover AI, nationally and near our local groups.',
      'A good fit if you’ve worked in journalism, PR or communications.',
    ],
    applyPlaceholder: 'e.g. Ten years as a reporter for the Detroit Free Press, now in PR.',
  },
  {
    id: 'onboarding',
    kind: 'vacancy',
    title: 'Volunteer onboarding',
    tagline: 'Welcome new volunteers and help each one find their place.',
    commitment: '10+ hours a week',
    where: 'From home',
    description: [
      'Call new volunteers for 15 minutes, answer their questions on Discord, and help each one find a local group or stream that fits. A month later, check in on how it’s going.',
      'A good fit if you like talking to people and want to see our movement grow.',
    ],
    applyPlaceholder: 'e.g. I welcome new members at my running club and still know most of them by name.',
  },
  {
    id: 'start-group',
    kind: 'vacancy',
    title: 'Start a local group',
    tagline: 'Bring People for a Pause to your town.',
    commitment: '5–10 hours a week, for at least six months',
    where: 'In person, where you live',
    warning: [
      'Leading a local group is a huge amount of work: expect 5–10 hours a week for at least six months. You recruit members, run the meetings and a public event every month, and meet with your representatives’ offices.',
      'You won’t do it alone: group leads get support from our organizing director, regular calls with the other leads, resources and media support. We interview every applicant.',
    ],
    description: [
      'Most groups start with three to five people: friends, coworkers or neighbors. In your application, tell us where your group would be and who you could start with.',
    ],
    applyPlaceholder: 'e.g. Ann Arbor. I organized a neighborhood association for five years, and three friends want to join.',
  },
]

export const vacancySent = 'We’ll email you within a week to set up a call.'

// The leads' profiles (Spec 5.1): a lead's name on their stream's or group's page opens theirs.
export const leads = [
  {
    id: 'dana-whitfield',
    name: 'Dana Whitfield',
    place: 'Harrisburg, PA',
    about: [
      'I spent eight years on the staff of a state senator, so I’ve sat on the other side of a lot of town halls. One good question from a constituent changes what a politician says next.',
      'I asked my first question about superintelligence at a town hall in 2025, and I’ve helped about forty volunteers ask theirs since.',
    ],
  },
  {
    id: 'sam-okafor',
    name: 'Sam Okafor',
    place: 'Raleigh, NC',
    about: [
      'High school English teacher and freelance writer. My letters and op-eds have run in the News & Observer and the Charlotte Observer.',
      'I read every draft in #op-eds and reply within two days.',
    ],
  },
  {
    id: 'maya-johnson',
    name: 'Maya Johnson',
    place: 'Royal Oak, MI',
    about: [
      'Physical therapist and mom of two. I started the Detroit area group in spring 2026 with three friends from church; now we’re nine.',
      'I want our representatives to hear about superintelligence from their own neighbors, not just from the AI companies.',
    ],
  },
]

export function findStream(id) {
  return streams.find((s) => s.id === id)
}

export function findGroup(id) {
  return groups.find((g) => g.id === id)
}

export function findVacancy(id) {
  return vacancies.find((v) => v.id === id)
}

// A stream, a group or a vacancy, by id: the things you can join or apply to.
export function findItem(id) {
  return findStream(id) || findGroup(id) || findVacancy(id)
}

export const findLead = (id) => leads.find((lead) => lead.id === id)
export const leadOf = (item) => leads.find((lead) => lead.name === item.lead)
// What a lead leads: their streams and groups.
export const ledBy = (lead) => [...streams, ...groups].filter((item) => item.lead === lead.name)

export const firstName = (name) => name.split(' ')[0]
