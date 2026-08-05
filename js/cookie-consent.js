/* =========================================================
   Bannière + panneau de préférences RGPD — composant autonome.

   INSTALLATION sur une page : ajouter ces 2 lignes avant </body>
     <link rel="stylesheet" href="css/cookie-consent.css">
     <script src="js/cookie-consent.js"></script>
   (adapter la profondeur des chemins "css/" et "js/" selon
   l'emplacement de la page). La page doit aussi charger
   css/style.css, qui définit les variables de couleur (--steel,
   --obsidian, --ember, --line, etc.) utilisées par la bannière et
   le panneau.

   DÉSACTIVATION : retirer ces 2 mêmes lignes. Rien d'autre à
   toucher, le composant ne modifie rien en dehors de lui-même.

   Le HTML (bannière + panneau "Personnaliser") vit dans
   partials/cookie-banner.html et est chargé dynamiquement ici,
   pour rester modifiable sans toucher au reste du site.

   Choix de conception (conformes aux recommandations CNIL) :
   - "Tout accepter" / "Tout refuser" ont le même poids visuel et
     le même nombre de clics, dans la bannière comme dans le panneau.
   - Les catégories non essentielles sont décochées par défaut.
   - Les préférences détaillées sont ré-ouvrables à tout moment via
     le lien "Gérer les cookies" du footer (#manage-cookies-link,
     optionnel — le composant fonctionne sans).
   ========================================================= */
