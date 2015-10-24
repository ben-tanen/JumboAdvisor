function isSingleReq(req) {
    if (req['valid_set'].length == 1 && req['valid_set'][0][0] == 'is') return true;
    else return false;
}

function generate_new_degree_section(section) {
    html_str = "<div class = 'sect-reqs'><div class='sect-header'><h3>" + section['name'] + "</h3></div><ul>";
    for (j = 0; j < section['req_list'].length; j++) {
        req = section['req_list'][j]
        html_str += "<li><div class='req " + (isSingleReq(req)?"req-single":"req-input") +"'>" + req['name'] + (isSingleReq(req)?"":"<br /><div class='class-input'><input class='class-input-field' type='text'></div>") + "<div class='validation-check'></div></div></li>";
    }
    html_str += "</ul></div>"
    $('.wrapper').append(html_str)
}

function isCourse(dept, course_num) {
    return (function (course) {
        return (dept == course.split('-')[0] && course_num == parseInt(course.split('-')[1]))
    });
}

function isCourseInRange(dept, min, max) {
    return (function (course) {
        return (dept == course.split('-')[0] && (min <= parseInt(course.split('-')[1]) || max >= parseInt(course.split('-')[1])))
    });
}



function course_validated(input_field) {
    input_field.closest('.req').find('.validation-check').css({'background-image': 'url("images/check.png")', 'background-size' : '20px'});
}

function course_failed(input_field) {
    input_field.closest('.req').find('.validation-check').css({'background-image': 'url("images/x.png")', 'background-size' : '20px'});
}

$(function() {
    var degree_list = [ ];
    var degree_sheet = null;
    $.ajax({
        url: "http://130.64.193.20:3000/getDegreeList",
    }).done(function(data) {
        degree_list = data;

        $( "#degree-search" ).autocomplete({
            source: data
        });
    });

    $(document).on('keydown', '.class-input-field', function(e){
        if (e.keyCode == 13) {
            course_name = $(this).val()
            console.log(course_name)

            req_num =  $(this).closest('.req').parent().index()
            sect_num = $(this).closest('.sect-reqs').index()
            valid_set = degree_sheet['sect_reqs'][sect_num]['req_list'][req_num]['valid_set']

            for (i = 0; i < valid_set.length; i++) {
                if (valid_set[i][0] == 'is' && isCourse(valid_set[i][1], valid_set[i][2])(course_name)) {
                    course_validated($(this));
                    return;
                } else if (valid_set[i][0] == 'range' && isCourseInRange(valid_set[i][1], valid_set[i][2], valid_set[i][2])(course_name)) {
                    course_validated($(this));
                    return;
                } else if (valid_set[i][0] == 'any') {
                    course_validated($(this));
                    return;
                }        
            }

            course_failed($(this));

        }
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
                    degree_sheet = data;
                    $('.wrapper').html('');
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