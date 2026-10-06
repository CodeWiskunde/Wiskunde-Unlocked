// --- PLAYER DATA & STORAGE ---
let player = {
    xp: 0,
    ownedItems: ['default'],
    equippedItem: 'default',
    ownedTitles: ['brugklasser'],
    equippedTitle: 'brugklasser'
};

const shopItems = [
    // Skins
    { id: 'default', type: 'skin', name: 'Standaard Grijs', cost: 0, icon: 'fa-box', color: 'bg-slate-300' },
    { id: 'neon', type: 'skin', name: 'Neon Hacker', cost: 200, icon: 'fa-bolt', color: 'bg-cyan-400' },
    { id: 'gold', type: 'skin', name: 'Gouden VIP', cost: 500, icon: 'fa-crown', color: 'bg-yellow-400' },
    { id: 'retro', type: 'skin', name: 'Retro Synthwave', cost: 750, icon: 'fa-record-vinyl', color: 'bg-pink-500' },
    { id: 'cyberpunk', type: 'skin', name: 'Cyber Matrix', cost: 1000, icon: 'fa-laptop-code', color: 'bg-lime-400' },
    { id: 'rainbow', type: 'skin', name: 'Regenboog Master', cost: 1500, icon: 'fa-rainbow', color: 'bg-rose-400' },
    { id: 'dark', type: 'skin', name: 'Dark Mode', cost: 2000, icon: 'fa-moon', color: 'bg-gray-800' },
    
    // Titles
    { id: 'brugklasser', type: 'title', name: 'Brugklasser', titleText: 'Brugklasser', cost: 0, icon: 'fa-user-graduate', color: 'bg-indigo-400' },
    { id: 'rekenwonder', type: 'title', name: 'Rekenwonder', titleText: '⚡ Rekenwonder', cost: 300, icon: 'fa-wand-magic-sparkles', color: 'bg-blue-400' },
    { id: 'kluisjeskraker', type: 'title', name: 'Meester Kraker', titleText: '🔐 Meester Kraker', cost: 600, icon: 'fa-user-ninja', color: 'bg-purple-500' },
    { id: 'wiskundegod', type: 'title', name: 'Wiskunde Legende', titleText: '👑 Wiskunde Legende', cost: 1200, icon: 'fa-infinity', color: 'bg-amber-500' }
];

let activeShopTab = 'skins';

// --- SOUND EFFECTS (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSound(type) {
    if(type === 'correct') { playTone(600, 'sine', 0.1, 0.4); setTimeout(() => playTone(800, 'sine', 0.2, 0.4), 100); }
    if(type === 'wrong') { playTone(250, 'sawtooth', 0.3, 0.4); setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.4), 150); }
    if(type === 'win') { [400,500,600,800].forEach((f,i) => setTimeout(() => playTone(f, 'square', 0.2, 0.3), i*150)); }
    if(type === 'fail') { [300,250,200,150].forEach((f,i) => setTimeout(() => playTone(f, 'triangle', 0.3, 0.4), i*200)); }
    if(type === 'buy') { playTone(900, 'sine', 0.1, 0.3); setTimeout(() => playTone(1200, 'sine', 0.4, 0.3), 100); }
    if(type === 'streak') { playTone(700, 'sine', 0.08, 0.3); setTimeout(() => playTone(1000, 'sine', 0.15, 0.4), 80); }
}

