"use strict";

function requestLogin(silent) {
    var login = $("#login-login").val();
    var password = $("#login-password").val();

    $.ajax({
        url: 'data/ajax.php',
        type: "POST",
        data: {
            request: "login",
            key: login + "/" + password
        },
        success: function(response) {
            if (response == 'OK') {
                if (!silent) INFO.push(INFO_TYPE.INFO, "Logged!");
                logged(true);
            } else if (response == "NO_OK") {
                if (!silent) INFO.push(INFO_TYPE.WARNING, "Incorrect login!");
                logged(false);
            } else {
                INFO.push(INFO_TYPE.DANGER, "Php error!");
                logged(false);
            };
        },
        error: function() {
            INFO.push(INFO_TYPE.WARNING, "Php error!");
            logged(false);
        },
    });
};


class Panel {
    constructor() {
        this.list = [];
        this.list_file_name = [];

        this.list_element = null;
        this.list_id;
        this.description_element = null;

        this.lastID;

        this.current_id;
        this.current_element;

        this.force_select_new = false;

        this.current_changed_image = false;
        this.image_new_name;
        this.input_image_f = new FileReader();

        this.current_changed_song = false;
        this.new_song_name;
        this.input_song_f = new FileReader();

        this.await_image = false;
        this.await_song = false;

        this.new_file_name;

        this.awaiting = false;

        this.new_song = false;

        this.delete_status = -1;
    }

    init(list_id, description_id) {
        // Validation.
        if (!document.getElementById(list_id)) {
            console.error("PANEL: Unable to locate element of id '" + list_id + "' during initialization process.");
            return;
        }
        if (!document.getElementById(description_id)) {
            console.error("PANEL: Unable to locate element of id '" + description_id + "' during initialization process.");
            return;
        }

        // Initialization.
        this.list_id = list_id;
        this.list_element = $(document.getElementById(list_id));
        this.description_element = $(document.getElementById(description_id));
        this.lastID = 0;
        this.current_id = -2;

        // Log.
        console.info("PANEL: Initialization successful.");

        // List.
        this.get_list();

        // Save button.
        var self = this;
        $("#song-button").click(function() {
            if (self.awaiting) return;

            self.awaiting = true;
            if (self.current_id >= 0) {
                self.update_song();
            } else {
                self.create_song();
            }
        });

        $("#delete-button").click(this.delete_button);
        $("#delete-yes").click(this.delete_yes);
        $("#delete-no").click(this.delete_reset);

        $("#song-song-new").on('change', function() {
            var val = this.value.replace(/.*[\/\\]/, '').trim();
            self.new_song_name = val;

            if (val == "") {
                self.current_changed_song = false;

                //$("#song-song-current").val("");

            } else {
                self.current_changed_song = true;
                //$("#song-song-current").val(val);
            }
            self.song_change_status();
        });

        $("#song-image-new").on('change', function() {
            var val = this.value.replace(/.*[\/\\]/, '').trim();
            self.image_new_name = val;

            if (val == "") {
                self.current_changed_image = false;

                //$("#song-image-current").val("");

            } else {
                self.current_changed_image = true;
                //$("#song-image-current").val(val);
            }
            self.image_change_status();
        });


        $("#song-image-delete").click(function() {
            self.current_changed_image = false;
            self.image_change_status();
        });

        $("#song-song-delete").click(function() {
            self.current_changed_song = false;
            self.song_change_status();
        });
    }

    song_change_status() {
        if (this.current_changed_song) {
            $("#song-song-new-status").html("<small>File will BE replaced by: <br>" + this.new_song_name + "</small>");
        } else {
            $("#song-song-new-status").html("<small>File will NOT be <br>replaced.</small>");
            this.new_song_name = "";
        }
    }

    image_change_status() {
        if (this.current_changed_image) {
            $("#song-image-new-status").html("<small>File will BE replaced by: <br>" + this.image_new_name + "</small>");
        } else {
            $("#song-image-new-status").html("<small>File will NOT be <br>replaced.</small>");
            this.image_new_name = "";
        }
    }


