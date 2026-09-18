// Owns exactly one isolated Strudel session. Removing it also removes sample-bank,
// tempo, drawing and AudioContext state; a late evaluation cannot revive an old song.
export class Playback {
  constructor(host, onState, onCode) {
    Object.assign(this, { host, onState, onCode, frame: null, code: '' });
  }
  getCode() { return this.frame?.contentWindow?.playerEngine?.getCode() ?? this.code; }
  dispose() {
    clearTimeout(this.timer);
    this.frame?.contentWindow?.playerEngine?.dispose();
    this.frame?.remove();
    this.frame = null;
  }
  load(code) {
    this.dispose();
    this.code = code;
    const frame = document.createElement('iframe');
    this.frame = frame;
    frame.title = 'Editable Strudel source';
    frame.allow = 'autoplay';
    frame.src = new URL('../engine.html', import.meta.url);
    const current = () => this.frame === frame;
    const fail = error => {
      if (!current()) return;
      clearTimeout(this.timer);
      this.onState('error', `Strudel could not start: ${error.message}. Use Reload engine to retry.`);
    };
    this.onState('initializing', 'Preparing Strudel and its sample banks…');
    this.timer = setTimeout(() => fail(new Error('initialization timed out')), 30000);
    frame.addEventListener('load', async () => {
      try {
        const api = frame.contentWindow.playerEngine;
        if (!api) throw new Error('engine assets are missing');
        await api.mount(code, (state, message) => {
          if (!current()) return;
          if (state === 'ready' || state === 'error') clearTimeout(this.timer);
          this.onState(state, message);
        }, code => { if (current()) this.onCode(code); });
      } catch (error) { fail(error); }
    }, { once: true });
    this.host.replaceChildren(frame);
  }
  play() { this.frame?.contentWindow?.playerEngine?.play(); }
  stop() { this.frame?.contentWindow?.playerEngine?.stop(); }
}
