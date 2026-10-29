// Mock content: the demo volunteer, the welcome email, the streams, the local groups and the two lead forms.
// All people, numbers and dates are made up; the links with an `href` are real public pages.
// Views read these objects live on every render, so in-page edits (the lead view's mock editing) can change
// them directly. Nothing here is persisted: the volunteer's own progress lives in state.js.

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
    'In the hub you’ll find your first action (it takes two minutes), local groups near you, and ways to help from anywhere, like town halls and op-eds. You also join our Discord from there.',
    'No AI expertise needed. Glad to have you with us!',
  ],
  signature: 'The People for a Pause team',
  ps: 'P.S. Just want to stay informed? That’s what the newsletter is for; you don’t need to do anything else.',
}

// Local groups within NEAR_MI count as "near you", those within FAR_MI as "not too far away".
export const NEAR_MI = 25
export const FAR_MI = 100

// kind 'start': Getting started, which everyone is in. kind 'stream': a nationwide pipeline that needs an application.
// A stream's tasks are an individual pipeline: the same steps for everyone, each volunteer marks their own progress.
// A task's `action` is one of {href} (real page), {mock} (not part of the prototype), {copy} (text to copy), {route}.
// A resource without `href` is mock.
export const streams = [
  {
    id: 'getting-started',
    kind: 'start',
    title: 'Getting started',
    tagline: 'Your first actions, and the basics on AI risk.',
    description: [
      'Everyone starts here. Each step takes a few minutes, so there’s always something you can do right now, also while you wait to hear back on an application.',
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
        summary: 'What superintelligence is, and how a treaty can stop the race.',
        steps: [
          'Read the About page of our website: who we are and what we ask for.',
          'Then read the Statement on Superintelligence: AI scientists and public figures from left and right call for a ban on building superintelligence.',
          'Want more? The resources below go deeper.',
        ],
        links: [
          { label: 'About People for a Pause', href: 'https://peopleforapause.org/about/' },
          { label: 'Statement on Superintelligence', href: 'https://superintelligence-statement.org/' },
        ],
      },
      {
        id: 'join',
        title: 'Join a local group or a stream',
        time: '10 min',
        summary: 'This is where most of our work happens.',
        steps: [
          'On the main page of your hub, look at the local groups near you and at our current streams.',
          'Pick the one that fits you best and apply. Each one says what it expects from you.',
          'While you wait to hear back, go on with the next step here.',
        ],
        action: { label: 'See groups and streams', route: '#/hub' },
        doneWhen: 'applied', // done as soon as you have applied to any group or stream
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
    doneNote: 'That’s the basics. Your local group or stream has the next steps.',
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
    members: 23,
    commitment: 'About 4 hours a month',
    where: 'In person, near you',
    discord: '#town-halls',
    description: [
      'Town halls, debates and candidate forums are where elected officials face their voters. One calm, clear question from a constituent gets their attention, and often an answer on the record.',
      'From November to January, members of Congress and the newly elected hold events back home before the new Congress starts. We want our question asked at as many of them as we can.',
    ],
    expectations:
      'Attend one of our town hall workshops first (online, 90 minutes): how to find a town hall, what to ask, and how to handle the answer. The next ones are on Sat Nov 7, 1 pm ET and Tue Nov 10, 7 pm ET, on our Luma calendar. In your application, tell me which workshop you attended or will attend.',
    applyPlaceholder: 'e.g. I’m signed up for the workshop on Nov 7, and a friend wants to come along to town halls.',
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
  },
  {
    id: 'op-eds',
    kind: 'stream',
    title: 'Op-eds and letters',
    tagline: 'Write for your local paper. Your neighbors read it, and so do your representatives’ staff.',
    lead: 'Sam Okafor',
    members: 15,
    commitment: 'A few hours, once',
    where: 'From home',
    discord: '#op-eds',
    resourcesFirst: true, // mostly resources, few tasks
    description: [
      'A letter to the editor (150–250 words) or an op-ed (600–750 words) in your local paper reaches thousands of people where you live, and congressional staff clip them for their boss.',
      'No writing experience needed: watch the workshop recording, use the guide, and a volunteer editor gives you feedback before you submit.',
    ],
    expectations:
      'Tell me which paper you’d like to write for and your angle, in a sentence or two. Rough ideas are fine; we shape them together.',
    applyPlaceholder: 'e.g. The Ann Arbor News. I’m a teacher and want to write about the world my students will grow up in.',
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
  },
  {
    id: 'tabling',
    kind: 'stream',
    title: 'Tabling',
    tagline: 'Set up a table in your town and sign up the people who already worry about AI.',
    lead: 'Ruth Novak',
    members: 7,
    commitment: 'One 2-hour table a month',
    where: 'In person, near you',
    discord: '#tabling',
    description: [
      'A table at a farmers market, a campus or a library is the easiest way to meet the people in your area who worry about AI. Most of them have never heard that they can do something about it.',
      'Do it alone or with a friend: we mail you a free kit and a short script. Everyone who signs up at your table hears about the local group near them, or helps start one.',
    ],
    expectations: 'Tell me where you’d like to table and roughly when you could do your first one. We mail the kit within a week.',
    applyPlaceholder: 'e.g. The Saturday farmers market in Ann Arbor, some time in November.',
    commitmentText: 'I can commit to this: one 2-hour table in the next month.',
    tasks: [
      {
        id: 'kit',
        title: 'Order your free tabling kit',
        time: '5 min',
        summary: 'A banner, sign-up sheets, postcards and flyers, mailed to you.',
        steps: [
          'Fill in your address in the kit form.',
          'We mail you a table banner, sign-up sheets, 50 postcards to Congress and flyers. They arrive within a week.',
        ],
        action: { label: 'Open the kit form', mock: 'This would open the form for the tabling kit.' },
      },
      {
        id: 'spot',
        title: 'Pick a spot and a date',
        time: '30 min',
        summary: 'Anywhere people stroll and have a minute.',
        steps: [
          'Good spots: farmers markets, campuses, libraries, community events.',
          'Ask the organizer or the manager. Markets often have a free table for nonprofits.',
          'Post your spot and date in #tabling, so a volunteer nearby can join you.',
        ],
      },
      {
        id: 'run',
        title: 'Run your table',
        time: '2 hours',
        summary: 'Ask one question, then listen.',
        steps: [
          'Use the script. Open with one question: “Have you heard that AI companies are racing to build superintelligence?”',
          'Ask everyone who’s interested to sign up and to write a postcard to their representative right at the table.',
          'Take a photo of your table for #tabling.',
        ],
      },
      {
        id: 'send',
        title: 'Send in your sign-ups',
        time: '15 min',
        summary: 'So every sign-up hears from us within a week.',
        steps: [
          'Photograph the sign-up sheets and post them in #tabling.',
          'Mail the postcards in the prepaid envelope from the kit. We deliver them to the offices in Washington.',
        ],
      },
    ],
    doneNote: 'Great work! Book your next table: the second one is always easier.',
    resources: [
      { title: 'Tabling guide and script', type: 'Guide', note: 'Setup, the opening question and how to close.' },
      { title: 'Answers to common questions', type: 'Doc', note: 'What to say when people ask “isn’t this just hype?” and more.' },
      { title: 'Printable sign-up sheet', type: 'PDF', note: 'In case you run out.' },
    ],
  },
]

// A local group's project is a team project: people claim different tasks. Members are in it by default.
// A team task's `owner` is the member who claimed it (or null); the volunteer's own claims live in state.js.
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
      'We’re neighbors from Detroit, Dearborn, Royal Oak and Ann Arbor who want our representatives to back an international treaty that bans superintelligence.',
      'We meet every other Thursday at 7 pm, alternating between the Royal Oak Public Library and Zoom, and we run one public event a month.',
    ],
    expectations:
      'Tell us a little about yourself and which of our meetings you could make. Before your first meeting, I’ll invite you to a 15-minute video call to say hi.',
    applyPlaceholder: 'e.g. I live in Ann Arbor and could make most Thursday meetings, at least the ones on Zoom.',
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
  },
]

