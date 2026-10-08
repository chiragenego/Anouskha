/* ==========================================================================
   💌  RESIGNATION REJECTED.exe  —  YOUR PERSONALIZATION FILE
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to change names, photos, captions,
   jokes, music and your letter.

   Simple rules so nothing breaks:
     1. Only change the text BETWEEN the quotes  "like this"
     2. Keep every comma  ,  at the end of lines exactly where it is.
     3. Inside "double quotes" you can freely use apostrophes ( ' ).
        If you need a double quote inside text, write it as  \"
     4. After saving, refresh the browser to see your changes.
   ========================================================================== */

window.FAREWELL_CONFIG = {

  /* ------------------------------------------------------------------------
     1. NAMES
     ------------------------------------------------------------------------ */
  managerName: "Anoushka Ghosh",            // Written on the envelope:  "To, Ma'am"
  nickname: "Boss Lady",           // Used in the funny "official" bits
  myName: "Chirag Panchal",        // Your name (signature at the end)


  /* ------------------------------------------------------------------------
     2. PHOTOS
     ------------------------------------------------------------------------
     • Put your photo files inside the folder:   assets/photos/
     • Then write the file name below, e.g.  "assets/photos/photo4.jpg"
     • .jpg, .jpeg, .png and .webp all work. File names are case-sensitive
       once the site is online, so "Photo1.JPG" is NOT the same as "photo1.jpg".
     • Leave src empty ( "" ) to show a pretty "add your photo" placeholder.
     • To remove a photo completely, delete its whole { ... }, block.
     • "label" is the little handwritten title on the Polaroid,
       "caption" appears when she hovers / taps the photo,
       "alt" describes the photo for screen readers.
     ------------------------------------------------------------------------ */
  photos: [
    {
      id: "photo1",
      src: "assets/photos/photo1.jpg",
      label: "Exhibit A",
      caption: "Evidence that we were more than just colleagues. ❤️",
      alt: "Chirag and Ma'am smiling together in the office corridor"
    },
    {
      id: "photo2",
      src: "assets/photos/photo2.jpg",
      label: "Exhibit B",
      caption: "Proof that office life wasn't always boring.",
      alt: "A happy office selfie with Ma'am, Chirag and a teammate"
    },
    {
      id: "photo3",
      src: "assets/photos/photo3.jpg",
      label: "Exhibit C",
      caption: "Some meetings were actually worth attending. 😂",
      alt: "Chirag pulling a dramatic face while Ma'am laughs behind him"
    },
    {
      id: "photo4",
      src: "assets/photos/photo4.jpg",
      label: "Exhibit D",
      caption: "Proof that even the boss can't escape a good filter. 😂",
      alt: "Ma'am in a funny selfie filter with red face paint, spiky hair and a moustache"
    },
    {
      id: "photo5",
      src: "assets/photos/photo5.jpg",
      label: "Exhibit E",
      caption: "You didn't just build a team. You built a family. ❤️",
      alt: "Ma'am smiling in the middle of the whole team"
    }
  ],

  // Which photo (by id) appears in the big Polaroid on Slide 3
  favoritePhoto: "photo1",

  // Which photo (by id) is pinned to the top of the farewell letter
  letterPhoto: "photo1",


  /* ------------------------------------------------------------------------
     3. BACKGROUND MUSIC (optional)
     ------------------------------------------------------------------------
     • Leave empty ( "" ) to use the built-in soft music-box melody.
     • Or put an .mp3 inside  assets/music/  and write its path, e.g.
         music: "assets/music/our-song.mp3",
     • Music only ever starts after she opens the letter (or taps the ♪ button).
     ------------------------------------------------------------------------ */
  music: "",


  /* ------------------------------------------------------------------------
     4. SLIDE 1 — "Excuse me?!"
     ------------------------------------------------------------------------ */
  slide1: {
    heading: "EXCUSE ME?! 😤",
    subheading: "Who approved your resignation?",
    message: "",                     // leave empty to hide this paragraph
    button1: "I Have My Resignation Letter 😎",
    button1Reply: "Resignation letter detected. Friendship approval still pending.",
    button2: "Please Don't Be Dramatic 😂",
    button2Reply: "ME? DRAMATIC? You're literally leaving me here! 😭",
    nextButton: "Fine, Let's Check Your Records 🔍"
  },


  /* ------------------------------------------------------------------------
     5. SLIDE 2 — Friendship records scan
     ------------------------------------------------------------------------ */
  slide2: {
    heading: "Scanning Your Friendship Records...",
    subheading: "Before approving your resignation, our highly advanced friendship management system needs to verify a few things.",
    // "at" = percentage on the progress bar. "tone" = colour of the result
    // badge: "funny", "warm", "critical" or "denied".
    steps: [
      { at: 15, text: "Checking how many times you've tolerated me...",      result: "Surprisingly high. 😂",  tone: "funny" },
      { at: 35, text: "Scanning office gossip and random conversations...",  result: "Too many memories detected. 🤭", tone: "warm" },
      { at: 55, text: "Checking emotional damage caused by your resignation...", result: "CRITICAL LEVEL. 😭", tone: "critical" },
      { at: 75, text: "Checking whether our friendship can be terminated...", result: "PERMISSION DENIED. 🔒", tone: "denied" }
    ],
    completeText: "Friendship verification completed!",
    warningTitle: "WARNING ⚠️",
    warningText: "Unusually strong friendship detected.",
    warningAction: "Recommended action: Reject resignation immediately.",
    nextButton: "View Final Decision ⚖️"
  },


  /* ------------------------------------------------------------------------
     6. SLIDE 3 — The verdict
     ------------------------------------------------------------------------ */
  slide3: {
    heading1: "Resignation Approved.",
    heading2: "But Friendship Termination? DENIED. ❤️",
    // Each line appears one after another
    messageLines: [
      "Okay, fine.",
      "You can leave the office.",
      "You can change your company.",
      "You can find new colleagues.",
      "But unfortunately for you...",
      "You're stuck with me as your friend. FOREVER. 😂❤️"
    ],
    acceptButton: "I Accept My Fate 😌",
    cardLine1: "Some people start as colleagues...\nAnd somehow become a part of your life.",
    cardLine2: "And I'm truly grateful our paths crossed. ✨",
    nextButton: "Read Your Final Notice 💌"
  },


  /* ------------------------------------------------------------------------
     7. THE LETTER
     ------------------------------------------------------------------------ */
  letterIntro1: "Okay, jokes apart...",
  letterIntro2: "There's something I really want to tell you.",
  openButton: "Open Your Letter ❤️",
  letterTitle: "A Letter I Never Wanted to Write",

  /* ✍️  YOUR LETTER
     Paste your letter between the two backticks  `  below.
     • Leave an EMPTY LINE between paragraphs.
     • Emojis work perfectly.
     • Just don't use the backtick character ( ` ) inside the letter. */
  letter: `
Dear Ma'am,

I have been trying to write this message for a while, but honestly, it's really hard to put into words what you mean to me.

When I first started working with you, I never thought a manager could have such a positive impact on someone's life. But you proved me wrong.

You were never just my manager. You were someone I could always look up to. Whether it was work or something personal, I always felt like I could count on you. You never made me feel like I was just another employee—you treated me with kindness, respect, and understanding, and I'll always be grateful for that.

You believed in me during moments when I wasn't even sure of myself. Your guidance, your patience, and the trust you showed me helped me grow, not only professionally but as a person. Some lessons you taught me had nothing to do with work, yet they are the ones I know I'll carry with me for the rest of my life.

I know everyone has their own opinions about people, and that's completely okay. But from the bottom of my heart, I honestly don't care what anyone says. To me, you are the best manager I have ever had in my career, and I truly mean that. People like you are rare.

Thank you for every conversation, every piece of advice, every word of encouragement, and every time you stood by me. You made even the difficult days easier, simply because I knew I had someone who genuinely cared.

It's hard to imagine coming to work and not seeing you around anymore. It really won't feel the same.

I truly hope this new chapter of your life brings you all the happiness, success, and peace that you deserve. If anyone has earned it, it's you.

Thank you for believing in me, for helping me become a better professional, and more importantly, a better person.

I feel incredibly lucky that I got the opportunity to work with you. No matter where life takes me, I'll always be thankful that our paths crossed.

You'll always have my respect, my gratitude, and my best wishes.

Please take care of yourself, Ma'am. And if there's one thing I want you to remember, it's this:

You made a difference in my life, and that's something I'll never forget.

Thank you for everything. ❤️
`,


  /* ------------------------------------------------------------------------
     8. THE ENDING
     ------------------------------------------------------------------------ */
  finalQuote: "Different offices. Different journeys.\nSame friendship. Always. ❤️",
  signOff: "With love,",
  restartButton: "Relive Our Little Journey ✨",


  /* ------------------------------------------------------------------------
     9. QR CARD (used by card.html)
     ------------------------------------------------------------------------
     After you host the site online, paste its address here, then open
     card.html to print a farewell card with a QR code.                     */
  siteUrl: "https://your-site-name.netlify.app"
};
