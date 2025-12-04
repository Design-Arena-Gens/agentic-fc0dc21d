'use client';

import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import clsx from 'clsx';

const dayKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayKey = (typeof dayKeys)[number];

type Intensity = 'Light' | 'Moderate' | 'Intense';

type ExercisePlan = {
  id: string;
  name: string;
  focus: string;
  sets: number;
  reps: string;
  notes: string;
};

type SessionPlan = {
  id: string;
  day: DayKey;
  start: string;
  end: string;
  focus: string;
  intensity: Intensity;
  location: string;
  target: string;
  notes: string;
  exercises: ExercisePlan[];
};

const defaultExercises: ExercisePlan[] = [
  {
    id: uuid(),
    name: 'Barbell Back Squat',
    focus: 'Compound',
    sets: 4,
    reps: '6-8',
    notes: 'Tempo 3-1-1, rest 120s'
  },
  {
    id: uuid(),
    name: 'Romanian Deadlift',
    focus: 'Posterior Chain',
    sets: 3,
    reps: '8-10',
    notes: 'Use straps if grip fatigues'
  }
];

const templates: Array<
  Pick<SessionPlan, 'focus' | 'notes' | 'intensity' | 'location' | 'target'> & { label: string; exercises: ExercisePlan[] }
> = [
  {
    label: 'Push Power 60m',
    focus: 'Upper Body Push',
    intensity: 'Intense',
    location: 'Strength Zone',
    target: 'Chest/Shoulders/Triceps',
    notes: 'Prioritize heavy compounds, finish with sled pushes.',
    exercises: [
      {
        id: uuid(),
        name: 'Flat Bench Press',
        focus: 'Compound',
        sets: 5,
        reps: '5',
        notes: 'Add 2.5kg each microcycle'
      },
      {
        id: uuid(),
        name: 'Seated DB Shoulder Press',
        focus: 'Accessory',
        sets: 3,
        reps: '8-10',
        notes: ''
      },
      {
        id: uuid(),
        name: 'Weighted Dips',
        focus: 'Accessory',
        sets: 3,
        reps: 'AMRAP',
        notes: 'RPE 8'
      }
    ]
  },
  {
    label: 'Conditioning 40m',
    focus: 'Engine Builder',
    intensity: 'Moderate',
    location: 'Turf + Assault Bike',
    target: 'Cardio / Core',
    notes: 'Sustainable heart rate 150-160, nasal breathing focus.',
    exercises: [
      {
        id: uuid(),
        name: 'Assault Bike Intervals',
        focus: 'Cardio',
        sets: 8,
        reps: '60s on / 60s off',
        notes: ''
      },
      {
        id: uuid(),
        name: 'Farmer Carry',
        focus: 'Core / Grip',
        sets: 4,
        reps: '40m',
        notes: 'Heavy kettlebells'
      }
    ]
  },
  {
    label: 'Mobility Reset 30m',
    focus: 'Recovery',
    intensity: 'Light',
    location: 'Studio',
    target: 'Mobility / Breathwork',
    notes: 'Full-body flow to enhance recovery and joint health.',
    exercises: [
      {
        id: uuid(),
        name: '90/90 Hip Flow',
        focus: 'Mobility',
        sets: 3,
        reps: '3 min per side',
        notes: ''
      },
      {
        id: uuid(),
        name: 'Thoracic Opener',
        focus: 'Mobility',
        sets: 3,
        reps: '12 reps',
        notes: 'Foam roller'
      },
      {
        id: uuid(),
        name: 'Box Breathing',
        focus: 'Breathwork',
        sets: 1,
        reps: '6 min',
        notes: '4-4-4-4 cadence'
      }
    ]
  }
];

const intensities: Intensity[] = ['Light', 'Moderate', 'Intense'];

const initialSessionForm: Omit<SessionPlan, 'id' | 'exercises'> = {
  day: 'Monday',
  start: '07:00',
  end: '08:15',
  focus: 'Lower Body Strength',
  intensity: 'Intense',
  location: 'Rack Bay',
  target: 'Quads/Glutes/Core',
  notes: ''
};

