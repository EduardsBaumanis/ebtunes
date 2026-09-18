// Copyright (C) 2026 Eduarda Baumaņa. AGPL-3.0.
// This is a same-origin, disposable realm, never the remotely hosted strudel.cc app.
(() => {
  let editor, notify = () => {}, changed = () => {}, ready = false, generation = 0, busy = false;
  let lastCode = '', disposed = false, tempoControl = null, sampleLoads = 0, cancelled = false;
  let sampleWarnings = [];
  const message = error => error?.message || String(error);
  const fail = error => {
    if (disposed) return;
    generation++;
    cancelled = false;
    editor?.repl.stop();
    window.getAudioContext?.().suspend();
    notify('error', message(error));
  };
  window.addEventListener('unhandledrejection', event => { event.preventDefault(); fail(event.reason); });
  window.addEventListener('error', event => { if (event.error) fail(event.error); });

  // The pinned runtime reports scheduler/output failures via this event, often
  // without rejecting evaluate(). Never leave the transport claiming it is playing.
  document.addEventListener('strudel.log', event => {
    const { message: text, type } = event.detail;
    if (type === 'error' || /\[[^\]]+\] error:/.test(text)) fail(new Error(text));
  });

  function updateTempo() {
    if (!tempoControl || !editor) return;
    const { value, divisor } = tempoControl;
    const scalar = value?._Pattern ? value.queryArc(0, 1)[0]?.value : value;
    const cps = Number(scalar) / divisor;
    if (!Number.isFinite(cps) || cps <= 0) throw new Error('Tempo must be a positive, finite number.');
    editor.repl.scheduler.setCps(cps);
  }
  function installTempoControls() {
    // 1.3.0 assumes setcpm receives a pure number. A CodeMirror slider is a
    // reference pattern, so the stock setter divides an object and stores NaN.
    // Keep the original source and widgets intact; resolve this control at runtime.
    for (const [name, divisor] of [['setcpm', 60], ['setCpm', 60], ['setcps', 1], ['setCps', 1]]) {
      const setter = value => { tempoControl = { value, divisor }; updateTempo(); return window.silence; };
      Object.defineProperty(window, name, { configurable: true, get: () => setter, set: () => {} });
    }
    window.addEventListener('message', event => {
      if (event.source === window && event.data?.type === 'cm-slider') {
        // The CodeMirror listener updates its reference value first.
        try { updateTempo(); } catch (error) { fail(error); }
      }
    });
  }

  function installSampleLoader() {
    const samples = window.samples;
    const dough = 'https://raw.githubusercontent.com/felixroos/dough-samples/main/';
    const manifests = {
      'github:felixroos/dough-samples': ['piano.json', 'Dirt-Samples.json', 'vcsl.json', 'mridangam.json', 'tidal-drum-machines.json'],
      'github:geikha/tidal-drum-machines': ['tidal-drum-machines.json'],
      'github:sgossner/vcsl': ['vcsl.json'],
    };
    window.samples = async (source, ...args) => {
      sampleLoads++;
      try {
        const urls = typeof source === 'string' && manifests[source.toLowerCase().replace(/\/$/, '')];
        if (urls) return await Promise.all(urls.map(url => samples(dough + url, ...args)));
        return await samples(source, ...args);
      } catch (error) {
        // Some old demos load a nonexistent pack but use only stock instruments.
        // Keep those instruments, disclose the failure, and verify every sound in
        // the initial 16 cycles before allowing playback. Never invent aliases.
        sampleWarnings.push(`Could not load ${typeof source === 'string' ? source : 'sample map'}. Using already loaded sounds where available.`);
      } finally { sampleLoads--; }
    };
  }

  // Bound external sample requests and surface HTTP errors instead of silent playback.
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, options = {}) => {
    const timeout = AbortSignal.timeout(20000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    try {
      const response = await nativeFetch(input, { ...options, signal });
      if (!response.ok) throw new Error(`Sample request failed (HTTP ${response.status}): ${response.url}`);
      return response;
    } catch (error) { if (!sampleLoads) fail(error); throw error; }
  };

  async function play() {
    if (!ready || disposed || busy) return;
    busy = true;
    cancelled = false;
    sampleWarnings = [];
    notify('warning', '');
    const request = ++generation;
    // Resume synchronously in the user's click/keyboard activation, before any await.
    const context = window.getAudioContext();
    const resumed = context.resume();
    notify('evaluating', 'Evaluating code and loading sounds…');
    try {
      await resumed;
      await window.initAudio();
      if (request !== generation || disposed) return;
      if (context.state !== 'running') throw new Error('Audio is suspended. Press Play again to enable sound.');
      await editor.repl.evaluate(editor.code, false);
      if (disposed || request !== generation) return;
      if (editor.repl.state.error) throw editor.repl.state.error;
      // Querying exposes pattern errors which otherwise appear only after Play reports success.
      const pattern = editor.repl.state.pattern;
      pattern.queryArc(0, 1);
      if (sampleWarnings.length) {
        const missing = new Set();
        for (let cycle = 0; cycle < 16; cycle++) {
          for (const hap of pattern.queryArc(cycle, cycle + 1)) {
            const value = hap.value;
            const sound = value.bank ? `${value.bank}_${value.s}` : value.s || 'triangle';
            if (!window.getSound(sound)) missing.add(sound);
          }
        }
        notify('warning', [...new Set(sampleWarnings)].join(' '));
        if (missing.size) throw new Error(`Required sounds are unavailable: ${[...missing].join(', ')}. Check this track's sample pack.`);
      }
      if (request !== generation) return;
      await editor.repl.start();
      if (disposed || request !== generation) { editor.repl.stop(); return; }
      notify('playing', 'Playing · patterns loop until you stop');
    } catch (error) { if (request === generation) fail(error); }
    finally {
      busy = false;
      if (cancelled && !disposed) { cancelled = false; notify('stopped', 'Stopped · press Play to restart'); }
    }
  }
  function stop() {
    generation++;
    cancelled = busy;
    editor?.repl.stop();
    // Suspend also silences long releases and samples already scheduled by Strudel.
    window.getAudioContext?.().suspend();
    if (ready && !disposed) notify(busy ? 'stopping' : 'stopped', busy ? 'Stopping pending evaluation…' : 'Stopped · press Play to restart');
  }
  window.playerEngine = {
    async mount(code, onState, onCode) {
      notify = onState;
      changed = onCode;
      lastCode = code;
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'vendor/strudel/index.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('The local Strudel bundle could not be loaded'));
        document.head.append(script);
      });
      if (disposed) return;
      const component = document.createElement('strudel-editor');
      component.setAttribute('code', code);
      component.addEventListener('update', event => {
        const state = event.detail;
        if (state.code !== lastCode) { lastCode = state.code; changed(state.code); }
        if (state.schedulerError) fail(state.schedulerError);
      });
      document.body.append(component);
      editor = component.editor;
      // Route editor keyboard shortcuts through the same cancellable transport as buttons.
      editor.evaluate = play;
      editor.stop = stop;
      await editor.prebaked;
      if (disposed) return;
      installTempoControls();
      installSampleLoader();
      ready = true;
      notify('ready', 'Ready · press Play to enable audio');
    },
    getCode: () => editor?.code ?? lastCode,
    play, stop,
    dispose() {
      disposed = true;
      stop();
      window.getAudioContext?.().close();
    },
  };
})();
