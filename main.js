import { clearDB, loadDB } from './db.js';

const clear = document.getElementById("clearBtn");
const query = document.getElementById("queryBtn");
const load = document.getElementById("loadBtn");
const terminal = document.getElementById("terminalOutput");

const renderLog = (msg, type) => {
				if (!terminal) return;

				const entry = document.createElement('div');
				entry.className = 'log-entry';

				const typeClass = type === 'success' ? 'log-success' :
												  type === 'error'   ? 'log-error'   :
												  type === 'info'    ? 'log-info'    : '';
				const time = new Date().toLocaleTimeString();

				entry.innerHTML = `
				  <span class="log-time">[${time}]</span>
					<span class="${typeClass}">${msg}</span>
				`;

				terminal.appendChild(entry);

				terminal.scrollTop = terminal.scrollHeight;
}

window.addEventListener('app-log', (event) => {
				const { msg, type } = event.detail;
				renderLog(msg, type);
});

if (load) { load.addEventListener('click', loadDB); }
if (clear) { clear.addEventListener('click', clearDB); }