(function(){
  /* doit être lu de façon synchrone ici : document.currentScript devient null
     dès qu'on est dans un callback différé (ex. DOMContentLoaded plus bas) */
  var thisScript = document.currentScript;

  var CATEGORIES = ['analytics', 'ads', 'personalization'];
  var CONSENT_COOKIE = 'cookie_consent';
  var PREFS_COOKIE = 'cookie_consent_prefs';

  function partialUrl(){
    var base = thisScript ? thisScript.src.replace(/[^/]+$/, '') : 'js/';
    return base + '../partials/cookie-banner.html';
  }

  function dict(){
    return (window.LovMyI18n && window.LovMyI18n.dict()) || {};
  }

  function translateBanner(){
    var d = dict();
    document.querySelectorAll('#cookie-banner [data-i18n], #cookie-modal [data-i18n]').forEach(function(el){
      var val = d[el.getAttribute('data-i18n')];
      if(val !== undefined){ el.textContent = val; }
    });
  }

  function setCookie(name, value){
    var date = new Date();
    date.setFullYear(date.getFullYear() + 1); // Expiration dans 1 an
    var isSecure = location.protocol === 'https:';
    var isProdDomain = /(^|\.)lovmy\.fr$/.test(location.hostname);
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + date.toUTCString() +
      '; path=/' + (isProdDomain ? '; domain=.lovmy.fr' : '') +
      '; SameSite=Lax' + (isSecure ? '; Secure' : '');
  }

  function getCookie(name){
    var cookies = document.cookie.split('; ');
    for(var i = 0; i < cookies.length; i++){
      if(cookies[i].indexOf(name + '=') === 0){
        return decodeURIComponent(cookies[i].slice(name.length + 1));
      }
    }
    return null;
  }

  function defaultPrefs(){
    return { analytics: false, ads: false, personalization: false };
  }

  function prefsForChoice(choice){
    var allOn = choice === 'accepted';
    var prefs = {};
    CATEGORIES.forEach(function(cat){ prefs[cat] = allOn; });
    return prefs;
  }

  function readSavedPrefs(){
    var raw = getCookie(PREFS_COOKIE);
    if(!raw) return null;
    try{
      var parsed = JSON.parse(raw);
      var prefs = defaultPrefs();
      CATEGORIES.forEach(function(cat){ if(typeof parsed[cat] === 'boolean'){ prefs[cat] = parsed[cat]; } });
      return prefs;
    }catch(e){ return null; }
  }

  function logConsentEffects(prefs){
    // Points d'intégration à brancher sur vos scripts réels (analytics, ads, personnalisation).
    console.log('Cookies essentiels : actifs (toujours)');
    console.log('Mesure d\'audience :', prefs.analytics ? 'activée' : 'désactivée');
    // Exemple: prefs.analytics ? loadAnalyticsScripts() : disableAnalytics();
    console.log('Publicité personnalisée :', prefs.ads ? 'activée' : 'désactivée');
    // Exemple: prefs.ads ? loadAdsScripts() : disableAds();
    console.log('Personnalisation du contenu :', prefs.personalization ? 'activée' : 'désactivée');
    // Exemple: prefs.personalization ? enablePersonalization() : disablePersonalization();
  }

  function wireUp(){
    var banner = document.getElementById('cookie-banner');
    var modal = document.getElementById('cookie-modal');
    var backToTop = document.getElementById('backToTop');
    var modalTrigger = null;

    /* recale le bouton "retour en haut" au-dessus de la bannière, quelle que soit sa hauteur (mobile inclus) */
    function positionBackToTop(){
      if(!backToTop) return;
      backToTop.style.bottom = (banner.style.display !== 'none')
        ? (banner.offsetHeight + 24) + 'px'
        : '';
    }

    function showBanner(){
      banner.style.display = 'block';
      positionBackToTop();
    }

    function hideBanner(){
      banner.style.display = 'none';
      positionBackToTop();
    }

    function getToggle(cat){
      return document.getElementById('cookie-toggle-' + cat);
    }

    function applyPrefsToToggles(prefs){
      CATEGORIES.forEach(function(cat){
        var t = getToggle(cat);
        if(t){ t.setAttribute('aria-checked', prefs[cat] ? 'true' : 'false'); }
      });
    }

    function readTogglesAsPrefs(){
      var prefs = defaultPrefs();
      CATEGORIES.forEach(function(cat){
        var t = getToggle(cat);
        prefs[cat] = !!t && t.getAttribute('aria-checked') === 'true';
      });
      return prefs;
    }

    function openModal(trigger){
      modalTrigger = trigger || null;
      applyPrefsToToggles(readSavedPrefs() || defaultPrefs());
      modal.style.display = 'flex';
      document.addEventListener('keydown', onModalKeydown);
      var closeBtn = document.getElementById('cookie-modal-close');
      if(closeBtn){ closeBtn.focus(); }
    }

    function closeModal(){
      modal.style.display = 'none';
      document.removeEventListener('keydown', onModalKeydown);
      if(modalTrigger && typeof modalTrigger.focus === 'function'){ modalTrigger.focus(); }
    }

    function onModalKeydown(e){
      if(e.key === 'Escape'){
        closeModal();
        return;
      }
      if(e.key !== 'Tab') return;
      var focusable = modal.querySelectorAll('button, a[href]');
      if(!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }

    function finalizeConsent(choice, prefs){
      setCookie(CONSENT_COOKIE, choice);
      setCookie(PREFS_COOKIE, JSON.stringify(prefs));
      hideBanner();
      modal.style.display = 'none';
      document.removeEventListener('keydown', onModalKeydown);
      logConsentEffects(prefs);
    }

    var consent = getCookie(CONSENT_COOKIE);
    if(!consent){
      showBanner();
    } else {
      console.log('Consentement déjà donné :', consent);
      logConsentEffects(readSavedPrefs() || prefsForChoice(consent));
    }

    window.addEventListener('resize', positionBackToTop);

    document.getElementById('accept-cookies').addEventListener('click', function(){
      finalizeConsent('accepted', prefsForChoice('accepted'));
    });

    document.getElementById('refuse-cookies').addEventListener('click', function(){
      finalizeConsent('refused', prefsForChoice('refused'));
    });

    document.getElementById('customize-cookies').addEventListener('click', function(e){
      openModal(e.currentTarget);
    });

    var manageLink = document.getElementById('manage-cookies-link');
    if(manageLink){
      manageLink.addEventListener('click', function(e){
        e.preventDefault();
        openModal(e.currentTarget);
      });
    }

    modal.querySelectorAll('[data-cookie-modal-close]').forEach(function(el){
      el.addEventListener('click', closeModal);
    });

    document.getElementById('cookie-accept-all').addEventListener('click', function(){
      finalizeConsent('accepted', prefsForChoice('accepted'));
    });

    document.getElementById('cookie-refuse-all').addEventListener('click', function(){
      finalizeConsent('refused', prefsForChoice('refused'));
    });

    CATEGORIES.forEach(function(cat){
      var t = getToggle(cat);
      if(!t) return;
      t.addEventListener('click', function(){
        var isOn = t.getAttribute('aria-checked') === 'true';
        t.setAttribute('aria-checked', isOn ? 'false' : 'true');
      });
    });

    document.getElementById('cookie-save-prefs').addEventListener('click', function(){
      finalizeConsent('customized', readTogglesAsPrefs());
    });
  }

  function init(){
    fetch(partialUrl())
      .then(function(r){
        if(!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function(html){
        document.body.insertAdjacentHTML('beforeend', html);
        translateBanner();
        wireUp();
      })
      .catch(function(err){
        console.error('Bannière cookies : échec du chargement de partials/cookie-banner.html —', err);
      });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
