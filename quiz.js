'use strict';

// ── Tracking ──
// Make.com Webhook-URL hier eintragen, sobald das Szenario erstellt wurde.
// Solange leer, passiert nichts (kein Fehler, kein Block).
var WEBHOOK_URL = '';

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function sendEvent(payload) {
  if (!WEBHOOK_URL) return;
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function () {});
}

document.addEventListener('DOMContentLoaded', function () {
  const fd = window.FunnelData;
  const { QUESTIONS, saveData, calculateScores, calculateTotalSavings } = fd;
  const TOTAL_QUESTIONS = QUESTIONS.length; // 11

  let currentStep = 0;
  let answers = {};
  let selectedOption = null;

  // Session starten und tracken
  var sessionId = generateSessionId();
  sendEvent({
    event: 'quiz_started',
    session_id: sessionId,
    started_at: new Date().toISOString(),
    source_url: window.location.href,
    referrer: document.referrer
  });

  // ── Build Progress Bar ──
  function buildProgressBar() {
    const bar = document.getElementById('progressBar');
    bar.innerHTML = '';
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const seg = document.createElement('div');
      seg.className = 'progress-segment';
      seg.id = 'seg-' + i;
      bar.appendChild(seg);
    }
  }

  function updateProgressBar() {
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const seg = document.getElementById('seg-' + i);
      if (!seg) continue;
      seg.className = 'progress-segment';
      if (i < currentStep) seg.classList.add('done');
      else if (i === currentStep) seg.classList.add('active');
    }
  }

  // ── Build Questions ──
  function buildQuestions() {
    const wrap = document.getElementById('questionsWrap');
    wrap.innerHTML = '';

    QUESTIONS.forEach(function (q, idx) {
      const step = document.createElement('div');
      step.className = 'question-step';
      step.id = 'step-' + idx;

      const optionsHtml = q.options.map(function (opt) {
        return '<div class="funnel-option" data-value="' + opt.value + '" data-step="' + idx + '">' +
          '<div class="funnel-radio"></div>' +
          '<span class="funnel-option-text">' + opt.label + '</span>' +
          '</div>';
      }).join('');

      step.innerHTML =
        '<div class="funnel-card">' +
        '<div class="quiz-counter">Frage ' + (idx + 1) + ' von ' + TOTAL_QUESTIONS + '</div>' +
        '<div class="question-text">' + q.text + '</div>' +
        '<div class="options-wrap">' + optionsHtml + '</div>' +
        '</div>';

      wrap.appendChild(step);
    });

    // Delegate click on all options
    document.getElementById('questionsWrap').addEventListener('click', function (e) {
      const opt = e.target.closest('.funnel-option');
      if (!opt) return;
      const stepIdx = parseInt(opt.dataset.step, 10);
      if (stepIdx !== currentStep) return;

      opt.closest('.options-wrap').querySelectorAll('.funnel-option').forEach(function (o) {
        o.classList.remove('active');
      });
      opt.classList.add('active');
      selectedOption = opt.dataset.value;

      document.getElementById('nextBtn').disabled = false;
    });
  }

  // ── Show Step ──
  function showStep(idx) {
    document.querySelectorAll('.question-step').forEach(function (s) {
      s.classList.remove('active');
    });
    document.getElementById('leadSection').classList.remove('active');
    document.getElementById('quizNav').style.display = 'flex';

    if (idx < TOTAL_QUESTIONS) {
      const step = document.getElementById('step-' + idx);
      if (step) step.classList.add('active');

      const q = QUESTIONS[idx];
      const prevAnswer = answers[q.id];
      selectedOption = prevAnswer || null;

      if (step) {
        step.querySelectorAll('.funnel-option').forEach(function (opt) {
          opt.classList.remove('active');
          if (opt.dataset.value === prevAnswer) opt.classList.add('active');
        });
      }

      const backBtn = document.getElementById('backBtn');
      if (idx === 0) backBtn.classList.add('hidden');
      else backBtn.classList.remove('hidden');

      const nextBtn = document.getElementById('nextBtn');
      nextBtn.disabled = !prevAnswer;
      nextBtn.textContent = idx === TOTAL_QUESTIONS - 1 ? 'Zum Ergebnis \u2192' : 'Weiter \u2192';

    } else {
      document.getElementById('quizNav').style.display = 'none';
      document.getElementById('leadSection').classList.add('active');
    }

    updateProgressBar();
  }

  // ── Next ──
  document.getElementById('nextBtn').addEventListener('click', function () {
    if (!selectedOption) return;
    answers[QUESTIONS[currentStep].id] = selectedOption;
    currentStep++;
    selectedOption = null;
    showStep(currentStep >= TOTAL_QUESTIONS ? TOTAL_QUESTIONS : currentStep);
  });

  // ── Back ──
  document.getElementById('backBtn').addEventListener('click', function () {
    if (currentStep <= 0) return;
    currentStep--;
    selectedOption = answers[QUESTIONS[currentStep].id] || null;
    showStep(currentStep);
  });

  // ── Lead Form Back ──
  document.getElementById('leadBackBtn').addEventListener('click', function () {
    currentStep = TOTAL_QUESTIONS - 1;
    showStep(currentStep);
  });

  // ── Lead Form Submit ──
  document.getElementById('leadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var vorname   = document.getElementById('vorname').value.trim();
    var nachname  = document.getElementById('nachname').value.trim();
    var email     = document.getElementById('email').value.trim();
    var consent   = document.getElementById('consent').checked;

    if (!vorname || !nachname) {
      showFormError('Bitte trage Vor- und Nachname ein.'); return;
    }
    if (!email || !email.includes('@')) {
      showFormError('Bitte trage eine g\u00fcltige E-Mail-Adresse ein.'); return;
    }
    if (!consent) {
      showFormError('Bitte stimme der Datenspeicherung zu, um fortzufahren.'); return;
    }

    document.getElementById('formError').style.display = 'none';

    var data = Object.assign({}, answers, {
      vorname:     vorname,
      nachname:    nachname,
      email:       email,
      unternehmen: document.getElementById('unternehmen').value.trim(),
      website:     document.getElementById('website').value.trim(),
      lead_type:   answers.q11_implementation || 'explore_lead',
      timestamp:   new Date().toISOString()
    });

    // Scores berechnen und Lead-Event senden
    var result  = calculateScores(data);
    var savings = calculateTotalSavings(result.top3);
    sendEvent({
      event:                    'lead_captured',
      session_id:               sessionId,
      vorname:                  data.vorname,
      nachname:                 data.nachname,
      email:                    data.email,
      unternehmen:              data.unternehmen,
      website:                  data.website,
      lead_type:                data.lead_type,
      total_score:              Math.round(result.totalScore),
      top3:                     result.top3.join(', '),
      score_angebotsprozess:    result.scores.angebotsprozess,
      score_terminbuchung:      result.scores.terminbuchung,
      score_onboarding:         result.scores.onboarding,
      score_marketing:          result.scores.marketing,
      score_projektorganisation:result.scores.projektorganisation,
      score_dokumentation:      result.scores.dokumentation,
      savings_weekly:           savings.weekly,
      savings_yearly:           savings.yearly,
      q1_industry:              data.q1_industry,
      q2_size:                  data.q2_size,
      captured_at:              new Date().toISOString()
    });

    saveData(data);
    window.location.href = 'analyse.html';
  });

  function showFormError(msg) {
    var el = document.getElementById('formError');
    el.textContent = msg;
    el.style.display = 'block';
  }

  // ── Init ──
  buildProgressBar();
  buildQuestions();
  showStep(0);
});
