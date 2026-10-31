/**
 * ========================================================
 * VIDEO AI - CORE ENGINE (TIMELINE, AUDIO, RECORDER & UI)
 * Động cơ phát và xuất video 16:9 dùng chung cho mọi dự án
 * ========================================================
 */

window.VideoEngine = (function() {
  const BASE_SPEED_CALIBRATION = 1.25;

  let currentProject = null;
  let SCENES = [];
  let totalDuration = 38;
  let currentTime = 0;
  let isPlaying = false;
  let lastTimestamp = null;
  let animFrameId = null;

  // Audio Context & Nodes
  let audioCtx = null;
  let voiceGainNode = null;
  let musicGainNode = null;
  let exportStreamDest = null;
  let isExportMuted = false;

  const trimmedSceneBuffers = [];
  const baseSceneVoiceSecs = [];
  let trimmedSampleBuffer = null;
  let customMusicBuffer = null;
  let activeVoiceSource = null;
  let activeCustomMusicSource = null;
  let lastTriggeredScene = -1;
  let lastMusicBeat = -1;

  // Cấu hình 8 Giọng Tiếng Việt chuẩn hóa WSOLA
  const VOICE_PRESETS = {
    nam_minh:      { name: "Nam Minh Chuẩn",       pitch: -3.4, rate: 1.00, lowGain: 3.0, midFreq: 1850, midGain: 2.5 },
    nam_tram:      { name: "Nam Trầm Hào Hùng",    pitch: -4.6, rate: 0.98, lowGain: 4.5, midFreq: 1650, midGain: 3.0 },
    nam_ban_tin:   { name: "Nam Bản Tin Nhanh",    pitch: -3.0, rate: 1.12, lowGain: 2.0, midFreq: 2200, midGain: 3.5 },
    nam_ke_su:     { name: "Nam Kể Sử Cổ Điển",    pitch: -5.4, rate: 0.94, lowGain: 5.0, midFreq: 1500, midGain: 2.5 },
    nu_chuan:      { name: "Hoài My (Nữ Chuẩn)",   pitch:  0.0, rate: 1.00, lowGain: 1.0, midFreq: 2500, midGain: 2.0 },
    nu_truyen_cam: { name: "Nữ Kể Chuyện Ấm",      pitch: -1.4, rate: 0.96, lowGain: 2.5, midFreq: 2100, midGain: 2.0 },
    nu_ban_tin:    { name: "Nữ Thời Sự Nhanh",     pitch:  0.8, rate: 1.12, lowGain: 0.0, midFreq: 2800, midGain: 3.0 },
    nu_cao_sang:   { name: "Nữ Trẻ Trung Sáng",    pitch:  1.8, rate: 1.06, lowGain: 0.0, midFreq: 3100, midGain: 2.5 },
    mute:          { name: "Tắt Giọng",            pitch:  0.0, rate: 1.00, lowGain: 0.0, midFreq: 2000, midGain: 0.0 }
  };

  // Canvas & Particles
  let canvas, ctx, W, H;
  let particles = [];

  function initCanvas() {
    canvas = document.getElementById('videoCanvas');
    ctx = canvas.getContext('2d');
    W = canvas.width;
    H = canvas.height;
    particles = window.VideoGraphics.createParticleSystem(90, W, H);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function getSceneIndexAtTime(t) {
    for (let i = 0; i < SCENES.length; i++) {
      if (t < SCENES[i].endTime || i === SCENES.length - 1) {
        return i;
      }
    }
    return Math.max(0, SCENES.length - 1);
  }

  function trimSilenceFromBuffer(buffer, threshold = 0.012) {
    if (!audioCtx) return buffer;
    const sr = buffer.sampleRate;
    const data = buffer.getChannelData(0);
    let start = 0;
    let end = data.length - 1;

    while (start < end && Math.abs(data[start]) < threshold) start++;
    while (end > start && Math.abs(data[end]) < threshold) end--;

    const padStart = Math.floor(sr * 0.03);
    const padEnd = Math.floor(sr * 0.04);
    start = Math.max(0, start - padStart);
    end = Math.min(data.length - 1, end + padEnd);

    const newLen = Math.max(1, end - start + 1);
    const trimmed = audioCtx.createBuffer(1, newLen, sr);
    trimmed.getChannelData(0).set(data.subarray(start, end + 1));
    return trimmed;
  }

  function recalculateDynamicTimeline() {
    const rngVoiceRate = document.getElementById('rngVoiceRate');
    const rngSceneGap = document.getElementById('rngSceneGap');
    if (!rngVoiceRate || !rngSceneGap || SCENES.length === 0) return;

    const userRate = parseFloat(rngVoiceRate.value);
    const effectiveRate = userRate * BASE_SPEED_CALIBRATION;
    const gapSec = parseFloat(rngSceneGap.value);

    const oldSceneIdx = getSceneIndexAtTime(currentTime);
    const oldScene = SCENES[oldSceneIdx];
    const oldLocalProgress = oldScene && oldScene.duration > 0
      ? Math.max(0, Math.min(1, (currentTime - oldScene.startTime) / oldScene.duration))
      : 0;

    let cursor = 0;
    for (let i = 0; i < SCENES.length; i++) {
      const rawDur = trimmedSceneBuffers[i] ? trimmedSceneBuffers[i].duration : (baseSceneVoiceSecs[i] || 8);
      const voiceDur = rawDur / effectiveRate;
      const sceneDur = voiceDur + gapSec;

      SCENES[i].startTime = cursor;
      SCENES[i].duration = sceneDur;
      SCENES[i].endTime = cursor + sceneDur;
      cursor += sceneDur;

      const timeLabel = document.getElementById(`sceneTime${i}`);
      if (timeLabel) {
        timeLabel.innerText = `${formatTime(SCENES[i].startTime)} - ${formatTime(SCENES[i].endTime)}`;
      }
    }

    totalDuration = cursor;
    const totalDisp = document.getElementById('totalTimeDisp');
    if (totalDisp) totalDisp.innerText = formatTime(totalDuration);

    const markersContainer = document.getElementById('sceneMarkers');
    if (markersContainer) {
      markersContainer.innerHTML = '';
      SCENES.forEach(s => {
        const div = document.createElement('div');
        div.className = 'marker';
        div.style.width = `${(s.duration / totalDuration) * 100}%`;
        markersContainer.appendChild(div);
      });
    }

    if (SCENES[oldSceneIdx]) {
      currentTime = SCENES[oldSceneIdx].startTime + oldLocalProgress * SCENES[oldSceneIdx].duration;
    }
    updateUI(currentTime);
  }

  function processVoiceWSOLA(srcAudioBuffer, pitchSemitones, effectiveTempoRate) {
    if (!audioCtx || !srcAudioBuffer) return srcAudioBuffer;
    const sr = srcAudioBuffer.sampleRate;
    const input = srcAudioBuffer.getChannelData(0);
    const N = input.length;

    const pitchFactor = Math.pow(2, pitchSemitones / 12);
    const timeStretchFactor = effectiveTempoRate / pitchFactor;

    if (Math.abs(pitchFactor - 1.0) < 0.01 && Math.abs(timeStretchFactor - 1.0) < 0.01) {
      return srcAudioBuffer;
    }

    const W = 1024;
    const H_syn = 256;
    const H_ana = Math.round(H_syn * timeStretchFactor);
    const searchWin = 256;

    const hann = new Float32Array(W);
    for (let i = 0; i < W; i++) {
      hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (W - 1)));
    }

    const maxSynFrames = Math.ceil(N / H_ana) + 4;
    const L_stretched = maxSynFrames * H_syn + W;
    const stretched = new Float32Array(L_stretched);

    let prevInPos = 0;
    for (let m = 0; m < maxSynFrames; m++) {
      const outPos = m * H_syn;
      const nominalInPos = Math.round(m * H_ana);
      if (nominalInPos >= N - W) break;

      let bestInPos = nominalInPos;
      let maxCorr = -1e9;
      const searchStart = Math.max(0, nominalInPos - searchWin);
      const searchEnd = Math.min(N - W, nominalInPos + searchWin);

      for (let cand = searchStart; cand <= searchEnd; cand += 4) {
        let corr = 0;
        const targetRef = prevInPos + H_syn;
        if (targetRef >= 0 && targetRef + 128 < N) {
          for (let k = 0; k < 128; k += 8) {
            corr += input[cand + k] * input[targetRef + k];
          }
        }
        if (corr > maxCorr) {
          maxCorr = corr;
          bestInPos = cand;
        }
      }

      bestInPos = Math.max(0, Math.min(N - W, bestInPos));
      for (let k = 0; k < W; k++) {
        stretched[outPos + k] += input[bestInPos + k] * hann[k];
      }
      prevInPos = bestInPos;
    }

    const finalLen = Math.max(1, Math.floor(L_stretched / pitchFactor));
    const outBuffer = audioCtx.createBuffer(1, finalLen, sr);
    const output = outBuffer.getChannelData(0);

    for (let i = 0; i < finalLen; i++) {
      const pos = i * pitchFactor;
      const idx = Math.floor(pos);
      const frac = pos - idx;
      const s0 = stretched[idx] || 0;
      const s1 = stretched[Math.min(stretched.length - 1, idx + 1)] || 0;
      output[i] = s0 + frac * (s1 - s0);
    }

    return outBuffer;
  }

  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async function initAudioEngine() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      const rngVoiceVol = document.getElementById('rngVoiceVol');
      const rngMusicVol = document.getElementById('rngMusicVol');

      voiceGainNode = audioCtx.createGain();
      voiceGainNode.gain.value = rngVoiceVol ? parseFloat(rngVoiceVol.value) : 1.0;
      voiceGainNode.connect(audioCtx.destination);

      musicGainNode = audioCtx.createGain();
      musicGainNode.gain.value = rngMusicVol ? parseFloat(rngMusicVol.value) : 0.28;
      musicGainNode.connect(audioCtx.destination);

      exportStreamDest = audioCtx.createMediaStreamDestination();
      voiceGainNode.connect(exportStreamDest);
      musicGainNode.connect(exportStreamDest);
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const voiceKey = currentProject?.id === 'history_vn' ? 'vi_history_vn' : 'vi_standard';
    const data = window.EMBEDDED_VOICES ? (window.EMBEDDED_VOICES[voiceKey] || window.EMBEDDED_VOICES.vi_standard) : null;
    if (data) {
      let newlyDecoded = false;
      for (let i = 0; i < SCENES.length; i++) {
        if (!trimmedSceneBuffers[i] && data.scenes && data.scenes[i]) {
          const buf = base64ToArrayBuffer(data.scenes[i]);
          const rawDecoded = await audioCtx.decodeAudioData(buf);
          trimmedSceneBuffers[i] = trimSilenceFromBuffer(rawDecoded);
          baseSceneVoiceSecs[i] = trimmedSceneBuffers[i].duration;
          newlyDecoded = true;
        }
      }
      if (!trimmedSampleBuffer && data.sample) {
        const sBuf = base64ToArrayBuffer(data.sample);
        const rawSample = await audioCtx.decodeAudioData(sBuf);
        trimmedSampleBuffer = trimSilenceFromBuffer(rawSample);
      }
      if (newlyDecoded) {
        recalculateDynamicTimeline();
      }
    }
  }

  function stopCurrentVoice() {
    if (activeVoiceSource) {
      try { activeVoiceSource.stop(); } catch (e) {}
      activeVoiceSource = null;
    }
  }

  function playProcessedVoice(trimmedBuffer) {
    if (!audioCtx || !trimmedBuffer) return;
    const selVoicePreset = document.getElementById('selVoicePreset');
    const presetKey = selVoicePreset ? selVoicePreset.value : 'nam_minh';
    if (presetKey === 'mute') return;

    stopCurrentVoice();

    const rngVoicePitch = document.getElementById('rngVoicePitch');
    const rngVoiceRate = document.getElementById('rngVoiceRate');

    const pitchSt = rngVoicePitch ? parseFloat(rngVoicePitch.value) : -3.4;
    const userRate = rngVoiceRate ? parseFloat(rngVoiceRate.value) : 1.0;
    const effectiveTempoRate = userRate * BASE_SPEED_CALIBRATION;
    const preset = VOICE_PRESETS[presetKey] || VOICE_PRESETS.nam_minh;

    const shiftedBuffer = processVoiceWSOLA(trimmedBuffer, pitchSt, effectiveTempoRate);

    const source = audioCtx.createBufferSource();
    source.buffer = shiftedBuffer;

    const highPass = audioCtx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 85;

    const lowShelf = audioCtx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 210;
    lowShelf.gain.value = preset.lowGain;

    const midPeak = audioCtx.createBiquadFilter();
    midPeak.type = 'peaking';
    midPeak.frequency.value = preset.midFreq;
    midPeak.Q.value = 1.1;
    midPeak.gain.value = preset.midGain;

    source.connect(highPass);
    highPass.connect(lowShelf);
    lowShelf.connect(midPeak);
    midPeak.connect(voiceGainNode);

    source.start(0);
    activeVoiceSource = source;
  }

  async function playVietnameseSceneVoice(sceneIndex) {
    await initAudioEngine();
    if (trimmedSceneBuffers[sceneIndex]) {
      playProcessedVoice(trimmedSceneBuffers[sceneIndex]);
    }
  }

  // Synth Sequencer Music Generator
  function playSynthNote(freq, duration, waveType = 'sawtooth', filterFreq = 800, vol = 0.12, delaySec = 0) {
    if (!audioCtx) return;
    const startTime = audioCtx.currentTime + delaySec;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGainNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  function playDrumHit(startFreq = 120, endFreq = 40, duration = 0.6, vol = 0.45) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(musicGainNode);
    osc.start(now);
    osc.stop(now + duration);
  }

  function triggerMusicBeat(beatIndex, sceneIndex) {
    const selMusicStyle = document.getElementById('selMusicStyle');
    const style = selMusicStyle ? selMusicStyle.value : 'zimmer';
    if (style === 'none' || !audioCtx || customMusicBuffer) return;

    const step = beatIndex % 8;
    const safeSceneIdx = sceneIndex % 5;

    if (style === 'zimmer') {
      const bassRoots = [73.42, 65.41, 87.31, 55.00, 73.42];
      const root = bassRoots[safeSceneIdx];
      playSynthNote(root, 0.45, 'sawtooth', 380, 0.22);

      if (step === 0 || step === 4) playDrumHit(110, 38, 0.7, 0.5);
      if (step === 0) {
        const chords = [
          [146.83, 220.00, 261.63, 329.63],
          [130.81, 196.00, 261.63, 329.63],
          [174.61, 220.00, 261.63, 349.23],
          [110.00, 164.81, 220.00, 293.66],
          [146.83, 220.00, 293.66, 369.99]
        ];
        (chords[safeSceneIdx] || chords[0]).forEach(f => playSynthNote(f, 3.8, 'sawtooth', 750, 0.10));
      }
    } else if (style === 'patriotic') {
      if (step % 2 === 0) playDrumHit(160, 60, 0.25, 0.35);
      const fanfareNotes = [220.0, 277.18, 329.63, 440.0, 392.0, 329.63, 293.66, 246.94];
      playSynthNote(fanfareNotes[step], 0.45, 'square', 1100, 0.12);
      if (step === 0) playSynthNote(880, 2.0, 'sine', 2000, 0.08);
    } else if (style === 'emotional') {
      const arpNotes = [
        [220.0, 261.63, 329.63, 440.0, 329.63, 261.63, 220.0, 196.0],
        [174.61, 220.0, 261.63, 349.23, 261.63, 220.0, 174.61, 164.81],
        [130.81, 164.81, 196.0, 261.63, 196.0, 164.81, 130.81, 146.83],
        [196.0, 246.94, 293.66, 392.0, 293.66, 246.94, 196.0, 174.61],
        [220.0, 277.18, 329.63, 440.0, 523.25, 440.0, 329.63, 277.18]
      ];
      const list = arpNotes[safeSceneIdx] || arpNotes[0];
      playSynthNote(list[step], 1.2, 'triangle', 1400, 0.18);
      if (step === 0) playSynthNote(list[0] / 2, 3.8, 'sine', 600, 0.20);
    } else if (style === 'synthwave') {
      const bassFreqs = [55.0, 65.41, 73.42, 49.0, 55.0];
      const bFreq = bassFreqs[safeSceneIdx] || 55.0;
      playSynthNote(bFreq, 0.22, 'sawtooth', 950, 0.22);
      playSynthNote(bFreq * 2, 0.22, 'sawtooth', 1200, 0.12, 0.25);

      const leadArp = [440, 523.25, 659.25, 523.25, 392, 523.25, 659.25, 783.99];
      playSynthNote(leadArp[step], 0.35, 'square', 1600, 0.08);
      if (step % 2 === 0) playDrumHit(130, 35, 0.3, 0.4);
    }
  }

  function startCustomMusic(offsetSec = 0) {
    stopCustomMusic();
    if (!customMusicBuffer || !audioCtx) return;
    const src = audioCtx.createBufferSource();
    src.buffer = customMusicBuffer;
    src.loop = true;
    src.connect(musicGainNode);
    src.start(0, offsetSec % customMusicBuffer.duration);
    activeCustomMusicSource = src;
  }

  function stopCustomMusic() {
    if (activeCustomMusicSource) {
      try { activeCustomMusicSource.stop(); } catch (e) {}
      activeCustomMusicSource = null;
    }
  }

  function syncAudioToTimeline(time) {
    const sceneIndex = getSceneIndexAtTime(time);
    const beatIndex = Math.floor(time * 2);

    if (sceneIndex !== lastTriggeredScene) {
      lastTriggeredScene = sceneIndex;
      playVietnameseSceneVoice(sceneIndex);
    }

    if (beatIndex !== lastMusicBeat) {
      lastMusicBeat = beatIndex;
      triggerMusicBeat(beatIndex, sceneIndex);
    }
  }

  // Render Frame
  function renderFrame(time) {
    if (!ctx || SCENES.length === 0) return;
    ctx.clearRect(0, 0, W, H);

    const sceneIndex = getSceneIndexAtTime(time);
    const scene = SCENES[sceneIndex];
    if (!scene) return;

    const localTime = Math.max(0, time - scene.startTime);
    const progress = scene.duration > 0 ? Math.min(1, localTime / scene.duration) : 0;

    if (currentProject?.id === 'history_vn') {
      // Chế độ render chuẩn xác theo tài liệu đặc tả (Exact Specification Mode)
      if (typeof scene.render === 'function') {
        scene.render(ctx, time, progress, W, H);
      }
      if (typeof currentProject.drawYearBar === 'function') {
        currentProject.drawYearBar(ctx, time, W, H);
      }
      return;
    }

    // 2.5D Ken Burns Parallax Camera (Cho các dự án khác)
    const cameraMode = scene.visual?.cameraMode || (sceneIndex % 2 === 0 ? 'zoom_in' : 'pan_left');
    const cam = window.VideoGraphics.getCameraTransform(cameraMode, progress, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-W / 2 + cam.panX, -H / 2 + cam.panY);

    if (typeof scene.render === 'function') {
      scene.render(ctx, time, progress, W, H, particles);
    } else {
      window.VideoGraphics.renderGenericScene(ctx, scene, localTime, progress, W, H, particles);
    }

    window.VideoGraphics.drawVignette(ctx, W, H);
    ctx.restore();

    window.VideoGraphics.drawKineticTitle(ctx, scene.title, W * 0.5, 90, localTime);
    if (scene.sub) {
      window.VideoGraphics.drawCanvasSubtitle(ctx, scene.sub, W * 0.5, H - 55, W * 0.82, localTime);
    }
  }

  function updateUI(time) {
    const sceneIndex = getSceneIndexAtTime(time);
    const scene = SCENES[sceneIndex];
    if (!scene) return;

    const progressFill = document.getElementById('progressFill');
    const currentTimeDisp = document.getElementById('currentTimeDisp');
    const overlayTime = document.getElementById('overlayTime');
    const subtitleText = document.getElementById('subtitleText');

    const pct = totalDuration > 0 ? Math.min(100, (time / totalDuration) * 100) : 0;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (currentTimeDisp) currentTimeDisp.innerText = formatTime(time);
    if (overlayTime) overlayTime.innerText = `${formatTime(time)} / ${formatTime(totalDuration)}`;
    if (subtitleText) subtitleText.innerText = scene.sub;

    const sceneCards = document.querySelectorAll('.scene-card');
    sceneCards.forEach((card, idx) => {
      if (idx === sceneIndex) card.classList.add('active');
      else card.classList.remove('active');
    });
  }

  function loop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying) {
      currentTime += dt;
      if (currentTime >= totalDuration) {
        currentTime = totalDuration;
        pauseVideo();
      } else {
        window.VideoGraphics.updateParticles(particles, W, H);
        syncAudioToTimeline(currentTime);
      }
    }

    renderFrame(currentTime);
    updateUI(currentTime);

    if (isPlaying) {
      animFrameId = requestAnimationFrame(loop);
    }
  }

  async function playVideo() {
    await initAudioEngine();
    if (currentTime >= totalDuration) currentTime = 0;
    isPlaying = true;
    lastTimestamp = null;
    lastTriggeredScene = -1;
    lastMusicBeat = -1;

    const playBtnLabel = document.getElementById('playBtnLabel');
    if (playBtnLabel) playBtnLabel.innerText = "Tạm dừng";

    const selVoicePreset = document.getElementById('selVoicePreset');
    const p = VOICE_PRESETS[selVoicePreset ? selVoicePreset.value : 'nam_minh'];
    const statusMsg = document.getElementById('statusMsg');
    if (statusMsg) {
      statusMsg.innerText = `Đang phát: ${p ? p.name : 'Tiếng Việt'} • Tự động chuyển cảnh sau mỗi câu (${formatTime(totalDuration)})`;
    }

    if (customMusicBuffer) startCustomMusic(currentTime);
    animFrameId = requestAnimationFrame(loop);
  }

  function pauseVideo() {
    isPlaying = false;
    stopCurrentVoice();
    stopCustomMusic();

    const playBtnLabel = document.getElementById('playBtnLabel');
    if (playBtnLabel) playBtnLabel.innerText = "Phát Video (Có Tiếng Việt)";

    const statusMsg = document.getElementById('statusMsg');
    if (statusMsg) statusMsg.innerText = "Đã tạm dừng";

    if (animFrameId) cancelAnimationFrame(animFrameId);
  }

  // Silent 1080p Video Exporter
  function restoreAudioRoutingAfterExport() {
    if (isExportMuted && audioCtx) {
      try {
        if (voiceGainNode) voiceGainNode.connect(audioCtx.destination);
        if (musicGainNode) musicGainNode.connect(audioCtx.destination);
      } catch (e) {}
      isExportMuted = false;
    }
  }

  async function exportVideo() {
    pauseVideo();
    await initAudioEngine();

    const btnExport = document.getElementById('btnExport');
    const exportBtnLabel = document.getElementById('exportBtnLabel');
    const statusMsg = document.getElementById('statusMsg');

    btnExport.disabled = true;
    btnExport.classList.add('rendering');

    // Tắt tiếng loa ngoài máy tính trong khi render
    try {
      if (voiceGainNode) voiceGainNode.disconnect(audioCtx.destination);
      if (musicGainNode) musicGainNode.disconnect(audioCtx.destination);
      isExportMuted = true;
    } catch (e) {}

    const stream = canvas.captureStream(30);
    if (exportStreamDest) {
      exportStreamDest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
    }

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8000000
    });

    const recordedChunks = [];
    recorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    recorder.onstop = () => {
      restoreAudioRoutingAfterExport();
      btnExport.disabled = false;
      btnExport.classList.remove('rendering');
      if (exportBtnLabel) exportBtnLabel.innerText = "Xuất Video (Tải MP4/WebM)";

      if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const projectSlug = currentProject?.id || 'VideoAI';
        a.download = `${projectSlug}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (statusMsg) statusMsg.innerHTML = `<span style="color:#10b981;">✓ Đã xuất và tải file video có phụ đề thành công!</span>`;
      }
    };

    recorder.start();

    currentTime = 0;
    lastTriggeredScene = -1;
    lastMusicBeat = -1;
    isPlaying = true;
    if (customMusicBuffer) startCustomMusic(0);

    const recordInterval = setInterval(() => {
      currentTime += 0.033;
      window.VideoGraphics.updateParticles(particles, W, H);
      syncAudioToTimeline(currentTime);
      renderFrame(currentTime);
      updateUI(currentTime);

      const pct = Math.min(100, (currentTime / totalDuration) * 100);
      const remSec = Math.max(0, Math.ceil(totalDuration - currentTime));

      if (exportBtnLabel) exportBtnLabel.innerText = `Đang xuất: ${Math.round(pct)}% (${remSec}s)`;
      if (statusMsg) {
        statusMsg.innerHTML = `<span style="color:#f59e0b;font-weight:600;">⚡ Đang ghi hình 1080p: ${Math.round(pct)}% (Còn ~${remSec}s) — Loa ngoài được tắt để không làm phiền bạn...</span> <button id="btnCancelExport" style="margin-left:8px;padding:2px 8px;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Hủy xuất</button>`;
      }

      const cancelBtn = document.getElementById('btnCancelExport');
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          clearInterval(recordInterval);
          isPlaying = false;
          stopCurrentVoice();
          stopCustomMusic();
          recordedChunks.length = 0;
          recorder.stop();
          restoreAudioRoutingAfterExport();
          btnExport.disabled = false;
          btnExport.classList.remove('rendering');
          if (exportBtnLabel) exportBtnLabel.innerText = "Xuất Video (Tải MP4/WebM)";
          if (statusMsg) statusMsg.innerHTML = `<span style="color:#ef4444;">Đã hủy quá trình xuất video.</span>`;
          currentTime = 0;
          renderFrame(0);
          updateUI(0);
        };
      }

      if (currentTime >= totalDuration) {
        clearInterval(recordInterval);
        isPlaying = false;
        stopCurrentVoice();
        stopCustomMusic();
        recorder.stop();
      }
    }, 33);
  }

  // Khởi tạo các sự kiện giao diện Studio
  function setupUIEvents() {
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnReplay = document.getElementById('btnReplay');
    const btnExport = document.getElementById('btnExport');
    const progressBar = document.getElementById('progressBar');
    const selVoicePreset = document.getElementById('selVoicePreset');
    const rngVoiceRate = document.getElementById('rngVoiceRate');
    const valVoiceRate = document.getElementById('valVoiceRate');
    const rngSceneGap = document.getElementById('rngSceneGap');
    const valSceneGap = document.getElementById('valSceneGap');
    const rngVoicePitch = document.getElementById('rngVoicePitch');
    const valVoicePitch = document.getElementById('valVoicePitch');
    const rngVoiceVol = document.getElementById('rngVoiceVol');
    const valVoiceVol = document.getElementById('valVoiceVol');
    const rngMusicVol = document.getElementById('rngMusicVol');
    const valMusicVol = document.getElementById('valMusicVol');
    const voiceChips = document.querySelectorAll('.voice-chip');

    if (btnPlayPause) {
      btnPlayPause.onclick = () => {
        if (isPlaying) pauseVideo();
        else playVideo();
      };
    }

    if (btnReplay) {
      btnReplay.onclick = () => {
        pauseVideo();
        currentTime = 0;
        playVideo();
      };
    }

    if (btnExport) {
      btnExport.onclick = () => exportVideo();
    }

    if (progressBar) {
      progressBar.onclick = async (e) => {
        await initAudioEngine();
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        currentTime = Math.max(0, Math.min(totalDuration, pos * totalDuration));
        lastTriggeredScene = -1;
        lastMusicBeat = -1;
        renderFrame(currentTime);
        updateUI(currentTime);
        if (isPlaying) {
          syncAudioToTimeline(currentTime);
          if (customMusicBuffer) startCustomMusic(currentTime);
        }
      };
    }

    function selectVoiceProfile(voiceKey, autoPreview = true) {
      if (selVoicePreset) selVoicePreset.value = voiceKey;
      voiceChips.forEach(chip => {
        if (chip.dataset.voice === voiceKey) chip.classList.add('active');
        else chip.classList.remove('active');
      });
      const p = VOICE_PRESETS[voiceKey];
      const activeVoiceBadge = document.getElementById('activeVoiceBadge');
      if (activeVoiceBadge && p) {
        activeVoiceBadge.innerText = `Giọng: ${p.name}`;
      }
      if (p) {
        if (rngVoiceRate && valVoiceRate) {
          rngVoiceRate.value = p.rate;
          valVoiceRate.innerText = `${p.rate.toFixed(2)}x`;
        }
        if (rngVoicePitch && valVoicePitch) {
          rngVoicePitch.value = p.pitch;
          valVoicePitch.innerText = `${p.pitch > 0 ? '+' : ''}${p.pitch.toFixed(1)} st`;
        }
      }
      recalculateDynamicTimeline();

      if (autoPreview) {
        initAudioEngine().then(() => {
          const sIdx = getSceneIndexAtTime(currentTime);
          playVietnameseSceneVoice(sIdx);
        });
      }
    }

    voiceChips.forEach(chip => {
      chip.onclick = () => selectVoiceProfile(chip.dataset.voice, true);
    });

    if (selVoicePreset) {
      selVoicePreset.onchange = () => selectVoiceProfile(selVoicePreset.value, true);
    }

    if (rngVoiceRate && valVoiceRate) {
      rngVoiceRate.oninput = () => {
        valVoiceRate.innerText = `${parseFloat(rngVoiceRate.value).toFixed(2)}x`;
        recalculateDynamicTimeline();
      };
    }

    if (rngSceneGap && valSceneGap) {
      rngSceneGap.oninput = () => {
        valSceneGap.innerText = `${parseFloat(rngSceneGap.value).toFixed(2)}s`;
        recalculateDynamicTimeline();
      };
    }

    if (rngVoicePitch && valVoicePitch) {
      rngVoicePitch.oninput = () => {
        const v = parseFloat(rngVoicePitch.value);
        valVoicePitch.innerText = `${v > 0 ? '+' : ''}${v.toFixed(1)} st`;
      };
    }

    if (rngVoiceVol && valVoiceVol) {
      rngVoiceVol.oninput = () => {
        const v = parseFloat(rngVoiceVol.value);
        valVoiceVol.innerText = `${Math.round(v * 100)}%`;
        if (voiceGainNode) voiceGainNode.gain.value = v;
      };
    }

    if (rngMusicVol && valMusicVol) {
      rngMusicVol.oninput = () => {
        const v = parseFloat(rngMusicVol.value);
        valMusicVol.innerText = `${Math.round(v * 100)}%`;
        if (musicGainNode) musicGainNode.gain.value = v;
      };
    }

    const btnTestVoice = document.getElementById('btnTestVoice');
    if (btnTestVoice) {
      btnTestVoice.onclick = async () => {
        await initAudioEngine();
        const sIdx = getSceneIndexAtTime(currentTime);
        const buf = trimmedSceneBuffers[sIdx] || trimmedSampleBuffer;
        if (buf) playProcessedVoice(buf);
      };
    }

    const btnStopVoice = document.getElementById('btnStopVoice');
    if (btnStopVoice) {
      btnStopVoice.onclick = () => stopCurrentVoice();
    }

    const fileCustomMusic = document.getElementById('fileCustomMusic');
    if (fileCustomMusic) {
      fileCustomMusic.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await initAudioEngine();
        const arrayBuf = await file.arrayBuffer();
        customMusicBuffer = await audioCtx.decodeAudioData(arrayBuf);
        const statusMsg = document.getElementById('statusMsg');
        if (statusMsg) statusMsg.innerText = `Đã nạp nhạc nền riêng: ${file.name}`;
        if (isPlaying) startCustomMusic(currentTime);
      };
    }

    const btnTestMusic = document.getElementById('btnTestMusic');
    if (btnTestMusic) {
      btnTestMusic.onclick = async () => {
        await initAudioEngine();
        const sIdx = getSceneIndexAtTime(currentTime);
        for (let b = 0; b < 4; b++) {
          setTimeout(() => {
            if (!isPlaying) triggerMusicBeat(b, sIdx);
          }, b * 450);
        }
      };
    }
  }

  // Tự động sinh danh sách thẻ cảnh động
  function renderDynamicSceneCards() {
    const sceneGrid = document.getElementById('sceneGrid');
    if (!sceneGrid || SCENES.length === 0) return;

    sceneGrid.innerHTML = '';
    sceneGrid.style.gridTemplateColumns = `repeat(${Math.min(SCENES.length, 5)}, 1fr)`;

    SCENES.forEach((scene, idx) => {
      const card = document.createElement('div');
      card.className = `scene-card ${idx === 0 ? 'active' : ''}`;
      card.dataset.scene = idx;
      card.innerHTML = `
        <div class="scene-time" id="sceneTime${idx}">00:00 - 00:00</div>
        <div class="scene-title">${scene.cardTitle || scene.title}</div>
      `;

      card.onclick = async () => {
        await initAudioEngine();
        currentTime = scene.startTime;
        lastTriggeredScene = -1;
        lastMusicBeat = -1;
        renderFrame(currentTime);
        updateUI(currentTime);
        if (isPlaying) {
          syncAudioToTimeline(currentTime);
          if (customMusicBuffer) startCustomMusic(currentTime);
        } else {
          playVietnameseSceneVoice(idx);
        }
      };

      sceneGrid.appendChild(card);
    });
  }

  /**
   * Nạp dự án video bất kỳ (Universal Storyboard Loader)
   */
  function loadProject(project) {
    if (!project || !project.scenes) {
      console.error("Dự án không hợp lệ:", project);
      return;
    }

    currentProject = project;
    trimmedSceneBuffers.length = 0;
    trimmedSampleBuffer = null;
    currentTime = 0;
    lastTriggeredScene = -1;
    lastMusicBeat = -1;
    SCENES = project.scenes.map((s, idx) => ({
      id: s.id !== undefined ? s.id : idx,
      startTime: 0,
      endTime: 0,
      duration: s.baseSec || 8.0,
      cardTitle: s.cardTitle || `Cảnh ${idx + 1}`,
      title: s.title || `CẢNH ${idx + 1}`,
      sub: s.sub || '',
      render: s.render || null,
      visual: s.visual || {}
    }));

    // Cập nhật tiêu đề & thông tin metadata trên UI
    if (project.meta) {
      if (project.meta.title) {
        document.title = project.meta.title;
        const h1 = document.querySelector('header h1');
        if (h1) h1.innerText = project.meta.title;
      }
      if (project.meta.subtitle) {
        const sub = document.querySelector('header p.subtitle');
        if (sub) sub.innerText = project.meta.subtitle;
      }
      if (project.meta.badge) {
        const b = document.querySelector('header .badge');
        if (b) b.innerText = project.meta.badge;
      }
      if (project.meta.defaultMusic) {
        const selMusicStyle = document.getElementById('selMusicStyle');
        if (selMusicStyle) selMusicStyle.value = project.meta.defaultMusic;
      }
    }

    baseSceneVoiceSecs.length = 0;
    SCENES.forEach(s => baseSceneVoiceSecs.push(s.duration));

    initCanvas();
    renderDynamicSceneCards();
    setupUIEvents();
    recalculateDynamicTimeline();

    // Nạp âm thanh nhúng nếu có
    initAudioEngine().then(() => {
      recalculateDynamicTimeline();
      renderFrame(0);
      updateUI(0);
    });
  }

  return {
    loadProject,
    playVideo,
    pauseVideo,
    exportVideo,
    recalculateDynamicTimeline,
    renderFrame,
    updateUI
  };
})();

