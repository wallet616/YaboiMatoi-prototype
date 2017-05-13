"use strict";

class AudioNode {
    constructor(id) {
        this.context = new AudioContext();
        this.audioBuffer = null;
        this.sourceNode = null;
        this.analyser = null;
        this.javascriptNode = null;

        this.canvas = $("#" + id);
        this.ctx = this.canvas.get()[0].getContext("2d");

        this.gradient = this.ctx.createLinearGradient(0, 0, 0, 300);
        this.gradient.addColorStop(1, '#000000');
        this.gradient.addColorStop(0.75, '#ff0000');
        this.gradient.addColorStop(0.25, '#ffff00');
        this.gradient.addColorStop(0, '#ffffff');

        this.javascriptNode = null;
        this.analyser = null;
        this.sourceNode = null;

        this.await = false;
        this.current_loaded_id = -1;
        this.bufforing_id = -1;
        //this.loaded = false;

        this.play = false;
        this.timer = 0.0;
        this.timer_start = 0.0;
        //this.timer_stop = 0.0;
        this.initialize = false;

        var self = this;
        $("#music-button-play").click(function() {
            if (!self.await) {
                if (self.current_loaded_id == music_list.current_element_id) {
                    if (!self.play) {
                        var buf = self.sourceNode.buffer;
                        self.setupAudioNodes();
                        self.sourceNode.buffer = buf;
                        self.timer_start = self.sourceNode.context.currentTime;
                        //console.log("play" + self.timer);
                        self.start_play(self.timer);
                        //console.log(self);
                    } else {
                        //self.timer_stop = self.sourceNode.context.currentTime;
                        self.timer += self.sourceNode.context.currentTime - self.timer_start;
                        //console.log("pause" + self.timer + ", " + (self.sourceNode.context.currentTime - self.timer_start));
                        self.stop_play();
                        //console.log(self);
                    }
                } else {
                    self.timer = 0.0;
                    music_list.audioNode.current_loaded_id = music_list.current_element_id;
                    self.setupAudioNodes();
                    self.loadSound(music_list.elements[music_list.current_element_id].music_file_name);
                    //console.log(self);
                }
            }
        });

        $("#music-button-stop").click(function() {
            if (!self.await) {
                self.timer = 0.0;
                //console.log("stop" + self.timer);
                if (self.play) {
                    self.stop_play();
                    //console.log(self);
                }
            }
        });

        // Arrays for equalizer.
        this.array_size = 256;
        this.null_array = new Uint8Array(this.array_size);
        this.last_array = new Uint8Array(this.array_size);
        for (var i = 0; i < this.array_size; i++) {
            this.null_array[i] = 0;
            this.last_array[i] = 0;
        }

        this.equalizer_width = 0;
        this.equalizer_height = 0;
        this.equalizer_half_height = 0;
        this.equalizer_stick_height = 300;
        this.equalizer_drawable = 192;
        this.equalizer_opacity = 0.0;

        self.equalizer_resize();
        $(window).resize(function() {
            self.equalizer_resize();
        });
    }

    setupAudioNodes() {
        this.javascriptNode = this.context.createScriptProcessor(2048, 1, 1);
        this.javascriptNode.connect(this.context.destination);

        this.analyser = this.context.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.3;
        this.analyser.fftSize = 512;

        this.sourceNode = this.context.createBufferSource();
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.javascriptNode);

        this.sourceNode.connect(this.context.destination);


