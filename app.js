let player = {
    xp: 0,
    ownedItems: ['default'],
    equippedItem: 'default'
};

const shopItems = [
    { id: 'default', name: 'Standaard Grijs', cost: 0, icon: 'fa-box', color: 'bg-slate-300', desc: 'Het vertrouwde, oersaaie schoolkluisje.' },
    { id: 'neon', name: 'Neon Hacker', cost: 200, icon: 'fa-bolt', color: 'bg-cyan-400', desc: 'Licht op in het donker. Perfect voor cyber-coders.' },
    { id: 'camo', name: 'Stealth Camo', cost: 300, icon: 'fa-user-secret', color: 'bg-green-700', desc: 'Verdwijn geruisloos in de school wandelgangen.' },
    { id: 'gold', name: 'Gouden VIP', cost: 500, icon: 'fa-crown', color: 'bg-yellow-400', desc: 'Laat iedereen zien wie de baas van de gang is.' },
    { id: 'fire', name: 'Fire Blast', cost: 750, icon: 'fa-fire-flame-curved', color: 'bg-orange-600', desc: 'Voor als je letterlijk "on fire" bent met je streaks!' },
    { id: 'dark', name: 'Dark Mode', cost: 1000, icon: 'fa-moon', color: 'bg-gray-800', desc: 'Rustig voor de ogen, gevaarlijk voor wiskunde-sommen.' },
    { id: 'holo', name: 'Holo-Locker', cost: 1500, icon: 'fa-vr-cardboard', color: 'bg-fuchsia-400', desc: 'Rechtstreeks geteleporteerd uit het jaar 2050.' },
    { id: 'diamond', name: 'Diamond Flex', cost: 3000, icon: 'fa-gem', color: 'bg-cyan-200', desc: 'De ultieme status. Onbreekbaar en ultra-shiny.' }
];

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
}

