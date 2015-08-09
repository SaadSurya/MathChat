$(function () {
    // Declare a proxy to reference the hub.
    var chat = $.connection.chatHub;
    var timer = null;
    var count = 0;
    var curStyle = 1;
    function nextStyle() {
        curStyle = ++curStyle >= 6 ? 1 : curStyle;
        return curStyle;
    }
    $('input').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
        }
    });
    function pad(val) { return val > 9 ? val : "0" + val; }
    function resetTimer(seconds) {
        if (timer != null) { clearInterval(timer); }
        var sec = seconds;
        timer = setInterval(function () {
            if (sec > 0) {
                $("#seconds" + count).html(pad(--sec % 60));
                $("#minutes" + count).html(pad(parseInt(sec / 60, 10)));
                $("#seconds").html(pad(sec % 60));
                $("#minutes").html(pad(parseInt(sec / 60, 10)));
            } else {
                clearInterval(timer);
                timer = null;
            }
        }, 1000);
    }
    chat.client.broadcastMessage = function (name, message, type) {
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();

        var mes = '<li class="media" >' +
                  '      <div class="media-body">' +
                  '          <div class="media">' +
                  '              <a class="pull-left message-user col-xs-3 col-sm-2 col-md-2 col-lg-2" href="javascript: void(0)">' + encodedName + '</a>' +
                  '              <div class="media-body">' + encodedMsg;
        if (type == "equation") {
            count++;
            mes += '                  <br />' +
                    '                  <small class="text-muted"><span id="minutes' + count + '">00</span>:<span id="seconds' + count + '">15</span></small>';
            resetTimer(16);
            $('#current-equation').html(encodedMsg);
        } else {
            mes += '                  <br />' +
                    '                  <small class="text-muted">' + new Date().toLocaleTimeString()+ '</small>';
        }
        mes += '                  <hr />' +
                  '              </div>' +
                  '          </div>' +
                  '      </div>' +
                  '  </li>';
        $('#discussion').append(mes);
        $('html, body').stop().animate({ scrollTop: $(document).height() - $(window).height() }, 300, 'swing');
    };
    chat.client.updatePoints = function (points) {
        $("#points").text(points);
    }
    chat.client.addUser = function (id, name, points, joinTime) {
        var user = '<li id="'+id+'" class="media">' +
                   '    <div class="media-body">' +
                   '        <div class="media">' +
                   '            <a class="pull-left" href="javascript: void(0)">' +
                   '            <label  class="dp dp' + nextStyle() + '">' + name.charAt(0).toUpperCase() + '</label>' +
                   //'                <img class="media-object img-circle" style="max-height:40px;" src="assets/img/user.png" />' +
                   '            </a>' +
                   '            <div class="media-body">' +
                   '                <h4>' + name + ' <span class="badge pull-right userPoints" >'+points+'</span></h4>' +
                   '                <small class="text-muted">' + joinTime + '</small>' +
                   '            </div>' +
                   '        </div>' +
                   '    </div>' +
                   '</li>';
        $("#users").append(user);
    }
    chat.client.removeUser = function (id) {
        $("#users #" + id).remove();
    }
    chat.client.updateUserPoints = function (id, points) {
        $("#" + id + " .userPoints").text(points);
    }
    $.connection.hub.start().done(function () {
        function getDisplayName(alert) {
            var message = alert ? "Name already exists, Enter another nick name: " : "Enter your nick name:";
            $('#displayname').val(prompt(message, ''));
            if($('#displayname').val() != ""){
                chat.server.addUser($('#displayname').val()).done(function (result) {
                    if (!result) {
                        getDisplayName(true);
                    }
                });
            } else {
                getDisplayName(false);
            }
        }
        getDisplayName(false);
        $('html, body').stop().animate({ scrollTop: $(document).height() - $(window).height() }, 300);

//	$('.slick').get(0).slick.slickGoTo(1);
        function sendMessage() {
            if ($('#message').val() != "") {
                chat.server.send($('#displayname').val(), $('#message').val());
                $('#message').val('').focus();
            }
        }
        $('#sendmessage').click(sendMessage);
        $('#message').bind("enterKey", sendMessage);
    }).fail(function (reason) {
            alert("Unable to connect: " + reason);
    });
    $('#message').focus();
    /*$('#chat-area .panel-body').css('max-height', $(window).height() - 160);
    $('#user-area .panel-body').css('max-height', $(window).height() - 100);
    $(window).resize(function () {
        $('#chat-area .panel-body').css('max-height', $(window).height() - 160);
        $('#user-area .panel-body').css('max-height', $(window).height() - 100);
    });*/

});