    update_song() {
        var self = this;
        var input_image;
        var input_song;
        //var data = new FormData();

        self.list[self.current_id].title = $("#song-title").val().trim();
        self.list[self.current_id].description = $("#song-description").val().trim();
        self.new_file_name = self.list[self.current_id].title + Math.floor(Date.now() / 1000) + ".json";

        self.input_image_f = new FileReader();
        if (self.current_changed_image) {
            self.list[self.current_id].image_name = self.image_new_name;
            //data.append("image", $("#song-image-new").get(0).files[0]);
            input_image = document.getElementById("song-image-new");
            var file = input_image.files[0];
            self.await_image = true;
            self.input_image_f.readAsDataURL(file);
            self.input_image_f.onload = self.update_image_ready;
        }
        self.current_changed_image = false;


        self.input_song_f = new FileReader();
        if (self.current_changed_song) {
            self.list[self.current_id].music_file_name = self.new_song_name;
            //data.append("song", $("#song-song-new").get(0).files[0]);
            input_song = document.getElementById("song-song-new");
            var file = input_song.files[0];
            self.await_song = true;
            self.input_song_f.readAsDataURL(file);
            self.input_song_f.onload = self.update_song_ready;
        }
        self.current_changed_song = false;


        self.update_song_ajax();
    }

    update_song_ready() {
        PANEL.await_song = false;
        PANEL.update_song_ajax();
    }

    update_image_ready() {
        PANEL.await_image = false;
        PANEL.update_song_ajax();
    }

    update_song_ajax() {
        var self = PANEL;

        if (self.await_song) return;
        if (self.await_image) return;

        //console.log(self.input_song_f.result);
        //console.log(self.input_image_f.result);

        //console.log("update");

        /*console.log({
            request: "update-song-admin",
            current_file: self.list_file_name[self.current_id],
            new_file: self.new_file_name,
            content: JSON.stringify(self.list[self.current_id]),
            song: self.input_song_f.result,
            old_song: $("#song-song-current").val(),
            new_song_name: self.new_song_name,
            image: self.input_image_f.result,
            old_image: $("#song-image-current").val(),
            image_new_name: self.image_new_name
        });*/

        $.ajax({
            url: 'data/ajax.php',
            type: 'POST',
            data: {
                request: "update-song-admin",
                current_file: self.list_file_name[self.current_id],
                new_file: self.new_file_name,
                content: JSON.stringify(self.list[self.current_id]),
                song: self.input_song_f.result,
                old_song: $("#song-song-current").val(),
                new_song_name: self.new_song_name,
                image: self.input_image_f.result,
                old_image: $("#song-image-current").val(),
                image_new_name: self.image_new_name
            },
            beforeSend: function() { INFO.push(INFO_TYPE.INFO, "Upload started, please wait."); },
            success: function(response) {
                console.log(response);
                self.awaiting = false;
                if (response == "OK") {
                    self.list_file_name[self.current_id] = self.new_file_name;
                    self.current_element.children(".title").first().html(self.list[self.current_id].title);
                    INFO.push(INFO_TYPE.INFO, "Changes saved.");

                    $("#song-image-current").val(self.list[self.current_id].image_name);
                    $("#song-song-current").val(self.list[self.current_id].music_file_name);
                } else {
                    INFO.push(INFO_TYPE.DANGER, "Save failed!\nReload the page and try again.");
                }
                self.image_change_status();
                self.song_change_status();
            },
            error: function() {
                INFO.push(INFO_TYPE.DANGER, "Php error!");
                self.awaiting = false;
            }
        });
    }