const questionBanks = {
    groep8: [
        { type: 'mc', text: "Wat is 3/4 + 1/8?", options: ["7/8", "4/12", "4/8", "5/8"], answer: 0, hint: "Maak de noemers (onderkant) gelijk: 3/4 = 6/8" },
        { type: 'mc', text: "Een jas van €120 krijgt 15% korting. Wat betaal je?", options: ["€102", "€105", "€18", "€95"], answer: 0, hint: "10% is €12. 5% is de helft daarvan (€6). Tel dat op en haal het van €120 af." },
        { type: 'input', text: "Reken uit: 12,5 : 0,5", answer: "25", hint: "Delen door een half (0,5) is hetzelfde als vermenigvuldigen met 2!" },
        { type: 'mc', text: "Wat is 5/8 deel van 640?", options: ["400", "300", "500", "480"], answer: 0, hint: "Bereken eerst 1/8 deel door 640 te delen door 8." },
        { type: 'mc', text: "4/5 is gelijk aan hoeveel procent?", options: ["80%", "40%", "45%", "60%"], answer: 0, hint: "1/5 is 20%. Hoeveel is 4 keer dat?" },
        { type: 'input', text: "Reken uit: 0,05 x 1000", answer: "50", hint: "Verschuif de komma 3 plekken naar rechts (want er zijn 3 nullen)." },
        { type: 'mc', text: "De helft van 1/4 is...", options: ["1/8", "1/2", "2/4", "1/6"], answer: 0, hint: "Als je een pizza in 4 stukken snijdt, en je snijdt zo'n stuk doormidden..." },
        { type: 'mc', text: "Wat is groter: 5/8 of 2/3?", options: ["2/3", "5/8", "Ze zijn gelijk", "Kan niet"], answer: 0, hint: "Maak ze gelijknamig: 24 is een handige noemer (15/24 vs 16/24)." },
        { type: 'input', text: "Reken uit: 840 : 12", answer: "70", hint: "Denk aan de tafel van 12: 84 : 12 = 7." },
        { type: 'mc', text: "Vereenvoudig breuk: 16/24", options: ["2/3", "4/6", "3/4", "1/2"], answer: 0, hint: "Deel de boven- en onderkant door het grootst mogelijke getal (8)." },
        { type: 'mc', text: "Hoeveel centimeter is 1,5 meter?", options: ["150 cm", "15 cm", "1500 cm", "0,1 cm"], answer: 0, hint: "1 meter is 100 centimeter." },
        { type: 'input', text: "Reken uit: 25% van 200", answer: "50", hint: "25% is hetzelfde als 1/4 deel. Deel 200 door 4." },
        { type: 'mc', text: "Een film begint om 19:45 en duurt 90 min. Hoe laat is hij afgelopen?", options: ["21:15", "21:00", "20:35", "21:30"], answer: 0, hint: "90 minuten is 1 uur en 30 minuten erbij optellen." },
        { type: 'input', text: "Omtrek van een vierkant met zijden van 5 cm?", answer: "20", hint: "Omtrek = alle vier de randen bij elkaar opgeteld." },
        { type: 'mc', text: "3 broden van €2,10. Je betaalt met €10. Wisselgeld?", options: ["€3,70", "€4,70", "€6,30", "€2,70"], answer: 0, hint: "3 x €2,10 = €6,30. Haal dat van €10,00 af." }
    ],
    negatief: [
        { type: 'mc', text: "-8 + 15 = ?", options: ["7", "-7", "67", "-23"], answer: 0, hint: "Je staat €8 in de min en krijgt er €15 bij. Waar kom je uit?" },
        { type: 'input', text: "-4 - 9 = ?", answer: "-13", hint: "Je bent al op -4 op de getallenlijn en gaat nog 9 stappen verder naar beneden." },
        { type: 'mc', text: "12 - 18 = ?", options: ["-6", "6", "30", "0"], answer: 0, hint: "Je trekt er meer af dan je hebt, dus je komt onder de nul uit." },
        { type: 'mc', text: "-5 - (-7) = ?", options: ["2", "-12", "12", "-2"], answer: 0, hint: "Let op de rekenregel: min min wordt plus! Dus: -5 + 7." },
        { type: 'input', text: "-10 + (-5) = ?", answer: "-15", hint: "Plus min wordt min. Je telt eigenlijk twee negatieve getallen bij elkaar op." },
        { type: 'mc', text: "(-3) x 6 = ?", options: ["-18", "18", "9", "-9"], answer: 0, hint: "Positief x negatief = negatief." },
        { type: 'mc', text: "(-4) x (-5) = ?", options: ["20", "-20", "9", "-9"], answer: 0, hint: "Negatief x negatief = positief!" },
        { type: 'input', text: "20 : (-4) = ?", answer: "-5", hint: "Positief gedeeld door negatief is altijd negatief." },
        { type: 'mc', text: "-8 - 2 + 5 = ?", options: ["-5", "-1", "-15", "5"], answer: 0, hint: "Doe het stap voor stap van links naar rechts. Eerst -8 - 2." },
        { type: 'input', text: "0 - 15 = ?", answer: "-15", hint: "Vanaf de 0 vijftien stappen naar beneden tellen." }
    ],
    algebra: [
        { type: 'mc', text: "Herleid: 3a + 5a", options: ["8a", "15a", "8a²", "35a"], answer: 0, hint: "Gelijksoortige termen! 3 appels + 5 appels = ?" },
        { type: 'mc', text: "Herleid: 7x - 2x + x", options: ["6x", "4x", "5x", "8x"], answer: 0, hint: "Een losse 'x' betekent eigenlijk + 1x." },
        { type: 'mc', text: "Herleid: 4a + 3b - 2a", options: ["2a + 3b", "5ab", "7ab - 2a", "6ab"], answer: 0, hint: "Je mag alleen dezelfde letters (gelijksoortige termen) optellen of aftrekken." },
        { type: 'mc', text: "Herleid: 3x · 4y", options: ["12xy", "7xy", "12x+y", "34xy"], answer: 0, hint: "Bij vermenigvuldigen: Doe de getallen keer elkaar, en plak de letters erachter." },
        { type: 'input', text: "Herleid: a · a (typ 'a2' voor a²)", answer: "a2", hint: "Een letter keer zichzelf is die letter in het kwadraat." },
        { type: 'mc', text: "Als x = 3, wat is dan 4x + 2?", options: ["14", "12", "9", "24"], answer: 0, hint: "Tussen een getal en een letter staat een onzichtbaar keerteken. Dus 4 keer 3." },
        { type: 'input', text: "Herleid: 5p - p", answer: "4p", hint: "Er staat eigenlijk 5p - 1p." },
        { type: 'mc', text: "Herleid: -2a · 3b", options: ["-6ab", "-5ab", "ab", "-6a+b"], answer: 0, hint: "Negatief getal keer positief getal is een negatief antwoord." }
    ],
    mix: [
        { type: 'input', text: "Bereken: 5²", answer: "25", hint: "Het kwadraat betekent het getal keer zichzelf (5 x 5)." },
        { type: 'mc', text: "Bereken: (-3)²", options: ["9", "-9", "-6", "6"], answer: 0, hint: "Door de haakjes doe je: (-3) x (-3). Min keer min is plus!" },
        { type: 'mc', text: "Bereken: -3²", options: ["-9", "9", "-6", "6"], answer: 0, hint: "Let op! Er staan geen haakjes, dus alleen de 3 staat in het kwadraat." },
        { type: 'mc', text: "Rekenvolgorde: 10 - 2 x 3", options: ["4", "24", "16", "5"], answer: 0, hint: "Vermenigvuldigen gaat altijd vóór aftrekken." },
        { type: 'input', text: "Bereken: 2³", answer: "8", hint: "Twee tot de derde macht: 2 x 2 x 2." },
        { type: 'mc', text: "Wortel van 64 (√64)", options: ["8", "32", "6", "4"], answer: 0, hint: "Welk getal levert keer zichzelf precies 64 op?" }
    ]
};

