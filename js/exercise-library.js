// ============================================
// EXERCISE LIBRARY MODULE
// ============================================

// ── Exercise Data ──
const EXERCISES = [
  // CHEST
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscle: 'chest',
    difficulty: 3,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="55" width="100" height="6" rx="3" fill="#ccff00" opacity="0.8"/><rect x="35" y="35" width="6" height="50" rx="3" fill="#ccff00" opacity="0.6"/><rect x="79" y="35" width="6" height="50" rx="3" fill="#ccff00" opacity="0.6"/><circle cx="13" cy="58" r="10" fill="#ccff00" opacity="0.4"/><circle cx="107" cy="58" r="10" fill="#ccff00" opacity="0.4"/><ellipse cx="60" cy="75" rx="15" ry="8" fill="#ccff00" opacity="0.2"/><path d="M45 58 L55 45 L65 45 L75 58" stroke="#ccff00" stroke-width="2" fill="none" opacity="0.5"/></svg>`,
    instructions: [
      'Lie flat on the bench with feet firmly on the floor.',
      'Grip the bar slightly wider than shoulder-width.',
      'Unrack and lower the bar to your mid-chest.',
      'Press the bar up until arms are fully extended.',
      'Keep your shoulder blades squeezed together throughout.'
    ]
  },
  {
    id: 'incline-db-press',
    name: 'Incline Dumbbell Press',
    muscle: 'chest',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="40" width="70" height="5" rx="2.5" fill="#ccff00" opacity="0.7" transform="rotate(-15 60 42)"/><rect x="35" y="50" width="5" height="40" rx="2.5" fill="#ccff00" opacity="0.5"/><rect x="80" y="50" width="5" height="40" rx="2.5" fill="#ccff00" opacity="0.5"/><rect x="28" y="32" width="14" height="8" rx="2" fill="#ccff00" opacity="0.6"/><rect x="78" y="32" width="14" height="8" rx="2" fill="#ccff00" opacity="0.6"/></svg>`,
    instructions: [
      'Set the bench to a 30-45° angle.',
      'Hold dumbbells at shoulder height with palms facing forward.',
      'Press up and slightly inward at the top.',
      'Lower slowly with control to the start position.',
      'Focus on the upper chest contraction.'
    ]
  },
  {
    id: 'cable-flyes',
    name: 'Cable Chest Flyes',
    muscle: 'chest',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="20" x2="55" y2="60" stroke="#ccff00" stroke-width="2" opacity="0.5"/><line x1="110" y1="20" x2="65" y2="60" stroke="#ccff00" stroke-width="2" opacity="0.5"/><circle cx="60" cy="60" r="15" fill="#ccff00" opacity="0.2"/><circle cx="60" cy="60" r="5" fill="#ccff00" opacity="0.6"/><rect x="5" y="10" width="10" height="100" rx="3" fill="#ccff00" opacity="0.3"/><rect x="105" y="10" width="10" height="100" rx="3" fill="#ccff00" opacity="0.3"/></svg>`,
    instructions: [
      'Set pulleys at chest height.',
      'Grab handles and step forward into a split stance.',
      'With slight elbow bend, bring hands together in front.',
      'Squeeze your chest at the peak contraction.',
      'Return slowly in a wide arc motion.'
    ]
  },
  {
    id: 'push-ups',
    name: 'Push-Ups',
    muscle: 'chest',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="80" x2="100" y2="70" stroke="#ccff00" stroke-width="4" stroke-linecap="round" opacity="0.6"/><circle cx="25" cy="65" r="8" fill="#ccff00" opacity="0.3"/><line x1="30" y1="85" x2="30" y2="100" stroke="#ccff00" stroke-width="3" stroke-linecap="round" opacity="0.5"/><line x1="85" y1="75" x2="85" y2="100" stroke="#ccff00" stroke-width="3" stroke-linecap="round" opacity="0.5"/></svg>`,
    instructions: [
      'Place hands slightly wider than shoulders.',
      'Keep body in a straight line from head to heels.',
      'Lower chest to just above the floor.',
      'Push back up to full arm extension.',
      'Engage core throughout the movement.'
    ]
  },
  // BACK
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    muscle: 'back',
    difficulty: 3,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="85" width="90" height="5" rx="2.5" fill="#ccff00" opacity="0.8"/><circle cx="15" cy="87" r="12" fill="#ccff00" opacity="0.3"/><circle cx="105" cy="87" r="12" fill="#ccff00" opacity="0.3"/><path d="M60 30 L60 75 M45 75 L60 75 L75 75" stroke="#ccff00" stroke-width="3" stroke-linecap="round" opacity="0.6"/><circle cx="60" cy="25" r="8" fill="#ccff00" opacity="0.4"/></svg>`,
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot.',
      'Grip the bar just outside your legs.',
      'Push hips back, keep chest up and back flat.',
      'Drive through your heels to lift the bar.',
      'Lock out by squeezing glutes at the top.'
    ]
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    muscle: 'back',
    difficulty: 3,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="90" height="5" rx="2.5" fill="#ccff00" opacity="0.8"/><path d="M40 20 L40 35 L60 50 L80 35 L80 20" stroke="#ccff00" stroke-width="2.5" fill="none" opacity="0.6"/><circle cx="60" cy="40" r="8" fill="#ccff00" opacity="0.4"/><line x1="60" y1="48" x2="60" y2="85" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="50" y1="85" x2="60" y2="85" stroke="#ccff00" stroke-width="2" opacity="0.4"/><line x1="60" y1="85" x2="70" y2="85" stroke="#ccff00" stroke-width="2" opacity="0.4"/></svg>`,
    instructions: [
      'Hang from the bar with an overhand grip, slightly wider than shoulders.',
      'Engage your lats and pull your chin above the bar.',
      'Keep your core tight and avoid swinging.',
      'Lower yourself with control to full arm extension.',
      'For beginners, use assisted pull-up machine or bands.'
    ]
  },
  {
    id: 'barbell-row',
    name: 'Bent-Over Barbell Row',
    muscle: 'back',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="70" width="80" height="4" rx="2" fill="#ccff00" opacity="0.7"/><circle cx="20" cy="72" r="8" fill="#ccff00" opacity="0.3"/><circle cx="100" cy="72" r="8" fill="#ccff00" opacity="0.3"/><path d="M50 35 L60 55 L70 35" stroke="#ccff00" stroke-width="2" fill="none" opacity="0.5"/><line x1="60" y1="55" x2="60" y2="68" stroke="#ccff00" stroke-width="3" opacity="0.6"/></svg>`,
    instructions: [
      'Bend at the hips to about 45°, knees slightly bent.',
      'Grip the bar slightly wider than shoulder-width.',
      'Pull the bar to your lower ribcage.',
      'Squeeze your shoulder blades at the top.',
      'Lower with control and maintain your back angle.'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscle: 'back',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="15" width="80" height="4" rx="2" fill="#ccff00" opacity="0.7"/><line x1="60" y1="19" x2="60" y2="35" stroke="#ccff00" stroke-width="2" opacity="0.5"/><rect x="40" y="35" width="40" height="4" rx="2" fill="#ccff00" opacity="0.6"/><circle cx="60" cy="55" r="8" fill="#ccff00" opacity="0.3"/><rect x="50" y="63" width="20" height="30" rx="5" fill="#ccff00" opacity="0.2"/></svg>`,
    instructions: [
      'Sit and secure your thighs under the pads.',
      'Grab the wide bar with an overhand grip.',
      'Pull the bar down to your upper chest.',
      'Lean back slightly and squeeze your lats.',
      'Return the bar up slowly with control.'
    ]
  },
  // SHOULDERS
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscle: 'shoulders',
    difficulty: 3,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="25" width="70" height="4" rx="2" fill="#ccff00" opacity="0.8"/><circle cx="60" cy="50" r="8" fill="#ccff00" opacity="0.4"/><line x1="40" y1="40" x2="40" y2="27" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><line x1="80" y1="40" x2="80" y2="27" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><line x1="60" y1="58" x2="60" y2="90" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="50" y1="90" x2="70" y2="90" stroke="#ccff00" stroke-width="2" opacity="0.4"/></svg>`,
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Grip the barbell at shoulder width, resting on upper chest.',
      'Press the bar overhead in a straight line.',
      'Lock out at the top with the bar over mid-foot.',
      'Lower back to shoulder height with control.'
    ]
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    muscle: 'shoulders',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="35" r="8" fill="#ccff00" opacity="0.4"/><line x1="60" y1="43" x2="60" y2="80" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="60" y1="55" x2="25" y2="50" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><line x1="60" y1="55" x2="95" y2="50" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><rect x="18" y="47" width="10" height="6" rx="2" fill="#ccff00" opacity="0.5"/><rect x="92" y="47" width="10" height="6" rx="2" fill="#ccff00" opacity="0.5"/></svg>`,
    instructions: [
      'Stand with dumbbells at your sides.',
      'With a slight bend in the elbows, raise arms to the side.',
      'Lift to shoulder height, forming a T-shape.',
      'Pause briefly at the top.',
      'Lower slowly to the starting position.'
    ]
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    muscle: 'shoulders',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="90" y="20" width="8" height="80" rx="4" fill="#ccff00" opacity="0.3"/><line x1="94" y1="50" x2="60" y2="50" stroke="#ccff00" stroke-width="2" opacity="0.5"/><circle cx="45" cy="45" r="8" fill="#ccff00" opacity="0.4"/><line x1="45" y1="53" x2="45" y2="85" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="45" y1="53" x2="30" y2="45" stroke="#ccff00" stroke-width="2" opacity="0.5"/><line x1="45" y1="53" x2="60" y2="45" stroke="#ccff00" stroke-width="2" opacity="0.5"/></svg>`,
    instructions: [
      'Set cable at upper chest height with rope attachment.',
      'Grip rope with overhand grip.',
      'Pull the rope towards your face, elbows high.',
      'Externally rotate at the end until hands are beside ears.',
      'Squeeze rear delts, then slowly return.'
    ]
  },
  // ARMS
  {
    id: 'bicep-curls',
    name: 'Barbell Bicep Curls',
    muscle: 'arms',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="30" r="8" fill="#ccff00" opacity="0.4"/><line x1="60" y1="38" x2="60" y2="75" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M60 55 Q45 45 40 60" stroke="#ccff00" stroke-width="2.5" fill="none" opacity="0.6"/><path d="M60 55 Q75 45 80 60" stroke="#ccff00" stroke-width="2.5" fill="none" opacity="0.6"/><rect x="30" y="58" width="25" height="4" rx="2" fill="#ccff00" opacity="0.7"/><circle cx="30" cy="60" r="5" fill="#ccff00" opacity="0.3"/><circle cx="90" cy="60" r="5" fill="#ccff00" opacity="0.3"/><rect x="65" y="58" width="25" height="4" rx="2" fill="#ccff00" opacity="0.7"/></svg>`,
    instructions: [
      'Stand with barbell at arms length, underhand grip.',
      'Keep elbows pinned to your sides.',
      'Curl the weight up by contracting biceps.',
      'Squeeze at the top for a second.',
      'Lower with control — avoid swinging.'
    ]
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Cable Pushdown',
    muscle: 'arms',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="55" y="10" width="10" height="60" rx="3" fill="#ccff00" opacity="0.3"/><circle cx="60" cy="45" r="8" fill="#ccff00" opacity="0.4"/><line x1="60" y1="53" x2="60" y2="85" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M48 55 L48 75" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><path d="M72 55 L72 75" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><rect x="42" y="73" width="12" height="4" rx="2" fill="#ccff00" opacity="0.5"/><rect x="66" y="73" width="12" height="4" rx="2" fill="#ccff00" opacity="0.5"/></svg>`,
    instructions: [
      'Stand facing the cable machine with bar/rope attachment.',
      'Grip with overhand, elbows tucked to sides.',
      'Push the weight down until arms are fully extended.',
      'Squeeze triceps at the bottom.',
      'Slowly return to the start — don\'t let elbows flare.'
    ]
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    muscle: 'arms',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="30" r="8" fill="#ccff00" opacity="0.4"/><line x1="60" y1="38" x2="60" y2="80" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M50 55 L45 40" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><path d="M70 55 L75 40" stroke="#ccff00" stroke-width="2.5" opacity="0.6"/><rect x="41" y="34" width="5" height="12" rx="2" fill="#ccff00" opacity="0.6"/><rect x="74" y="34" width="5" height="12" rx="2" fill="#ccff00" opacity="0.6"/></svg>`,
    instructions: [
      'Hold dumbbells at sides with neutral (palms in) grip.',
      'Keep elbows stationary at your sides.',
      'Curl the dumbbells up without rotating your wrists.',
      'Squeeze at the top.',
      'Lower with slow control.'
    ]
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    muscle: 'arms',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="68" width="80" height="5" rx="2.5" fill="#ccff00" opacity="0.3"/><ellipse cx="60" cy="70" rx="20" ry="8" fill="#ccff00" opacity="0.15"/><circle cx="60" cy="60" r="6" fill="#ccff00" opacity="0.4"/><path d="M50 50 L40 30 L80 30 L70 50" stroke="#ccff00" stroke-width="2" fill="none" opacity="0.6"/><circle cx="35" cy="28" r="5" fill="#ccff00" opacity="0.4"/><circle cx="85" cy="28" r="5" fill="#ccff00" opacity="0.4"/></svg>`,
    instructions: [
      'Lie on a bench holding an EZ-bar above your chest.',
      'Keep upper arms vertical and fixed.',
      'Bend elbows to lower the bar towards your forehead.',
      'Stop just before the bar touches your head.',
      'Extend arms back up using only your triceps.'
    ]
  },
  // LEGS
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    muscle: 'legs',
    difficulty: 3,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="35" width="80" height="4" rx="2" fill="#ccff00" opacity="0.8"/><circle cx="60" cy="30" r="6" fill="#ccff00" opacity="0.4"/><line x1="60" y1="42" x2="60" y2="70" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M60 70 L45 95" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M60 70 L75 95" stroke="#ccff00" stroke-width="3" opacity="0.5"/><circle cx="20" cy="37" r="8" fill="#ccff00" opacity="0.3"/><circle cx="100" cy="37" r="8" fill="#ccff00" opacity="0.3"/></svg>`,
    instructions: [
      'Position bar on upper back (not neck).',
      'Stand with feet shoulder-width apart, toes slightly out.',
      'Brace core and descend by pushing hips back.',
      'Go down until thighs are at least parallel to floor.',
      'Drive through heels to stand back up.'
    ]
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscle: 'legs',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="75" width="70" height="4" rx="2" fill="#ccff00" opacity="0.7"/><circle cx="25" cy="77" r="7" fill="#ccff00" opacity="0.3"/><circle cx="95" cy="77" r="7" fill="#ccff00" opacity="0.3"/><path d="M60 35 Q60 55 60 73" stroke="#ccff00" stroke-width="3" opacity="0.5"/><circle cx="60" cy="30" r="7" fill="#ccff00" opacity="0.4"/><line x1="55" y1="73" x2="50" y2="95" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><line x1="65" y1="73" x2="70" y2="95" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/></svg>`,
    instructions: [
      'Hold barbell at hip height with overhand grip.',
      'Push hips back while keeping a slight knee bend.',
      'Lower the bar along your legs until you feel a hamstring stretch.',
      'Keep back flat and chest up throughout.',
      'Drive hips forward to return to standing.'
    ]
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscle: 'legs',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="60" y="25" width="50" height="70" rx="5" fill="#ccff00" opacity="0.1" transform="rotate(15 85 60)"/><circle cx="45" cy="70" r="6" fill="#ccff00" opacity="0.4"/><path d="M45 65 L65 40" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M45 75 L65 95" stroke="#ccff00" stroke-width="3" opacity="0.5"/><rect x="62" y="30" width="35" height="4" rx="2" fill="#ccff00" opacity="0.6" transform="rotate(15 80 32)"/></svg>`,
    instructions: [
      'Sit in the machine with back against the pad.',
      'Place feet shoulder-width apart on the platform.',
      'Release safety catches and lower the weight.',
      'Bend knees to about 90° without rounding lower back.',
      'Press through heels to extend legs (don\'t lock out knees).'
    ]
  },
  {
    id: 'lunges',
    name: 'Walking Lunges',
    muscle: 'legs',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="25" r="7" fill="#ccff00" opacity="0.4"/><line x1="60" y1="32" x2="60" y2="60" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M60 60 L35 90" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M60 60 L85 90" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="35" y1="90" x2="30" y2="100" stroke="#ccff00" stroke-width="2" opacity="0.4"/><line x1="85" y1="90" x2="90" y2="100" stroke="#ccff00" stroke-width="2" opacity="0.4"/></svg>`,
    instructions: [
      'Stand tall with dumbbells at sides (or bodyweight).',
      'Step forward into a long stride.',
      'Lower back knee towards the floor.',
      'Front knee should track over toes (not past).',
      'Push off front foot and step forward into the next lunge.'
    ]
  },
  {
    id: 'calf-raises',
    name: 'Standing Calf Raises',
    muscle: 'legs',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="20" r="7" fill="#ccff00" opacity="0.4"/><line x1="60" y1="27" x2="60" y2="65" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="60" y1="65" x2="55" y2="90" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="60" y1="65" x2="65" y2="90" stroke="#ccff00" stroke-width="3" opacity="0.5"/><rect x="45" y="90" width="30" height="5" rx="2" fill="#ccff00" opacity="0.6"/><path d="M55 85 L55 90" stroke="#ccff00" stroke-width="3" opacity="0.3"/><path d="M65 85 L65 90" stroke="#ccff00" stroke-width="3" opacity="0.3"/></svg>`,
    instructions: [
      'Stand on the edge of a step or calf raise machine.',
      'Lower heels below the step for a full stretch.',
      'Push up onto your toes as high as possible.',
      'Hold the peak contraction for 1-2 seconds.',
      'Lower slowly under control.'
    ]
  },
  // CORE
  {
    id: 'plank',
    name: 'Plank Hold',
    muscle: 'core',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="65" x2="100" y2="60" stroke="#ccff00" stroke-width="4" stroke-linecap="round" opacity="0.6"/><circle cx="20" cy="58" r="6" fill="#ccff00" opacity="0.4"/><line x1="25" y1="70" x2="25" y2="85" stroke="#ccff00" stroke-width="2.5" opacity="0.5"/><line x1="95" y1="65" x2="95" y2="85" stroke="#ccff00" stroke-width="2.5" opacity="0.5"/></svg>`,
    instructions: [
      'Place forearms on the ground, elbows under shoulders.',
      'Extend legs behind you, resting on your toes.',
      'Keep your body in a perfectly straight line.',
      'Engage your core and glutes — don\'t let hips sag.',
      'Hold for the prescribed time while breathing normally.'
    ]
  },
  {
    id: 'hanging-leg-raises',
    name: 'Hanging Leg Raises',
    muscle: 'core',
    difficulty: 3,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="10" width="70" height="4" rx="2" fill="#ccff00" opacity="0.7"/><line x1="50" y1="14" x2="50" y2="30" stroke="#ccff00" stroke-width="2" opacity="0.5"/><line x1="70" y1="14" x2="70" y2="30" stroke="#ccff00" stroke-width="2" opacity="0.5"/><circle cx="60" cy="38" r="7" fill="#ccff00" opacity="0.4"/><line x1="60" y1="45" x2="60" y2="70" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M60 70 L40 85" stroke="#ccff00" stroke-width="3" opacity="0.6"/><path d="M60 70 L80 85" stroke="#ccff00" stroke-width="3" opacity="0.6"/></svg>`,
    instructions: [
      'Hang from a pull-up bar with straight arms.',
      'Keep legs straight (or slightly bent for easier variation).',
      'Raise legs until they are parallel to the ground (or higher).',
      'Avoid swinging — use controlled motion only.',
      'Lower legs slowly back to hanging position.'
    ]
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    muscle: 'core',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="40" r="7" fill="#ccff00" opacity="0.4"/><path d="M60 47 L55 75" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M55 75 L45 95" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><path d="M55 75 L65 95" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><ellipse cx="40" cy="60" rx="8" ry="5" fill="#ccff00" opacity="0.5" transform="rotate(-20 40 60)"/></svg>`,
    instructions: [
      'Sit on the floor with knees bent, feet slightly elevated.',
      'Lean back to about 45° — keep back straight.',
      'Hold a weight plate or dumbbell with both hands.',
      'Rotate your torso to touch the weight to each side.',
      'Keep core tight and movement controlled.'
    ]
  },
  {
    id: 'cable-crunches',
    name: 'Cable Crunches',
    muscle: 'core',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="55" y="5" width="10" height="30" rx="3" fill="#ccff00" opacity="0.3"/><circle cx="60" cy="50" r="7" fill="#ccff00" opacity="0.4"/><path d="M60 57 Q60 70 55 80" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="50" y1="80" x2="45" y2="95" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><line x1="55" y1="80" x2="65" y2="95" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><line x1="60" y1="35" x2="60" y2="43" stroke="#ccff00" stroke-width="2" opacity="0.5"/></svg>`,
    instructions: [
      'Kneel in front of a high cable with rope attachment.',
      'Hold the rope behind your head.',
      'Crunch down, bringing elbows towards your knees.',
      'Focus on flexing your abs — not pulling with arms.',
      'Return to the starting position slowly.'
    ]
  },
  // CARDIO
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    muscle: 'cardio',
    difficulty: 1,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="30" r="7" fill="#ccff00" opacity="0.4"/><line x1="60" y1="37" x2="60" y2="70" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="60" y1="70" x2="50" y2="90" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><line x1="60" y1="70" x2="70" y2="90" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><path d="M35 45 Q30 80 60 95 Q90 80 85 45" stroke="#ccff00" stroke-width="2" fill="none" opacity="0.6" stroke-dasharray="5 3"/></svg>`,
    instructions: [
      'Hold handles at hip height with elbows close.',
      'Use wrist motion to spin the rope — not arms.',
      'Jump with small, quick bounces (1-2 inches off ground).',
      'Land softly on the balls of your feet.',
      'Start with 30-second intervals, build up duration.'
    ]
  },
  {
    id: 'burpees',
    name: 'Burpees',
    muscle: 'cardio',
    difficulty: 3,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="18" r="6" fill="#ccff00" opacity="0.4"/><line x1="60" y1="24" x2="60" y2="50" stroke="#ccff00" stroke-width="3" opacity="0.5"/><line x1="45" y1="35" x2="60" y2="30" stroke="#ccff00" stroke-width="2" opacity="0.4"/><line x1="75" y1="35" x2="60" y2="30" stroke="#ccff00" stroke-width="2" opacity="0.4"/><line x1="60" y1="50" x2="45" y2="65" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><line x1="60" y1="50" x2="75" y2="65" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><path d="M30 80 L90 80" stroke="#ccff00" stroke-width="1.5" opacity="0.3" stroke-dasharray="4 4"/><text x="60" y="100" text-anchor="middle" fill="#ccff00" font-size="10" opacity="0.5">JUMP</text></svg>`,
    instructions: [
      'Stand tall, then squat down and place hands on floor.',
      'Jump feet back into a push-up position.',
      'Perform a push-up (optional for beginners).',
      'Jump feet forward back to squat position.',
      'Explode up into a jump with hands overhead.'
    ]
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    muscle: 'cardio',
    difficulty: 2,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="35" cy="40" r="6" fill="#ccff00" opacity="0.4"/><line x1="40" y1="44" x2="90" y2="55" stroke="#ccff00" stroke-width="3" opacity="0.5"/><path d="M42 50 L55 70 L45 85" stroke="#ccff00" stroke-width="2.5" fill="none" opacity="0.6"/><line x1="75" y1="58" x2="85" y2="85" stroke="#ccff00" stroke-width="2.5" opacity="0.4"/><line x1="35" y1="46" x2="30" y2="60" stroke="#ccff00" stroke-width="2" opacity="0.5"/></svg>`,
    instructions: [
      'Start in a push-up position with arms straight.',
      'Drive one knee towards your chest.',
      'Quickly switch legs in a running motion.',
      'Keep hips low and core engaged throughout.',
      'Move as quickly as possible while maintaining form.'
    ]
  }
];

