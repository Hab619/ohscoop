/* OhScoop Recipe Card — Frontend JS v2.0.0 */
/* cybertrickz.info */

// ── US / Metric unit toggle ─────────────────────────────────────────
function ohscoopSetUnit( btn, unit ) {
    var wrap = btn.closest('.ohscoop-wrap');
    if (!wrap) return;

    // Toggle buttons
    wrap.querySelectorAll('.ohscoop-unit-btn').forEach(function(b){
        b.classList.toggle('active', b.dataset.unit === unit);
    });

    // Toggle amounts
    wrap.querySelectorAll('.ohscoop-amt-us').forEach(function(el){
        el.style.display = unit === 'us' ? '' : 'none';
    });
    wrap.querySelectorAll('.ohscoop-amt-metric').forEach(function(el){
        el.style.display = unit === 'metric' ? '' : 'none';
    });

    // Persist preference
    try { localStorage.setItem('ohscoop_unit', unit); } catch(e){}
}

// Restore unit preference on load
document.addEventListener('DOMContentLoaded', function() {
    try {
        var saved = localStorage.getItem('ohscoop_unit');
        if (saved === 'metric') {
            document.querySelectorAll('.ohscoop-unit-btn[data-unit="metric"]').forEach(function(btn){
                ohscoopSetUnit(btn, 'metric');
            });
        }
    } catch(e){}
});

// ── Adjustable servings ─────────────────────────────────────────────
function ohscoopAdjustServings( postId, delta ) {
    var wrap = document.getElementById('ohscoop-' + postId);
    if (!wrap) return;

    var numEl = wrap.querySelector('.ohscoop-serving-num');
    var inlineEl = wrap.querySelector('.ohscoop-serving-inline');
    if (!numEl) return;

    var base    = parseInt(numEl.dataset.base) || 2;
    var current = parseInt(numEl.textContent) || base;
    var next    = Math.max(1, current + delta);

    numEl.textContent = next;
    if (inlineEl) inlineEl.textContent = next;

    var ratio = next / base;

    // Scale US amounts
    wrap.querySelectorAll('.ohscoop-amt-us').forEach(function(el){
        var orig = el.dataset.orig;
        if (!orig) {
            orig = el.textContent.trim();
            el.dataset.orig = orig;
        }
        el.textContent = ohscoopScaleAmount(orig, ratio);
    });

    // Scale metric amounts
    wrap.querySelectorAll('.ohscoop-amt-metric').forEach(function(el){
        var orig = el.dataset.orig;
        if (!orig) {
            orig = el.textContent.trim();
            el.dataset.orig = orig;
        }
        el.textContent = ohscoopScaleAmount(orig, ratio);
    });
}

function ohscoopScaleAmount(str, ratio) {
    if (!str || ratio === 1) return str;

    // Match leading number (including fractions like 1½, ½, 1/2, 1.5)
    return str.replace(/^([\d]*[½⅓⅔¼¾⅛⅜⅝⅞]?[\d\/\.]*)/, function(match) {
        if (!match) return match;
        var num = ohscoopParseFraction(match);
        if (isNaN(num) || num === 0) return match;
        var scaled = num * ratio;
        return ohscoopFormatAmount(scaled);
    });
}

function ohscoopParseFraction(str) {
    var fractions = {'½':0.5,'⅓':0.333,'⅔':0.667,'¼':0.25,'¾':0.75,'⅛':0.125,'⅜':0.375,'⅝':0.625,'⅞':0.875};
    var val = 0;
    // Mixed number like 1½
    str = str.replace(/([½⅓⅔¼¾⅛⅜⅝⅞])/, function(m){ val += fractions[m]||0; return ''; });
    // Regular fraction like 1/2
    str = str.replace(/(\d+)\/(\d+)/, function(m,a,b){ val += parseInt(a)/parseInt(b); return ''; });
    // Remaining integer
    if (str.trim()) val += parseFloat(str) || 0;
    return val;
}