let currentQuestions = [];
let qIndex = 0;
let sessionScore = 0;
let isAnswering = false;
let gameMode = 'normal';
let timeLeft = 60;
let timerInterval = null;
let currentStreak = 0;
let hintsLeft = 3;

function updateTopNav() {
    document.getElementById('nav-xp').innerText = player.xp + ' XP';
}

function showScreen(id) {
    ['screen-lobby', 'screen-select', 'screen-shop', 'screen-game', 'screen-end'].forEach(sid => {
        document.getElementById(sid).classList.add('hidden-screen');
    });
    document.getElementById('top-nav').style.display = (id === 'screen-game' || id === 'screen-end') ? 'none' : 'flex';
    
    const target = document.getElementById(id);
    target.classList.remove('hidden-screen', 'pop-in');
    void target.offsetWidth;
    target.classList.add('pop-in');

    if(id === 'screen-shop') renderShop();
    updateTopNav();
}

function goToLobby() {
    stopConfetti();
    showScreen('screen-lobby');
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startMission(category, mode = 'normal') {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    gameMode = mode;
    let rawQuestions = JSON.parse(JSON.stringify(questionBanks[category]));
    currentQuestions = shuffle(rawQuestions).slice(0, 10);
    
    qIndex = 0;
    sessionScore = 0;
    currentStreak = 0;
    hintsLeft = 3;
    
    document.getElementById('streak-count').innerText = "0";
    document.getElementById('streak-display').classList.replace('opacity-100', 'opacity-50');
    document.getElementById('streak-display').classList.remove('fire-glow', 'text-red-500');
    document.getElementById('streak-display').classList.add('text-orange-400');
    
    const hintBtn = document.getElementById('hint-btn');
    document.getElementById('hint-count').innerText = hintsLeft;
    hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    const timerDisp = document.getElementById('timer-display');
    if (gameMode === 'time_attack') {
        timeLeft = 60;
        timerDisp.classList.remove('hidden-screen', 'text-red-500', 'animate-pulse');
        timerDisp.classList.add('text-red-400');
        document.getElementById('timer-time').innerText = timeLeft + 's';
        startTimer();
    } else {
        timerDisp.classList.add('hidden-screen');
        clearInterval(timerInterval);
    }

    const locker = document.getElementById('the-locker');
    locker.className = `locker-container locker-${player.equippedItem} w-full max-w-md p-6 flex flex-col items-center relative z-10`;
    
    showScreen('screen-game');
    loadNextQuestion();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        const timerDisp = document.getElementById('timer-display');
        document.getElementById('timer-time').innerText = timeLeft + 's';
        
        if (timeLeft <= 10) {
            timerDisp.classList.add('text-red-500', 'animate-pulse');
            timerDisp.classList.remove('text-red-400');
            if(timeLeft > 0) playTone(400, 'square', 0.1, 0.1);
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playSound('fail');
            endMission(true);
        }
    }, 1000);
}