        if (!this.initialize) {
            var self = this;
            this.initialize = true;
            this.javascriptNode.onaudioprocess = function() {
                var array = new Uint8Array(self.analyser.frequencyBinCount);
                self.analyser.getByteFrequencyData(array);

                self.drawSpectrum(array);
                self.checkEnd(self);
            }
        }
    }

    checkEnd(self) {
        if (self.sourceNode.buffer == null) return;

        var t;
        if (self.play)
            t = self.timer + self.sourceNode.context.currentTime - self.timer_start;
        else
            t = self.timer;

        if (t >= self.sourceNode.buffer.duration) {
            $("#music-button-stop").click();
        }
    }

    loadSound(url) {
        url = "audio/" + url;
        console.log(url);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        //this.loaded = false;
        this.bufforing_id = music_list.current_element_id;
        this.current_loaded_id = -1;

        var self = this;
        self.await = true;
        self.loading_play();
        request.onload = function() {
            self.context.decodeAudioData(request.response, function(buffer) {
                self.await = false;
                self.current_loaded_id = self.bufforing_id;
                self.bufforing_id = -1;
                self.play = false;
                self.timer = 0.0;
                self.sourceNode.buffer = buffer;
                $("#music-button-play").click();
            }, self.onError);
        }
        request.send();
    }

    start_play(time) {
        this.play = true;
        this.sourceNode.start(0, time);
        $("#music-button-play-warp").removeClass("glyphicon-play");
        $("#music-button-play-warp").removeClass("glyphicon-refresh");
        $("#music-button-play-warp").addClass("glyphicon-pause");
    }

    stop_play() {
        this.sourceNode.stop();
        this.play = false;
        $("#music-button-play-warp").removeClass("glyphicon-pause");
        $("#music-button-play-warp").removeClass("glyphicon-refresh");
        $("#music-button-play-warp").addClass("glyphicon-play");
    }

    loading_play() {
        $("#music-button-play-warp").removeClass("glyphicon-play");
        $("#music-button-play-warp").removeClass("glyphicon-pause");
        $("#music-button-play-warp").addClass("glyphicon-refresh");
    }

    drawSpectrum(array) {
        this.ctx.clearRect(0, 0, this.equalizer_width, this.equalizer_height);
        this.ctx.fillStyle = "#191919";
        this.ctx.globalAlpha = this.equalizer_opacity;
        //console.log(this.timer);

        if (this.play) {
            this.equalizer_opacity += 0.05;
            if (this.equalizer_opacity > 1.0) {
                this.equalizer_opacity = 1.0;
            }
        } else {
            this.equalizer_opacity -= 0.05;
            if (this.equalizer_opacity < 0.0) {
                this.equalizer_opacity = 0.0;
            }
        }

        var half_width_left = this.equalizer_width / 2.0 - 3;
        var half_width_right = this.equalizer_width / 2.0 + 3;

        //console.log(array);
        for (var i = 0; i < this.equalizer_drawable; i += 1) {
            if (this.play) {
                this.last_array[i] = (this.last_array[i] * 0.8 + array[i] * 0.2) | 0;
            } else {
                this.last_array[i] = (this.last_array[i] * 0.8 + this.null_array[i] * 0.2) | 0;
            }

            var proc = this.last_array[i] / this.array_size;
            var x = this.equalizer_height * proc * 0.5;
            //var ii = i + 1;

            this.ctx.fillRect(half_width_right + i * 6, this.equalizer_half_height - x, 3, 300);
            this.ctx.fillRect(half_width_left + i * -6, this.equalizer_half_height - x, 3, 300);
            //this.ctx.fillRect(i * 5, this.equalizer_height - x, 12, this.equalizer_height);
        }
    }

    equalizer_resize() {
        this.equalizer_height = 950;
        this.equalizer_half_height = this.equalizer_height / 2 - this.equalizer_stick_height / 2 + 100;
        //this.equalizer_half_height = this.equalizer_height * ;
        this.equalizer_width = window.innerWidth;

        if (this.equalizer_width < 320)
            this.equalizer_width = 320;

        this.canvas.attr("width", this.equalizer_width);
        this.canvas.attr("height", this.equalizer_height);
    }

    onError(e) {
        this.await = false;
        this.play = false;
        this.bufforing_id = -1;
        this.current_loaded_id = -1;
        console.log(e);
    }
}