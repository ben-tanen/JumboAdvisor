function isSingleReq(req) {
    if (req['valid_set'].length == 1 && req['valid_set'][0][0] == 'is') return true;
    else return false;
}

function generate_new_degree_section(section) {
    html_str = "<div class = 'sect-reqs'><div class='sect-header'><h3>" + section['name'] + "</h3></div><ul>";
    for (j = 0; j < section['req_list'].length; j++) {
        req = section['req_list'][j]
        html_str += "<li><div class='" + (isSingleReq(req)?"req-single":"req-input") +"'>" + req['name'] + (isSingleReq(req)?"":"<br /><div class='class-input'><input class='class-input-field' type='text'></div>") + "<div class='validation-check'></div></div></li>";
    }
    html_str += "</ul></div>"
    $('.wrapper').append(html_str)
}

$(function() {
    var degree_list = [ ];
    $.ajax({
        url: "http://130.64.193.20:3000/getDegreeList",
    }).done(function(data) {
        degree_list = data;

        $( "#degree-search" ).autocomplete({
            source: data
        });
    });

    $('#degree-search').keyup(function(e){
        if(e.keyCode == 13) {
            if(degree_list.indexOf($('#degree-search').val()) > -1) {
                $.ajax({
                    url: "http://130.64.193.20:3000/getDegreeSheet",
                    data: {
                        degree: $('#degree-search').val(),
                    }
                }).done(function(data) {
                    for (i = 0; i < data['sect_reqs'].length; i++) {
                        generate_new_degree_section(data['sect_reqs'][i]);
                    }
                });
            } else {
                alert('Please Enter a Valid Major');
            }
        }
    });

    $('.class-input-field').keyup(function(e){
        console.log(e)
        if(e.keyCode == 13) {
            console.log('pressed enter');
            console.log(this);
        }
    });
});