function useHint() {
    if (hintsLeft > 0) {
        hintsLeft--;
        document.getElementById('hint-count').innerText = hintsLeft;
        document.getElementById('hint-text').innerText = currentQuestions[qIndex].hint;
        document.getElementById('hint-modal').classList.remove('hidden-screen');

        if (hintsLeft === 0) {
            document.getElementById('hint-btn').classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

function closeHint() {
    document.getElementById('hint-modal').classList.add('hidden-screen');
}

function loadNextQuestion() {
    if (qIndex >= currentQuestions.length) {
        endMission();
        return;
    }

    isAnswering = false;
    const q = currentQuestions[qIndex];
    
    document.getElementById('level-display').innerText = `Code ${qIndex + 1}/10`;
    document.getElementById('game-score-display').innerText = sessionScore;
    document.getElementById('progress-bar').style.width = `${(qIndex / 10) * 100}%`;
    document.getElementById('question-text').innerText = q.text;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    if (q.type === 'mc') {
        const correctText = q.options[q.answer];
        let shuffledOptions = shuffle([...q.options]);

        shuffledOptions.forEach(optText => {
            const isCorrect = (optText === correctText);
            const btn = document.createElement('button');
            btn.className = "option-btn bg-white text-gray-800 font-black py-4 px-3 rounded-xl text-lg brand-font shadow-sm w-full";
            btn.innerText = optText;
            
            const darkThemes = ['dark', 'neon', 'camo', 'fire', 'holo'];
            if(darkThemes.includes(player.equippedItem)) btn.classList.add('bg-opacity-90');

            btn.onclick = () => handleAnswer(btn, isCorrect);
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'input') {
        optionsContainer.innerHTML = `
        <div class="col-span-1 sm:col-span-2 flex flex-col items-center w-full pop-in">
            <input type="text" id="lock-input" autocomplete="off" class="text-center text-3xl font-black p-4 w-full max-w-[250px] rounded-xl border-4 border-gray-300 focus:border-indigo-500 focus:outline-none mb-4 text-gray-800 shadow-inner" placeholder="Typ code...">
            <button onclick="checkInputAnswer()" id="lock-submit-btn" class="game-btn bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl text-xl brand-font w-full max-w-[250px] uppercase">
                Kraak 'm <i class="fa-solid fa-key ml-1"></i>
            </button>
        </div>
        `;
        document.getElementById('lock-input').focus();
        document.getElementById('lock-input').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') checkInputAnswer();
        });
    }
}

function checkInputAnswer() {
    if (isAnswering) return;
    const inputEl = document.getElementById('lock-input');
    const submitBtn = document.getElementById('lock-submit-btn');
    
    if(!inputEl.value.trim()) return;

    const userAnswer = inputEl.value.trim().toLowerCase();
    const correctAnswer = currentQuestions[qIndex].answer.toLowerCase();
    const isCorrect = (userAnswer === correctAnswer);
    
    if(isCorrect) {
        inputEl.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
        submitBtn.classList.replace('bg-indigo-600', 'bg-green-600');
        submitBtn.innerHTML = "GOED! <i class='fa-solid fa-check'></i>";
    } else {
        inputEl.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
        submitBtn.classList.replace('bg-indigo-600', 'bg-red-600');
        submitBtn.innerHTML = "FOUT! <i class='fa-solid fa-xmark'></i>";
    }

    handleAnswer(null, isCorrect, true);
}

function handleAnswer(btn, isCorrect, isInput = false) {
    if (isAnswering) return;
    isAnswering = true;

    if (isCorrect) {
        if(!isInput && btn) {
            btn.classList.add('correct');
            btn.innerHTML += ' <i class="fa-solid fa-check ml-1"></i>';
        }
        playSound('correct');
        sessionScore++;
        document.getElementById('game-score-display').innerText = sessionScore;
        
        currentStreak++;
        updateStreakUI();

        setTimeout(() => {
            qIndex++;
            loadNextQuestion();
        }, 1200);

    } else {
        if(!isInput && btn) {
            btn.classList.add('incorrect');
            btn.innerHTML += ' <i class="fa-solid fa-xmark ml-1"></i>';
        }

        const q = currentQuestions[qIndex];
        if (q.type === 'mc') {
            const optionsContainer = document.getElementById('options-container');
            const buttons = optionsContainer.querySelectorAll('button');
            buttons.forEach(b => {
                if (b.innerText.trim() === q.options[q.answer]) {
                    b.classList.add('correct');
                }
            });
        }

        playSound('wrong');
        currentStreak = 0;
        updateStreakUI();

        const locker = document.getElementById('the-locker');
        locker.classList.remove('shake');
        void locker.offsetWidth;
        locker.classList.add('shake');

        setTimeout(() => {
            showFeedbackModal();
        }, 800);
    }
}

function showFeedbackModal() {
    if(document.activeElement) document.activeElement.blur();
    if (gameMode === 'time_attack') clearInterval(timerInterval);

    const q = currentQuestions[qIndex];
    let correctAnswerText = (q.type === 'mc') ? q.options[q.answer] : q.answer;

    document.getElementById('feedback-correct-answer').innerText = correctAnswerText;
    const explanationText = q.hint ? `💡 ${q.hint}` : "Bekijk de rekenregels goed en probeer de stappen te herhalen.";
    document.getElementById('feedback-explanation').innerText = explanationText;

    document.getElementById('feedback-modal').classList.remove('hidden-screen');
}

function closeFeedback() {
    document.getElementById('feedback-modal').classList.add('hidden-screen');
    if (gameMode === 'time_attack') startTimer();

    qIndex++;
    loadNextQuestion();
}

function updateStreakUI() {
    const streakDisp = document.getElementById('streak-display');
    const streakCount = document.getElementById('streak-count');
    streakCount.innerText = currentStreak;
    
    if (currentStreak >= 3) {
        streakDisp.classList.replace('opacity-50', 'opacity-100');
        streakDisp.classList.add('fire-glow', 'text-red-500');
        streakDisp.classList.remove('text-orange-400');
    } else {
        streakDisp.classList.replace('opacity-100', 'opacity-50');
        streakDisp.classList.remove('fire-glow', 'text-red-500');
        streakDisp.classList.add('text-orange-400');
    }
}

function endMission(outOfTime = false) {
    clearInterval(timerInterval);
    showScreen('screen-end');
    
    const scoreDisplay = document.getElementById('final-score');
    const titleDisplay = document.getElementById('end-title');
    const iconDisplay = document.getElementById('end-icon');
    const rewardBox = document.getElementById('reward-box');
    const streakBox = document.getElementById('streak-bonus-box');
    
    scoreDisplay.innerText = `${sessionScore}/10`;
    
    if (outOfTime) {
        titleDisplay.innerText = "Tijd is op!";
        titleDisplay.className = "text-4xl md:text-5xl font-black text-red-600 mb-2 brand-font";
        iconDisplay.innerHTML = '<i class="fa-solid fa-clock text-red-500"></i>';
        scoreDisplay.className = "text-7xl font-black brand-font mb-2 text-red-500";
        
        rewardBox.classList.add('hidden-screen');
        streakBox.classList.add('hidden-screen');
    } else if (sessionScore >= 8) {
        titleDisplay.innerText = "Kluisje Gekraakt!";
        titleDisplay.className = "text-4xl md:text-5xl font-black text-green-600 mb-2 brand-font";
        iconDisplay.innerHTML = '<i class="fa-solid fa-door-open text-green-500"></i>';
        scoreDisplay.className = "text-7xl font-black brand-font mb-2 text-green-500";
        
        let baseReward = gameMode === 'time_attack' ? 200 : 100;
        let streakBonus = currentStreak >= 3 ? currentStreak * 10 : 0;

        document.getElementById('base-xp-reward').innerText = baseReward;
        rewardBox.classList.remove('hidden-screen');
        rewardBox.classList.add('flex');
        
        if(streakBonus > 0) {
            document.getElementById('streak-xp-reward').innerText = streakBonus;
            streakBox.classList.remove('hidden-screen');
            streakBox.classList.add('flex');
        } else {
            streakBox.classList.add('hidden-screen');
            streakBox.classList.remove('flex');
        }

        player.xp += (baseReward + streakBonus);
        playSound('win');
        startConfetti();
    } else {
        titleDisplay.innerText = "Kluisje Blijft Dicht!";
        titleDisplay.className = "text-4xl md:text-5xl font-black text-red-600 mb-2 brand-font";
        iconDisplay.innerHTML = '<i class="fa-solid fa-lock text-red-500"></i>';
        scoreDisplay.className = "text-7xl font-black brand-font mb-2 text-red-500";
        
        rewardBox.classList.add('hidden-screen');
        streakBox.classList.add('hidden-screen');
        playSound('fail');
    }
}

function renderShop() {
    const container = document.getElementById('shop-items-container');
    container.innerHTML = '';
    
    shopItems.forEach(item => {
        const isOwned = player.ownedItems.includes(item.id);
        const isEquipped = player.equippedItem === item.id;
        
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center text-center relative";
        if (isEquipped) card.classList.add('border-indigo-500', 'ring-4', 'ring-indigo-100');

        let btnHTML = '';
        if (isEquipped) {
            btnHTML = `<button disabled class="w-full mt-auto bg-gray-200 text-gray-500 font-bold py-2 rounded-xl text-sm uppercase">Uitgerust</button>`;
        } else if (isOwned) {
            btnHTML = `<button onclick="equipItem('${item.id}')" class="game-btn w-full mt-auto bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold py-2 rounded-xl text-sm uppercase">Equip</button>`;
        } else {
            const canAfford = player.xp >= item.cost;
            const btnClass = canAfford ? 'bg-pink-500 hover:bg-pink-400 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed';
            btnHTML = `<button onclick="buyItem('${item.id}', ${item.cost})" ${!canAfford ? 'disabled' : ''} class="game-btn w-full mt-auto ${btnClass} font-bold py-2 rounded-xl text-sm flex items-center justify-center">
            <i class="fa-solid fa-star mr-1 text-xs"></i> ${item.cost}
            </button>`;
        }

        card.innerHTML = `
        <div class="w-16 h-16 rounded-xl ${item.color} flex items-center justify-center text-white text-2xl mb-3 shadow-inner">
            <i class="fa-solid ${item.icon}"></i>
        </div>
        <h4 class="font-bold brand-font text-gray-800 mb-1">${item.name}</h4>
        <p class="text-xs text-gray-500 mb-4 h-10 flex items-center justify-center">${item.desc}</p>
        ${btnHTML}
        `;
        container.appendChild(card);
    });
}

function buyItem(id, cost) {
    if (player.xp >= cost && !player.ownedItems.includes(id)) {
        player.xp -= cost;
        player.ownedItems.push(id);
        player.equippedItem = id;
        playSound('buy');
        updateTopNav();
        renderShop();
    }
}

function equipItem(id) {
    if (player.ownedItems.includes(id)) {
        player.equippedItem = id;
        renderShop();
    }
}

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

updateTopNav();