let currentFilter = 'all';
let searchQuery = '';

/**
 * Get filtered exercises
 */
function getFilteredExercises() {
  return EXERCISES.filter(ex => {
    const matchesFilter = currentFilter === 'all' || ex.muscle === currentFilter;
    const matchesSearch = !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

/**
 * Render difficulty dots
 */
function renderDifficulty(level) {
  let dots = '';
  for (let i = 1; i <= 3; i++) {
    dots += `<div class="difficulty-dot ${i <= level ? 'active' : ''}"></div>`;
  }
  return dots;
}

/**
 * Render exercise grid
 */
function renderExercises() {
  const container = document.getElementById('exerciseGrid');
  if (!container) return;

  const exercises = getFilteredExercises();

  if (exercises.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-12); color: var(--text-tertiary);">
        <div style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">🔍</div>
        <div style="font-size: var(--text-lg);">No exercises found</div>
        <div style="font-size: var(--text-sm);">Try a different filter or search term</div>
      </div>
    `;
    return;
  }

  container.innerHTML = exercises.map((ex, i) => `
    <div class="exercise-lib-card animate-fade-up stagger-${(i % 6) + 1}" id="exercise-${ex.id}" onclick="window.toggleExerciseCard('${ex.id}')">
      <div class="exercise-lib-visual">
        ${ex.svg}
      </div>
      <div class="exercise-lib-info">
        <div class="exercise-lib-name">${ex.name}</div>
        <div class="exercise-lib-muscle">${ex.muscle}</div>
        <div class="exercise-difficulty">
          ${renderDifficulty(ex.difficulty)}
        </div>
      </div>
      <div class="exercise-lib-instructions">
        <h4>How to Perform</h4>
        <ol>
          ${ex.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    </div>
  `).join('');
}

/**
 * Toggle exercise card expansion
 */
window.toggleExerciseCard = function (id) {
  const card = document.getElementById(`exercise-${id}`);
  if (!card) return;
  card.classList.toggle('expanded');
};

/**
 * Initialize exercise library
 */
export function initExerciseLibrary() {
  const filterBar = document.getElementById('exerciseFilters');
  const searchInput = document.getElementById('exerciseSearch');

  // Filter buttons
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        filterBar.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderExercises();
      }
    });
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderExercises();
    });
  }

  renderExercises();
}
