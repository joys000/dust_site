// ── 멀티페이지 — 표준 링크로 이동, 활성 메뉴만 표시 ──
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const currentPage = path.replace('.html','');
  document.querySelectorAll('.nav-link, .menu-link').forEach(l=>{
    const href = (l.getAttribute('href') || '').toLowerCase();
    const linkPage = href.replace('.html','').replace('/','') || 'index';
    const isActive = (path === href) || (path === 'index.html' && linkPage === 'index') || (currentPage === linkPage);
    l.classList.toggle('active', isActive);
  });

  // ── 모바일 햄버거 드롭다운 ──
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  function closeMobileMenu(){
    mobileMenu?.classList.remove('open');
    hamburgerBtn?.classList.remove('open');
    if(hamburgerBtn) hamburgerBtn.setAttribute('aria-label','메뉴 열기');
  }
  function openMobileMenu(){
    mobileMenu?.classList.add('open');
    hamburgerBtn?.classList.add('open');
    if(hamburgerBtn) hamburgerBtn.setAttribute('aria-label','메뉴 닫기');
  }
  function toggleMobileMenu(){
    if(mobileMenu?.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
  }
  hamburgerBtn?.addEventListener('click',(e)=>{ e.stopPropagation(); toggleMobileMenu(); });
  document.addEventListener('click',(e)=>{
    if(!mobileMenu?.classList.contains('open')) return;
    if(mobileMenu.contains(e.target)) return;
    if(hamburgerBtn?.contains(e.target)) return;
    closeMobileMenu();
  });
  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape' && mobileMenu?.classList.contains('open')) closeMobileMenu();
  });
  // ───────────────────────────────────────────────────────────────────────
  // 체험해보기 — OpenMeteo Forecast + Air Quality (no API key, CORS OK)
  // ───────────────────────────────────────────────────────────────────────
  (function(){
    const $idle = document.getElementById('trIdle');
    const $loading = document.getElementById('trLoading');
    const $error = document.getElementById('trError');
    const $result = document.getElementById('trResult');
    if(!$idle) return; // 페이지 미존재 보호

    const $geoBtn = document.getElementById('trGeoBtn');
    const $defBtn = document.getElementById('trDefaultBtn');
    const $form = document.getElementById('trSearchForm');
    const $input = document.getElementById('trSearchInput');
    const $refreshBtn = document.getElementById('trRefreshBtn');

    const $locName = document.getElementById('trLocName');
    const $ts = document.getElementById('trTs');
    const $face = document.getElementById('trFace');
    const $faceEm = document.getElementById('trFaceEm');
    const $faceLabel = document.getElementById('trFaceLabel');
    const $pm25 = document.getElementById('trPm25');
    const $pm10 = document.getElementById('trPm10');
    const $uv = document.getElementById('trUv');
    const $temp = document.getElementById('trTemp');
    const $hum = document.getElementById('trHum');
    const $wind = document.getElementById('trWind');
    const $wx = document.getElementById('trWx');
    const $advice = document.getElementById('trAdviceLine');

    let lastCoords = null; // {lat, lon, name}

    function show(state){
      $idle.style.display = state==='idle' ? 'flex' : 'none';
      $loading.classList.toggle('show', state==='loading');
      $result.classList.toggle('show', state==='result');
      $error.classList.toggle('show', state==='error');
    }

    function err(msg){
      $error.textContent = msg;
      show('error');
      // 5초 후 idle로 복귀
      setTimeout(()=>{ if($error.classList.contains('show')) show(lastCoords ? 'result' : 'idle'); }, 5000);
    }

    // PM2.5 → 5등급 (앱 기준)
    // 0–15 아주좋음 / 16–35 좋음 / 36–75 보통 / 76–150 나쁨 / 151+ 매우나쁨
    function gradeOf(pm25){
      if(pm25 == null) return {idx:-1};
      if(pm25 <= 15) return {idx:0, label:'아주 좋음', em:'🌟', color:'#2563EB', bg:'#DBEAFE',
                              advice:'공기가 아주 맑아요! 창문 열고 환기, 야외 활동 마음껏 즐기세요.'};
      if(pm25 <= 35) return {idx:1, label:'좋음', em:'😊', color:'#10B981', bg:'#D1FAE5',
                              advice:'공기가 좋아요. 가벼운 산책·자전거·환기 모두 좋은 날이에요.'};
      if(pm25 <= 75) return {idx:2, label:'보통', em:'😐', color:'#F59E0B', bg:'#FFE7B2',
                              advice:'민감군은 장시간 외출 자제. 환기는 짧게(오전 10시–오후 2시) 해주세요.'};
      if(pm25 <= 150) return {idx:3, label:'나쁨', em:'🙁', color:'#EF4444', bg:'#FECACA',
                              advice:'KF94 마스크를 꼭 착용하세요! 외출은 단축, 빨래는 실내에서.'};
      return {idx:4, label:'매우 나쁨', em:'😷', color:'#7C3AED', bg:'#EDE9FE',
              advice:'외출 자제, 창문 완전 밀폐, 공기청정기 강풍! 호흡기·심혈관 환자는 특히 주의.'};
    }

    function uvLabel(v){
      if(v==null) return '--';
      const n = Math.round(v);
      if(n<=2) return n+' 낮음';
      if(n<=5) return n+' 보통';
      if(n<=7) return n+' 높음';
      if(n<=10) return n+' 매우높음';
      return n+' 위험';
    }

    // OpenMeteo WMO weather code → 이모지+한국어 짧은 표현
    function weatherText(code){
      const map = {
        0:['☀','맑음'], 1:['🌤','대체로 맑음'], 2:['⛅','부분 흐림'], 3:['☁','흐림'],
        45:['🌫','안개'], 48:['🌫','짙은 안개'],
        51:['🌦','이슬비'], 53:['🌦','이슬비'], 55:['🌧','이슬비 강함'],
        61:['🌧','약한 비'], 63:['🌧','비'], 65:['🌧','강한 비'],
        66:['🌧','어는 비'], 67:['🌧','어는 비 강함'],
        71:['❄','약한 눈'], 73:['❄','눈'], 75:['❄','강한 눈'],
        77:['🌨','싸락눈'],
        80:['🌦','소나기'], 81:['🌧','소나기'], 82:['⛈','강한 소나기'],
        85:['🌨','약한 눈 소나기'], 86:['🌨','눈 소나기'],
        95:['⛈','뇌우'], 96:['⛈','뇌우+우박'], 99:['⛈','강한 뇌우+우박']
      };
      const [em,t] = map[code] || ['☁','—'];
      return em+' '+t;
    }

    async function fetchAndRender(lat, lon, displayName){
      lastCoords = {lat, lon, name: displayName};
      show('loading');
      try{
        const fcUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index` +
                      `&timezone=Asia%2FSeoul`;
        const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
                      `&current=pm10,pm2_5,european_aqi,uv_index` +
                      `&timezone=Asia%2FSeoul`;

        const [fcRes, aqRes] = await Promise.all([fetch(fcUrl), fetch(aqUrl)]);
        if(!fcRes.ok || !aqRes.ok) throw new Error('네트워크 오류');
        const fc = await fcRes.json();
        const aq = await aqRes.json();

        const pm25 = aq.current?.pm2_5;
        const pm10 = aq.current?.pm10;
        const uvAQ = aq.current?.uv_index;
        const uvFC = fc.current?.uv_index;
        const uv = (uvAQ != null) ? uvAQ : uvFC;
        const temp = fc.current?.temperature_2m;
        const hum = fc.current?.relative_humidity_2m;
        const wind = fc.current?.wind_speed_10m;
        const wcode = fc.current?.weather_code;

        // grade
        const g = gradeOf(pm25);
        $faceEm.textContent = g.em;
        $faceLabel.textContent = g.label;
        $face.style.borderColor = g.color;
        $face.style.background = g.bg;

        $pm25.textContent = (pm25 != null) ? Math.round(pm25*10)/10 : '--';
        $pm10.textContent = (pm10 != null) ? Math.round(pm10*10)/10 : '--';
        $uv.textContent = uvLabel(uv);
        $temp.textContent = (temp != null) ? Math.round(temp*10)/10 : '--';
        $hum.textContent = (hum != null) ? Math.round(hum) : '--';
        // OpenMeteo wind_speed_10m default unit km/h → m/s 변환
        $wind.textContent = (wind != null) ? (Math.round((wind/3.6)*10)/10) : '--';
        $wx.textContent = (wcode != null) ? weatherText(wcode) : '--';
        $advice.textContent = g.advice + (uv != null && Math.round(uv) >= 6 ? ' 자외선도 강하니 모자·선글라스 챙기세요.' : '');

        $locName.textContent = displayName || (lat.toFixed(3)+', '+lon.toFixed(3));
        const now = new Date();
        $ts.textContent = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} 갱신`;

        show('result');
      }catch(e){
        console.error(e);
        err('데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      }
    }

    // 지오코딩 (한국 주소 → 위경도)
    async function geocode(query){
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=ko&format=json`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('검색 실패');
      const data = await res.json();
      if(!data.results || !data.results.length) return null;
      // 한국 우선 (country_code === 'KR')
      const kr = data.results.find(r => r.country_code === 'KR') || data.results[0];
      return {
        lat: kr.latitude,
        lon: kr.longitude,
        name: [kr.admin1, kr.admin2, kr.name].filter(Boolean).join(' ').trim() || kr.name
      };
    }

    // ── handlers ──
    $geoBtn?.addEventListener('click',()=>{
      if(!navigator.geolocation){ err('이 브라우저는 위치 정보를 지원하지 않아요.'); return; }
      show('loading');
      navigator.geolocation.getCurrentPosition(
        async (pos)=>{
          const {latitude:lat, longitude:lon} = pos.coords;
          // 역지오코딩으로 동네 이름 시도 (실패해도 좌표로 표시)
          let name = `좌표 ${lat.toFixed(3)}, ${lon.toFixed(3)}`;
          try{
            const r = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=ko&count=1`);
            if(r.ok){
              const d = await r.json();
              const it = d.results?.[0];
              if(it) name = [it.admin1, it.admin2, it.name].filter(Boolean).join(' ');
            }
          }catch(e){}
          fetchAndRender(lat, lon, name);
        },
        (e)=>{
          if(e.code === 1) err('위치 권한이 거부됐어요. 주소 검색이나 "서울로 시작"을 사용해주세요.');
          else if(e.code === 2) err('위치를 찾을 수 없어요. WiFi/GPS를 켜고 다시 시도해주세요.');
          else err('위치 가져오기에 실패했어요. 주소 검색을 사용해주세요.');
        },
        {enableHighAccuracy:false, timeout:10000, maximumAge:60000}
      );
    });

    $defBtn?.addEventListener('click',()=>{
      // 서울시청 (37.5665, 126.9780)
      fetchAndRender(37.5665, 126.9780, '서울특별시');
    });

    $form?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const q = ($input.value || '').trim();
      if(!q) return;
      show('loading');
      try{
        const r = await geocode(q);
        if(!r){ err('"'+q+'" 을 찾을 수 없어요. 다른 동네 이름으로 시도해주세요.'); return; }
        fetchAndRender(r.lat, r.lon, r.name);
      }catch(ex){ err('검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.'); }
    });

    $refreshBtn?.addEventListener('click',()=>{
      if(lastCoords) fetchAndRender(lastCoords.lat, lastCoords.lon, lastCoords.name);
    });
  })();

  // 사전 알림 폼: Google Form 외부 링크로 변경됨 — JS 핸들러 불필요

  // 후원자 명단은 donors-data.js 에서 관리합니다 (add-donor.py 로 자동 추가·삭제)

  // 채널별 표시 정보
  const CHANNEL_INFO = {
    kakao: { label:'카카오페이', em:'💛' },
    kb: { label:'KB국민', em:'🏦' },
    toss: { label:'토스뱅크', em:'💙' },
  };

  function fmtDate(s){
    if(!s) return '';
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return s;
    return `${parseInt(m[2])}월 ${parseInt(m[3])}일`;
  }

  // ── 명단 페이지 렌더링 ──
  (function(){
    const list = document.getElementById('donorsList');
    const empty = document.getElementById('donorsEmpty');
    const total = document.getElementById('dnTotal');
    if(!list || !empty || !total) return;

    total.textContent = DONORS.length;

    if(DONORS.length === 0){
      empty.style.display = 'block';
      list.style.display = 'none';
      return;
    }

    list.className = 'donors-grid';
    list.innerHTML = DONORS.map(d=>{
      const ch = CHANNEL_INFO[d.channel] || { label:'', em:'☕' };
      const safeName = String(d.name||'익명').replace(/[<>]/g,'');
      const safeMsg = String(d.message||'').replace(/[<>]/g,'');
      return `
        <article class="donor-card" data-channel="${d.channel||''}">
          <div class="quote-mark">"</div>
          <p class="msg">${safeMsg ? safeMsg : '<span style="color:var(--ink-3);font-weight:600">조용한 응원, 감사합니다.</span>'}</p>
          <div class="meta">
            <span class="name">${safeName}</span>
            <span class="info">${ch.em} ${ch.label}<span class="dt"> · ${fmtDate(d.date)}</span></span>
          </div>
        </article>
      `;
    }).join('');
  })();

  // ── 메인 페이지 응원 슬라이드 ──
  (function(){
    const slide = document.getElementById('cheerSlide');
    const dots = document.getElementById('cheerDots');
    if(!slide || !dots) return;

    // 슬라이드는 메시지가 있는 후원만, 최대 8개까지 (너무 많으면 부담)
    const items = DONORS.filter(d=>d.message && d.message.trim()).slice(0, 8);

    if(items.length === 0){
      slide.innerHTML = '<div class="cheer-empty">아직 응원이 도착하지 않았어요.<br/>첫 응원이 도착하면 여기에 한 명씩 따뜻하게 보여드릴게요. <b>☕ 첫 후원자가 되어주세요.</b></div>';
      return;
    }

    slide.innerHTML = items.map((d,i)=>{
      const ch = CHANNEL_INFO[d.channel] || { label:'', em:'☕' };
      const safeName = String(d.name||'익명').replace(/[<>]/g,'');
      const safeMsg = String(d.message||'').replace(/[<>]/g,'');
      return `
        <div class="cheer-item${i===0?' active':''}" data-i="${i}">
          <p class="quote">${safeMsg}</p>
          <span class="who"><span class="ch">${ch.em}</span>${safeName}<span class="dt">${fmtDate(d.date)}</span></span>
        </div>
      `;
    }).join('');

    dots.innerHTML = items.map((_,i)=>`<button class="${i===0?'on':''}" data-i="${i}" aria-label="응원 ${i+1}"></button>`).join('');

    let idx = 0;
    let timer = null;
    const itemsEl = slide.querySelectorAll('.cheer-item');
    const dotsEl = dots.querySelectorAll('button');

    function show(n){
      idx = (n + items.length) % items.length;
      itemsEl.forEach((el,i)=>el.classList.toggle('active', i===idx));
      dotsEl.forEach((el,i)=>el.classList.toggle('on', i===idx));
    }
    function start(){ if(items.length<=1) return; timer = setInterval(()=>show(idx+1), 5000); }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }

    dotsEl.forEach(b=>b.addEventListener('click', ()=>{ stop(); show(parseInt(b.dataset.i)); start(); }));
    slide.parentElement.addEventListener('mouseenter', stop);
    slide.parentElement.addEventListener('mouseleave', start);
    start();
  })();

  // ── 후원 동의 모달 + 후원 채널 처리 통합 ─────────────────────────────
  (function(){
    const modal = document.getElementById('donateModal');
    if(!modal) return;
    const yesBtn = document.getElementById('dmYes');
    const noBtn = document.getElementById('dmNo');

    const DONOR_FORM_URL = 'https://forms.gle/M6Mc6GfrmVQvfdYs7';

    let pendingAction = null;

    function openModal(actionFn){
      pendingAction = actionFn;
      modal.classList.add('show');
      yesBtn.focus();
    }
    function closeModal(runAction){
      modal.classList.remove('show');
      if(runAction && pendingAction) pendingAction();
      pendingAction = null;
    }

    yesBtn.addEventListener('click', ()=>{
      window.open(DONOR_FORM_URL, '_blank', 'noopener');
      closeModal(true);
    });
    noBtn.addEventListener('click', ()=> closeModal(true));
    // 모달 외부 클릭 → 취소 (원래 행동도 안 함)
    modal.addEventListener('click', (e)=>{
      if(e.target === modal) closeModal(false);
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && modal.classList.contains('show')) closeModal(false);
    });

    // 카카오페이 카드 (link 가로채기)
    document.querySelectorAll('.donate-card.kakao').forEach(card=>{
      card.addEventListener('click', (e)=>{
        e.preventDefault();
        const url = card.getAttribute('href');
        openModal(()=> window.open(url, '_blank', 'noopener'));
      });
    });

    // 계좌 카드 (KB / 토스뱅크) — 블러 해제 + 복사 + 모달
    function copyAcct(btn){
      return new Promise(async (resolve)=>{
        const acct = btn.dataset.acct;
        const label = btn.dataset.label || '계좌번호';
        // 블러 해제 (한 번 누르면 계속 공개)
        btn.classList.add('revealed');
        try{
          await navigator.clipboard.writeText(acct);
        }catch(e){
          const ta = document.createElement('textarea');
          ta.value = acct;
          document.body.appendChild(ta);
          ta.select();
          try{ document.execCommand('copy'); }catch(_){}
          document.body.removeChild(ta);
        }
        const tag = btn.querySelector('.copy-tag');
        const original = tag.textContent;
        btn.classList.add('copied');
        tag.textContent = `${label} 복사됨! 다시 누르면 재복사`;
        setTimeout(()=>{
          btn.classList.remove('copied');
          tag.textContent = '📋 다시 누르면 재복사';
          resolve();
        }, 1500);
      });
    }

    document.querySelectorAll('.copy-acct').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        await copyAcct(btn); // 1) 복사 + 피드백
        // 2) 잠시 후 모달 표시 (계좌는 이미 복사됐으므로 모달은 안내만)
        openModal(null);
      });
    });
  })();