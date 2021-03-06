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
        html_str += "<li><div class='req " + (isSingleReq(req)?"req-single":"req-input") +"'>" + (isSingleReq(req)?"":"<span class='req_link'>") + req['name'] + (isSingleReq(req)?"":"</span><br /><div class='class-input'><input class='class-input-field' type='text'></div>") + "<div class='validation-check'></div><select class='semester-select'><option selected disabled hidden value=''></option><option value='S17'>S17</option><option value='F16'>F16</option><option value='S16'>S16</option><option value='F15'>F15</option><option value='S15'>S15</option><option value='F14'>F14</option><option value='S14'>S14</option><option value='F13'>F13</option></select></div></li>";
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

function clean_course_name(name) {
    return name.toUpperCase().trim().replace(' ', '-');
}

function get_schedule_data(wrapper) {
    sem_mapping = ['F13', 'S14', 'F14', 'S15', 'F15', 'S16', 'F16', 'S17'];
    schedule = new Array(8);
    for (i = 0; i < schedule.length; i++) { schedule[i] = [ ] }

    selects = $('.semester-select');
    for (i = 0; i < selects.length; i++) {
        if (selects[i].value != "") {
            course_sem  = selects[i].value
            index = sem_mapping.indexOf(course_sem);
            req = $(selects[i]).closest('.req')
            if (req.hasClass('req-single')) {
                schedule[index].push(clean_course_name(req[0].innerText))
            } else {
                schedule[index].push(clean_course_name($(req.children()[2]).children()[0].value));  
            }
            
        }
    }

    html_str = ''
    for (i = 0; i < schedule.length; i++) {
        if (schedule[i].length > 0) {
            html_str += '<p><b>' + sem_mapping[i] + ':</b></p>';
            for (j = 0; j < schedule[i].length; j++) {
                html_str += '<p>' + schedule[i][j] + '</p>';
            }
            html_str += '</br>'
        }
    }
    return html_str;
}

$(function() {
    $.ajax({
        url: "http://jumbo-advisor.herokuapp.com/getDegreeList",
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

    schedule_popup = new jBox('Modal',{
        attach: $('#view-schedule'),
        width: 300 ,
        height: 400,
        title: "Your Tufts Schedule",
        content: "Loading...",
        onOpen: function() {
            this.setContent(get_schedule_data($('.wrapper')));
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
                $('#logo').animate({'width': '100px'}, 500);
                $('#view-schedule').css('display', 'inline');
                $.ajax({
                    url: "http://jumbo-advisor.herokuapp.com/getDegreeSheet",
                    data: {
                        degree: $('#degree-search').val(),
                    }
                }).done(function(data) {
                    degree_sheet = data;
                    $('.wrapper').html('');
                    for (i = 0; i < data['sect_reqs'].length; i++) {
                        generate_new_degree_section(data['sect_reqs'][i]);
                    }

                    user_guide_popup = new jBox('Modal',{
                        attach: $('.req_link'),
                        width: 400 ,
                        height: 100,
                        title: "Description",
                        content: "Loading...",
                        onOpen: function() {
                            source = $(this.source)
                            req_num =  $(source).closest('.req').parent().index()
                            sect_num = $(source).closest('.sect-reqs').index()
                            this.setContent(degree_sheet['sect_reqs'][sect_num]['req_list'][req_num]['description']);
                        }
                    });

                    $.ajax({
                        url: "http://jumbo-advisor.herokuapp.com/getCourseList",
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