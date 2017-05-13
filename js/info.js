// Global objects:
var INFO;

var INFO_TYPE = {
    // NAME:    ["base bootstrap class (and optional classes)"]
    SUCCESS: ["alert alert-danger alert-dismissable"],
    INFO: ["alert alert-info alert-dismissable"],
    WARNING: ["alert alert-warning alert-dismissable"],
    DANGER: ["alert alert-danger alert-dismissable"]
};


// Info object:
class Info {
    constructor(id) {
        // Values:
        this.message_duration = 3900;
        this.message_fade_out = 500;
        this.enable = true;


        // Private members, do not touch:
        this.element; // = document.getElementById(id);
        this.lastID = 0;

        if (document.getElementById(id)) {
            this.element = document.getElementById(id);
            console.info("INFO: Initialization successful.");
        } else
            console.error("INFO: Unable to locate element of id '" + id + "' during initialization process.");
    }

    setEnable(value) {
        if (value) {
            this.enable = true;
            console.info("INFO: Has been enabled.");
        } else {
            this.enable = false;
            console.info("INFO: Has been disabled.");
        }
    }

    push(type, message) {
        if (this.enable) {
            var self = this;
            var complex_message = "";
            var found = true;
            this.lastID++;

            complex_message += "<div ";
            complex_message += "id='INFO_MESSAGE_ID_" + this.lastID + "' ";

            switch (type) {
                case INFO_TYPE.SUCCESS:
                    complex_message += "class='" + type[0] + "'>";
                    complex_message += "<strong>Success!</strong> ";
                    break;

                case INFO_TYPE.INFO:
                    complex_message += "class='" + type[0] + "'>";
                    complex_message += "<strong>Info!</strong> ";
                    break;

                case INFO_TYPE.WARNING:
                    complex_message += "class='" + type[0] + "'>";
                    complex_message += "<strong>Warning!</strong> ";
                    break;

                case INFO_TYPE.DANGER:
                    complex_message += "class='" + type[0] + "'>";
                    complex_message += "<strong>Danger!</strong> ";
                    break;

                default:
                    found = false;
                    this.lastID--;
                    break;
            }

            complex_message += "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>";
            complex_message += message;
            complex_message += "</div>";

            if (found) {
                $(this.element).append(complex_message);

                var fixed_id = this.lastID;
                setTimeout(function() {
                    $("#INFO_MESSAGE_ID_" + fixed_id).animate({
                        "opacity": 0
                    }, {
                        "duration": self.message_fade_out,
                        "queue": true
                    }).animate({
                        "height": 0,
                        "margin": 0,
                        "padding": 0
                    }, {
                        "duration": 400,
                        "queue": true,
                        "done": function() {
                            this.remove();
                        }
                    });

                }, self.message_duration);
            } else {
                console.error("INFO: No matching types for message '" + message + "', use types from 'INFO_TYPE' instead.");
            }
        } else {
            console.info("INFO: You do have to enable INFO first in order to push messages.");
        }
    }
}


// Ready
$(document).ready(function() {
    INFO = new Info("announcements");
});