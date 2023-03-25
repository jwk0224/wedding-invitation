$(document).ready(function() {
    try {
        dbInitialize();
        updateMessages();
        $(".copy").tooltip({ trigger : "manual" });
    } catch (error) {
    }
});

let PHOTOS = "";
let VISIBLE_PHOTO_COUNT = "";
let TOTAL_PHOTO_COUNT = "";

function setPhotos(json) {
    PHOTOS = json["photo_list"];
    VISIBLE_PHOTO_COUNT = json["visible_photo_count"];
    TOTAL_PHOTO_COUNT = Object.keys(PHOTOS).length;

    $.each(PHOTOS, function(index, photo) {
        $("#thumbnail_list").append(
            "<div id='t"+index+"' class='thumbnail-box'>" +
            "<div class='thumbnail-wrapper'>" +
                "<img class='thumbnail' src='"+photo+"' onclick='javascript: openGallery("+index+")'>" +
            "</div>" +
            "</div>"
        );

        if(index > VISIBLE_PHOTO_COUNT) $("#t"+index).hide();

        if(index == 1) {
            $("#carousel_list").append(
                "<div class='carousel-item active'>" +
                    "<img class='d-block' src='"+photo+"'>" +
                "</div>"
            );
        } else {
            $("#carousel_list").append(
                "<div class='carousel-item'>" +
                    "<img class='d-block' src='"+photo+"'>" +
                "</div>"
            );
        }
    });
}

$.getJSON("resource/photo.json", function(json) {
    setPhotos(json);
});

function showMorePhotos() {
    for(index=VISIBLE_PHOTO_COUNT+1; index<=TOTAL_PHOTO_COUNT; index++) {
        $("#t"+index).show();
    }
    $("#more_button").hide();
}

function openGallery(photo_index) {
    $(".carousel").carousel(photo_index-1);
    $("#gallery").css("display", "block");
    disableScroll();
}

function closeGallery() {
    $("#gallery").css("display", "none");
    enableScroll();
}

let POSITION = "";

function disableScroll() {
    POSITION = window.pageYOffset;
    $("body").addClass("freeze");
    $("body").css("top", (-1)*POSITION + "px");
}

function enableScroll() {
    $("body").removeClass("freeze");
    window.scrollTo(0, POSITION);
}

function copyAccount(modal_id, object_id, account_num) {
    $("#"+modal_id).append("<textarea id='temp'>"+account_num+"</textarea>");
    $("#temp")[0].select();
    $("#temp")[0].setSelectionRange(0, 99999);
    document.execCommand("copy");
    $("#temp").remove();

    $("#"+object_id).tooltip("show");
    setTimeout(function() {
        $("#"+object_id).tooltip("hide");
    }, 1000);
}

(function() {
  'use strict';
  window.addEventListener('load', function() {
    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault();
                submitForm(form.id);
            }
            form.classList.add('was-validated');
        }, false);
    });
  }, false);
})();

function submitForm(form_id) {
    try {
        if(form_id == "add_message_form") {
            const name = $("#name").val();
            const comment = $("#comment").val();
            const password = $("#password").val();

            $('#add_message').modal('hide');
            dbCreateMessage(name, comment, password);
        } else {
            const message = MESSAGES[$("#form_index").val()];
            const password_check = $("#password_check").val();

            if(message["password"] == password_check) {
                $('#delete_message').modal('hide');
                dbDeleteMessage(message["id"]);
            } else {
                $("#alert").html(
                    "<div class='alert alert-danger' role='alert' style='margin-bottom: 0px; margin-top: 16px'>" +
                        "비밀번호가 일치하지 않습니다." +
                    "</div>"
                );
            }
        }
    } catch (error) {
    }
}

function initializeMessageForm() {
    var forms = document.getElementsByClassName('needs-validation');
    $.each(forms, function(index, form) {
        form.reset();
        form.classList.remove('was-validated');
    });
}

function initializeDeleteMessageForm(index) {
    initializeMessageForm();
    $("#form_index").val(index);
    $("#alert").html("");
}

function updateMessages() {
    try {
        dbReadAllMessages();
    } catch (error) {
    }
}

let MESSAGES = "";
let VISIBLE_MESSAGE_COUNT = 5;
let TOTAL_MESSAGE_COUNT = "";

function setMessages(messages) {
    MESSAGES = messages;
    TOTAL_MESSAGE_COUNT = Object.keys(MESSAGES).length;

    $("#message_list").empty();

    $.each(MESSAGES, function(index, message) {
        if(index == VISIBLE_MESSAGE_COUNT) return false;

        $("#message_list").append(
            "<li class='list-group-item message-item'>" +
                "<div class='card-body message-card'>" +
                    "<div class='row message-row'>" +
                        "<div class='col message-col1'>" +
                            "<h5 class='card-title message-name'>" + message["name"] + "</h5>" +
                        "</div>" +
                        "<div class='col-1 message-col2'>" +
                            "<button type='button' class='close' data-toggle='modal' data-target='#delete_message' onclick='javascript: initializeDeleteMessageForm(" + index + ")'>" +
                                "<span aria-hidden='true'>&times;</span>" +
                            "</button>" +
                        "</div>" +
                    "</div>" +
                    "<p class='card-text message-comment'>" + message["comment"] + "</p>" +
                    "<p class='card-text message-time'><small class='text-muted'>" + formatDate(message["timestamp"].toDate()) + "</small></p>" +
                "</div>" +
            "</li>"
        );
    });

    if(TOTAL_MESSAGE_COUNT <= VISIBLE_MESSAGE_COUNT) {
        $(".message-all-button").hide();
    } else {
        $(".message-all-button").show();
    }

    if($("#all_message").css("display") == "block") {
        openAllMessage();
    }
}

function validateNumber() {
    if((event.keyCode < 48) || (event.keyCode > 57)) {
        event.returnValue = false;
    }
}

function formatDate(timestamp){
    let year = timestamp.getFullYear();
    let month = timestamp.getMonth() + 1;
    let day = timestamp.getDate();

    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    let hours = timestamp.getHours();
    let minutes = timestamp.getMinutes();
    let seconds = timestamp.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

function openAllMessage() {
    $("#all_message_list").empty();

    $.each(MESSAGES, function(index, message) {
        $("#all_message_list").append(
            "<li class='list-group-item message-item'>" +
                "<div class='card-body message-card'>" +
                    "<div class='row message-row'>" +
                        "<div class='col message-col1'>" +
                            "<h5 class='card-title message-name'>" + message["name"] + "</h5>" +
                        "</div>" +
                        "<div class='col-1 message-col2'>" +
                            "<button type='button' class='close' data-toggle='modal' data-target='#delete_message' onclick='javascript: initializeDeleteMessageForm(" + index + ")'>" +
                                "<span aria-hidden='true'>&times;</span>" +
                            "</button>" +
                        "</div>" +
                    "</div>" +
                    "<p class='card-text message-comment'>" + message["comment"] + "</p>" +
                    "<p class='card-text message-time'><small class='text-muted'>" + formatDate(message["timestamp"].toDate()) + "</small></p>" +
                "</div>" +
            "</li>"
        );
    });

    $("#all_message").css("display", "block");
    $("#all_message")[0].scrollTo(0, 0);
    disableScroll();
}

function closeAllMessage() {
    $("#all_message").css("display", "none");
    enableScroll();
}