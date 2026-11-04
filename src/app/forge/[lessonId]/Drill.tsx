'use client';

import { useEffect, useRef, useState } from 'react';

import { markComplete } from '@/lib/forge/progress';
import { buildDrillQuestions, isAnswerCorrect, type Question } from '@/lib/forge/questions';
import type { DrillLesson, Tip } from '@/lib/forge/types';
import { useIsClient } from '@/lib/useIsClient';
import styles from './drill.module.css';

export default function Drill({ lesson }: { lesson: DrillLesson }) {
  // "Try again" reshuffles by remounting the run, so none of its state needs
  // resetting by hand.
  const [attempt, setAttempt] = useState(0);

  // The question set is shuffled, so the server can't render it: it would
  // pick a different one than the browser. Mounting the run only on the
  // client also means its questions are built once, in a state initializer,
  // rather than reshuffling on every keystroke.
  const isClient = useIsClient();
  if (!isClient) {
    return <p className={styles.loading}>Building your drill…</p>;
  }

  return (
    <DrillRun
      key={attempt}
      lesson={lesson}
      onRetry={() => setAttempt((current) => current + 1)}
    />
  );
}

function DrillRun({ lesson, onRetry }: { lesson: DrillLesson; onRetry: () => void }) {
  const [base] = useState(() => buildDrillQuestions(lesson.sentences));

  // Missed questions, appended so the drill ends once everything has been
  // answered correctly at least once.
  const [retries, setRetries] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState({ right: 0, asked: 0 });
  const [tipsOpenFor, setTipsOpenFor] = useState<string | null>(null);

  const audio = useRef<HTMLAudioElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  const queue = [...base, ...retries];
  const question = queue[index] ?? null;
  const finished = index >= queue.length;

  useEffect(() => {
    if (finished) markComplete(lesson.id);
  }, [finished, lesson.id]);

  // Typing questions get the caret without the visitor reaching for the mouse.
  useEffect(() => {
    if (question?.kind === 'typing') input.current?.focus();
  }, [question]);

  if (!question) {
    const percent = score.asked ? Math.round((score.right / score.asked) * 100) : 0;
    return (
      <div className={styles.done}>
        <h2 className={styles.doneTitle}>Drill complete</h2>
        <p className={styles.doneScore}>
          {score.right} of {score.asked} right on the first try ({percent}%)
        </p>
        <button type="button" className={styles.secondaryButton} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  const answered = verdict !== null;
  const tips = lesson.tips.filter((tip) => question.tips.includes(tip.id));
  const showTips = tipsOpenFor === question.key;

  const playAudio = (): void => {
    const player = audio.current;
    if (!player) return;
    player.currentTime = 0;
    void player.play().catch(() => {
      // Autoplay rules and missing files both land here, and the question
      // works without the audio, so there's nothing to tell the visitor.
    });
  };

  const settle = (correct: boolean): void => {
    setVerdict(correct ? 'correct' : 'incorrect');
    setScore((current) => ({
      right: current.right + (correct ? 1 : 0),
      asked: current.asked + 1,
    }));
    if (!correct) {
      setRetries((current) => [
        ...current,
        { ...question, key: `${question.key}-again-${current.length}` },
      ]);
    }
  };

  const choose = (option: string): void => {
    if (answered) return;
    setChosen(option);
    settle(isAnswerCorrect(option, question.accepted));
  };

  const check = (): void => {
    if (answered || !typed.trim()) return;
    settle(isAnswerCorrect(typed, question.accepted));
  };

  const advance = (): void => {
    setIndex((current) => current + 1);
    setTyped('');
    setChosen(null);
    setVerdict(null);
  };

  return (
    <div className={styles.drill}>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${(index / queue.length) * 100}%` }} />
      </div>
      <p className={styles.counter}>
        Question {index + 1} of {queue.length}
      </p>

      <div className={styles.promptBlock}>
        <p className={styles.direction}>
          {question.direction === 'es-to-en' ? 'Translate to English' : 'Translate to Spanish'}
        </p>
        <p className={styles.prompt}>
          {question.prompt}
          {question.audioUrl && (
            <button
              type="button"
              className={styles.audioButton}
              onClick={playAudio}
              aria-label="Play the Spanish audio"
            >
              ▶
            </button>
          )}
        </p>
        {question.audioUrl && <audio ref={audio} src={question.audioUrl} preload="none" />}
      </div>

      {question.kind === 'multipleChoice' ? (
        <ul className={styles.options}>
          {question.options?.map((option) => (
            <li key={option}>
              <button
                type="button"
                className={optionClass(option, question, chosen, answered)}
                onClick={() => choose(option)}
                disabled={answered}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.typing}>
          <input
            ref={input}
            type="text"
            className={styles.input}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              if (answered) advance();
              else check();
            }}
            placeholder={question.direction === 'es-to-en' ? 'In English…' : 'En español…'}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={answered}
            aria-label="Your answer"
          />
          {!answered && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={check}
              disabled={!typed.trim()}
            >
              Check
            </button>
          )}
        </div>
      )}

      {answered && (
        <div className={verdict === 'correct' ? styles.feedbackGood : styles.feedbackBad}>
          <p className={styles.feedbackLine}>
            {verdict === 'correct' ? 'Correct' : `Answer: ${question.answer}`}
          </p>
          {verdict === 'incorrect' && (
            <p className={styles.feedbackNote}>We&rsquo;ll come back to this one.</p>
          )}
        </div>
      )}

      {tips.length > 0 && (
        <div className={styles.tips}>
          <button
            type="button"
            className={styles.tipToggle}
            onClick={() => setTipsOpenFor(showTips ? null : question.key)}
            aria-expanded={showTips}
          >
            {showTips ? 'Hide hint' : 'Need a hint?'}
          </button>
          {showTips && tips.map((tip) => <TipCard key={tip.id} tip={tip} />)}
        </div>
      )}

      {answered && (
        <button type="button" className={styles.primaryButton} onClick={advance}>
          {index + 1 >= queue.length ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}

function optionClass(
  option: string,
  question: Question,
  chosen: string | null,
  answered: boolean
): string {
  if (!answered) return styles.option;
  if (isAnswerCorrect(option, question.accepted)) return styles.optionCorrect;
  if (option === chosen) return styles.optionWrong;
  return styles.option;
}

function TipCard({ tip }: { tip: Tip }) {
  return (
    <div className={styles.tip}>
      <h3 className={styles.tipTitle}>{tip.title}</h3>
      <div className={styles.tipText} dangerouslySetInnerHTML={{ __html: tip.html }} />
    </div>
  );
}
