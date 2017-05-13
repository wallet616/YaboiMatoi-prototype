var music_list = new MusicList();

$(document).ready(function() {

    ///////////////////////////
    // Music list
    music_list.get_list();

    $(window).scroll(function() {
        $(".slideanim").each(function() {
            var pos = $(this).offset().top;
            var winTop = $(window).scrollTop();
            //console.log(pos + ", " + winTop);
            if (pos < winTop + window.innerHeight * 0.9) {
                $(this).addClass("slide");
            }
        });

        if (!music_list.scrolled) {
            var pos = $("#music-buttons").offset().top;
            var winTop = $(window).scrollTop();
            if (pos < winTop + window.innerHeight * 0.9) {
                music_list.scrolled = true;
            }
        }
    });


    $(window).resize(function() {
        change_selected_title_resize(music_list.elements[music_list.current_element_id].title);
    });


    setTimeout(function() {
        music_list.sly.reload();
        music_list.audioNode.equalizer_resize();
    }, 1000);
    setTimeout(function() {
        music_list.sly.reload();
        music_list.audioNode.equalizer_resize();
    }, 3000);
});