export const leadForms = {
  group: {
    title: 'Apply to lead a local group',
    warning: [
      'Leading a local group is a huge amount of work: expect 5–10 hours a week for at least six months. You recruit members, run the meetings and a public event every month, and meet with your representatives’ offices.',
      'You won’t do it alone: group leads get support from our organizing director, regular calls with the other leads, resources and media support. We interview every applicant.',
    ],
    placeLabel: 'Where would your group be?',
    whyLabel: 'Why do you want to lead a group, and what makes you a good fit?',
    whoLabel: 'Who could you start with?',
    whoHint: 'Friends, coworkers or communities you’re part of who might join.',
    sent: 'Application sent. We’ll email you within a week to set up an interview.',
  },
  stream: {
    title: 'Apply to lead a stream',
    intro: [
      'A stream is a nationwide effort that anyone can join, like town halls or tabling. Leading one means designing its steps, accepting volunteers and keeping them going: plan on at least 5 hours a week.',
      'Pick one of our ideas or pitch your own. We interview every applicant and work out the details with you.',
    ],
    ideas: [
      { id: 'screenings', title: 'Movie screenings', note: 'Volunteers host screenings of AI documentaries and lead a discussion afterwards.' },
      { id: 'media', title: 'Local media', note: 'Get our message onto local radio, TV and podcasts.' },
      { id: 'congress', title: 'Meetings with Congress', note: 'Volunteers meet their members of Congress in their district offices.' },
      { id: 'postcards', title: 'Postcards to Congress', note: 'Postcard-writing evenings; we deliver the cards by hand.' },
      { id: 'influencers', title: 'Influencer outreach', note: 'Reach creators who talk to audiences we don’t reach yet.' },
      { id: 'own', title: 'My own idea', note: 'Describe it in your pitch.' },
    ],
    pitchLabel: 'Your pitch: what would volunteers do, and how does it help get to a pause?',
    aboutLabel: 'Why would you be a good fit?',
    sent: 'Application sent. We’ll email you within a week to set up an interview.',
  },
}

export const hoursOptions = ['Less than 5 hours a week', '5–10 hours a week', 'More than 10 hours a week']

export function findStream(id) {
  return streams.find((s) => s.id === id)
}

export function findGroup(id) {
  return groups.find((g) => g.id === id)
}

// A stream or a group, by id.
export function findItem(id) {
  return findStream(id) || findGroup(id)
}

export const firstName = (name) => name.split(' ')[0]