// --- EXTENDED QUESTION BANKS (MC + FREE INPUT) ---
const questionBanks = {
    groep8: [
        { type: "mc", text: "Wat is 3/4 + 1/8?", options: ["7/8", "4/12", "4/8", "5/8"], answer: "7/8", hint: "Maak de breuken eerst gelijknamig: 3/4 = 6/8.", explanation: "3/4 = 6/8. Tel daarna de tellers op: 6/8 + 1/8 = 7/8." },
        { type: "input", text: "Reken uit: 12,5 : 0,5", answer: "25", hint: "Delen door 0,5 is hetzelfde als vermenigvuldigen met 2.", explanation: "12,5 : 0,5 = 12,5 × 2 = 25." },
        { type: "mc", text: "Een jas van €120 krijgt 15% korting. Wat betaal je?", options: ["€102", "€105", "€18", "€95"], answer: "€102", hint: "Bereken eerst 10% (€12) en 5% (€6).", explanation: "10% van €120 = €12, 5% = €6. Totale korting is €18. €120 - €18 = €102." },
        { type: "input", text: "Wat is 5/8 deel van 640?", answer: "400", hint: "Deel eerst 640 door 8 (1/8 deel) en doe het dan x 5.", explanation: "640 : 8 = 80. Dan is 5/8 deel gelijk aan 5 × 80 = 400." },
        { type: "mc", text: "4/5 is gelijk aan hoeveel procent?", options: ["80%", "40%", "45%", "60%"], answer: "80%", hint: "1/5 deel is gelijk aan 20%.", explanation: "1/5 = 20%. Dus 4/5 = 4 × 20% = 80%." },
        { type: "input", text: "Reken uit: 0,05 x 1000", answer: "50", hint: "Bij x 1000 schuift de komma 3 plekken naar rechts.", explanation: "0,05 × 1000 = 50." },
        { type: "mc", text: "De helft van 1/4 is...", options: ["1/8", "1/2", "2/4", "1/6"], answer: "1/8", hint: "Vermenigvuldig de noemer met 2 (1/4 : 2).", explanation: "1/4 ÷ 2 = 1/8." },
        { type: "mc", text: "Wat is groter: 5/8 of 2/3?", options: ["2/3", "5/8", "Ze zijn gelijk", "Kan niet"], answer: "2/3", hint: "Maak allebei de breuken gelijknamig met noemer 24.", explanation: "5/8 = 15/24 en 2/3 = 16/24. 16/24 is groter." },
        { type: "input", text: "Reken uit: 840 : 12", answer: "70", hint: "Denk aan 84 : 12 en plak er een nul achter.", explanation: "84 : 12 = 7, dus 840 : 12 = 70." },
        { type: "input", text: "Vereenvoudig 16/24 zo ver mogelijk.", answer: "2/3", hint: "Deel teller en noemer door hun grootste gemeenschappelijke deler (8).", explanation: "16:8 = 2 en 24:8 = 3. De breuk wordt 2/3." }
    ],
    negatief: [
        { type: "input", text: "-8 + 15 = ?", answer: "7", hint: "Tel eerst op tot 0 (-8 + 8 = 0) en tel de rest erbij op.", explanation: "-8 + 8 = 0. Je moet nog 7 optellen, dus de uitkomst is 7." },
        { type: "input", text: "-4 - 9 = ?", answer: "-13", hint: "Je begint onder nul en gaat nog verder naar links.", explanation: "-4 - 9 = -13." },
        { type: "mc", text: "12 - 18 = ?", options: ["-6", "6", "30", "0"], answer: "-6", hint: "Trek eerst 12 af om op 0 te komen.", explanation: "12 - 12 = 0. Trek er nog 6 af: -6." },
        { type: "input", text: "-5 - (-7) = ?", answer: "2", hint: "Twee mintekens direct achter elkaar worden samen een plus: - - = +", explanation: "-5 - (-7) wordt -5 + 7 = 2." },
        { type: "mc", text: "-10 + (-5) = ?", options: ["-15", "-5", "5", "15"], answer: "-15", hint: "Plus en min achter elkaar worden samen min: + - = -", explanation: "-10 + (-5) wordt -10 - 5 = -15." },
        { type: "input", text: "(-3) x 6 = ?", answer: "-18", hint: "Negatief x Positief is altijd Negatief.", explanation: "3 × 6 = 18, met een minteken wordt dit -18." },
        { type: "input", text: "(-4) x (-5) = ?", answer: "20", hint: "Negatief x Negatief wordt Positief!", explanation: "-4 × -5 = 20." },
        { type: "mc", text: "20 : (-4) = ?", options: ["-5", "5", "16", "24"], answer: "-5", hint: "Positief gedeeld door Negatief is Negatief.", explanation: "20 : 4 = 5, met een minteken wordt dit -5." },
        { type: "input", text: "-8 - 2 + 5 = ?", answer: "-5", hint: "Reken gewoon van links naar rechts.", explanation: "-8 - 2 = -10. Daarna -10 + 5 = -5." },
        { type: "input", text: "0 - 15 = ?", answer: "-15", hint: "15 stappen onder de nul.", explanation: "0 - 15 = -15." }
    ],
    algebra: [
        { type: "input", text: "Herleid: 3a + 5a", answer: "8a", hint: "Gelijke letters mag je optellen: tel de getallen op en plak de 'a' erachter.", explanation: "3a + 5a = 8a." },
        { type: "input", text: "Herleid: 7x - 2x + x", answer: "6x", hint: "Vergeet niet dat losse 'x' hetzelfde is als '1x'.", explanation: "7x - 2x = 5x. Dan 5x + 1x = 6x." },
        { type: "mc", text: "Herleid: 4a + 3b - 2a", options: ["2a + 3b", "5ab", "7ab - 2a", "6ab"], answer: "2a + 3b", hint: "Voeg alleen termen met dezelfde letter samen (4a - 2a).", explanation: "4a - 2a = 2a. De 3b kan er niet bij opgeteld worden, dus 2a + 3b." },
        { type: "input", text: "Herleid: 3x · 4y", answer: "12xy", hint: "Vermenigvuldig de getallen en plak de letters erachter.", explanation: "3 × 4 = 12. De letters worden x en y, dus 12xy." },
        { type: "mc", text: "Herleid: a · a", options: ["a²", "2a", "a", "0"], answer: "a²", hint: "Iets met zichzelf vermenigvuldigen schrijf je als een kwadraat.", explanation: "a · a = a²." },
        { type: "input", text: "Als x = 3, wat is dan 4x + 2?", answer: "14", hint: "4x betekent 4 x x. Vul voor x het getal 3 in.", explanation: "4 × 3 + 2 = 12 + 2 = 14." },
        { type: "input", text: "Herleid: 5p - p", answer: "4p", hint: "Onthoud dat 'p' gelijk staat aan '1p'.", explanation: "5p - 1p = 4p." },
        { type: "input", text: "Herleid: -2a · 3b", answer: "-6ab", hint: "Let op de min! Negatief x positief is negatief.", explanation: "-2 × 3 = -6, dus -6ab." },
        { type: "mc", text: "Herleid: 2x + 3x + 4", options: ["5x + 4", "9x", "24x", "5x²"], answer: "5x + 4", hint: "Voeg alleen de termen met 'x' samen. Losse getallen blijven apart.", explanation: "2x + 3x = 5x. Het getal 4 blijft apart: 5x + 4." },
        { type: "input", text: "Als y = -2, wat is dan 5y?", answer: "-10", hint: "5y betekent 5 x y. Denk aan 5 x -2.", explanation: "5 × -2 = -10." }
    ],
    mix: [
        { type: "input", text: "Bereken: 5² (Kwadraat)", answer: "25", hint: "Een kwadraat is een getal x zichzelf (5 x 5).", explanation: "5 × 5 = 25." },
        { type: "input", text: "Bereken: (-3)²", answer: "9", hint: "Min x min wordt plus! (-3) x (-3).", explanation: "(-3) × (-3) = 9." },
        { type: "input", text: "Bereken: -3² (Let op de haakjes!)", answer: "-9", hint: "Zonder haakjes hoort het minteken NIET bij het kwadraat.", explanation: "-(3 × 3) = -9." },
        { type: "mc", text: "Rekenvolgorde: 10 - 2 x 3", options: ["4", "24", "16", "5"], answer: "4", hint: "Vermenigvuldigen gaat voor aftrekken!", explanation: "Eerst 2 × 3 = 6. Daarna 10 - 6 = 4." },
        { type: "input", text: "Bereken: 2³ (Twee tot de derde macht)", answer: "8", hint: "2³ betekent 2 x 2 x 2.", explanation: "2 × 2 × 2 = 8." },
        { type: "input", text: "Wat is de wortel van 64 (√64)?", answer: "8", hint: "Welk positief getal x zichzelf is 64?", explanation: "8 × 8 = 64, dus √64 = 8." },
        { type: "mc", text: "Rekenvolgorde: (5 + 3) x 2", options: ["16", "11", "13", "10"], answer: "16", hint: "Haakjes gaan ALTIJD voor!", explanation: "Eerst tussen haakjes: 5 + 3 = 8. Daarna 8 × 2 = 16." },
        { type: "input", text: "Oppervlakte driehoek met basis = 4 en hoogte = 5", answer: "10", hint: "Formule: 0,5 x basis x hoogte.", explanation: "0,5 × 4 × 5 = 10." },
        { type: "input", text: "Herleid: 2a · 3a", answer: "6a²", hint: "2 x 3 = 6, en a x a = a².", explanation: "2 × 3 = 6 en a × a = a², dus 6a²." },
        { type: "input", text: "Wat is 10% van €45?", answer: "4,50", hint: "Deel het bedrag door 10.", explanation: "€45 : 10 = €4,50." }
    ]
};

