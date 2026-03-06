'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var fd = window.FunnelData;
  var loadData             = fd.loadData;
  var calculateScores      = fd.calculateScores;
  var getScoreLabel        = fd.getScoreLabel;
  var getScoreDescription  = fd.getScoreDescription;
  var calculateTotalSavings= fd.calculateTotalSavings;
  var CATEGORIES           = fd.CATEGORIES;
  var INDUSTRY_TIPS        = fd.INDUSTRY_TIPS;

  // Guard: redirect if no data
  var data = loadData();
  if (!data) {
    window.location.href = 'index.html';
    return;
  }

  // ── Calculate ──
  var result    = calculateScores(data);
  var scores    = result.scores;
  var totalScore= result.totalScore;
  var top3      = result.top3;
  var savings   = calculateTotalSavings(top3);
  var weekly    = savings.weekly;
  var yearly    = savings.yearly;
  var leadType  = data.lead_type || 'explore_lead';

  // Save computed results back
  data.scores      = scores;
  data.total_score = totalScore;
  data.top3        = top3;
  fd.saveData(data);

  // ── Score Ring + Labels ──
  function renderScore() {
    var numberEl = document.getElementById('scoreNumber');
    var current  = 0;
    var stepVal  = totalScore / (1200 / 16);
    var timer    = setInterval(function () {
      current = Math.min(current + stepVal, totalScore);
      numberEl.textContent = Math.round(current);
      if (current >= totalScore) clearInterval(timer);
    }, 16);

    setTimeout(function () {
      var circumference = 327;
      var offset = circumference - (circumference * totalScore / 100);
      document.getElementById('scoreRingFill').style.strokeDashoffset = offset;
    }, 100);

    document.getElementById('scoreInterpretation').textContent = getScoreLabel(totalScore);
    document.getElementById('scoreDescription').textContent    = getScoreDescription(totalScore);
    document.getElementById('metaWeekly').textContent          = '~' + weekly + 'h';
    document.getElementById('metaYearly').textContent          = '~' + yearly + 'h';
  }

  // ── Top 3 Cards ──
  function buildTop3() {
    var grid = document.getElementById('top3Grid');
    grid.innerHTML = '';
    top3.forEach(function (catKey, idx) {
      var cat        = CATEGORIES[catKey];
      var isTopLever = idx === 0;
      var card       = document.createElement('div');
      card.className = 'result-card' + (isTopLever ? ' top-lever' : '');
      card.innerHTML =
        (isTopLever ? '<div class="result-card-badge">Gr\u00f6\u00dfter Hebel</div>' : '') +
        '<div class="result-card-category">' + cat.icon + ' ' + cat.label + '</div>' +
        '<div class="result-card-title">' + cat.label + '</div>' +
        '<p class="result-card-problem">' + cat.problem + '</p>' +
        '<div class="result-card-idea">' + cat.idea + '</div>' +
        '<div class="result-card-savings">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
            '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>' +
          '</svg> ' +
          cat.savings + ' Zeitersparnis' +
        '</div>';
      grid.appendChild(card);
    });
  }

  // ── Potential Banner ──
  function buildPotential() {
    document.getElementById('potentialWeekly').textContent = '~' + weekly;
    document.getElementById('potentialYearly').textContent = 'entspricht ~' + yearly + ' Stunden pro Jahr';
  }

  // ── Industry Tips ──
  function buildIndustryTips() {
    var industry = data.q1_industry || 'other';
    var tips     = INDUSTRY_TIPS[industry] || INDUSTRY_TIPS.other;
    var grid     = document.getElementById('industryTipsGrid');
    grid.innerHTML = '';
    tips.forEach(function (tip, idx) {
      var item = document.createElement('div');
      item.className = 'industry-tip-item';
      item.innerHTML =
        '<span class="industry-tip-num">0' + (idx + 1) + '</span>' +
        '<span class="industry-tip-text">' + tip + '</span>';
      grid.appendChild(item);
    });
  }

  // ── Conditional CTAs ──
  function buildCTAs() {
    if (leadType === 'consulting_lead' || leadType === 'done_for_you_lead') {
      document.getElementById('ctaConsulting').style.display = 'block';
    }
  }

  // ── Scroll Reveal ──
  function initReveal() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (el) {
        if (el.isIntersecting) el.target.classList.add('visible');
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── Init ──
  renderScore();
  buildTop3();
  buildPotential();
  buildIndustryTips();
  buildCTAs();
  initReveal();
});
