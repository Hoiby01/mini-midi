import './style.css';

document.querySelector('#app').innerHTML = `
  <main>
    <h1>Mini MIDI</h1>

    <h2>Barebones MIDI Sample Player</h2>
    
    <button id="midiButton">Connect MIDI Device</button>
    
    <p id="status">Not connected</p>
    
    <select id="deviceSelect" disabled>
      <option>Select a MIDI device</option>
    </select>

    <p id="noteDisplay">Waiting for input...</p>

    <form id="sampleForm">
      <input type="file" id="sampleInput" name="Sample" required />
      <button id="sampleButton">Upload Sample</button>
    </form>

    <button id="playSample">Play Sample</button>
    
  </main>
  `;

  const midiButton = document.querySelector('#midiButton');
  const status = document.querySelector('#status');
  const deviceSelect = document.querySelector('#deviceSelect');
  const noteDisplay = document.querySelector('#noteDisplay');
  const sampleUploadButton = document.querySelector('#sampleButton');
  const playSampleButton = document.querySelector('#playSample');
  const sampleForm = document.querySelector('#sampleForm');

  let midiAccess;
  const audioContext = new AudioContext();
  let sample;

  midiButton.addEventListener('click', async () => {
    try {
      midiAccess = await navigator.requestMIDIAccess();

      deviceSelect.innerHTML = '';

      for (const input of midiAccess.inputs.values()) {
        const option = document.createElement('option');

        option.value = input.id;
        option.textContent = input.name;

        deviceSelect.appendChild(option);
      }

      deviceSelect.disabled = false;
      status.textContent = 'MIDI access granted!';

      connectDevice();

    } catch (error) {
      status.textContent = 'Could not access MIDI.';
      console.error(error);
    }
    });

    function connectDevice() {
      for (const input of midiAccess.inputs.values()) {
        input.onmidimessage = null;
      }

      const selectedInput = midiAccess.inputs.get(deviceSelect.value);
      
      if (!selectedInput) return;

      selectedInput.onmidimessage = (event) => {
        const [command, note, velocity] = event.data;

        if (command === 144 && velocity > 0) {
          noteDisplay.textContent = `Note pressed: ${note} at velocity ${velocity}`;
        }
      };
    }

    deviceSelect.addEventListener('change', connectDevice);

    sampleForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const fileInput = document.getElementById('sampleInput');

      if (fileInput.files.length === 0) {
        alert('Please select a file first.');
        return;
      }
      
      sample = await audioContext.decodeAudioData(
        await fileInput.files[0].arrayBuffer()
      );
    })

playSampleButton.addEventListener('click', async () => {
  const source = audioContext.createBufferSource();
  source.buffer = sample;
  source.connect(audioContext.destination);
  source.start();
})