// --- GAME STATE VARIABLES ---
let gameMode = 'normal'; // 'normal' or 'timeattack'
let currentQuestions = [];
let qIndex = 0;
let sessionScore = 0;
let isAnswering = false;

let hintsLeft = 3;
let currentStreak = 0;
let maxStreak = 0;

let timerInterval = null;
let timeRemaining = 60;

// --- INITIALIZATION & NAVIGATION ---
function updateTopNav() {
    document.getElementById('nav-xp').innerText = player.xp + ' XP';
    
    // Equipped title update
    const currentTitleObj = shopItems.find(i => i.id === player.equippedTitle);
    if(currentTitleObj) {
        document.getElementById('title-text').innerText = currentTitleObj.titleText || currentTitleObj.name;
    }
}

function showScreen(id) {
    ['screen-lobby', 'screen-select', 'screen-shop', 'screen-game', 'screen-end'].forEach(sid => {
        document.getElementById(sid).classList.add('hidden-screen');
    });
    
    document.getElementById('top-nav').style.display = (id === 'screen-game' || id === 'screen-end') ? 'none' : 'flex';
    
    const target = document.getElementById(id);
    target.classList.remove('hidden-screen');
    target.classList.remove('pop-in');
    void target.offsetWidth; // trigger reflow
    target.classList.add('pop-in');

    if(id === 'screen-shop') renderShop();
    updateTopNav();
}

