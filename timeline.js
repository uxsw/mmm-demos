(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  // Pointer users get hover/press feedback; keyboard users always get a visible focus cue.
  document.documentElement.dataset.inputMode = 'pointer';
  document.addEventListener('pointerdown', () => {
    document.documentElement.dataset.inputMode = 'pointer';
  }, true);
  document.addEventListener('keydown', e => {
    if (!e.metaKey && !e.ctrlKey && !e.altKey) document.documentElement.dataset.inputMode = 'keyboard';
  }, true);
  // UTC minutes from the beginning of the sample forecast. Swap this array for real timestamps.
  const base = Date.UTC(2026, 8, 15, 12);
  const duration = 120 * 60;
  const steps = [0];
  while (steps.at(-1) < duration) {
    const t = steps.at(-1);
    const interval = t < 4 * 60 ? 10 : t < 16 * 60 ? 20 : 3 * 60;
    const next = t + interval;
    // Only full intervals: do not add a shorter step at the forecast boundary.
    if (next > duration) break;
    steps.push(next);
  }
  const date = minute => new Date(base + minute * 60000);
  const time = minute => date(minute).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit', timeZone:'UTC'});
  const day = minute => date(minute).toLocaleDateString('en-GB', {weekday:'short', timeZone:'UTC'});
  const dayKey = minute => date(minute).toISOString().slice(0,10);
  const nearest = minute => steps.reduce((best, value, index) => Math.abs(value-minute) < Math.abs(steps[best]-minute) ? index : best, 0);
  // Display coordinates keep the detailed region unchanged, then compress time 2:1.
  // Every drawing and pointer operation shares this continuous, invertible mapping.
  const coarseStart = 16 * 60;
  const toRibbon = minute => minute <= coarseStart ? minute : coarseStart + (minute-coarseStart)/2;
  const fromRibbon = position => position <= coarseStart ? position : coarseStart + (position-coarseStart)*2;
  let selected = nearest(300), start = 0, span = 1440, timer = null, dragging = false;
  let animation = null, gesture = null;
  let cueTime = null, cueFade = null, cueProgress = 0, cueDirection = 1, cueKind = 'step';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const track = $('track'), scrubber = $('scrubber');
  scrubber.max = steps.length - 1;
  const days = [...new Set(steps.map(dayKey))];
  const tickNodes = steps.map(t => {
    const tick = document.createElement('i');
    tick.className = 'tick' + (date(t).getUTCMinutes() === 0 ? ' major' : '');
    return tick;
  });
  $('ticks').replaceChildren(...tickNodes);
  // Calendar boundaries are independent of forecast sampling intervals.
  const dayLayer = document.createElement('div');
  dayLayer.className = 'day-boundaries';
  dayLayer.setAttribute('aria-hidden', 'true');
  const dayMarkers = days.map(key => {
    const minute = (Date.parse(key+'T00:00:00Z')-base)/60000;
    if (minute < 0 || minute > duration) return null;
    const node = document.createElement('span');
    node.className = 'day-boundary';
    node.dataset.minute = minute;
    const label = document.createElement('span');
    label.textContent = day(minute).charAt(0);
    node.append(label);
    dayLayer.append(node);
    return {minute, node};
  }).filter(Boolean);
  track.insertBefore(dayLayer, $('marker'));
  tickNodes.forEach((node, i) => {
    if (dayMarkers.some(marker => marker.minute === steps[i])) node.classList.add('midnight-tick');
  });
  const coarsePointer = matchMedia('(pointer: coarse)');
  function syncPointer() { $('timeline').classList.toggle('is-touch', coarsePointer.matches); }
  coarsePointer.addEventListener('change', syncPointer);
  syncPointer();
  function percent(t) { return (toRibbon(t)-start) / span * 100; }
  // The indicator is centred on the whole timeline, not the track remaining after Play.
  function anchor() {
    const parent = $('timeline').getBoundingClientRect(), box = track.getBoundingClientRect();
    return (parent.left + parent.width / 2 - box.left) / box.width;
  }
  function hideStepCue() {
    clearTimeout(cueFade);
    cueTime = null;
    $('step-cue').classList.remove('is-visible');
  }
  function finishStepCue() {
    if (cueTime !== null) cueFade = setTimeout(hideStepCue, 100);
  }
  function centredStart() { return toRibbon(steps[selected]) - anchor() * span; }
  function stopAnimation() {
    cancelAnimationFrame(animation); animation = null;
  }
  function centreRibbon(animate = true, durationMs = 500) {
    stopAnimation();
    const from = start, target = centredStart();
    if (!animate || reducedMotion.matches || Math.abs(target-from) < .01) {
      start = target; renderTicks(); hideStepCue(); return;
    }
    const began = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now-began)/durationMs);
      cueProgress = progress;
      start = from + (target-from) * (1-Math.pow(1-progress,3));
      renderTicks();
      if (progress < 1) animation = requestAnimationFrame(frame);
      else {
        animation = null; finishStepCue();
      }
    }
    animation = requestAnimationFrame(frame);
  }
  // Keep preview nodes mounted so opacity can finish fading before visibility changes.
  for (const id of ['hover-band', 'hover-time']) {
    $(id).hidden = false;
    $(id).setAttribute('aria-hidden', 'true');
  }
  function hidePreview() {
    $('hover-band').classList.remove('is-visible');
    $('hover-time').classList.remove('is-visible');
  }
  function renderTicks() {
    const width = track.clientWidth, centre = anchor()*width;
    steps.forEach((t, i) => {
      const tick = tickNodes[i];
      const positionOnRibbon = toRibbon(t);
      const visible = positionOnRibbon >= start-span && positionOnRibbon <= start+2*span;
      tick.hidden = !visible;
      if (visible) {
        const position = percent(t)*width/100;
        // A small focus lens adds emphasis without changing the mapped positions.
        const focus = Math.pow(Math.max(0, 1-Math.abs(position-centre)/100), 2);
        tick.style.left = '0';
        tick.style.transform = `translateX(${position}px) scaleY(${reducedMotion.matches ? 1 : .78 + .34*focus})`;
        tick.style.opacity = (.60 + .40*focus).toFixed(3);
      }
    });
    dayMarkers.forEach(({minute, node}) => {
      const position = percent(minute)*width/100;
      node.hidden = position < -30 || position > width+30;
      node.style.transform = `translateX(${position}px)`;
      node.classList.toggle('at-centre', Math.abs(position-centre)<16);
    });
    renderStepSwell();
  }
  function renderStepSwell() {
    if (cueTime === null) return;
    const width = track.clientWidth, height = track.clientHeight;
    const centre = anchor()*width;
    const position = Math.max(0, Math.min(width, percent(cueTime)*width/100));
    // Anchor the inner edge at now, including when a rapid click reverses direction.
    const destination = cueDirection > 0 ? Math.max(centre, position) : Math.min(centre, position);
    let left = cueDirection > 0 ? centre : Math.max(0, destination-28);
    let right = cueDirection > 0 ? Math.min(width, destination+28) : centre;
    let x = Math.max(left+8, Math.min(right-8, destination));
    if (cueKind === 'day') {
      // Day jumps use a bounded directional ripple, not a stretched time interval.
      const available = cueDirection > 0 ? width-centre : centre;
      const rippleWidth = Math.min(76, available*.4);
      const travel = Math.min(190, Math.max(0, available-rippleWidth-8));
      const distance = travel*Math.pow(1-cueProgress, 2);
      left = cueDirection > 0 ? centre+distance : centre-distance-rippleWidth;
      right = left+rippleWidth;
      x = (left+right)/2;
    }
    const swell = 7*Math.pow(Math.sin(Math.PI*cueProgress), .85);
    const top = 18-swell, bottom = 23+swell;
    const l = (left+x)/2, r = (x+right)/2;
    $('swell-gradient').setAttribute('x1', left);
    $('swell-gradient').setAttribute('x2', right);
    $('swell-shade').setAttribute('offset', (x-left)/(right-left));
    $('step-cue').setAttribute('viewBox', `0 0 ${width} ${height}`);
    $('step-swell').setAttribute('d',
      `M ${left} 18 C ${l} 18 ${l} ${top} ${x} ${top} C ${r} ${top} ${r} 18 ${right} 18 `+
      `L ${right} 23 C ${r} 23 ${r} ${bottom} ${x} ${bottom} C ${l} ${bottom} ${l} 23 ${left} 23 Z`);
  }
  function render() {
    const t=steps[selected];
    const coarse = t >= coarseStart;
    scrubber.value=selected; scrubber.setAttribute('aria-valuetext', `${day(t)} ${time(t)} UTC${coarse ? ', 3-hour steps, compressed spacing' : ''}`);
    $('selected-time').innerHTML=`${day(t)} <strong>${time(t)}</strong> UTC`;
    $('selected-time').setAttribute('aria-label', `${day(t)} ${time(t)} UTC. Choose forecast day or enter time`);
    $('marker').style.left = anchor()*100+'%';
    $('previous').disabled=selected===0; $('next').disabled=selected===steps.length-1;
    document.querySelectorAll('[data-day]').forEach(b=> { if(b.dataset.day===dayKey(t)) b.setAttribute('aria-current','date'); else b.removeAttribute('aria-current'); });
    renderTicks();
  }
  function announce() { const t=steps[selected]; $('status').textContent=`Selected forecast: ${date(t).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short',timeZone:'UTC'})}, ${time(t)} UTC.`; }
  function pause() { clearInterval(timer); timer=null; $('play').setAttribute('aria-pressed','false'); $('play').setAttribute('aria-label','Play forecast'); $('play-icon').classList.remove('is-paused'); $('timeline').classList.remove('is-playing'); }
  function commit(index, manual=true, durationMs=500, showStep=false, kind='step') {
    if(manual) pause();
    hideStepCue();
    const previous = selected;
    selected=Math.max(0,Math.min(steps.length-1,index));
    if (showStep && selected !== previous && !reducedMotion.matches) {
      cueTime = steps[selected];
      cueKind = kind;
      cueDirection = Math.sign(selected-previous);
      cueProgress = 0;
      $('step-cue').classList.add('is-visible');
    }
    hidePreview(); render(); centreRibbon(true, durationMs);
    if(manual) announce();
  }
  function stepWithFeedback(button, direction) {
    closeMenu();
    button.classList.remove('is-pulsing');
    if (!reducedMotion.matches) {
      void button.offsetWidth;
      button.classList.add('is-pulsing');
    }
    commit(selected+direction, true, 700, true);
  }
  function closeMenu(restoreFocus = false) {
    const wasOpen = !$('day-menu').hidden;
    $('day-menu').hidden=true;
    $('selected-time').setAttribute('aria-expanded','false');
    if (restoreFocus && wasOpen) $('selected-time').focus({preventScroll:true});
  }
  function openMenu(initialDigit = '') {
    const input = $('time-input');
    input.value = initialDigit || time(steps[selected]);
    input.removeAttribute('aria-invalid');
    $('time-result').textContent = 'Type four digits, e.g. 1830';
    $('day-menu').hidden = false;
    $('selected-time').setAttribute('aria-expanded', 'true');
    input.focus({preventScroll:true});
    if (!initialDigit) input.select();
  }
  $('time-input').addEventListener('input', () => {
    const input = $('time-input');
    const value = input.value.trim();
    const match = /^(?:([01]\d|2[0-3]):?([0-5]\d))$/.exec(value);
    if (!match) {
      const incomplete = value.replace(':', '').length < 4;
      if (incomplete) input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid', 'true');
      $('time-result').textContent = incomplete ? 'Type four digits, e.g. 1830' : 'Enter a time from 0000 to 2359';
      return;
    }
    input.removeAttribute('aria-invalid');
    const requested = Number(match[1])*60 + Number(match[2]);
    const key = dayKey(steps[selected]);
    const candidates = steps.map((minute, index) => ({minute, index})).filter(step => dayKey(step.minute) === key);
    const target = candidates.reduce((best, step) => {
      const difference = Math.abs(date(step.minute).getUTCHours()*60 + date(step.minute).getUTCMinutes() - requested);
      return difference < best.difference ? {index:step.index, difference} : best;
    }, {index:candidates[0].index, difference:Infinity});
    commit(target.index, true, 650, true, 'day');
    const reached = steps[target.index];
    $('time-result').textContent = target.difference === 0
      ? `Showing ${day(reached)} ${time(reached)} UTC`
      : `Nearest available: ${day(reached)} ${time(reached)} UTC`;
  });
  days.forEach((key, dayIndex) => {
    const t=(Date.parse(key+'T00:00:00Z')-base)/60000;
    for(const parent of [$('days'),$('day-options')]) {
      const b=document.createElement('button'); b.type='button'; b.textContent=dayIndex === 0 ? 'Today' : day(t); b.dataset.day=key; b.setAttribute('aria-label',`Jump to ${date(t).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})}`);
      b.addEventListener('click',()=>{ const current=date(steps[selected]); commit(nearest(t+current.getUTCHours()*60+current.getUTCMinutes()), true, 950, true, 'day'); closeMenu(parent === $('day-options')); }); parent.append(b);
    }
  });
  $('previous').addEventListener('click',()=>stepWithFeedback($('previous'),-1));
  $('next').addEventListener('click',()=>stepWithFeedback($('next'),1));
  $('selected-time').addEventListener('click',()=> {
    if ($('day-menu').hidden) openMenu(); else closeMenu();
  });
  $('selected-time').addEventListener('keydown', e => {
    if (/^[0-9]$/.test(e.key) && $('day-menu').hidden) {
      e.preventDefault();
      openMenu(e.key);
    }
  });
  $('day-menu').addEventListener('keydown', e => {
    const buttons = [...$('day-options').children];
    const index = buttons.indexOf(document.activeElement);
    let next;
    if (e.key === 'ArrowDown' && index >= 0) next = index === buttons.length-1 ? -1 : index+1;
    if (e.key === 'ArrowUp') next = index < 0 ? buttons.length-1 : (index-1+buttons.length)%buttons.length;
    if (e.key === 'Home' && index >= 0) next = 0;
    if (e.key === 'End' && index >= 0) next = buttons.length-1;
    if (next !== undefined) { e.preventDefault(); (next < 0 ? $('time-input') : buttons[next]).focus(); }
  });
  $('selection').addEventListener('focusout', e => {
    if (!$('selection').contains(e.relatedTarget)) closeMenu();
  });
  document.addEventListener('pointerdown',e=>{if(!$('selection').contains(e.target))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu($('selection').contains(document.activeElement));hidePreview();}});
  $('play').addEventListener('click',()=>{
    if(timer){pause();announce();return;}
    closeMenu(); if(selected===steps.length-1)commit(0);
    $('play').setAttribute('aria-pressed','true'); $('play').setAttribute('aria-label','Pause forecast'); $('play-icon').classList.add('is-paused'); $('timeline').classList.add('is-playing');
    timer=setInterval(()=>{commit(selected+1,false); if(selected===steps.length-1){pause();announce();}},800);
  });
  function pointerIndex(e) { const r=track.getBoundingClientRect(); return nearest(fromRibbon(start+Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*span)); }
  function preview(e) {
    if (gesture && e.pointerId !== gesture.pointerId) return;
    if (!dragging && (e.pointerType === 'touch' || timer || animation)) return;
    const index=pointerIndex(e), t=steps[index];
    if (dragging) {
      const dx = e.clientX-gesture.x;
      if (!gesture.moved && Math.abs(dx) < 4) return;
      gesture.moved = true;
      // Direct manipulation: the ribbon follows the finger; release snaps a step to centre.
      start = Math.max(-anchor()*span, Math.min(toRibbon(steps.at(-1))-anchor()*span, gesture.start-dx/track.clientWidth*span));
      selected = nearest(fromRibbon(start+anchor()*span));
      render(); return;
    }
    const a=anchor()*100, b=percent(t);
    const entering = !$('hover-band').classList.contains('is-visible');
    const label = $('hover-time');
    label.textContent = time(t);
    const trackBox = track.getBoundingClientRect();
    const daysBox = $('days').getBoundingClientRect();
    const visibleWidth = daysBox.width ? Math.min(trackBox.width, daysBox.left-trackBox.left-4) : trackBox.width;
    const x = Math.max(0, Math.min(visibleWidth, b*track.clientWidth/100));
    const labelWidth = label.offsetWidth;
    // Extend the time cap away from the selected time; flip inward near either edge.
    let leftCap = b < a;
    if (x + labelWidth > visibleWidth) leftCap = true;
    if (x < labelWidth) leftCap = false;
    label.dataset.side = leftCap ? 'left' : 'right';
    label.style.left = (leftCap ? x-labelWidth : x)+'px';
    const centre = a*track.clientWidth/100;
    $('hover-band').style.left = Math.min(centre,x)+'px';
    $('hover-band').style.width = Math.abs(centre-x)+'px';
    if (entering) void $('hover-band').offsetWidth;
    $('hover-band').classList.add('is-visible');
    $('hover-time').classList.add('is-visible');
  }
  scrubber.addEventListener('pointermove',preview);
  scrubber.addEventListener('pointerleave',()=>{if(!dragging)hidePreview();});
  scrubber.addEventListener('pointerdown',e=>{
    if (!e.isPrimary || e.button !== 0 || gesture) return;
    e.preventDefault(); pause(); stopAnimation(); hideStepCue(); hidePreview();
    scrubber.focus({preventScroll:true}); scrubber.setPointerCapture(e.pointerId);
    dragging=true; gesture={x:e.clientX, start, moved:false, pointerId:e.pointerId};
    $('timeline').classList.add('is-dragging'); closeMenu();
  });
  scrubber.addEventListener('pointerup',e=>{
    if (!gesture || e.pointerId !== gesture.pointerId) return;
    const moved = gesture.moved;
    const index = moved ? selected : pointerIndex(e);
    dragging=false; gesture=null; $('timeline').classList.remove('is-dragging');
    if(scrubber.hasPointerCapture(e.pointerId)) scrubber.releasePointerCapture(e.pointerId);
    commit(index, true, moved ? 300 : 500);
  });
  function cancelGesture() {
    if (!gesture) return;
    dragging=false; gesture=null; $('timeline').classList.remove('is-dragging');
    hidePreview(); centreRibbon(true, 300); announce();
  }
  scrubber.addEventListener('pointercancel',cancelGesture);
  scrubber.addEventListener('lostpointercapture',cancelGesture);
  window.addEventListener('blur',()=>{cancelGesture();pause();hidePreview();});
  scrubber.addEventListener('input',()=>commit(Number(scrubber.value)));
  new ResizeObserver(()=>{hidePreview();render();centreRibbon(false);}).observe(track);
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches) { if(animation) centreRibbon(false); hideStepCue(); renderTicks(); }});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();centreRibbon(false);}});
  render();centreRibbon(false);announce();
})();
