import { MAX_ROUNDS } from '../game/state';

// A short how-to-play, for the menu
export function Rules() {
  return (
    <div className="space-y-3 text-white/80 leading-relaxed">
      <p>
        Each team has 4 secret <b>keywords</b>, numbered 1 to 4. Only your team should ever see yours.
      </p>
      <p>
        Each round, one player on each team is the <b>encryptor</b>. They get a secret <b>code</b>, such as 3-1-4, and
        give 3 clues: one for each keyword in the code, in order. The clues are read out loud.
      </p>
      <p>
        From round 2, the other team tries to <b>intercept</b> first: guess the code from the clues so far. Then the
        encryptor's own team guesses (the encryptor stays quiet).
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          The other team guesses right: they get an <b className="text-emerald-400">interception</b>. Two wins the game.
        </li>
        <li>
          Your own team guesses wrong: you get a <b className="text-red-400">miscommunication</b>. Two loses the game.
        </li>
      </ul>
      <p>
        The game ends at the end of a round. If both teams finish at once, or nobody has after round {MAX_ROUNDS}, the
        higher score wins: interceptions minus miscommunications.
      </p>
      <p>
        Tip: give clues that your team will get but that don't give the keyword away. The other team sees every clue
        on the clue sheet, and the more clues there are, the easier interception gets.
      </p>
    </div>
  );
}