function goToLobby() {
    stopConfetti();
    if (timerInterval) clearInterval(timerInterval);
    showScreen('screen-lobby');
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- MISSION & GAME LOGIC ---
function startMission(category) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    gameMode = 'normal';
    hintsLeft = 3;
    currentStreak = 0;
    maxStreak = 0;
    
    let rawQuestions = JSON.parse(JSON.stringify(questionBanks[category] || questionBanks['mix']));
    currentQuestions = shuffle(rawQuestions).slice(0, 10);
    
    setupGameScreen();
}

function startToetsweekMode() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    gameMode = 'timeattack';
    hintsLeft = 3;
    currentStreak = 0;
    maxStreak = 0;
    timeRemaining = 60;
    
    // Combine questions from all categories
    let allQuestions = [];
    Object.keys(questionBanks).forEach(cat => {
        allQuestions = allQuestions.concat(questionBanks[cat]);
    });
    
    currentQuestions = shuffle(JSON.parse(JSON.stringify(allQuestions))).slice(0, 10);
    
    setupGameScreen();
    startTimer();
}

function setupGameScreen() {
    qIndex = 0;
    sessionScore = 0;
    
    // Apply locker skin styling
    const locker = document.getElementById('the-locker');
    locker.className = `locker-container locker-${player.equippedItem} w-full max-w-md p-5 sm:p-6 flex flex-col items-center relative z-10`;
    
    // Configure header visibility
    const timerContainer = document.getElementById('time-attack-timer-container');
    if (gameMode === 'timeattack') {
        timerContainer.classList.remove('hidden-screen');
        document.getElementById('timer-display').innerText = `${timeRemaining}s`;
    } else {
        timerContainer.classList.add('hidden-screen');
    }

    updateStreakUI();
    updateHintUI();
    
    showScreen('screen-game');
    loadNextQuestion();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        document.getElementById('timer-display').innerText = `${timeRemaining}s`;
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endMission();
        }
    }, 1000);
}

