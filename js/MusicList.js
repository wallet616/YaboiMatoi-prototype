"use strict";

class Music_Element {
    constructor(title, description, image_name, music_file_name) {
        this.id = "";
        this.element = null;

        this.title = title;
        this.description = description;
        this.image_name = image_name;
        this.music_file_name = music_file_name;

        this.audioNode = null;
    }

    init(id) {
        this.id = id;
    }

    find() {
        this.element = $("#" + this.id);
    }
}

class MusicList {
    constructor() {
        this.frame = null;
        this.frame_list = null;

        this.current_element_id = 0;

        this.elements = [];

        this.scrolled = false;

        this.audioNode = null;
    }

    init(frame_id) {
        this.frame = $("#" + frame_id);
        this.frame.innerHTML = "";

        var new_content = "<ul id='frame_list'>\n";
        for (var i = 0; i < this.elements.length; i++) {
            new_content += "<li id='frame_id_" + i + "'>";
            new_content += "<img src='img/" + this.elements[i].image_name + "' class='frame-mini-image' />";
            new_content += "<div class='hiding-layer'>\n";
            new_content += "<div class='description'>" + this.elements[i].title + "</div>\n";
            new_content += "</div>\n";
            new_content += "</li>\n";

            this.elements[i].init("frame_id_" + i);
        }
        new_content += "</ul>";

        frame.innerHTML = new_content;

        // Elements assigment.
        this.frame_list = $("#frame_list");
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].find();
        }

        // Sly init.
        var self = this;
        this.sly = new Sly(self.frame, {
            horizontal: 1,
            itemNav: 'centered',
            smart: 1,
            activateOn: 'click',
            mouseDragging: 1,
            touchDragging: 1,
            releaseSwing: 1,
            startAt: 0,
            scrollBar: $('#scrollbar'),
            scrollBy: 1,
            speed: 300,
            elasticBounds: 1,
            dragHandle: 1,
            dynamicHandle: 1,
            clickBar: 1,

            // Buttons
            prev: $('#music-button-previous'),
            next: $('#music-button-next')
        }, {
            active: change_selected
        });

        self.audioNode = new AudioNode("equalizer");
        self.sly.init();
        $(window).resize(function() {
            self.sly.reload();
        });
    }

    add(title, description, image_name, music_file_name) {
        var e = new Music_Element(title, description, image_name, music_file_name);
        this.elements.push(e);
    }

    get_list() {
        var self = this;
        $.ajax({
            url: 'data/ajax.php',
            type: "POST",
            data: {
                request: "get-list"
            },
            success: function(response) {
                if (response == "") {
                    console.log("No music!");
                } else {
                    var list = response.split("</>");
                    for (var i = 0; i < list.length; i++) {
                        list[i] = JSON.parse(list[i]);
                    }
                    list.sort(function(a, b) { return (a.index < b.index) ? 1 : -1; });

                    for (var i = 0; i < list.length; i++) {
                        self.add(list[i].title, list[i].description, list[i].image_name, list[i].music_file_name);
                    }
                    music_list.init("frame");
                }
            },
            error: function() {
                console.log("Php error!");
            }
        });
    }
};



function change_selected() {
    var current = null;
    var current_hiding = null;
    // Before change selected.
    current = music_list.elements[music_list.current_element_id];
    current_hiding = $(current.element).find(".hiding-layer");
    current_hiding.removeClass("active");
    $(current_hiding).find(".description").removeClass("active");


    // After change.
    music_list.current_element_id = music_list.sly.rel.activeItem;
    current = music_list.elements[music_list.current_element_id];
    current_hiding = $(current.element).find(".hiding-layer");
    current_hiding.addClass("active");
    $(current_hiding).find(".description").addClass("active");

    //console.log(music_list.elements[music_list.current_element_id]);
    //console.log(current);
    //console.log(current_hiding);


    $("#music-image-warp").attr("src", "img/" + current.image_name);
    $("#music-title-warp").html(current.title);
    $("#music-description-warp").html(current.description);

    change_selected_title_resize(current.title);

    $("#music-button-stop").click();
}

function change_selected_title_resize(title) {
    var title_size;
    if (title.length < 5) {
        title_size = 0.2;
    } else if (title.length > 25) {
        title_size = 1.0;
    } else {
        title_size = title.length / 25.0;
    }
    title_size = 1.0 - title_size;

    var title_base_size = 2.5;
    if (window.innerWidth >= 768) {
        title_base_size = 3.5;
    }
    if (window.innerWidth >= 992) {
        title_base_size = 4.0;
    }
    if (window.innerWidth >= 1200) {
        title_base_size = 4.5;
    }

    $("#music-title-warp").css("font-size", 0.7 * title_base_size + 1.8 * title_size + "em");

}