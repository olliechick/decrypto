import { MAX_ROUNDS } from '../game/state';

const NOTEPAD_URL = 'https://portalgames.blob.core.windows.net/decrypto/Decrypto-Notatnik.pdf';

// A short how-to-play, for the menu and the setup screen
export function Rules() {
  return (
    <div className="space-y-3 text-white/80 leading-relaxed">
      <p>
        This app deals the keywords and the codes. Everything else goes on the{' '}
        <a href={NOTEPAD_URL} target="_blank" rel="noreferrer" className="underline">
          printed notepad
        </a>
        : one sheet per team, and a pen.
      </p>
      <p>
        Each team has 4 secret <b>keywords</b>, numbered 1 to 4. Only your team should ever see yours.
      </p>
      <p>
        Each round, one player on each team is the <b>encryptor</b>. The app shows them a secret <b>code</b>, such as
        3-1-4. They write a clue for each keyword in the code, in order, and read the clues out loud.
      </p>
      <p>
        From round 2, the other team writes down its guess at the code (an <b>intercept</b>). The encryptor's own team
        writes down its guess too (the encryptor stays quiet). Then reveal the code on the phone.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          The other team guessed right: they get an <b className="text-emerald-400">interception</b>. Two wins the game.
        </li>
        <li>
          Your own team guessed wrong: you get a <b className="text-red-400">miscommunication</b>. Two loses the game.
        </li>
      </ul>
      <p>
        The game ends at the end of a round. If both teams finish at once, or nobody has after round {MAX_ROUNDS}, the
        higher score wins: interceptions minus miscommunications. Still level? Each team guesses the other team's
        keywords, and the most right wins.
      </p>
      <p>
        Tip: give clues that your team will get but that don't give the keyword away. Every clue goes on both teams'
        sheets, and the more clues there are, the easier interception gets.
      </p>
    </div>
  );
}
