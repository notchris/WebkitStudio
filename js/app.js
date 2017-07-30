var audio_context;
var recorder;
var app = new Vue({
    el: '#app',
    data: {
        recording: false,
        master: {
            id: 'master',
            label: 'Master',
            file: false,
            wave: null
        },
        tracks: [{
            id: 'track1',
            label: 'Track 1',
            file: false,
            active: true,
            armed: false
        }, {
            id: 'track2',
            label: 'Track 2',
            file: false,
            active: false,
            armed: false
        }, {
            id: 'track3',
            label: 'Track 3',
            file: false,
            active: false,
            armed: false
        }, {
            id: 'track4',
            label: 'Track 4',
            file: false,
            active: false,
            armed: false
        }, {
            id: 'track5',
            label: 'Track 5',
            file: false,
            active: false,
            armed: false
        }, {
            id: 'track6',
            label: 'Track 6',
            file: false,
            active: false,
            armed: false
        }]
    },
    methods: {
        select: function(track) {
            for (let i = 0; i < app.tracks.length; i++) {
                app.tracks[i].active = false;
            }
            track.active = true;
        },
        arm: function(track) {
            for (let i = 0; i < app.tracks.length; i++) {
                if (app.tracks[i] !== track){
                    app.tracks[i].armed = false;
                }
            }
            if (!track.armed){
                track.armed = true;
            } else{
                track.armed = false;
            }
        },
        record: function() {
            if (!app.recording){
                app.recording = true;
                recorder && recorder.record();
            } else{
                app.recording = false;
                recorder && recorder.stop();
                recorder && recorder.exportWAV(function(blob) {
                    var url = URL.createObjectURL(blob);
                    for (let i = 0; i < app.tracks.length; i++) {
                        if (app.tracks[i].armed){
                            app.tracks[i].file = url;
                            app.tracks[i].wave = WaveSurfer.create({
                                container: '#' + app.tracks[i].id,
                                waveColor: '#333',
                                progressColor: '#0275d8',
                                fillParent: false,
                                minPxPerSec: 50,
                                cursorWidth: 1,
                                cursorColor: '#0275d8',
                                hideScrollbar: false,
                                interact: true,
                                responsive: false
                            });
                            app.tracks[i].wave.load(app.tracks[i].file);
                            app.tracks[i].wave.on('ready', function() {
                                app.tracks[i].wave.zoom(100);
                            });
                        }
                    }
                });
                recorder.clear();
                console.log('Stopped recording');
            }
        },
        play: function() {
            for (let i = 0; i < app.tracks.length; i++) {
                if (app.tracks[i].wave) {
                    app.tracks[i].wave.playPause();
                }
                app.master.wave.playPause();
            }
        },
        clear: function(track) {
            track.file = false;
            var node = document.getElementById(track.id);
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        },
        init: function() {
            app.master.wave = WaveSurfer.create({
                container: '#master',
                fillParent: false,
                minPxPerSec: 50,
                cursorWidth: 1,
                cursorColor: 'green',
                hideScrollbar: false,
                interact: false,
                responsive: false
            })
            app.master.wave.load('silence.wav');
            app.master.wave.on('ready', function() {
                app.master.wave.zoom(100);
                var timeline = Object.create(WaveSurfer.Timeline);
                timeline.init({
                    wavesurfer: app.master.wave,
                    container: '.grid'
                });
            });
        }
    }
});

var slider = document.querySelector('#slider');
slider.oninput = function () {
  var zoomLevel = Number(slider.value);
    for (let i = 0; i < app.tracks.length; i++) {
        if (app.tracks[i].wave) {
            app.tracks[i].wave.zoom(zoomLevel);
        }
    }
  app.master.wave.zoom(zoomLevel);
};

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    recorder = new Recorder(input);
    console.log('Media stream started');
}

window.onload = function init() {
    app.init();
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;
        audio_context = new AudioContext;
        console.log('Audio context initialized.');
        console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('This browser does not support Web Audio.');
    }
    navigator.getUserMedia({
        audio: true
    }, startUserMedia, function(e) {
        console.log('Could not locate live audio input: ' + e);
    });
};