function updateStreakUI() {
    document.getElementById('streak-display').innerText = `${currentStreak}`;
    const streakContainer = document.getElementById('streak-container');
    
    if (currentStreak >= 3) {
        streakContainer.classList.add('ring-2', 'ring-orange-400');
    } else {
        streakContainer.classList.remove('ring-2', 'ring-orange-400');
    }
}

function updateHintUI() {
    document.getElementById('hints-left-count').innerText = hintsLeft;
    const btn = document.getElementById('hint-button');
    if (hintsLeft <= 0) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function useHint() {
    if (hintsLeft <= 0 || isAnswering) return;
    
    hintsLeft--;
    updateHintUI();
    
    const q = currentQuestions[qIndex];
    document.getElementById('hint-text').innerText = q.hint || "Geen specifieke hint beschikbaar. Reken zorgvuldig!";
    document.getElementById('hint-display-box').classList.remove('hidden-screen');
}

function loadNextQuestion() {
    if (qIndex >= currentQuestions.length) {
        if (timerInterval) clearInterval(timerInterval);
        endMission();
        return;
    }

    isAnswering = false;
    document.getElementById('explanation-box').classList.add('hidden-screen');
    document.getElementById('hint-display-box').classList.add('hidden-screen');

    const q = currentQuestions[qIndex];
    
    document.getElementById('level-display').innerText = `Code ${qIndex + 1}/10`;
    document.getElementById('game-score-display').innerText = sessionScore;
    document.getElementById('progress-bar').style.width = `${(qIndex / 10) * 100}%`;
    
    document.getElementById('question-text').innerText = q.text;

    const optionsContainer = document.getElementById('options-container');
    const inputContainer = document.getElementById('input-container');
    
    if (q.type === 'mc') {
        // Multiple Choice setup
        optionsContainer.classList.remove('hidden-screen');
        inputContainer.classList.add('hidden-screen');
        optionsContainer.innerHTML = '';

        const correctText = q.answer;
        let shuffledOptions = shuffle([...q.options]);

        shuffledOptions.forEach(optText => {
            const isCorrect = (optText === correctText);
            const btn = document.createElement('button');
            btn.className = "option-btn bg-white text-gray-800 font-black py-3.5 px-3 rounded-xl text-base sm:text-lg brand-font shadow-sm w-full";
            btn.innerText = optText;
            btn.dataset.correct = isCorrect;
            
            if(player.equippedItem === 'dark' || player.equippedItem === 'neon' || player.equippedItem === 'retro') {
                btn.classList.add('bg-opacity-90');
            }

            btn.onclick = () => processAnswer(isCorrect, correctText, q.explanation, btn);
            optionsContainer.appendChild(btn);
        });
    } else {
        // Open Input setup
        optionsContainer.classList.add('hidden-screen');
        inputContainer.classList.remove('hidden-screen');
        
        const inputField = document.getElementById('free-answer-input');
        inputField.value = '';
        inputField.disabled = false;
        document.getElementById('submit-input-btn').disabled = false;
        
        // Focus input field automatically
        setTimeout(() => inputField.focus(), 100);

        // Enter key handler
        inputField.onkeyup = (e) => {
            if (e.key === 'Enter') handleInputSubmit();
        };
    }
}

function normalizeAnswer(str) {
    if (!str) return '';
    return str.toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace('€', '')
        .replace('.', ',');
}

function handleInputSubmit() {
    if (isAnswering) return;
    
    const inputField = document.getElementById('free-answer-input');
    const userVal = normalizeAnswer(inputField.value);
    
    if (!userVal) return; // Don't submit empty

    const q = currentQuestions[qIndex];
    const targetVal = normalizeAnswer(q.answer);
    const isCorrect = (userVal === targetVal);

    inputField.disabled = true;
    document.getElementById('submit-input-btn').disabled = true;

    processAnswer(isCorrect, q.answer, q.explanation, null);
}

function processAnswer(isCorrect, correctText, explanationText, clickedBtn) {
    if (isAnswering) return;
    isAnswering = true;

    const allMcBtns = document.querySelectorAll('.option-btn');
    allMcBtns.forEach(b => b.disabled = true);
    
    if (isCorrect) {
        if (clickedBtn) {
            clickedBtn.classList.add('correct');
            clickedBtn.innerHTML += ' <i class="fa-solid fa-check ml-1"></i>';
        }
        
        sessionScore++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        
        if (currentStreak >= 3) {
            playSound('streak');
        } else {
            playSound('correct');
        }

        updateStreakUI();
        document.getElementById('game-score-display').innerText = sessionScore;

        setTimeout(() => {
            qIndex++;
            loadNextQuestion();
        }, 1100);
    } else {
        if (clickedBtn) {
            clickedBtn.classList.add('incorrect');
            clickedBtn.innerHTML += ' <i class="fa-solid fa-xmark ml-1"></i>';
        }
        
        currentStreak = 0;
        updateStreakUI();
        playSound('wrong');
        
        const locker = document.getElementById('the-locker');
        locker.classList.remove('shake');
        void locker.offsetWidth;
        locker.classList.add('shake');

        // Highlight correct answer if MC
        allMcBtns.forEach(b => {
            if (b.dataset.correct === 'true') {
                b.classList.add('correct');
                b.innerHTML += ' <i class="fa-solid fa-check ml-1"></i>';
            }
        });

        // Show Explanation Box
        document.getElementById('correct-answer-text').innerText = correctText;
        document.getElementById('explanation-text').innerText = explanationText || "Geen extra toelichting.";
        document.getElementById('explanation-box').classList.remove('hidden-screen');
    }
}

function nextQuestionAfterExplanation() {
    qIndex++;
    loadNextQuestion();
}

function endMission() {
    showScreen('screen-end');
    
    const scoreDisplay = document.getElementById('final-score');
    const titleDisplay = document.getElementById('end-title');
    const iconDisplay = document.getElementById('end-icon');
    const rewardBox = document.getElementById('reward-box');
    
    scoreDisplay.innerText = `${sessionScore}/10`;
    document.getElementById('end-max-streak').innerText = `${maxStreak}x`;

    const timeLeftRow = document.getElementById('end-time-left-row');
    if (gameMode === 'timeattack') {
        timeLeftRow.classList.remove('hidden-screen');
        document.getElementById('end-time-left').innerText = `${timeRemaining}s`;
    } else {
        timeLeftRow.classList.add('hidden-screen');
    }
    
    let baseXP = sessionScore * 10; // 10 XP per correct question
    let streakBonus = maxStreak * 5; // 5 XP per max streak
    
    if (sessionScore >= 8 || gameMode === 'timeattack') {
        let totalXP = baseXP + streakBonus;
        
        // Time Attack 2x multiplier
        if (gameMode === 'timeattack') {
            totalXP *= 2;
        }

        titleDisplay.innerText = sessionScore >= 8 ? "Kluisje Gekraakt!" : "Tijd is Om!";
        titleDisplay.className = "text-3xl sm:text-4xl md:text-5xl font-black text-green-600 mb-2 brand-font";
        iconDisplay.innerHTML = '<i class="fa-solid fa-door-open text-green-500"></i>';
        scoreDisplay.className = "text-6xl sm:text-7xl font-black brand-font mb-2 text-green-500";
        
        rewardBox.classList.remove('hidden-screen');
        document.getElementById('earned-xp-amount').innerText = totalXP;

        let bonusMsg = [];
        if (streakBonus > 0) bonusMsg.push(`+${streakBonus} Streak Bonus`);
        if (gameMode === 'timeattack') bonusMsg.push(`2x Toetsweek Multiplier`);
        document.getElementById('bonus-xp-note').innerText = bonusMsg.join(' • ');

        player.xp += totalXP;
        playSound('win');
        startConfetti();
    } else {
        // LOST (< 8 correct in normal mode)
        titleDisplay.innerText = "Kluisje Blijft Dicht!";
        titleDisplay.className = "text-3xl sm:text-4xl md:text-5xl font-black text-red-600 mb-2 brand-font";
        iconDisplay.innerHTML = '<i class="fa-solid fa-lock text-red-500"></i>';
        scoreDisplay.className = "text-6xl sm:text-7xl font-black brand-font mb-2 text-red-500";
        
        rewardBox.classList.add('hidden-screen'); // No XP
        playSound('fail');
    }
}

// --- SHOP SYSTEM ---
function switchShopTab(tab) {
    activeShopTab = tab;
    
    document.getElementById('shop-tab-skins').className = tab === 'skins' 
        ? "px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 text-white transition"
        : "px-4 py-2 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition";

    document.getElementById('shop-tab-titles').className = tab === 'titles' 
        ? "px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 text-white transition"
        : "px-4 py-2 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition";

    renderShop();
}

function renderShop() {
    const container = document.getElementById('shop-items-container');
    container.innerHTML = '';
    
    const filteredItems = shopItems.filter(i => activeShopTab === 'skins' ? i.type === 'skin' : i.type === 'title');

    filteredItems.forEach(item => {
        const isOwned = item.type === 'skin' ? player.ownedItems.includes(item.id) : player.ownedTitles.includes(item.id);
        const isEquipped = item.type === 'skin' ? player.equippedItem === item.id : player.equippedTitle === item.id;
        
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center text-center relative";
        
        if (isEquipped) {
            card.classList.add('border-indigo-500', 'ring-4', 'ring-indigo-100');
        }

        let btnHTML = '';
        if (isEquipped) {
            btnHTML = `<button disabled class="w-full mt-4 bg-gray-200 text-gray-500 font-bold py-2 rounded-xl text-sm uppercase">Uitgerust</button>`;
        } else if (isOwned) {
            btnHTML = `<button onclick="equipShopItem('${item.id}', '${item.type}')" class="game-btn w-full mt-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold py-2 rounded-xl text-sm uppercase">Equip</button>`;
        } else {
            const canAfford = player.xp >= item.cost;
            const btnClass = canAfford ? 'bg-pink-500 hover:bg-pink-400 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed';
            btnHTML = `<button onclick="buyShopItem('${item.id}', ${item.cost}, '${item.type}')" ${!canAfford ? 'disabled' : ''} class="game-btn w-full mt-4 ${btnClass} font-bold py-2 rounded-xl text-sm flex items-center justify-center">
                <i class="fa-solid fa-star mr-1 text-xs"></i> ${item.cost} XP
            </button>`;
        }

        card.innerHTML = `
            <div class="w-16 h-16 rounded-xl ${item.color} flex items-center justify-center text-white text-2xl mb-3 shadow-inner">
                <i class="fa-solid ${item.icon}"></i>
            </div>
            <h4 class="font-bold brand-font text-gray-800">${item.name}</h4>
            ${btnHTML}
        `;
        container.appendChild(card);
    });
}

function buyShopItem(id, cost, type) {
    if (player.xp >= cost) {
        player.xp -= cost;
        if (type === 'skin') {
            player.ownedItems.push(id);
            player.equippedItem = id;
        } else {
            player.ownedTitles.push(id);
            player.equippedTitle = id;
        }
        playSound('buy');
        updateTopNav();
        renderShop();
    }
}

function equipShopItem(id, type) {
    if (type === 'skin' && player.ownedItems.includes(id)) {
        player.equippedItem = id;
    } else if (type === 'title' && player.ownedTitles.includes(id)) {
        player.equippedTitle = id;
    }
    updateTopNav();
    renderShop();
}

// --- CONFETTI ANIMATION ---
let confettiLoop;
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

function startConfetti() {
    canvas.style.display = 'block';
    resizeCanvas();
    particles = [];
    const colors = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
    
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 4 + 3,
            speedX: Math.random() * 3 - 1.5,
            rot: Math.random() * 360,
            rotSpeed: Math.random() * 5 - 2.5
        });
    }
    
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i=0; i<particles.length; i++) {
            let p = particles[i];
            ctx.save();
            ctx.translate(p.x + p.size/2, p.y + p.size/2);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
            
            p.y += p.speedY;
            p.x += p.speedX;
            p.rot += p.rotSpeed;
            
            if(p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
        }
        confettiLoop = requestAnimationFrame(render);
    }
    render();
    setTimeout(stopConfetti, 4000);
}

function stopConfetti() {
    if(confettiLoop) cancelAnimationFrame(confettiLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
}

// Initial Call
updateTopNav();