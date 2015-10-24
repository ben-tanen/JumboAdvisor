var degree_list  = null;
var degree_sheet = null;
var course_list  = null;

function isSingleReq(req) {
    if (req['valid_set'].length == 1 && req['valid_set'][0][0] == 'is') return true;
    else return false;
}

function generate_new_degree_section(section) {
    html_str = "<div class = 'sect-reqs'><div class='sect-header'><h3>" + section['name'] + "</h3></div><ul>";
    for (j = 0; j < section['req_list'].length; j++) {
        req = section['req_list'][j]
        html_str += "<li><div class='req " + (isSingleReq(req)?"req-single":"req-input") +"'>" + req['name'] + (isSingleReq(req)?"":"<br /><div class='class-input'><input class='class-input-field' type='text'></div>") + "<div class='validation-check'></div><select class='semester-select'><option value='S17'>S17</option><option value='F16'>F16</option><option value='S16'>S16</option><option value='F15'>F15</option></select></div></li>";
    }
    html_str += "</ul></div>"
    $('.wrapper').append(html_str)
}

function isCourse(dept, course_num) {
    return (function (course) {
        var separator = (course.indexOf('-') >= 0? '-' : ' ');
        return (dept.toLowerCase() == course.split(separator)[0].toLowerCase() && course_num == parseInt(course.split(separator)[1]))
    });
}

function isCourseInRange(dept, min, max) {
    return (function (course) {
        var separator = (course.indexOf('-') >= 0? '-' : ' ');
        return (dept.toLowerCase() == course.split(separator)[0].toLowerCase() && (min <= parseInt(course.split(separator)[1]) || max >= parseInt(course.split(separator)[1])))
    });
}

function attributeCheck(attribute) {
    return (function (course) {
        var chkdept = course.split('-')[0];
        var chknum = parseInt(course.split('-')[1]);
        for (x=0;x < course_list.length; x++) {
            if (course_list[x]["course_num"].split('-')[0] == chkdept && parseInt(course_list[x]["course_num"].split('-')[1]) == chknum) {
                if (course_list[x]['attrs'].indexOf(attribute) >= 0) return true;
                else return false;
            }
        }
    });
}


function course_validated(input_field) {
    input_field.closest('.req').find('.validation-check').css({'background-image': 'url("images/check.png")', 'background-size' : '20px'});
    input_field.closest('.req').find('.validation-check').siblings('select').css('display', 'inline-block');
}

function course_failed(input_field) {
    input_field.closest('.req').find('.validation-check').css({'background-image': 'url("images/x.png")', 'background-size' : '20px'});
}

$(function() {
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
                } else if (valid_set[i][0] == 'attr' && attributeCheck(valid_set[i][1])(course_name)) {
                    course_validated($(this));
                    return;
                }        
            }

            course_failed($(this));

        }
    });

    $(document).on('click', '.validation-check', function(e){
        req_num =  $(this).closest('.req').parent().index()
        sect_num = $(this).closest('.sect-reqs').index()
        valid_set = degree_sheet['sect_reqs'][sect_num]['req_list'][req_num]['valid_set']

        if (valid_set.length == 1 && valid_set[0][0] == 'is') {
            if ($(this).css('background-image') == 'none') {
                $(this).css({'background-image': 'url("images/check.png")', 'background-size' : '20px'});
                $(this).siblings('select').css('display', 'inline-block');
            } else {
                $(this).css({'background-image': 'none', 'background-size' : '20px'});
                $(this).siblings('select').css('display', 'none');
            }
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

                    $.ajax({
                        url: "http://130.64.193.20:3000/getCourseList",
                    }).done(function(data) {
                        course_list = data;
                    });
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