    create_song() {
        var self = PANEL;
        var input_image;
        var input_song;


        var new_title = $("#song-title").val().trim();
        if (new_title.length == 0) {
            self.awaiting = false;
            INFO.push(INFO_TYPE.DANGER, "No title set. Cannot create.");
            return;
        }

        self.lastID++;
        self.force_select_new = true;

        var s_name = (self.current_changed_song) ? self.new_song_name : "None";
        var i_name = (self.current_changed_image) ? self.image_new_name : "None";

        self.new_song = {
            index: self.lastID,
            title: new_title,
            description: $("#song-description").val().trim(),
            image_name: i_name,
            music_file_name: s_name
        };


        self.new_file_name = self.new_song.title + "_" + Math.floor(Date.now() / 1000) + ".json";


        self.input_image_f = new FileReader();
        if (self.current_changed_image) {
            input_image = document.getElementById("song-image-new");
            var file = input_image.files[0];
            self.await_image = true;
            self.input_image_f.readAsDataURL(file);
            self.input_image_f.onload = self.create_image_ready;
        }
        self.current_changed_image = false;


        self.input_song_f = new FileReader();
        if (self.current_changed_song) {
            input_song = document.getElementById("song-song-new");
            var file = input_song.files[0];
            self.await_song = true;
            self.input_song_f.readAsDataURL(file);
            self.input_song_f.onload = self.create_song_ready;
        }
        self.current_changed_song = false;


        self.create_song_ajax();
    }

    create_song_ready() {
        PANEL.await_song = false;
        PANEL.create_song_ajax();
    }

    create_image_ready() {
        PANEL.await_image = false;
        PANEL.create_song_ajax();
    }



    create_song_ajax() {
        var self = PANEL;

        if (self.await_song) return;
        if (self.await_image) return;

        $.ajax({
            url: 'data/ajax.php',
            type: 'POST',
            data: {
                request: "create-song-admin",
                new_file: self.new_file_name,
                content: JSON.stringify(self.new_song),
                image: self.input_image_f.result,
                image_new_name: self.image_new_name,
                song: self.input_song_f.result,
                new_song_name: self.new_song_name,
            },
            beforeSend: function() { INFO.push(INFO_TYPE.INFO, "Upload started, please wait."); },
            success: function(response) {
                self.awaiting = false;
                if (response == "OK") {
                    INFO.push(INFO_TYPE.INFO, "Post created.");
                    self.get_list();
                } else {
                    INFO.push(INFO_TYPE.DANGER, "Could not create post!\nReload the page and try again.");
                }
            },
            error: function() {
                INFO.push(INFO_TYPE.DANGER, "Php error!");
            }
        });
    }


    reload() {
        var new_content = "";

        new_content += "<div class='row admin-list-element'' data-index='-1'>\n";
        new_content += "<div class='title'>Create new one</div>\n";
        new_content += "</div>\n";

        for (var i = 0; i < this.list.length; i++) {
            new_content += "<div class='row admin-list-element'' data-index='" + i + "'>\n";
            new_content += "<div class='title'>" + this.list[i].title + "</div>\n";
            new_content += "</div>\n";
        }
        new_content += "";

        this.list_element.html(new_content);


        var self = this;
        $(".admin-list-element").click(function() {
            self.select($(this));
        });

        if (this.force_select_new) {
            this.force_select_new = false;
            this.select(this.list_element.children()[1]);
        } else {
            this.select(this.list_element.children()[0]);
        }
    }

    get_list() {
        this.list = [];
        this.list_file_name = [];

        var self = this;
        $.ajax({
            url: 'data/ajax.php',
            type: 'POST',
            data: {
                request: "get-list-admin"
            },
            success: function(response) {
                if (response == "") {
                    INFO.push(INFO_TYPE.INFO, "No music!");
                } else {
                    var temp_list = response.split("</>");
                    for (var i = 0; i < temp_list.length; i++) {
                        temp_list[i] = temp_list[i].split("<:>");

                        temp_list[i][1] = JSON.parse(temp_list[i][1]);
                    }

                    temp_list.sort(function(a, b) {
                        return (a[1].index < b[1].index) ? 1 : -1;
                    });

                    for (var i = 0; i < temp_list.length; i++) {
                        self.list_file_name.push(temp_list[i][0]);
                        self.list.push(temp_list[i][1]);
                    }
                    self.lastID = self.list[0].index;
                }
                self.reload();
            },
            error: function() {
                INFO.push(INFO_TYPE.DANGER, "Php error!");
            }
        });
    }