function ohscoopFormatAmount(num) {
    if (num <= 0) return '0';
    // Common fractions
    var fracs = [[0.125,'⅛'],[0.25,'¼'],[0.333,'⅓'],[0.375,'⅜'],[0.5,'½'],[0.625,'⅝'],[0.667,'⅔'],[0.75,'¾'],[0.875,'⅞']];
    var whole = Math.floor(num);
    var dec   = num - whole;

    for (var i=0; i<fracs.length; i++) {
        if (Math.abs(dec - fracs[i][0]) < 0.04) {
            return (whole > 0 ? whole : '') + fracs[i][1];
        }
    }
    if (dec < 0.04) return String(whole);
    // Round to 1 decimal for metric
    return parseFloat(num.toFixed(1)).toString();
}

// ── Cook Mode — keep screen awake ──────────────────────────────────
var ohscoopWakeLock = null;

async function ohscoopCookMode(btn) {
    if (!('wakeLock' in navigator)) {
        alert('Cook Mode is not supported in this browser. Try Chrome or Edge on Android.');
        return;
    }
    if (ohscoopWakeLock) {
        ohscoopWakeLock.release();
        ohscoopWakeLock = null;
        btn.classList.remove('active');
        btn.querySelector('span').textContent = 'Cook Mode';
    } else {
        try {
            ohscoopWakeLock = await navigator.wakeLock.request('screen');
            btn.classList.add('active');
            btn.querySelector('span').textContent = 'Screen On ✓';
            ohscoopWakeLock.addEventListener('release', function(){
                ohscoopWakeLock = null;
                btn.classList.remove('active');
                btn.querySelector('span').textContent = 'Cook Mode';
            });
        } catch(e) {
            alert('Could not enable Cook Mode: ' + e.message);
        }
    }
}

// ── Star rating ─────────────────────────────────────────────────────
function ohscoopRate(postId, value) {
    var thanksEl = document.getElementById('ohscoop-thanks-' + postId);
    var starsEl  = document.querySelector('[data-post="' + postId + '"]');

    // Highlight stars
    if (starsEl) {
        starsEl.querySelectorAll('.ohscoop-rate-star').forEach(function(star, i){
            star.classList.toggle('active', i < value);
        });
    }

    // Show thanks
    if (thanksEl) {
        thanksEl.style.display = 'block';
    }

    // Save to localStorage (no backend in free version)
    try {
        var key = 'ohscoop_rated_' + postId;
        if (localStorage.getItem(key)) return; // already rated
        localStorage.setItem(key, value);
    } catch(e) {}

    // Optional: POST to WP AJAX
    if (typeof ohscoopAjax !== 'undefined') {
        fetch(ohscoopAjax.url, {
            method: 'POST',
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            body: 'action=ohscoop_rate&nonce=' + ohscoopAjax.nonce + '&post_id=' + postId + '&rating=' + value
        })
        .then(function(r){ return r.json(); })
        .catch(function(){});
    }
}

// ── Hover effect on rating stars ────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.ohscoop-stars-input').forEach(function(widget){
        var stars = widget.querySelectorAll('.ohscoop-rate-star');
        var postId = widget.dataset.post;

        // Disable if already rated
        try {
            if (localStorage.getItem('ohscoop_rated_' + postId)) {
                var val = parseInt(localStorage.getItem('ohscoop_rated_' + postId));
                stars.forEach(function(s,i){ s.classList.toggle('active', i < val); });
                var thanks = document.getElementById('ohscoop-thanks-' + postId);
                if (thanks) thanks.style.display = 'block';
                return;
            }
        } catch(e){}

        stars.forEach(function(star, idx){
            star.addEventListener('mouseenter', function(){
                stars.forEach(function(s,i){ s.classList.toggle('hover', i <= idx); });
            });
            star.addEventListener('mouseleave', function(){
                stars.forEach(function(s){ s.classList.remove('hover'); });
            });
        });
    });
});