export function Scheduler() {
  const [sessions, setSessions] = useState<SessionPlan[]>([
    { ...initialSessionForm, id: uuid(), exercises: defaultExercises }
  ]);
  const [sessionForm, setSessionForm] = useState(initialSessionForm);
  const [exerciseDrafts, setExerciseDrafts] = useState<ExercisePlan[]>([
    {
      id: uuid(),
      name: '',
      focus: '',
      sets: 3,
      reps: '8-12',
      notes: ''
    }
  ]);
  const [activeTab, setActiveTab] = useState<'plan' | 'overview'>('plan');

  const grouped = useMemo(() => {
    return dayKeys.reduce<Record<DayKey, SessionPlan[]>>((acc, day) => {
      acc[day] = sessions.filter((session) => session.day === day).sort((a, b) => a.start.localeCompare(b.start));
      return acc;
    }, {} as Record<DayKey, SessionPlan[]>);
  }, [sessions]);

  const focusSummary = useMemo(() => {
    return sessions.reduce<Record<string, number>>((acc, session) => {
      acc[session.focus] = (acc[session.focus] ?? 0) + 1;
      return acc;
    }, {});
  }, [sessions]);

  const nextSessionId = useMemo(() => {
    if (!sessions.length) return null;
    const upcoming = [...sessions].sort((a, b) => {
      const dayIndex = dayKeys.indexOf(a.day) - dayKeys.indexOf(b.day);
      if (dayIndex !== 0) return dayIndex;
      return a.start.localeCompare(b.start);
    });
    return upcoming[0]?.id ?? null;
  }, [sessions]);

  const handleSessionChange = <Key extends keyof typeof sessionForm>(key: Key, value: (typeof sessionForm)[Key]) => {
    setSessionForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleExerciseChange = (id: string, key: keyof ExercisePlan, value: string | number) => {
    setExerciseDrafts((prev) =>
      prev.map((exercise) => (exercise.id === id ? { ...exercise, [key]: value } : exercise))
    );
  };

  const addExerciseDraft = () => {
    setExerciseDrafts((prev) => [
      ...prev,
      { id: uuid(), name: '', focus: '', sets: 3, reps: '10', notes: '' }
    ]);
  };

  const removeExerciseDraft = (id: string) => {
    setExerciseDrafts((prev) => (prev.length === 1 ? prev : prev.filter((exercise) => exercise.id !== id)));
  };

  const addSession = (customExercises?: ExercisePlan[]) => {
    const exercises = (customExercises ?? exerciseDrafts)
      .filter((exercise) => exercise.name.trim().length > 0)
      .map((exercise) => ({
        ...exercise,
        id: uuid()
      }));

    if (!exercises.length) {
      const fallback = {
        id: uuid(),
        name: 'Full-Body Circuit',
        focus: 'Conditioning',
        sets: 5,
        reps: '45s on / 15s off',
        notes: 'Use sled, battle ropes, and med-ball slams'
      };
      exercises.push(fallback);
    }

    setSessions((prev) => [
      ...prev,
      {
        id: uuid(),
        ...sessionForm,
        exercises
      }
    ]);

    setExerciseDrafts([{ id: uuid(), name: '', focus: '', sets: 3, reps: '8-12', notes: '' }]);
  };

  const applyTemplateToDay = (day: DayKey, templateIndex: number) => {
    const template = templates[templateIndex];
    setSessions((prev) => [
      ...prev,
      {
        id: uuid(),
        day,
        start: '18:00',
        end: '19:00',
        focus: template.focus,
        intensity: template.intensity,
        location: template.location,
        target: template.target,
        notes: template.notes,
        exercises: template.exercises.map((exercise) => ({
          ...exercise,
          id: uuid()
        }))
      }
    ]);
  };

  const clearDay = (day: DayKey) => {
    setSessions((prev) => prev.filter((session) => session.day !== day));
  };

  const duplicateSession = (sessionId: string, direction: 'next' | 'previous') => {
    setSessions((prev) => {
      const target = prev.find((session) => session.id === sessionId);
      if (!target) return prev;
      const currentDayIndex = dayKeys.indexOf(target.day);
      const nextIndex =
        direction === 'next'
          ? (currentDayIndex + 1) % dayKeys.length
          : (currentDayIndex - 1 + dayKeys.length) % dayKeys.length;
      const newDay = dayKeys[nextIndex];
      const offsetMinutes = direction === 'next' ? 60 : -60;
      const adjustTime = (time: string) => {
        const [hourStr, minuteStr] = time.split(':');
        const minuteValue = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10) + offsetMinutes;
        const normalized = ((minuteValue % (24 * 60)) + 24 * 60) % (24 * 60);
        const hours = Math.floor(normalized / 60)
          .toString()
          .padStart(2, '0');
        const minutes = (normalized % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      return [
        ...prev,
        {
          ...target,
          id: uuid(),
          day: newDay,
          start: adjustTime(target.start),
          end: adjustTime(target.end),
          notes: `${target.notes} • Duplicated ${direction === 'next' ? 'forward' : 'backward'} on ${format(
            new Date(),
            'MMM d'
          )}`,
          exercises: target.exercises.map((exercise) => ({
            ...exercise,
            id: uuid()
          }))
        }
      ];
    });
  };

  const removeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  };

  const renderSessionCard = (session: SessionPlan) => (
    <article
      key={session.id}
      className={clsx(
        'rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm transition hover:border-brand-400',
        session.id === nextSessionId && 'ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-950'
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-50">{session.focus}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {session.start} - {session.end} • {session.location}
          </p>
        </div>
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-medium',
            session.intensity === 'Intense' && 'bg-brand-500/20 text-brand-200',
            session.intensity === 'Moderate' && 'bg-emerald-500/20 text-emerald-200',
            session.intensity === 'Light' && 'bg-sky-500/20 text-sky-100'
          )}
        >
          {session.intensity}
        </span>
      </header>

      <p className="mt-2 text-sm text-slate-300">{session.target}</p>

      <ul className="mt-4 space-y-3 text-sm text-slate-200">
        {session.exercises.map((exercise) => (
          <li key={exercise.id} className="rounded-lg border border-slate-800/60 bg-slate-900/70 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">{exercise.name}</p>
              <span className="text-xs text-slate-400">{exercise.focus || 'Training'}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {exercise.sets} sets · {exercise.reps}
            </p>
            {exercise.notes && <p className="mt-1 text-xs text-slate-500">{exercise.notes}</p>}
          </li>
        ))}
      </ul>

      {session.notes && <p className="mt-3 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-400">{session.notes}</p>}

      <footer className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => duplicateSession(session.id, 'previous')}
          className="rounded-lg border border-slate-800 px-3 py-1 hover:border-slate-700 hover:text-slate-200"
        >
          Clone to previous day
        </button>
        <button
          type="button"
          onClick={() => duplicateSession(session.id, 'next')}
          className="rounded-lg border border-slate-800 px-3 py-1 hover:border-slate-700 hover:text-slate-200"
        >
          Clone to next day
        </button>
        <button
          type="button"
          onClick={() => removeSession(session.id)}
          className="ml-auto rounded-lg border border-red-700/40 px-3 py-1 text-red-300 hover:border-red-600/60 hover:text-red-100"
        >
          Remove
        </button>
      </footer>
    </article>
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 pb-10 pt-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg backdrop-blur">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-200">Agentic Gym Planner</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-50 sm:text-4xl">
              Build your strongest week with clarity and intent
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Map your lifting focus, conditioning pieces, and recovery blocks across the week. Duplicate sessions,
              apply ready-made templates, and keep each workout dialed in with specific exercise prescriptions.
            </p>
          </div>
          <div className="flex gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-2">
            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className={clsx(
                'rounded-xl px-5 py-2 text-sm font-medium transition',
                activeTab === 'plan'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Build Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={clsx(
                'rounded-xl px-5 py-2 text-sm font-medium transition',
                activeTab === 'overview'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Weekly Overview
            </button>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[2fr,3fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <h2 className="text-lg font-semibold text-slate-100">Session Builder</h2>
              <p className="mt-1 text-xs text-slate-400">
                Choose the day, dial in the focus, and stack exercises. Template buttons drop in fully built sessions.
              </p>

              <div className="mt-4 grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Day
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                      value={sessionForm.day}
                      onChange={(event) => handleSessionChange('day', event.target.value as DayKey)}
                    >
                      {dayKeys.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Intensity
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                      value={sessionForm.intensity}
                      onChange={(event) => handleSessionChange('intensity', event.target.value as Intensity)}
                    >
                      {intensities.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    Start Time
                    <input
                      type="time"
                      value={sessionForm.start}
                      onChange={(event) => handleSessionChange('start', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-wide text-slate-500">
                    End Time
                    <input
                      type="time"
                      value={sessionForm.end}
                      onChange={(event) => handleSessionChange('end', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                    />
                  </label>
                </div>

                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Session Focus
                  <input
                    type="text"
                    value={sessionForm.focus}
                    onChange={(event) => handleSessionChange('focus', event.target.value)}
                    placeholder="e.g. Lower Body Strength"
                    className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </label>

                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Target Outcome
                  <input
                    type="text"
                    value={sessionForm.target}
                    onChange={(event) => handleSessionChange('target', event.target.value)}
                    placeholder="e.g. Quads/Glutes/Core"
                    className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </label>

                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Location
                  <input
                    type="text"
                    value={sessionForm.location}
                    onChange={(event) => handleSessionChange('location', event.target.value)}
                    placeholder="e.g. Rack Bay"
                    className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </label>

                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Notes & Cues
                  <textarea
                    value={sessionForm.notes}
                    onChange={(event) => handleSessionChange('notes', event.target.value)}
                    placeholder="Key tempo, RPE, or intent for this block"
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </label>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">Exercise Stack</h3>
                  <button
                    type="button"
                    onClick={addExerciseDraft}
                    className="text-xs font-medium text-brand-200 hover:text-brand-100"
                  >
                    + Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {exerciseDrafts.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-inner shadow-slate-950/40"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          value={exercise.name}
                          onChange={(event) => handleExerciseChange(exercise.id, 'name', event.target.value)}
                          placeholder="Exercise name"
                          className="flex-1 rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                        />
                        <input
                          value={exercise.focus}
                          onChange={(event) => handleExerciseChange(exercise.id, 'focus', event.target.value)}
                          placeholder="Focus"
                          className="w-40 rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <label className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wide text-slate-500">Sets</span>
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={exercise.sets}
                            onChange={(event) =>
                              handleExerciseChange(exercise.id, 'sets', Number(event.target.value) || 0)
                            }
                            className="w-20 rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                          />
                        </label>
                        <label className="flex flex-1 items-center gap-2">
                          <span className="text-xs uppercase tracking-wide text-slate-500">Reps / Time</span>
                          <input
                            value={exercise.reps}
                            onChange={(event) => handleExerciseChange(exercise.id, 'reps', event.target.value)}
                            placeholder="e.g. 8-10 or EMOM 10m"
                            className="flex-1 rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                          />
                        </label>
                      </div>
                      <textarea
                        value={exercise.notes}
                        onChange={(event) => handleExerciseChange(exercise.id, 'notes', event.target.value)}
                        placeholder="Technique cues, tempo, or rest guidance"
                        rows={2}
                        className="mt-3 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeExerciseDraft(exercise.id)}
                          className="rounded-lg border border-red-700/40 px-3 py-1 text-xs text-red-300 hover:border-red-600/60 hover:text-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => addSession()}
                  className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400"
                >
                  Add Session to Week
                </button>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs font-semibold text-slate-400">Quick Templates</p>
                  <div className="mt-3 space-y-3">
                    {templates.map((template, index) => (
                      <div
                        key={template.label}
                        className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-950/80 p-3 text-xs text-slate-300 sm:flex-row sm:items-center"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-100">{template.label}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{template.notes}</p>
                        </div>
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                          <span
                            className={clsx(
                              'inline-flex justify-center rounded-lg px-3 py-1 text-[11px] font-medium',
                              template.intensity === 'Intense' && 'bg-brand-500/20 text-brand-200',
                              template.intensity === 'Moderate' && 'bg-emerald-500/20 text-emerald-200',
                              template.intensity === 'Light' && 'bg-sky-500/20 text-sky-100'
                            )}
                          >
                            {template.intensity}
                          </span>
                          <select
                            onChange={(event) => {
                              const value = event.target.value as DayKey | 'placeholder';
                              if (value === 'placeholder') return;
                              applyTemplateToDay(value, index);
                              event.target.value = 'placeholder';
                            }}
                            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300 focus:border-brand-400 focus:outline-none"
                            defaultValue="placeholder"
                          >
                            <option value="placeholder" disabled>
                              Drop into day
                            </option>
                            {dayKeys.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-100">Weekly Snapshot</h2>
                <p className="text-xs text-slate-400">
                  {sessions.length} sessions • {Object.keys(focusSummary).length} unique focuses
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {Object.entries(focusSummary).map(([focus, count]) => (
                  <span
                    key={focus}
                    className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300"
                  >
                    {focus} · {count}x
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Next highlight session:{' '}
                <span className="text-slate-200">
                  {nextSessionId ? sessions.find((session) => session.id === nextSessionId)?.focus : 'No sessions yet'}
                </span>
              </p>
            </div>

            {activeTab === 'plan' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {dayKeys.map((day) => (
                  <section key={day} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                    <header className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-100">{day}</h3>
                        <p className="text-xs text-slate-500">
                          {grouped[day].length ? `${grouped[day].length} planned block(s)` : 'No sessions yet'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearDay(day)}
                        className="text-xs text-slate-500 hover:text-red-300"
                      >
                        Clear
                      </button>
                    </header>

                    <div className="space-y-4">
                      {grouped[day].length ? (
                        grouped[day].map((session) => renderSessionCard(session))
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-500">
                          Drop a template or build a session to lock in this day.
                        </p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
                <h3 className="text-base font-semibold text-slate-100">Capacity & Recovery Planner</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Visualize volume versus recovery demands. Aim for a wave of high, medium, and deload-focused days that
                  matches your priorities.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {dayKeys.map((day) => {
                    const daySessions = grouped[day];
                    const score = daySessions.reduce((acc, session) => {
                      const intensityScore =
                        session.intensity === 'Intense' ? 3 : session.intensity === 'Moderate' ? 2 : 1;
                      return acc + intensityScore;
                    }, 0);

                    const rating = score === 0 ? 'Recovery' : score >= 4 ? 'Load' : 'Build';
                    return (
                      <div key={day} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <header className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-100">{day}</span>
                          <span
                            className={clsx(
                              'rounded-full px-3 py-1 text-xs font-medium',
                              rating === 'Load' && 'bg-brand-500/20 text-brand-200',
                              rating === 'Build' && 'bg-emerald-500/20 text-emerald-100',
                              rating === 'Recovery' && 'bg-sky-500/20 text-sky-100'
                            )}
                          >
                            {rating}
                          </span>
                        </header>
                        <ul className="mt-3 space-y-2 text-xs text-slate-300">
                          {daySessions.length ? (
                            daySessions.map((session) => (
                              <li key={session.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                                <p className="font-medium text-slate-200">{session.focus}</p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {session.start} - {session.end} • {session.intensity}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">{session.target}</p>
                              </li>
                            ))
                          ) : (
                            <li className="rounded-lg border border-dashed border-slate-800 bg-slate-900/40 p-3 text-slate-500">
                              No sessions. Slot in active recovery or rest.
                            </li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