    select(element) {
        var e = $(element);
        var id = e.data("index");

        // The same.
        if (id == this.current_id) return;
        if (this.awaiting) return;

        // Change selection.
        e.addClass("active");
        if (this.current_element != null) {
            this.current_element.removeClass("active");
        }

        // Display at main panel.
        var self = this;
        if (id >= 0) {
            $("#title").text("Edit existing.");
            $("#song-title").val(this.list[id].title);
            $("#song-description").val(this.list[id].description);
            $("#song-image-current").val(this.list[id].image_name);
            $("#song-song-current").val(this.list[id].music_file_name);
            self.delete_status = 0;
        } else {
            $("#title").text("Create new one.");
            $("#song-title").val("");
            $("#song-description").val("");
            $("#song-image-current").val("");
            $("#song-song-current").val("");
            self.delete_status = -1;
        }

        // Assign new values.
        this.current_element = e;
        this.current_id = id;
        this.current_changed_image = false;
        this.current_changed_song = false;

        this.song_change_status();
        this.image_change_status();
        this.delete_reset();
    }


    delete_button() {
        if (PANEL.delete_status == -1) {
            INFO.push(INFO_TYPE.WARNING, "Cannot delete this post.");
            return;
        }

        if (PANEL.awaiting) {
            INFO.push(INFO_TYPE.WARNING, "Cannot delete this post right now, please wait.");
            return;
        }



        $("#delete-button").css("display", "none");
        $("#delete-yes").css("display", "inline-block");
        $("#delete-no").css("display", "inline-block");
    }

    delete_yes() {
        if (PANEL.delete_status == -1) {
            INFO.push(INFO_TYPE.WARNING, "Cannot delete this post.");
            return;
        }
        if (PANEL.awaiting) {
            INFO.push(INFO_TYPE.WARNING, "Cannot delete this post right now, please wait.");
            return;
        }

        PANEL.awaiting = true;


        $.ajax({
            url: 'data/ajax.php',
            type: 'POST',
            data: {
                request: "delete-admin",
                file_name: PANEL.list_file_name[PANEL.current_id],
                image_name: PANEL.list[PANEL.current_id].image_name,
                song_name: PANEL.list[PANEL.current_id].music_file_name
            },
            success: function(response) {
                if (response == "OK") {
                    INFO.push(INFO_TYPE.INFO, "Post deleted.");
                } else {
                    INFO.push(INFO_TYPE.DANGER, "Post could not be deleted!");
                }

                PANEL.awaiting = false;
                PANEL.get_list();
            },
            error: function() {
                PANEL.awaiting = false;
                INFO.push(INFO_TYPE.DANGER, "Php error!");
            }
        });


        PANEL.delete_reset();
    }

    delete_reset() {
        $("#delete-button").css("display", "inline-block");
        $("#delete-yes").css("display", "none");
        $("#delete-no").css("display", "none");
    }
}



function logged(status) {
    if (status === true) {
        $("#panel-login").css("display", "none");
        $("#panel-admin").css("display", "block");

        PANEL.init("admin-list-cell", "admin-description-cell");
    } else {
        $("#panel-login").css("display", "block");
        $("#panel-admin").css("display", "none");
        $("#login-login").val("");
        $("#login-password").val("");
    }
}
// Global access to the panel.
var PANEL = new Panel();



// Ready
$(document).ready(function() {
    requestLogin(true);
    $("#login-button").click(function() { requestLogin(false); });


});